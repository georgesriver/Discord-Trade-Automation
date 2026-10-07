# TradeForge

> 把 Discord 交易信号变成可追踪、可风控、可复盘的个人交易基础设施  
> **机器负责速度 · 规则负责风险 · 人保留最终控制权**

[![GitHub](https://img.shields.io/badge/GitHub-luffy--yu%2FDiscord2Discord-blue?logo=github)](https://github.com/luffy-yu/Discord2Discord)
[![Status](https://img.shields.io/badge/Status-Active-success)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## 为什么做这个？

玩股票的人，或多或少都见过各种交易群里的实时提醒。

Discord 里每天各种 `BUY`、`SELL`、加仓、止损、`CALL`、`PUT`……

以前的操作流程：

```
看到消息 → 打开券商 → 找标的 → 核对价格和数量 → 下单
```

等操作完，价格可能已经跑了。

所以干脆自己折腾了一套自动化系统，把这些重复的信息处理工作交给程序。

**自动交易 ≠ 无脑跟单。**  
真正有意思的是把这一整条链路建立起来：

```
Signal → Parsing → Validation → Risk → Execution → Review
```

---

## 完整链路

| 步骤 | 模块 | 说明 |
|------|------|------|
| 1 | **交易信息群** | 别人运营的 Discord 交易信号频道 |
| 2 | **Chrome Extension** | 实时读取 Discord Web 的新交易信息 |
| 3 | **转发到自己的 Discord** | 自动转发到自己控制的 Server / 频道 |
| 4 | **TradeForge 信号解析** | 解析 Ticker / 方向 / 数量 / 期权类型等 |
| 5 | **风控与验证** | 检查标的、去重、过滤无效或可疑指令、仓位与风险控制 |
| 6 | **Moomoo API 自动交易** | 连接券商 API，自动执行股票 / 期权下单 |

---

## 核心组件

### 1. Chrome Extension — Trade Alerting Discord Web Forwarder

自己开发的浏览器扩展，负责把 Discord Web 可见频道的新消息实时转发到本地中继。

- 版本：`0.1.0`
- 特点：本地中继，不经过第三方服务器
- 作用：解决 Discord 官方 Bot 权限和消息获取限制

![Chrome Extension](../attachments/1000033463.jpg)

仓库相关实现可参考：[Discord2Discord](https://github.com/luffy-yu/Discord2Discord)

### 2. TradeForge 解析 & 风控引擎

真正麻烦的不是自动下单，而是这些边界情况：

- Ticker 写错了怎么办？
- 同一条消息重复出现怎么办？
- 价格已经跑掉了还要不要执行？
- 一句话同时出现入场、止损、止盈怎么理解？
- 信息有歧义时，系统应该执行还是拒绝？
- 怎样防止一次错误解析直接变成错误交易？
- 怎样保证每个 Signal、Decision、Order、Fill 都能追踪和复盘？

设计原则：

- 默认拒绝歧义指令
- 多层校验 + 限额保护
- 完整日志，支持事后复盘

### 3. Market Pulse 仪表盘

实时市场辅助面板，帮助决策而不是替代决策。

**功能包括：**

- Market Overview（SPX / NDX / DJI 等）
- Sector Heatmap
- Biggest Movers
- Earnings Calendar
- Economic Calendar
- Latest News（按标签分类）

![Market Pulse Dashboard](../attachments/1000033458.jpg)

![Latest News](../attachments/1000033461.jpg)

---

## 带来的改变

| 维度 | 说明 |
|------|------|
| **更快** | 减少手动操作，抓住时机 |
| **更准** | 自动解析，降低人为错误 |
| **更安全** | 有风控规则，避免误单和重复下单 |
| **更高效** | 支持股票 / 期权的自动交易 |
| **可复盘** | 完整记录每一笔交易 |
| **更自由** | 基于自己的规则，而不是无脑跟单 |

> “不是无脑跟单，而是把有价值的信息，通过技术变成可执行的交易系统。  
> 这不仅是更快的交易，更是属于自己的交易基础设施。”

---

## 项目结构（规划）

```
TradeForge/
├── chrome-extension/          # Discord Web Forwarder
├── parser/                    # 信号解析引擎
├── risk-engine/               # 风控与验证
├── execution/                 # Moomoo / 券商 API 对接
├── dashboard/                 # Market Pulse 前端
├── docs/                
... 
