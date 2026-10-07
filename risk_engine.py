"""风控引擎"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional, Set
import time


class Decision(str, Enum):
    ALLOW = "ALLOW"
    REJECT = "REJECT"
    REVIEW = "REVIEW"


@dataclass
class RiskResult:
    decision: Decision
    reason: str
    signal_id: str
    timestamp: float


class RiskEngine:
    def __init__(
        self,
        max_position_size: float = 1000,
        max_slippage_pct: float = 2.0,
        allowed_tickers: Optional[Set[str]] = None,
        blocked_tickers: Optional[Set[str]] = None,
        min_confidence: float = 0.5,
        cooldown_seconds: int = 30,
    ):
        self.max_position_size = max_position_size
        self.max_slippage_pct = max_slippage_pct
        self.allowed_tickers = allowed_tickers
        self.blocked_tickers = blocked_tickers or set()
        self.min_confidence = min_confidence
        self.cooldown_seconds = cooldown_seconds
        self._seen: dict[str, float] = {}
        self._last_ticker: dict[str, float] = {}

    def _key(self, sig) -> str:
        return f"{sig.action.value}:{sig.ticker}:{sig.quantity}:{sig.price}"

    def evaluate(self, signal, current_price: Optional[float] = None) -> RiskResult:
        now = time.time()
        sid = self._key(signal)

        if signal.confidence < self.min_confidence:
            return RiskResult(Decision.REJECT, f"置信度低 ({signal.confidence:.2f})", sid, now)
        if not signal.ticker:
            return RiskResult(Decision.REJECT, "无有效 Ticker", sid, now)

        ticker = signal.ticker.upper()
        if ticker in self.blocked_tickers:
            return RiskResult(Decision.REJECT, f"{ticker} 黑名单", sid, now)
        if self.allowed_tickers and ticker not in self.allowed_tickers:
            return RiskResult(Decision.REJECT, f"{ticker} 不在白名单", sid, now)

        if sid in self._seen and now - self._seen[sid] < 300:
            return RiskResult(Decision.REJECT, "重复信号", sid, now)

        if ticker in self._last_ticker and now - self._last_ticker[ticker] < self.cooldown_seconds:
            return RiskResult(Decision.REJECT, f"{ticker} 冷却中", sid, now)

        if signal.quantity and signal.quantity > self.max_position_size:
            return RiskResult(Decision.REJECT, f"数量超限 {signal.quantity}", sid, now)

        if current_price and signal.price:
            dev = abs(signal.price - current_price) / current_price * 100
            if dev > self.max_slippage_pct:
                return RiskResult(Decision.REVIEW, f"价格偏离 {dev:.1f}%", sid, now)

        if signal.action.value == "UNKNOWN":
            return RiskResult(Decision.REJECT, "未知动作", sid, now)

        self._seen[sid] = now
        self._last_ticker[ticker] = now
        self._cleanup(now)
        return RiskResult(Decision.ALLOW, "通过", sid, now)

    def _cleanup(self, now: float):
        exp = now - 600
        self._seen = {k: v for k, v in self._seen.items() if v > exp}
        self._last_ticker = {k: v for k, v in self._last_ticker.items() if v > exp}
