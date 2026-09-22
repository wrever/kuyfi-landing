/**
 * Fills `{name}` placeholders in a piece of copy. Copy stays free of numbers and identifiers (see
 * siteCopy.test.ts); the values come from a source of truth such as config/site.ts. A placeholder
 * with no value is a bug, so it throws instead of rendering a hole.
 */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = values[name]
    if (value === undefined) throw new Error(`Missing value for {${name}} in "${template}"`)
    return value
  })
}
