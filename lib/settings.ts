// Server-only — imports next/headers via supabase/server. Do not import in client components.
import { createClient } from './supabase/server'
import { DEFAULT_SETTINGS, type Settings } from './settings-defaults'

export { DEFAULT_SETTINGS, type Settings } from './settings-defaults'

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
