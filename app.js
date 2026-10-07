/**
 * Market Pulse + Live Signal Feed
 */

// ========== 模拟市场数据（真实环境替换为 API） ==========
const INDICES = [
  { id: "spx", name: "SPX", full: "S&P 500", value: "6,766.6", change: -1.43, color: "#e74c3c" },
  { id: "ndx", name: "NDX", full: "Nasdaq 100", value: "24,462.3", change: -1.80, color: "#3498db" },
  { id: "dji", name: "DJI", full: "Dow 30", value: "48,168.0", change: -1.46, color: "#2ecc71" },
];

const HEATMAP = [
  { sym: "NVDA", pct: -4.16 }, { sym: "AAPL", pct: -3.21 }, { sym: "MSFT", pct: -2.24 },
  { sym: "META", pct: -1.34 }, { sym: "GOOGL", pct: 1.42 }, { sym: "AMZN", pct: 1.00 },
  { sym: "AVGO", pct: -0.67 }, { sym: "BRK.B", pct: 0.45 }, { sym: "JPM", pct: -1.90 },
  { sym: "V", pct: 1.09 }, { sym: "TSLA", pct: 2.84 }, { sym: "AMD", pct: -2.15 },
  { sym: "NFLX", pct: 0.78 }, { sym: "CRM", pct: -0.92 }, { sym: "COST", pct: 0.33 },
];

const MOVERS = [
  { sym: "NVDA", price: 177.19, chg: -4.16 },
  { sym: "SMCI", price: 42.80, chg: 5.67 },
  { sym: "TSLA", price: 248.50, chg: 3.82 },
  { sym: "AMD", price: 162.30, chg: -2.15 },
  { sym: "PLTR", price: 78.20, chg: 2.34 },
  { sym: "ARM", price: 118.40, chg: -3.10 },
];

const EARNINGS = [
  { time: "22:45", name: "S&P Global Mfg PMI Final", detail: "A: 0.3%  F: 0.3%" },
  { time: "23:00", name: "All Car Sales", detail: "P: 2.6M Units" },
];

const ECONOMIC = [
  { time: "23:00", name: "ISM Manufacturing PMI", detail: "F: 51.8  P: 52.6" },
  { time: "07:30", name: "Unemployment Rate", detail: "F: 2.6%  P: 2.6%" },
];

const NEWS = [
  { title: "Who is running Iran now?", tag: "#world", source: "Reuters", time: "14:13" },
  { title: "Why did the U.S. and Israel carry out strikes on Iran?", tag: "#world", source: "Reuters", time: "14:13" },
  { title: "How will the strikes affect oil markets and the U.S. economy?", tag: "#world", source: "Reuters", time: "14:13" },
  { title: "Why did Health Canada approve sunscreens tied to fake lab data?", tag: "#health", source: "Reuters", time: "14:12" },
  { title: "What is Samsung's new Privacy Display?", tag: "#lifestyle", source: "Reuters", time: "14:11" },
  { title: "Why have Middle East flights been halted?", tag: "#travel", source: "Reuters", time: "14:10" },
];

// ========== 渲染函数 ==========
function heatColor(pct) {
  if (pct >= 2) return "#0e4429";
  if (pct >= 0.5) return "#1a3a2a";
  if (pct >= 0) return "#1c2b22";
  if (pct >= -0.5) return "#2d1f1f";
  if (pct >= -2) return "#3d1f1f";
  return "#5c1a1a";
}

function renderIndices() {
  document.getElementById("indices").innerHTML = INDICES.map(i => `
    <div class="index-row">
      <div class="badge" style="background:${i.color}">${i.id === "spx" ? "500" : i.id === "ndx" ? "100" : "30"}</div>
      <span class="name">${i.full}</span>
      <span class="value">${i.value}</span>
      <span class="chg ${i.change >= 0 ? "up" : "down"}">${i.change >= 0 ? "+" : ""}${i.change}%</span>
    </div>
  `).join("");
}

function renderHeatmap() {
  document.getElementById("heatmap").innerHTML = HEATMAP.map(h => `
    <div class="heat-cell" style="background:${heatColor(h.pct)}">
      <span class="sym">${h.sym}</span>
      <span class="pct" style="color:${h.pct >= 0 ? "#3fb950" : "#f85149"}">${h.pct > 0 ? "+" : ""}${h.pct}%</span>
    </div>
  `).join("");
}

