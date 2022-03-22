export function classNames(...classes: Array<string | undefined | null>): string {
  for (let i = 0; i < classes.length; i++) {
    if (!classes[i]) classes.splice(i--, 1)
  }
  return classes.join(' ')
}
