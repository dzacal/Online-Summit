// Reads ALL rows from Google Sheets and upserts them into Supabase.
// Requires a logged-in team member session.
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { readAllRows, rowToRecord } from '@/lib/google-sheets'

export async function POST() {
  const auth = await createServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const sheetRows = await readAllRows()
  let imported = 0
  let skipped = 0
  const idUpdates: { rowIndex: number; id: string }[] = []

  for (const { rowIndex, values } of sheetRows) {
    const record = rowToRecord(values)
    if (!record.podcast_name) { skipped++; continue }

    const existingId = (values[12] ?? '').trim()

    if (existingId) {
      const { error } = await db.from('podcasts').upsert({ ...record, id: existingId })
      if (!error) imported++
    } else {
      const { data, error } = await db
        .from('podcasts')
        .insert(record)
        .select('id')
        .single()
      if (!error && data) {
        imported++
        idUpdates.push({ rowIndex, id: data.id })
      }
    }
  }

  return NextResponse.json({ imported, skipped, idUpdates })
}
