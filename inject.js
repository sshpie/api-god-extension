// inject.js — runs in the PAGE's main world (world: "MAIN").
// X's own JavaScript makes the authenticated GraphQL requests; we never forge one.
// We tee the RESPONSE bodies as they land and hand them to the isolated content
// script over the window message bus. MV3 removed blocking-webRequest response
// access, so patching fetch + XHR in the page world is the way to read bodies.
(() => {
  'use strict';
  if (window.__apiGodInjected) return;
  window.__apiGodInjected = true;

  // GraphQL ops worth teeing. Anything matching goes to the parser; the content
  // script also runs a generic deep-walk so an unlisted op still yields tweets.
  const OP_RE = /\/graphql\/[^/]+\/(SearchTimeline|UserTweets|UserTweetsAndReplies|ListLatestTweetsTimeline|HomeTimeline|HomeLatestTimeline|TweetDetail|Bookmarks|UserMedia|Likes|TweetResultsByRestIds|CommunityTweetsTimeline)/;

  function isCandidate(url) {
    return typeof url === 'string' && url.includes('/graphql/') && OP_RE.test(url);
  }
  function emit(url, json) {
    try { window.postMessage({ type: 'APIGOD_CAPTURE', url, json }, window.location.origin); } catch (_) {}
  }

  // ---- fetch ----
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const p = origFetch.apply(this, arguments);
    if (isCandidate(url)) {
      p.then((resp) => {
        try {
          resp.clone().json().then((j) => emit(url, j)).catch(() => {});
        } catch (_) {}
      }).catch(() => {});
    }
    return p;
  };

  // ---- XMLHttpRequest ----
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__apiGodUrl = url;
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    if (isCandidate(this.__apiGodUrl)) {
      this.addEventListener('load', function () {
        try {
          const t = this.responseType;
          if (t === '' || t === 'text') emit(this.__apiGodUrl, JSON.parse(this.responseText));
          else if (t === 'json') emit(this.__apiGodUrl, this.response);
        } catch (_) {}
      });
    }
    return origSend.apply(this, arguments);
  };
})();
