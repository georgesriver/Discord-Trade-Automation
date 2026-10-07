"""信号解析器 - 从 Discord 文本提取结构化交易指令"""
import re
from dataclasses import dataclass, asdict
from enum import Enum
from typing import Optional, List


class Action(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    ADD = "ADD"
    REDUCE = "REDUCE"
    STOP = "STOP"
    TARGET = "TARGET"
    CALL = "CALL"
    PUT = "PUT"
    CLOSE = "CLOSE"
    UNKNOWN = "UNKNOWN"


@dataclass
class TradeSignal:
    raw: str
    action: Action
    ticker: Optional[str] = None
    quantity: Optional[float] = None
    price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    option_type: Optional[str] = None
    confidence: float = 0.0

    def to_dict(self):
        d = asdict(self)
        d["action"] = self.action.value
        return d


TICKER_RE = re.compile(r"\b([A-Z]{1,5})\b")
BLACKLIST = {
    "BUY", "SELL", "LONG", "SHORT", "CALL", "PUT", "STOP", "TARGET", "ADD",
    "THE", "FOR", "AND", "WITH", "FROM", "THIS", "THAT", "PRICE", "ENTRY",
    "EXIT", "SIZE", "SHARES", "LOT", "USD", "NOW", "AT", "SL", "TP"
}

ACTION_PATTERNS = [
    (r"\b(BUY|LONG|BTO|买入|做多)\b", Action.BUY),
    (r"\b(SELL|SHORT|STO|卖出|做空)\b", Action.SELL),
    (r"\b(ADD|加仓|加码)\b", Action.ADD),
    (r"\b(REDUCE|减仓|减码)\b", Action.REDUCE),
    (r"\b(STOP|SL|止损)\b", Action.STOP),
    (r"\b(TARGET|TP|止盈)\b", Action.TARGET),
    (r"\b(CALL)\b", Action.CALL),
    (r"\b(PUT)\b", Action.PUT),
    (r"\b(CLOSE|EXIT|平仓)\b", Action.CLOSE),
]


def parse_signal(text: str) -> TradeSignal:
    text = text.strip()
    upper = text.upper()

    action = Action.UNKNOWN
    for pat, act in ACTION_PATTERNS:
        if re.search(pat, upper, re.I):
            action = act
            break

    tickers = [t for t in TICKER_RE.findall(upper) if t not in BLACKLIST]
    ticker = tickers[0] if tickers else None

    qty_m = re.search(r"(?:qty|quantity|size|数量|股)?\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:shares?|股|contracts?)?", text, re.I)
    quantity = float(qty_m.group(1)) if qty_m else None

    price_m = re.search(r"(?:@|price|entry|价格|入场)?\s*[:=]?\s*\$?(\d+(?:\.\d+)?)", text, re.I)
    price = float(price_m.group(1)) if price_m else None

    sl_m = re.search(r"(?:sl|stop|止损)\s*[:=]?\s*\$?(\d+(?:\.\d+)?)", text, re.I)
    stop_loss = float(sl_m.group(1)) if sl_m else None

    tp_m = re.search(r"(?:tp|target|止盈)\s*[:=]?\s*\$?(\d+(?:\.\d+)?)", text, re.I)
    take_profit = float(tp_m.group(1)) if tp_m else None

    option_type = None
    if action in (Action.CALL, Action.PUT):
        option_type = action.value
    elif re.search(r"\bCALL\b", upper):
        option_type = "CALL"
    elif re.search(r"\bPUT\b", upper):
        option_type = "PUT"

    conf = 0.25
    if action != Action.UNKNOWN: conf += 0.3
    if ticker: conf += 0.25
    if quantity or price: conf += 0.2

    return TradeSignal(
        raw=text, action=action, ticker=ticker, quantity=quantity,
        price=price, stop_loss=stop_loss, take_profit=take_profit,
        option_type=option_type, confidence=min(conf, 1.0)
    )
