/** Host (and optionally its path) of a URL, for showing next to a link without its scheme or "www.". */
export function hostContext(url: string, withPath = false): string {
  const { hostname, pathname } = new URL(url)
  return hostname.replace(/^www\./, '') + (withPath ? pathname : '')
}
