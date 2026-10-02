'use client'

import { saveReviewAction } from '../../content-actions'
import {
  Card,
  Field,
  I18nField,
  Select,
  SubmitButton,
  TextInput,
  ToggleField,
} from '../../_components/ui'
import { ImagePicker } from '../../_components/fields'

export type ReviewFormValues = {
  id?: string
  author: string
  country: string
  rating: string
  textEn: string
  textRu: string
  tourTitleEn: string
  tourTitleRu: string
  image: string
  isApproved: boolean
  isPublished: boolean
  sortOrder: string
}

const empty: ReviewFormValues = {
  author: '',
  country: '',
  rating: '5',
  textEn: '',
  textRu: '',
  tourTitleEn: '',
  tourTitleRu: '',
  image: '',
  isApproved: true,
  isPublished: true,
  sortOrder: '0',
}

export default function ReviewForm({
  values,
}: {
  values?: Partial<ReviewFormValues>
}) {
  const v = { ...empty, ...values }

  return (
    <form action={saveReviewAction} className="space-y-6">
      {v.id ? <input type="hidden" name="id" value={v.id} /> : null}

      <Card title="Guest">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Author" hint="Exactly as the guest signed it.">
            <TextInput name="author" defaultValue={v.author} />
          </Field>

          <Field label="Country" hint="Optional.">
            <TextInput name="country" defaultValue={v.country} />
          </Field>

          <Field label="Rating">
            <Select name="rating" defaultValue={v.rating}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {'★'.repeat(n)} ({n})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Sort order" hint="Lower numbers appear first in the carousel.">
            <TextInput name="sortOrder" type="number" defaultValue={v.sortOrder} />
          </Field>

          <div className="flex flex-col justify-end gap-4 sm:col-span-2 sm:flex-row sm:gap-8">
            <ToggleField name="isApproved" defaultChecked={v.isApproved} label="Approved" />
            <ToggleField name="isPublished" defaultChecked={v.isPublished} label="Published" />
          </div>
        </div>
      </Card>

      <Card title="Review text" description="Paste the guest's own words; add the Russian version.">
        <div className="space-y-6">
          <I18nField
            label="Text"
            nameEn="textEn"
            nameRu="textRu"
            en={v.textEn}
            ru={v.textRu}
            multiline
            rows={8}
          />
          <I18nField
            label="Tour label"
            hint="Short context shown under the author's name."
            nameEn="tourTitleEn"
            nameRu="tourTitleRu"
            en={v.tourTitleEn}
            ru={v.tourTitleRu}
          />
        </div>
      </Card>

      <Card
        title="Photo"
        description="Optional. Leave empty and the card shows the guest's initial instead."
      >
        <ImagePicker name="image" defaultValue={v.image} label="Guest photo" />
      </Card>

      <SubmitButton>{v.id ? 'Save changes' : 'Create review'}</SubmitButton>
    </form>
  )
}