function renderMovers() {
  document.getElementById("moversList").innerHTML = MOVERS.map(m => `
    <div class="item">
      <span><strong>${m.sym}</strong> · ${m.price}</span>
      <span class="chg ${m.chg >= 0 ? "up" : "down"}">${m.chg > 0 ? "+" : ""}${m.chg}%</span>
    </div>
  `).join("");
}

function renderEarnings() {
  document.getElementById("earningsList").innerHTML = EARNINGS.map(e => `
    <div class="item"><span>${e.time} · ${e.name}</span><span style="color:var(--muted);font-size:0.75rem">${e.detail}</span></div>
  `).join("");
}

function renderEconomic() {
  document.getElementById("economicList").innerHTML = ECONOMIC.map(e => `
    <div class="item"><span>${e.time} · ${e.name}</span><span style="color:var(--muted);font-size:0.75rem">${e.detail}</span></div>
  `).join("");
}

function renderNews() {
  document.getElementById("newsList").innerHTML = NEWS.map(n => `
    <div class="news-item">
      <div class="title">${n.title} <span class="tag">${n.tag}</span></div>
      <div class="meta">${n.source} · ${n.time}</div>
    </div>
  `).join("");
}

function drawMiniChart() {
  const canvas = document.getElementById("spxChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // 简单模拟走势
  const points = [];
  let y = h * 0.6;
  for (let i = 0; i < 60; i++) {
    y += (Math.random() - 0.48) * 8;
    y = Math.max(10, Math.min(h - 10, y));
    points.push(y);
  }

  ctx.beginPath();
  ctx.strokeStyle = "#58a6ff";
  ctx.lineWidth = 2;
  points.forEach((p, i) => {
    const x = (i / (points.length - 1)) * w;
    if (i === 0) ctx.moveTo(x, p);
    else ctx.lineTo(x, p);
  });
  ctx.stroke();

  // 填充
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = "rgba(88,166,255,0.08)";
  ctx.fill();
}

// ========== 实时信号 ==========
let signalCount = 0;

function addSignal(data) {
  const list = document.getElementById("signalList");
  const empty = list.querySelector(".empty");
  if (empty) empty.remove();

  signalCount++;
  document.getElementById("signalCount").textContent = `信号 ${signalCount}`;

  const decision = data.decision || "REVIEW";
  const cls = decision === "ALLOW" ? "allow" : decision === "REJECT" ? "reject" : "";

  const el = document.createElement("div");
  el.className = `signal-item ${cls}`;
  el.innerHTML = `
    <div><strong>${data.action || "?"} ${data.ticker || ""}</strong> ${data.quantity ? "×" + data.quantity : ""}</div>
    <div style="color:var(--muted);font-size:0.78rem;margin-top:2px">${(data.raw || "").slice(0, 60)}</div>
    <div class="meta">
      <span>${decision} · conf ${(data.confidence || 0).toFixed(2)}</span>
      <span>${new Date().toLocaleTimeString()}</span>
    </div>
  `;
  list.insertBefore(el, list.firstChild);

  // 只保留最近 30 条
  while (list.children.length > 30) list.removeChild(list.lastChild);
}

// 轮询本地中继（如果开了的话）
async function pollSignals() {
  try {
    const res = await fetch("http://127.0.0.1:8765/recent");
    if (res.ok) {
      const arr = await res.json();
      arr.forEach(addSignal);
    }
  } catch (e) {
    // 中继未启动时忽略
  }
}

// ========== 初始化 ==========
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });

  renderIndices();
  renderHeatmap();
  renderMovers();
  renderEarnings();
  renderEconomic();
  renderNews();
  drawMiniChart();

  // 每 5 秒尝试拉取新信号
  setInterval(pollSignals, 5000);

  // 演示：模拟几条信号
  setTimeout(() => {
    addSignal({ action: "BUY", ticker: "AAPL", quantity: 100, raw: "BUY AAPL 100 @ 190 SL 185", decision: "ALLOW", confidence: 0.85 });
  }, 1500);
  setTimeout(() => {
    addSignal({ action: "SELL", ticker: "TSLA", quantity: 50, raw: "SELL TSLA 50 shares", decision: "REJECT", confidence: 0.72 });
  }, 3000);
});
