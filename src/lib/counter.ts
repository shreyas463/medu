const siteCode = /^[a-z0-9-]+$/i

// The GoatCounter site code is a public address, not a credential.
// Only a https host on goatcounter.com is accepted, so the page cannot be pointed at some other collector.
export function counterEndpoint(site: string): string | null {
  const value = site.trim()
  if (!value) return null

  let url: URL
  try {
    if (value.startsWith("https://")) url = new URL(value)
    else if (value.includes(".")) url = new URL(`https://${value}`)
    else if (siteCode.test(value)) url = new URL(`https://${value}.goatcounter.com/count`)
    else return null
  } catch {
    return null
  }

  if (url.username || url.password) return null
  if (url.protocol !== "https:") return null
  const host = url.hostname.toLowerCase()
  if (!/^[a-z0-9-]+\.goatcounter\.com$/.test(host)) return null

  url.hostname = host
  url.pathname = "/count"
  url.search = ""
  url.hash = ""
  return url.toString()
}

export function counterOrigin(site: string): string | null {
  const endpoint = counterEndpoint(site)
  if (!endpoint) return null
  return new URL(endpoint).origin
}
