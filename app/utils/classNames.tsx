export function classNames(...classes: Array<string | undefined | null>): string {
  return classes.filter(Boolean).join(" ");
}
