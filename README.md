# Medu

A hieroglyph reader you touch. The signs are the interface: choose one, read what it depicts and how it sounds, and carve it into a line.

Medu reads sign by sign. It does not translate a sentence.

## Use it

The alphabet is the front door, twenty-four signs a newcomer can learn. The other groups are the basic Egyptian hieroglyphs from Unicode. Search stays on this screen. Drag a sign onto the line, or press Carve. The line is written right to left, and you can flip it.

Copy the rubbing to share the line. The link is the signs themselves, as Gardiner codes: `#F35-I9-D21`. Save rubbing downloads a picture of the line.

## Run it locally

```bash
npm install
npm run dev
```

`npm run signs` rebuilds `src/data/signs.json` from the Unicode Unikemet catalog.

## Visits

GitHub Pages does not count who opens the site. Medu can send one page view to [GoatCounter](https://www.goatcounter.com/), a private dashboard with no cookies and no banner on the page. Carving a sign does not count as another visit.

1. Create a free site at goatcounter.com. A public project can use the free plan. Name it `medu`, or any short code.
2. In this GitHub repo, open Settings → Secrets and variables → Actions → Variables, and add `GOATCOUNTER` with that code (`medu`, or the full `https://medu.goatcounter.com/count`).
3. Push to `main`. The next deploy starts counting.

The numbers are at `https://YOURCODE.goatcounter.com`. They are visitors and page views. The dashboard stays private to you. Leave GoatCounter’s “individual pageviews” setting off. That setting would store one row per view.

The site code is the public address of the counter. It is not a password, and the GoatCounter login never goes in this repo or in the page. `.env` files are gitignored. Vite would copy any `VITE_` variable into the public page, so the only one the build accepts is `VITE_GOATCOUNTER`, and the address has to be a `something.goatcounter.com` site.

## Where data sits

The privacy page is published with the site, at `privacy.html`. It is the list visitors can read.

| What | Where |
| --- | --- |
| Guide finished (`medu.tour` = `done`) | That browser’s local storage. It is not sent. |
| The carved line | The page address (`#F35-I9-D21`). Medu does not keep a copy. |
| One page view, only after `GOATCOUNTER` is set | GoatCounter, aggregate tables, on Hetzner servers in Finland and Germany. The IP address is discarded after the country is known. |
| The request that loads the page | GitHub Pages, the host. Their privacy statement covers those logs. |

There is no Medu account and no Medu database.

## Before visitors

This is a static site on GitHub Pages. The list below is the check that has to stay true.

- **Privacy policy.** `privacy.html` is published with the site and linked under the signs.
- **Where data sits.** The table above is the whole map.
- **Keys.** No credential is compiled into the page. `VITE_GOATCOUNTER` is the public address of the counter. The GoatCounter password stays on GoatCounter.
- **Env files.** `.env` is gitignored. Pages publishes `dist` only. The build scans the source and `dist` for env files and for key-shaped strings, and it prints the file name rather than the value.
- **Logs.** The app does not write to the console. The deploy masks the counter code before the build starts.
- **Responses.** Medu has no API. The sign list is the public Unicode catalog. The visit beacon returns nothing the page shows.
- **Auth.** There is no login and no private page. The reader and the privacy page are both public. A private page added later has to check the caller on the server that holds the data, on that page itself.
- **Inputs.** The address and the search box are the inputs. A code that is not in the catalog is dropped, and a broken `%` in the address is dropped. Search text is matched as text, capped at 80 characters. The build rejects `innerHTML` and `eval`. There is no SQL database.
- **Headers.** GitHub Pages sends `Strict-Transport-Security`. The built page adds a Content-Security-Policy and a `strict-origin-when-cross-origin` referrer policy. Pages does not let a project set `X-Content-Type-Options` or `X-Frame-Options`, and a meta tag cannot carry `frame-ancestors`. The page has no session and no payment.
- **Paid APIs.** Nothing here calls one. `npm run signs` downloads the public Unikemet list when someone rebuilds the catalog. A paid API would need a server of our own, with a limit, and the key would stay on that server.
- **Database.** There is not one. The sign list is a file in the repo. A future database starts closed.

## Sources

- Sign list, depictions, and functions for the catalog: [Unicode Unikemet](https://www.unicode.org/Public/UCD/latest/ucd/Unikemet.txt), Unicode, Inc. Used under the [Unicode Terms of Use](https://www.unicode.org/terms_of_use.html).
- The alphabet and the common signs Medu introduces are written for this project.
- Glyphs: [Noto Sans Egyptian Hieroglyphs](https://fonts.google.com/noto/specimen/Noto+Sans+Egyptian+Hieroglyphs), Copyright 2022 The Noto Project Authors, licensed under the SIL Open Font License 1.1. The license is in `src/assets/OFL.txt`.
- Latin type: Fraunces and Outfit.
