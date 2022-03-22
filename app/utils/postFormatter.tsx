import type React from 'react'
import SimpleMarkdown from 'simple-markdown'

const rules: SimpleMarkdown.ParserRules = {
  ...SimpleMarkdown.defaultRules,
  link: {
    ...SimpleMarkdown.defaultRules.link,
    react: (node, output, state) => {
      return (
        <a
          key={state.key}
          href={SimpleMarkdown.sanitizeUrl(node.target)}
          title={node.title}
          target="_blank"
          rel="noopener noreferrer"
        >
          {output(node.content, state)}
        </a>
      )
    },
  },
  paragraph: {
    ...SimpleMarkdown.defaultRules.paragraph,
    react: (node, output, state) => {
      return <p key={state.key}>{output(node.content, state)}</p>
    },
  },
}

const parser = SimpleMarkdown.parserFor(rules)
const reactOutput = SimpleMarkdown.outputFor(rules, 'react')

export function formatter(source: string): React.ReactNode {
  // Many rules require content to end in \n\n to be interpreted
  // as a block.
  const blockSource = source + '\n\n'
  const parseTree = parser(blockSource, { inline: false })
  const outputResult = reactOutput(parseTree)
  return outputResult
}
