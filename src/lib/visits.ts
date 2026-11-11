import { counterEndpoint } from "./counter.ts"

// Counts one page view when the published site loads.
// Local dev stays quiet. A missing site code stays quiet too.
// The dashboard is GoatCounter: visitors and page views, no cookies.

export function countVisit() {
  if (!import.meta.env.PROD) return
  const endpoint = counterEndpoint(import.meta.env.VITE_GOATCOUNTER ?? "")
  if (!endpoint) return
  if (document.querySelector("script[data-goatcounter]")) return

  const script = document.createElement("script")
  script.async = true
  script.src = "https://gc.zgo.at/count.js"
  script.dataset.goatcounter = endpoint
  document.body.append(script)
}
