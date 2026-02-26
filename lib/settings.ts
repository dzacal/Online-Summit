import { createClient } from './supabase/server'

export const DEFAULT_SETTINGS = {
  // Brand color scale
  color_brand_50:      '#EFF7F4',
  color_brand_100:     '#CCCCC1',
  color_brand_200:     '#A6DCCD',
  color_brand_300:     '#9A9C91',
  color_brand_400:     '#9EA481',
  color_brand_500:     '#6EA451',
  color_brand_600:     '#4A6264',
  color_brand_700:     '#3D5254',
  color_brand_800:     '#434C4C',
  color_brand_900:     '#2F3636',
  // Named semantic tokens
  color_sage:          '#6EA451',
  color_seafoam:       '#A6DCCD',
  color_teal:          '#4A6264',
  color_charcoal:      '#434C4C',
  color_olive:         '#9EA481',
  color_linen:         '#CCCCC1',
  color_cool_gray:     '#9A9C91',
  color_vision_purple: '#8B7BA8',
  // Site content
  site_title:       'Global Online Regeneration Summit',
  site_tagline:     'A global gathering of regenerative thinkers, practitioners, and changemakers. Online. Open. Transformative.',
  site_coming_soon: 'Coming Soon',
  // Dropdown options (JSON arrays)
  speaker_statuses: '["Not Contacted","Outreach Sent","Follow Up Sent","In Conversation","Confirmed","Declined","No Response"]',
  session_types:    '["Keynote","Panel","Workshop","Lightning Talk","Fireside Chat","Interview"]',
  partner_statuses: '["Prospecting","In Discussion","Agreement Sent","Confirmed","Active","Completed","Declined"]',
  partner_types:    '["Sponsor","Media Partner","Community Partner","Co-Organizer","In-Kind","Affiliate"]',
}

export type Settings = typeof DEFAULT_SETTINGS

export async function getSettings(): Promise<Settings> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('site_settings').select('key, value')
    const map: Record<string, string> = {}
    for (const row of data ?? []) map[row.key] = row.value
    return { ...DEFAULT_SETTINGS, ...map } as Settings
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function buildCssVars(s: Settings): string {
  return [
    `--color-brand-50: ${s.color_brand_50}`,
    `--color-brand-100: ${s.color_brand_100}`,
    `--color-brand-200: ${s.color_brand_200}`,
    `--color-brand-300: ${s.color_brand_300}`,
    `--color-brand-400: ${s.color_brand_400}`,
    `--color-brand-500: ${s.color_brand_500}`,
    `--color-brand-600: ${s.color_brand_600}`,
    `--color-brand-700: ${s.color_brand_700}`,
    `--color-brand-800: ${s.color_brand_800}`,
    `--color-brand-900: ${s.color_brand_900}`,
    `--color-sage: ${s.color_sage}`,
    `--color-seafoam: ${s.color_seafoam}`,
    `--color-teal: ${s.color_teal}`,
    `--color-charcoal: ${s.color_charcoal}`,
    `--color-olive: ${s.color_olive}`,
    `--color-linen: ${s.color_linen}`,
    `--color-cool-gray: ${s.color_cool_gray}`,
    `--color-vision-purple: ${s.color_vision_purple}`,
  ].join('; ')
}
