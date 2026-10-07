"""Moomoo 执行接口（模拟盘可用，真实接口留位）"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


@dataclass
class OrderRequest:
    ticker: str
    side: OrderSide
    quantity: float
    limit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None


@dataclass
class OrderResult:
    success: bool
    order_id: Optional[str] = None
    message: str = ""
    filled_qty: float = 0.0
    avg_price: float = 0.0


class MoomooExecutor:
    def __init__(self, paper: bool = True):
        self.paper = paper
        self._connected = False
        logger.info(f"MoomooExecutor paper={paper}")

    def connect(self) -> bool:
        # TODO: 真实连接 OpenD
        self._connected = True
        return True

    def place_order(self, req: OrderRequest) -> OrderResult:
        if not self._connected:
            return OrderResult(False, message="未连接")
        if self.paper:
            oid = f"PAPER-{req.ticker}-{req.side.value}-{int(req.quantity)}"
            logger.info(f"[PAPER] {req.side.value} {req.quantity} {req.ticker}")
            return OrderResult(True, order_id=oid, message="模拟成功", filled_qty=req.quantity)
        return OrderResult(False, message="真实交易接口未实现")
