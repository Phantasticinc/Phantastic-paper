---
title: Stop losses
summary: Pre-deciding where you are wrong, and why a stop is not a promise.
order: 5
minutes: 6
---
## What a stop does

A **stop-loss order** is an instruction that sits dormant until the price reaches your **stop price**, then turns into a regular order to exit. Its job is to take emotion out of the exit: you decide the level while calm.

## Two kinds

- **Stop-market**: once the stop price trades, it becomes a **market order**. You almost surely exit, but at whatever price is available.
- **Stop-limit**: once triggered, it becomes a **limit order**. You control the lowest price you accept, but if the price blows through your limit you may **not exit at all**.

## Gaps: a stop is not a guaranteed price

A stock closes at $50. You hold a sell-stop at $48. Overnight bad news hits and it **opens at $44**. Your stop triggers at the open and a stop-market fills near **$44**, not $48. That is called a **gap**, and the loss is bigger than planned. Stops reduce risk; they do not eliminate it.

## Where to put a stop

Good stops come from the trade idea, not from a round number or a percent picked at random:

- Put it at a level that, if hit, means your reason for the trade is **wrong**, for example below a recent support area (lesson 7).
- Not so tight that ordinary day-to-day wiggle triggers it. A stop inside normal noise gets you shaken out for no reason.
- Then size the position from that stop (lesson 4), not the other way round.

A **trailing stop** follows the price up by a set distance and never moves down. It can lock in gains but also exits you on normal pullbacks.

## What this paper desk does

The desk's Grok autopilot (here a local rules engine) attaches a **stop and a target** to the positions it opens. While the desk is open, it checks them against each new quote and closes the position at that quote when one is crossed. Manual tickets have no stop. This is simplified: a real stop sits with your broker around the clock, and, as the [risk notice](/risk) says, paper fills have no slippage or halts.

```quiz
[
  {
    "q": "What is a stop-loss order for?",
    "options": [
      "To guarantee a profit",
      "To exit automatically if the price reaches a level you chose in advance",
      "To buy more when the price falls",
      "To avoid paying the spread"
    ],
    "answer": 1,
    "explain": "A stop is a pre-planned exit that triggers at your stop price."
  },
  {
    "q": "A stock closes at $50. You hold a sell-stop at $48. It opens next day at $44. A stop-market order will most likely fill:",
    "options": ["At $48 exactly", "Near $44", "At $50", "It will not trigger"],
    "answer": 1,
    "explain": "The stop triggers when the price is at or below $48, and the market order fills near the available price, around $44. That is gap risk."
  },
  {
    "q": "What is the main risk of a stop-limit order?",
    "options": [
      "It always fills at the worst price",
      "If price jumps past your limit it may not fill at all",
      "It cannot be used on ETFs",
      "It triggers before the stop price"
    ],
    "answer": 1,
    "explain": "A limit protects your price but not your exit. In a gap you can be left holding the position."
  },
  {
    "q": "Which is the better basis for choosing a stop?",
    "options": [
      "A level that, if hit, shows your trade idea was wrong",
      "A random round percent",
      "As close to entry as possible",
      "Whatever number feels comfortable"
    ],
    "answer": 0,
    "explain": "A stop should mark where the idea fails. Then size the position from that distance."
  },
  {
    "q": "A stop is placed very close to entry on a fast-moving stock. What often happens?",
    "options": [
      "It almost never triggers",
      "Normal price noise triggers it and you are stopped out for little reason",
      "It guarantees a profit",
      "It locks in the price you wanted"
    ],
    "answer": 1,
    "explain": "A stop inside the normal swing range tends to get hit by routine movement."
  }
]
```

```practice
{
  "title": "Read the stops Grok attaches",
  "steps": [
    "Open the desk and run one Grok cycle. It uses one of your free daily cycles.",
    "In Positions, find a holding and read its stop and target price.",
    "Work out the distance to the stop as a percent, and the dollars at risk (shares x risk per share). Does it fit within 1% of the desk?"
  ]
}
```
