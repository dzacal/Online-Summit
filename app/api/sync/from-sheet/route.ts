// Called by Google Apps Script when a row is edited in the Google Sheet.
// Upserts the row into Supabase and returns the record's UUID.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rowToRecord } from '@/lib/google-sheets'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const body = await req.json()

  if (body.secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const values: string[] = body.values ?? []
  const record = rowToRecord(values)

  if (!record.podcast_name) {
    return NextResponse.json({ skipped: true })
  }

  const existingId = (values[12] ?? '').trim()

  if (existingId) {
    const { error } = await supabase().from('podcasts').update(record).eq('id', existingId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: existingId })
  } else {
    const { data, error } = await supabase()
      .from('podcasts')
      .insert(record)
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id })
  }
}
