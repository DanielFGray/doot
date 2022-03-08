type Token =
  | { type: 'url', value: string }
  | { type: 'string', value: string }

/* thank you greenjello */
export function urlTokens(str: string) {
  const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g
  const tokens: Token[] = []
  let last = 0
  if (! str) return tokens
  str.replace(regex, (m, ...args) => {
    const index = args[args.length - 2]
    tokens.push({
      type: 'string',
      value: str.slice(last, index),
    })
    tokens.push({
      type: 'url',
      value: m,
    })
    last = index + m.length
  })
  tokens.push({
    type: 'string',
    value: str.slice(last),
  })
  return tokens
}

export const Linkify = (text: string): React.ReactNode[] => urlTokens(text)
  .map((t, i) => {
    switch (t.type) {
    case 'url':
      return (
        <a key={i} href={t.value} target="_blank" rel="noopener noreferrer">
          {t.value}
        </a>
      )
    case 'string':
      return t.value
    default:
      throw new Error('unknown linkify token')
    }
  })


