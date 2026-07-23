export function sanitizeFarmerField(value) {
  if (!value) return null

  const corrupted = [
    '\u2014',
    '\u2013',
    '\u2015',
    'â€"',
    '&mdash;',
    '--',
  ]

  const trimmed = value.trim()
  if (corrupted.includes(trimmed)) return null

  if (/^[\s\-–—―\u2010-\u2015]+$/.test(trimmed)) return null

  return trimmed
}
