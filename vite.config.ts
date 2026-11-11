import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { counterOrigin } from "./src/lib/counter.ts"

function pagePolicy(): Plugin {
  const origin = counterOrigin(process.env.VITE_GOATCOUNTER ?? "")
  const script = origin ? " https://gc.zgo.at" : ""
  const connect = origin ? ` ${origin}` : ""
  const policy = [
    "default-src 'self'",
    `script-src 'self'${script}`,
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    `connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com${connect}`,
    "base-uri 'self'",
    "form-action 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "worker-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ")

  return {
    name: "page-policy",
    apply: "build",
    transformIndexHtml() {
      return [
        {
          tag: "meta",
          attrs: { "http-equiv": "Content-Security-Policy", content: policy },
          injectTo: "head-prepend",
        },
        {
          tag: "meta",
          attrs: { name: "referrer", content: "strict-origin-when-cross-origin" },
          injectTo: "head-prepend",
        },
      ]
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/medu/" : "/",
  plugins: [react(), pagePolicy()],
}))
