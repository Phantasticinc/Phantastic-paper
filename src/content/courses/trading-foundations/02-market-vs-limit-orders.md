---
title: Market vs limit orders
summary: Certainty of getting filled versus certainty of the price.
order: 2
minutes: 5
---
## Two basic ways to say "buy"

A **market order** says: *fill me now at the best price available.* You are almost certain to get filled, but you do not control the exact price. In a calm, heavily traded stock the price is usually very close to what you see. In a thin or fast-moving market it can be worse than you expected.

A **limit order** says: *only fill me at this price or better.* A buy limit at $50 fills only at $50 or lower. A sell limit at $50 fills only at $50 or higher. You control the price, but you may never get filled if the market does not come to you.

| | Price control | Fill certainty |
| --- | --- | --- |
| Market | Low | High |
| Limit | High | Not guaranteed |

## Worked example

A stock trades near $100. You place a **buy limit at $95**. If the price slides to $95 you may fill. If it drifts up to $110 your order just sits there and you miss the move. That is not a bug, it is the trade-off: you got price certainty in exchange for fill certainty.

## When people reach for limits

- Thinly traded names, where the gap between buyers and sellers is wide (next lesson).
- Volatile moments, such as around news or the open.
- When they have a specific price in mind and are happy to wait.

## What this paper desk does

The paper desk fills every ticket instantly **at the last quote**. It does not model limit orders, queues, partial fills or price movement between your click and the fill. That is simplified on purpose, and the [risk notice](/risk) says so. Use the practice task to think through the limit you *would* choose, then remember a real order can behave differently.

```quiz
[
  {
    "q": "What does a market order prioritise?",
    "options": [
      "Getting filled quickly, at whatever the best available price is",
      "Getting a specific price, even if it never fills",
      "Paying no fees",
      "Filling only after the market closes"
    ],
    "answer": 0,
    "explain": "A market order trades certainty of a fill for no control over the exact price."
  },
  {
    "q": "You place a buy limit at $50. At which prices could it fill?",
    "options": ["$50 or higher", "Exactly $50 only", "$50 or lower", "Any price"],
    "answer": 2,
    "explain": "A buy limit is a ceiling. You will pay your limit or less, never more."
  },
  {
    "q": "A stock is at $100 and you place a buy limit at $95. It rises to $110 and never trades at $95. What happens?",
    "options": [
      "The order fills at $110",
      "The order stays unfilled",
      "The order fills at $100",
      "The broker cancels and buys at market for you"
    ],
    "answer": 1,
    "explain": "Limit orders only fill at your price or better. If the market never comes to you, you simply miss the move."
  },
  {
    "q": "Which statement about a limit order is true?",
    "options": [
      "It guarantees both price and fill",
      "It guarantees the fill but not the price",
      "It guarantees your price or better, but not that you get filled",
      "It guarantees you will not lose money"
    ],
    "answer": 2,
    "explain": "A limit protects the price you pay, at the cost of possibly not trading at all."
  },
  {
    "q": "Does this paper desk model limit orders?",
    "options": [
      "Yes, fully, with queues and partial fills",
      "No, it fills at the last quote only",
      "Yes, but only for ETFs",
      "Only when Grok is connected"
    ],
    "answer": 1,
    "explain": "The desk fills tickets instantly at the last quote and does not model limit orders. Real markets are messier."
  }
]
```

```practice
{
  "title": "Pick a limit price, then see the desk's simplified fill",
  "steps": [
    "The NVDA ticket opens pre-filled. Note the last price.",
    "Write down a buy limit you would set about 0.5% below it, and say when it might never fill.",
    "Fill the ticket. The desk fills at the last quote, not at your imagined limit. That is the gap between this tool and a real order."
  ],
  "symbol": "NVDA",
  "shares": 5
}
```
