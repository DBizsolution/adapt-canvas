'use client'

const GLOSSARY: Record<string, string> = {
  HBL: 'House Bill of Lading',
  WFF: 'Wholesale Freight Forwarder',
  FF: 'Freight Forwarder',
  DO: 'Delivery Order',
  TC: 'Transport Carrier',
  BRD: 'Business Requirements Document',
  OTP: 'One-Time Password',
  SSO: 'Single Sign-On',
  ABF: 'Australian Border Force',
  FOC: 'Free of Charge',
  ACFS: 'Australian Container Freight Services',
  VBS: 'Vehicle Booking System',
}

// Sort by length descending so longer matches take priority (e.g., "ACFS" before "FF")
const ABBR_PATTERN = new RegExp(
  `\\b(${Object.keys(GLOSSARY).sort((a, b) => b.length - a.length).join('|')})\\b`,
  'g',
)

export function AbbrText({ text }: { text: string }) {
  const parts: Array<{ type: 'text' | 'abbr'; value: string; expansion?: string }> = []
  let lastIndex = 0

  for (const match of text.matchAll(ABBR_PATTERN)) {
    const abbr = match[0]
    const index = match.index!

    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) })
    }

    parts.push({ type: 'abbr', value: abbr, expansion: GLOSSARY[abbr] })
    lastIndex = index + abbr.length
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  // No abbreviations found — return plain text
  if (parts.every(p => p.type === 'text')) {
    return <>{text}</>
  }

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'abbr') {
          return (
            <abbr
              key={i}
              title={part.expansion}
              className="abbr-term"
            >
              {part.value}
            </abbr>
          )
        }
        return <span key={i}>{part.value}</span>
      })}
    </>
  )
}
