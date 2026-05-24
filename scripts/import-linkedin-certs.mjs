#!/usr/bin/env node
/**
 * One-time LinkedIn certifications importer.
 *
 * Usage:
 *   node scripts/import-linkedin-certs.mjs <path-to-Certifications.csv>
 *
 * Required env vars (copy from profile/.env.local):
 *   STRAPI_API_URL   e.g. https://strapi-cms-2usx.onrender.com
 *   STRAPI_API_TOKEN e.g. the read/write token (STRAPI_SYNC_API_TOKEN from .env.local)
 *
 * LinkedIn export steps:
 *   1. linkedin.com → Me → Settings & Privacy
 *   2. Data Privacy → Get a copy of your data
 *   3. Select "Licenses and certifications" → Request archive
 *   4. Download → extract zip → find Certifications.csv
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const STRAPI_API_URL = process.env.STRAPI_API_URL
const STRAPI_API_TOKEN = process.env.STRAPI_SYNC_API_TOKEN ?? process.env.STRAPI_API_TOKEN

if (!STRAPI_API_URL || !STRAPI_API_TOKEN) {
  console.error('Missing STRAPI_API_URL or STRAPI_SYNC_API_TOKEN / STRAPI_API_TOKEN env vars')
  console.error('Run: STRAPI_API_URL=... STRAPI_SYNC_API_TOKEN=... node scripts/import-linkedin-certs.mjs <csv>')
  process.exit(1)
}

const csvPath = process.argv[2]
if (!csvPath) {
  console.error('Usage: node scripts/import-linkedin-certs.mjs <path-to-Certifications.csv>')
  process.exit(1)
}

// --- CSV parser (no dependencies) ---
function parseCsv(content) {
  const lines = content.trim().split('\n')
  const headers = splitCsvLine(lines[0])
  return lines.slice(1).map(line => {
    const values = splitCsvLine(line)
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] ?? '').trim()]))
  }).filter(row => Object.values(row).some(v => v))
}

function splitCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes }
    else if (ch === ',' && !inQuotes) { result.push(current); current = '' }
    else { current += ch }
  }
  result.push(current)
  return result
}

// --- Date parser ---
// LinkedIn Time Period examples:
//   "Started on 01-2024 | Expire on 01-2026"
//   "Started on 01-2024"
//   "01-2026"
function parseExpiryDate(timePeriod) {
  if (!timePeriod) return undefined
  const expireMatch = timePeriod.match(/Expire(?:s)?\s+on\s+(\d{2}-\d{4})/i)
  if (expireMatch) {
    const [month, year] = expireMatch[1].split('-')
    return `${year}-${month}-01`
  }
  // No expiry found in time period
  return undefined
}

// --- Credly badge fetcher ---
// If the verification URL is a Credly badge URL, try to get the badge image URL
async function fetchCredlyBadgeImageUrl(certUrl) {
  if (!certUrl?.includes('credly.com/badges/')) return null
  try {
    // Extract badge UUID from URL: https://www.credly.com/badges/{UUID}[/...]
    const uuidMatch = certUrl.match(/credly\.com\/badges\/([a-f0-9-]{36})/)
    if (!uuidMatch) return null
    const uuid = uuidMatch[1]

    const res = await fetch(`https://www.credly.com/badges/${uuid}.json`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
    })
    if (!res.ok) return null
    const data = await res.json()
    // Credly badge JSON has image_url or badge.image.url
    return data?.image_url ?? data?.badge?.image?.url ?? null
  } catch {
    return null
  }
}

// --- Strapi helpers ---
async function strapiGet(path) {
  const res = await fetch(`${STRAPI_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`)
  return res.json()
}

async function strapiPost(path, body) {
  const res = await fetch(`${STRAPI_API_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: body }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

async function uploadImageFromUrl(imageUrl, filename) {
  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) throw new Error(`Failed to download badge from ${imageUrl}: ${imgRes.status}`)
  const buffer = await imgRes.arrayBuffer()
  const form = new FormData()
  form.append('files', new Blob([buffer]), filename)
  const res = await fetch(`${STRAPI_API_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
    body: form,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upload failed → ${res.status}: ${text}`)
  }
  const uploaded = await res.json()
  if (!uploaded[0]?.id) throw new Error('Upload returned no media entry')
  return uploaded[0].id
}

async function certExists(title, issuingBody, licenseNumber) {
  const encodedTitle = encodeURIComponent(title)
  const encodedBody = encodeURIComponent(issuingBody)
  const res = await strapiGet(
    `/api/certifications?filters[title][$eq]=${encodedTitle}&filters[issuingBody][$eq]=${encodedBody}&pagination[limit]=1`
  )
  if (res.data?.length > 0) return true

  if (licenseNumber) {
    const encodedLicense = encodeURIComponent(licenseNumber)
    const res2 = await strapiGet(
      `/api/certifications?filters[linkedinCertId][$eq]=${encodedLicense}&pagination[limit]=1`
    )
    if (res2.data?.length > 0) return true
  }
  return false
}

// --- Main ---
async function main() {
  const content = readFileSync(resolve(csvPath), 'utf-8')
  const rows = parseCsv(content)

  console.log(`\nParsed ${rows.length} certification(s) from CSV\n`)

  let created = 0
  let skipped = 0
  let failed = 0

  for (const row of rows) {
    const title = row['Name'] ?? row['name'] ?? ''
    const issuingBody = row['Authority'] ?? row['authority'] ?? ''
    const licenseNumber = row['License Number'] ?? row['license_number'] ?? ''
    const timePeriod = row['Time Period'] ?? row['time_period'] ?? ''
    const certUrl = row['Url'] ?? row['url'] ?? ''

    if (!title || !issuingBody) {
      console.log(`  SKIP  [no title/authority] row: ${JSON.stringify(row)}`)
      skipped++
      continue
    }

    process.stdout.write(`  ${title} @ ${issuingBody} ... `)

    try {
      // Dedup check
      const exists = await certExists(title, issuingBody, licenseNumber)
      if (exists) {
        console.log('SKIP (already exists)')
        skipped++
        continue
      }

      // Try to get badge image from Credly
      let badgeImageId = undefined
      const credlyImageUrl = await fetchCredlyBadgeImageUrl(certUrl)
      if (credlyImageUrl) {
        try {
          const filename = `badge-${title.replace(/\s+/g, '-').toLowerCase().slice(0, 40)}.png`
          badgeImageId = await uploadImageFromUrl(credlyImageUrl, filename)
          process.stdout.write('[badge uploaded] ')
        } catch (e) {
          process.stdout.write('[badge failed, skipping badge] ')
        }
      }

      const expiryDate = parseExpiryDate(timePeriod)

      await strapiPost('/api/certifications?status=published', {
        title,
        issuingBody,
        verificationUrl: certUrl || 'https://www.linkedin.com/in/akashdborkar/',
        ...(licenseNumber && { linkedinCertId: licenseNumber }),
        ...(expiryDate && { expiryDate }),
        ...(badgeImageId !== undefined && { badgeImage: badgeImageId }),
      })

      console.log('CREATED ✓')
      created++
    } catch (err) {
      console.log(`FAILED — ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${failed} failed`)
  if (failed > 0) {
    console.log('Check failed certs above and add them manually via Strapi admin.')
  }
  if (created > 0) {
    console.log('Certifications are published and live in Strapi.')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
