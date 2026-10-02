'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireSession, login, logout, hashPassword } from '@/lib/admin-auth'
import { i18n, revalidateSite, toBool, toStr } from './_lib/form-helpers'

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const email = toStr(formData.get('email'))
  const password = toStr(formData.get('password'))

  if (!email || !password) {
    return { error: 'Email and password are both required.' }
  }

  const session = await login(email, password)
  if (!session) {
    return { error: 'Those credentials were not recognised.' }
  }

  redirect('/admin')
}

export async function logoutAction() {
  await logout()
  redirect('/admin/login')
}

export type PasswordState = { error?: string; ok?: boolean }

export async function changePasswordAction(
  _prev: PasswordState | null,
  formData: FormData,
): Promise<PasswordState> {
  const session = await requireSession()
  const current = toStr(formData.get('current'))
  const next = toStr(formData.get('next'))

  if (next.length < 10) {
    return { error: 'The new password must be at least 10 characters.' }
  }

  const user = await prisma.adminUser.findUnique({ where: { email: session.email } })
  if (!user) return { error: 'Account not found.' }

  if (!(await bcrypt.compare(current, user.passwordHash))) {
    return { error: 'Your current password is not correct.' }
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  })
  return { ok: true }
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

export async function readMessageAction(formData: FormData) {
  await requireSession()
  await prisma.message.update({
    where: { id: toStr(formData.get('id')) },
    data: { isRead: toBool(formData.get('isRead')) },
  })
  revalidatePath('/admin/messages')
}

export async function deleteMessageAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const message = await prisma.message.findUnique({ where: { id } })
  if (!message) return
  // Contact messages are the only record that a guest wrote in, so the
  // operator has to type the sender's name to confirm.
  if (toStr(formData.get('confirm')) !== message.name) {
    throw new Error('Confirmation did not match — nothing was deleted.')
  }
  await prisma.message.delete({ where: { id } })
  revalidatePath('/admin/messages')
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

/**
 * Settings hold arbitrary JSON documents, so both actions validate the JSON
 * server-side. A syntax error would otherwise be stored verbatim and break
 * whatever reads the setting, and the client-side check alone is not a
 * guarantee — the action can be posted directly.
 */

/** Returns the parsed value, or throws with a message the UI can show. */
function requireJson(raw: string): string {
  try {
    JSON.parse(raw)
  } catch (e) {
    throw new Error(`That value is not valid JSON: ${(e as Error).message}`)
  }
  return raw
}

export async function saveSettingAction(formData: FormData) {
  await requireSession()
  const key = toStr(formData.get('key'))
  if (!key) throw new Error('A setting needs a key.')

  const value = requireJson(toStr(formData.get('value')))
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })

  revalidateSite()
  redirect(`/admin/settings?saved=${encodeURIComponent(key)}`)
}

/** Creates a new key; refuses to silently overwrite an existing one. */
export async function createSettingAction(formData: FormData) {
  await requireSession()
  const key = toStr(formData.get('key'))
  if (!key) throw new Error('A setting needs a key.')

  const existing = await prisma.setting.findUnique({ where: { key } })
  if (existing) throw new Error(`“${key}” already exists — edit it below instead.`)

  const value = requireJson(toStr(formData.get('value')))
  await prisma.setting.create({ data: { key, value } })

  revalidateSite()
  redirect(`/admin/settings?saved=${encodeURIComponent(key)}`)
}

/**
 * Removes a setting. Guarded against deleting the `brand` key, which the
 * footer and header read for the phone and Instagram links — losing it would
 * silently strip those from every page.
 */
export async function deleteSettingAction(formData: FormData) {
  await requireSession()
  const key = toStr(formData.get('key'))
  if (!key) throw new Error('A setting needs a key.')
  if (key === 'brand') {
    throw new Error('The “brand” setting cannot be deleted — it holds the contact details.')
  }

  await prisma.setting.delete({ where: { key } })

  revalidateSite()
  redirect('/admin/settings?deleted=' + encodeURIComponent(key))
}