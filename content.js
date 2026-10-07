(function () {
  const SELECTOR = '[class*="messageContent-"], [id^="message-content-"]';
  const seen = new Set();

  function grab(node) {
    const id = node.closest('[id^="chat-messages-"]')?.id || node.id || Math.random().toString(36);
    if (seen.has(id)) return null;
    seen.add(id);
    if (seen.size > 400) {
      const arr = [...seen];
      arr.slice(0, 150).forEach(x => seen.delete(x));
    }
    const text = (node.innerText || "").trim();
    if (!text || text.length < 3) return null;
    return { id, text, ts: Date.now(), url: location.href };
  }

  function emit(msg) {
    chrome.runtime.sendMessage({ type: "NEW_DISCORD_MESSAGE", payload: msg });
  }

  const obs = new MutationObserver(muts => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.matches?.(SELECTOR)) {
          const msg = grab(n);
          if (msg) emit(msg);
        }
        n.querySelectorAll?.(SELECTOR).forEach(c => {
          const msg = grab(c);
          if (msg) emit(msg);
        });
      }
    }
  });

  function start() {
    obs.observe(document.body, { childList: true, subtree: true });
    console.log("[TradeForwarder] observer active");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
