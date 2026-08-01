# API-God — X export (Chrome extension)

**A free, keyless X read API — pull search and timelines from your own logged-in session, export to JSONL or markdown.**

> **It reads the answer to a request the page was going to make anyway.**
> It doesn't forge API calls, doesn't scrape rendered HTML. X makes the authenticated
> request; the extension tees the JSON response.

## What it is

A Chrome extension that turns the X tab you're already logged into a free, keyless X
read API. When you search or scroll, X's own JavaScript calls its internal GraphQL
backend; the extension reads those response bodies off the wire and exports them to
JSONL/markdown. You never authenticate to anything — the auth is your existing session
cookie.

## Why that matters

Reading X's own response — instead of paying for a key, forging requests, or parsing
HTML — is the one property that separates it from every other category of tool:

| Compared to | They do | This does instead |
|---|---|---|
| **X's paid API** ($100–$42k/mo, keyed) | Authorized machine access, rate-tiered, firehose/full-archive | Same search + timeline data, no key, no bill — bounded to your session's view, at browsing speed |
| **DOM scrapers / Nitter** | Parse rendered HTML; race the paint; break on redesigns; third-party server or shared IP → bans | Reads structured JSON X itself fetched — gets `followers/blue/views/quotes` the DOM hides; survives UI redesigns; your own session, no shared IP |
| **API-God / api-god-x** (the CLIs) | Drive a separate Playwright browser; must capture + store your login (`auth_token/ct0/twid`) to `~/.x-session/` | No Playwright, no stored session file — it lives inside the logged-in tab, so the auth is just there. Stripped the memecoin engine + ingestion daemon |

## How it works

X is a single-page app — open a search or profile and it runs a GraphQL query
(`SearchTimeline`, `UserTweets`, `ListLatestTweetsTimeline`, `HomeTimeline`, …) and
renders the JSON. The extension reads the answer to a request the page makes anyway:

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

MIT © 2026
