// Called from the Podcast dashboard to push all Supabase records into Google Sheets.
// Requires a valid user session (logged-in team member).
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { readAllRows, updateRow, appendRow, recordToRow } from '@/lib/google-sheets'

export async function POST() {
  // Verify the caller is a logged-in team member
  const auth = await createServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use service role key so we can read all rows regardless of RLS
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: podcasts, error } = await db
    .from('podcasts')
    .select('*')
    .order('podcast_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Build a map of Supabase UUID → sheet row index
  const sheetRows = await readAllRows()
  const idToRow = new Map<string, number>()
  for (const { rowIndex, values } of sheetRows) {
    const id = (values[12] ?? '').trim()
    if (id) idToRow.set(id, rowIndex)
  }

  let updated = 0
  let added = 0

  for (const podcast of podcasts ?? []) {
    const row = recordToRow(podcast)
    if (idToRow.has(podcast.id)) {
      await updateRow(idToRow.get(podcast.id)!, row)
      updated++
    } else {
      await appendRow(row)
      added++
    }
  }

  return NextResponse.json({ updated, added })
}
