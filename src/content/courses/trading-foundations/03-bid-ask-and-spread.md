---
title: Bid, ask and the spread
summary: Why buying and instantly selling the same thing loses a little.
order: 3
minutes: 5
---
## Two prices at once

At any moment a market has two prices:

- The **bid**: the highest price someone is currently willing to *pay*.
- The **ask** (or offer): the lowest price someone is currently willing to *sell* at.

The ask is always at or above the bid. The gap between them is the **spread**. The **last price** is just where the most recent trade happened. It is neither.

## You cross the spread

If you send a **market buy**, you typically buy at the **ask**. A **market sell** typically sells at the **bid**. So buying and instantly selling the same shares loses roughly the spread, even if nothing else moves.

**Example.** Bid $20.00, ask $20.10, so the spread is **$0.10**. You buy 200 shares at $20.10 and immediately sell them at $20.00. You lose 200 x $0.10 = **$20**, plus any commissions. This hidden cost is why very active traders watch spreads closely.

## What makes a spread wide or tight

- **Tight**: heavily traded, popular securities, where many buyers and sellers compete. Spreads can be one cent.
- **Wide**: thinly traded names and times when the market is uncertain, like right at the open or after surprising news.

A limit order (last lesson) lets you refuse to cross a wide spread.

## What this paper desk does

The desk shows **one price** and fills at it, with no spread. A round trip on the desk therefore costs nothing, and real life does not. Keep that in mind when a paper result looks great: real costs would eat into it, especially for frequent trading. See the [risk notice](/risk).

```quiz
[
  {
    "q": "What is the bid?",
    "options": [
      "The lowest price a seller will accept",
      "The highest price a buyer is currently willing to pay",
      "The price of the last trade",
      "The price at the previous close"
    ],
    "answer": 1,
    "explain": "Bid = what buyers will pay now. Ask = what sellers want now."
  },
  {
    "q": "You send a market buy order. At roughly which price do you usually buy?",
    "options": ["The bid", "The ask", "The previous close", "Halfway between"],
    "answer": 1,
    "explain": "A market buy takes the lowest offered price, the ask."
  },
  {
    "q": "Bid is $20.00 and ask is $20.10. What is the spread?",
    "options": ["$0.05", "$0.10", "$20.05", "$40.10"],
    "answer": 1,
    "explain": "Spread = ask minus bid = $20.10 - $20.00 = $0.10."
  },
  {
    "q": "You buy 200 shares at the ask of $20.10 and immediately sell them at the bid of $20.00. Ignoring fees, what do you lose?",
    "options": ["$0", "$2", "$20", "$200"],
    "answer": 2,
    "explain": "200 shares x $0.10 = $20. That is the cost of crossing the spread twice."
  },
  {
    "q": "Which usually has the tighter spread?",
    "options": [
      "A very heavily traded ETF",
      "A rarely traded small company",
      "They are always identical",
      "Whichever has the higher price"
    ],
    "answer": 0,
    "explain": "More competition between buyers and sellers squeezes the spread."
  }
]
```

```practice
{
  "title": "Price the spread the desk does not charge",
  "steps": [
    "The AMD ticket opens pre-filled with 10 shares. Note the single last price the desk shows.",
    "Imagine a real market with a $0.05 spread. Calculate what buying and selling 10 shares right away would cost (10 x $0.05).",
    "Try 1,000 shares of a thinner name in your head. How does the cost scale?"
  ],
  "symbol": "AMD",
  "shares": 10
}
```
