const DEFAULT_RELAY = "http://127.0.0.1:8765/signal";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "NEW_DISCORD_MESSAGE") return;
  const payload = msg.payload;

  chrome.storage.sync.get(["relayUrl"], (r) => {
    const url = r.relayUrl || DEFAULT_RELAY;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "discord-web", ...payload })
    }).catch(() => {});
  });

  sendResponse({ ok: true });
  return true;
});
