import { GoogleAuth } from 'google-auth-library'

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1'

async function getToken(): Promise<string> {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const client = await auth.getClient() as any
  const res = await client.getAccessToken()
  return res.token!
}

// Column order (A–M):
// A=podcast_name  B=response_status  C=notes  D=client_notes
// E=rating        F=social_handle    G=monthly_listeners  H=rep
// I=recording_format  J=location  K=audience_niche  L=episode_url  M=id

export function rowToRecord(values: string[]) {
  const v = (i: number) => (values[i] ?? '').trim()
  return {
    podcast_name: v(0),
    response_status: v(1) || 'Not Contacted',
    notes: v(2) || null,
    client_notes: v(3) || null,
    rating: v(4) ? Number(v(4)) : null,
    social_handle: v(5) || null,
    monthly_listeners: v(6) ? Number(v(6)) : null,
    rep: v(7) || null,
    recording_format: v(8) || null,
    location: v(9) || null,
    audience_niche: v(10) || null,
    episode_url: v(11) || null,
  }
}

export function recordToRow(record: Record<string, any>): string[] {
  return [
    record.podcast_name ?? '',
    record.response_status ?? '',
    record.notes ?? '',
    record.client_notes ?? '',
    record.rating != null ? String(record.rating) : '',
    record.social_handle ?? '',
    record.monthly_listeners != null ? String(record.monthly_listeners) : '',
    record.rep ?? '',
    record.recording_format ?? '',
    record.location ?? '',
    record.audience_niche ?? '',
    record.episode_url ?? '',
    record.id ?? '',
  ]
}

export async function readAllRows(): Promise<{ rowIndex: number; values: string[] }[]> {
  const token = await getToken()
  const range = `${SHEET_NAME}!A:M`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  const rows: string[][] = data.values || []
  // Skip header row (index 0), rowIndex is 1-based so data row 1 = rowIndex 2
  return rows.slice(1).map((values, i) => ({ rowIndex: i + 2, values }))
}

export async function updateRow(rowIndex: number, values: string[]) {
  const token = await getToken()
  const range = `${SHEET_NAME}!A${rowIndex}:M${rowIndex}`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`
  await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [values] }),
  })
}

export async function appendRow(values: string[]) {
  const token = await getToken()
  const range = `${SHEET_NAME}!A:M`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [values] }),
  })
}
