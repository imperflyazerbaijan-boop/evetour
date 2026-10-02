/**
 * Repairs double-encoded text in the project's own source files.
 *
 * The Russian in prisma/*.ts was UTF-8 encoded and then decoded as cp1252, so
 * the files contain `Ð¡Ñ‚Ð°Ñ€Ñ‹Ð¹` instead of `Старый`. Seeding from those files
 * writes the damage straight back into the database — which is why fixing only
 * the database did not stick.
 *
 * Reads as UTF-8 and writes back as UTF-8. Only touches .ts/.tsx/.json under
 * the paths listed, and prints a per-file count so the change is reviewable.
 *
 * Run:  npx tsx scripts/fix-source-mojibake.ts          # report
 *       npx tsx scripts/fix-source-mojibake.ts --write  # apply
 */
import fs from 'node:fs'
import path from 'node:path'
import { repairMojibake } from '../src/lib/mojibake'

const WRITE = process.argv.includes('--write')

/** Directories and file types to scan. */
const TARGET_DIRS = ['prisma', 'src', 'scripts']
const EXTENSIONS = new Set(['.ts', '.tsx', '.json'])

/** Minimum hit count before a file is considered damaged. */
const THRESHOLD = 1

type Hit = { line: number; before: string; after: string }

function scanFile(file: string): Hit[] {
  const original = fs.readFileSync(file, 'utf8')
  const hits: Hit[] = []

  const lines = original.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Only lines that look damaged: Latin-1 supplement letters.
    if (!/[À-ÿ]/.test(line)) continue
    const fixed = repairMojibake(line)
    if (fixed !== line) {
      hits.push({ line: i + 1, before: line.trim().slice(0, 60), after: fixed.trim().slice(0, 60) })
      lines[i] = fixed
    }
  }

  if (hits.length < THRESHOLD) return []

  if (WRITE) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8')
  }
  return hits
}

function walk(dir: string, out: string[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // Skip generated code and dependencies.
      if (entry.name === 'node_modules' || entry.name === 'generated') continue
      walk(full, out)
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full)
    }
  }
}

const files: string[] = []
for (const dir of TARGET_DIRS) {
  const full = path.join(process.cwd(), dir)
  if (fs.existsSync(full)) walk(full, files)
}

let totalFiles = 0
let totalHits = 0

for (const file of files) {
  const hits = scanFile(file)
  if (hits.length === 0) continue
  totalFiles++
  totalHits += hits.length
  const rel = path.relative(process.cwd(), file)
  console.log(`\n${rel} — ${hits.length} line(s)`)
  for (const hit of hits.slice(0, 5)) {
    console.log(`  ${hit.line}: ${hit.before}`)
    console.log(`       → ${hit.after}`)
  }
  if (hits.length > 5) console.log(`  … and ${hits.length - 5} more`)
}

console.log(
  `\n${totalFiles} file(s), ${totalHits} line(s) ${WRITE ? 'repaired' : 'need repair'}.`,
)
if (!WRITE && totalHits > 0) {
  console.log('Nothing was changed. Re-run with --write to apply.')
}