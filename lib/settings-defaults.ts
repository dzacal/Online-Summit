// Shared constants — no server imports, safe to use in client components

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
