# API-God — X export (Chrome extension)

Export the X (Twitter) search or timeline you're **already looking at** to JSONL or
markdown. One click, no API key, no server, no Playwright, no saved session file.

This is the browser-extension form of [api-god-x](https://github.com/zellkernel/api-god-x).
The CLI drives a separate headless browser and has to capture and store your login
(`auth_token`, `ct0`, `twid`) to `~/.x-session/`. An extension doesn't — it already
runs inside the tab you're logged into. The auth is just there.

## How it works

X is a single-page app. When you open a search or scroll a profile, the page doesn't
ship HTML with the tweets in it — it runs a GraphQL query (`SearchTimeline`,
`UserTweets`, `ListLatestTweetsTimeline`, `HomeTimeline`, …) and renders the JSON.

The extension **reads the answer to a request the page was going to make anyway**:

```
X's JS fires SearchTimeline ─► patched fetch/XHR tees the response ─► parse ─► JSONL / markdown
```

- `inject.js` runs in the page's main world and monkeypatches `window.fetch` +
  `XMLHttpRequest` to tee the GraphQL **response bodies** (MV3 removed blocking
  `webRequest` body access, so this is the way to read them). It never forges a
  request — X makes the authenticated call; the extension only reads the result.
- `content.js` runs in the isolated world, parses X's timeline JSON into flat
  records (parser ported from and parity-tested byte-for-byte against `api-god-x`),
  dedupes by tweet id, and exports.

Captured per record: `id, handle, name, text, time, url, likes, replies, reposts,
followers, blue, verified, views, quotes, lang, is_retweet, source`.

## Install (unpacked)

1. `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → select this folder
3. Open [x.com](https://x.com) logged in. A small **API-God** panel appears bottom-right.
4. Search or scroll. The counter climbs as responses land. Click **JSONL**,
   **Markdown**, or **Copy JSONL**.

## Scope / terms

Operator tool. It runs under **your own** X account and your own authenticated
session, and exports **your own view** — the same posts the page already showed you.
Use it on accounts and data you're authorized to access, and stay inside X's terms
for that account. Automated / bulk access to X's internal endpoints can violate
those terms and put an account at risk; that judgement is the operator's.

No memecoin engine, no ingestion daemon, no network calls of its own — capture and
export only. For the continuous-ingestion and signal-engine pieces, see the CLI.

## License

MIT © 2026 Nicholas Kloster
