# API-God — X export (Chrome extension)

**A free, keyless X read API.** Pull the search and timelines X charges API money for,
straight from your own logged-in session, and export to JSONL or markdown — one click,
no key, no server.

X's paid API sells programmatic read access: search, user timelines, tweet lookups.
The web app you're already logged into hits the same internal GraphQL endpoints every
time you scroll. This extension reads those responses off the wire and hands you the data.

## How it works

X is a single-page app — open a search or profile and it runs a GraphQL query
(`SearchTimeline`, `UserTweets`, `ListLatestTweetsTimeline`, `HomeTimeline`, …) and
renders the JSON. The extension **reads the answer to a request the page makes anyway**:

```
X's JS fires SearchTimeline ─► patched fetch/XHR tees the response ─► parse ─► JSONL / markdown
```

- `inject.js` (page main world) patches `window.fetch` + `XMLHttpRequest` to tee the
  GraphQL **response bodies** — MV3 removed blocking-`webRequest` body access, so this is
  how you read them. It never forges a request; X makes the authenticated call, the
  extension reads the result.
- `content.js` (isolated world) parses X's timeline JSON into flat records (parser ported
  from and parity-tested byte-for-byte against [api-god-x](https://github.com/zellkernel/api-god-x)),
  dedupes by tweet id, and exports.

Per record: `id, handle, name, text, time, url, likes, replies, reposts, followers, blue,
verified, views, quotes, lang, is_retweet, source`.

## Install (unpacked)

1. `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → select this folder
3. Open [x.com](https://x.com) logged in — an **API-God** panel appears bottom-right
4. Search or scroll; the counter climbs as responses land. Click **JSONL**, **Markdown**, or **Copy JSONL**.

## Scope

Runs under your own account and session, over your own view — the same posts the page
already showed you. No firehose, no full-archive, no key: it's bounded to what your
session can see, at browsing speed. Automated/bulk access to X's internal endpoints can
violate X's terms and risk the account; that call is the operator's. Capture and export
only — no ingestion daemon, no signal engine, no network calls of its own.

## License

MIT © 2026 Nicholas Kloster
