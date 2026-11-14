---
title: Position sizing and the 1% rule
summary: Decide how much you can lose first, then work out how many shares that allows.
order: 4
minutes: 7
---
## Size is the part you control

You cannot control whether a trade works. You can control how much you lose if it does not. **Position sizing** means choosing the number of shares so that a loss stays small.

## The 1% rule

A common guideline: risk no more than **1% of your account** on any one trade. It is a rule of thumb, not a law. Some people use 0.5% or 2%. The point is that a string of losses cannot wreck you.

The steps:

1. **Dollar risk** = account size x risk percent.
2. Pick an **entry** and a **stop** (the price where your idea is proven wrong, see the next lesson).
3. **Risk per share** = entry - stop.
4. **Shares = floor(dollar risk / risk per share)**, rounded *down* to a whole number.

## Worked examples

**A.** Account $25,000, risk 1% = **$250**. Entry $50, stop $47.50, so risk per share is $2.50. Shares = 250 / 2.50 = **100**. Position value is 100 x $50 = $5,000, which is 20% of the account.

**B.** Same account. Entry $200, stop $190, risk per share $10. Shares = 250 / 10 = **25**. Position value $5,000.

**C. Watch out for tight stops.** Entry $50, stop $49.50, risk per share $0.50. Shares = 250 / 0.50 = **500**, a $25,000 position, the whole account. The rule alone said "fine", but it is a bad idea: one overnight gap could hurt a lot. So also set a **maximum position size**, for example no more than 20% of the account in one name. This desk has the same idea: its risk profiles cap a single name at 12%, 22% or 35% of NAV.

## What the rule does not do

The 1% rule limits loss **if the stop works**. Prices can **gap** past your stop, so the real loss can be bigger than planned (next lesson). It also does not tell you whether the trade is a good one.

## Try the sizer

Use the calculator below with your own numbers, then open the result as a ticket on the paper desk.

```widget
position-sizer
```

```quiz
[
  {
    "q": "Your account is $20,000 and you risk 1% per trade. What is the most you plan to lose on one trade?",
    "options": ["$20", "$200", "$2,000", "$1,000"],
    "answer": 1,
    "explain": "1% of $20,000 = $200."
  },
  {
    "q": "Account $20,000, risk 1%. Entry $40, stop $38. How many shares?",
    "options": ["50", "100", "200", "500"],
    "answer": 1,
    "explain": "Dollar risk $200; risk per share $2; shares = 200 / 2 = 100."
  },
  {
    "q": "Account $50,000, risk 1%. Entry $100, stop $96. How many shares (round down)?",
    "options": ["50", "100", "125", "500"],
    "answer": 2,
    "explain": "Dollar risk $500; risk per share $4; shares = 500 / 4 = 125."
  },
  {
    "q": "You keep the same 1% risk but move your stop farther from entry. What happens to the share count?",
    "options": ["It goes up", "It goes down", "It stays the same", "It becomes zero"],
    "answer": 1,
    "explain": "A wider stop means more risk per share, so fewer shares fit inside the same dollar risk."
  },
  {
    "q": "Does the 1% rule guarantee you will never lose more than 1% on a trade?",
    "options": [
      "Yes, always",
      "No. Prices can gap past a stop, so a loss can exceed the plan",
      "Yes, if you use a limit order",
      "Only for ETFs"
    ],
    "answer": 1,
    "explain": "The rule sizes the position for the planned stop. Gaps and fast markets can fill you worse than the stop."
  }
]
```

```practice
{
  "title": "Size a position at 1% risk",
  "steps": [
    "On a $100,000 desk, 1% is $1,000. Suppose you buy MSFT near $450 with a stop 5% below, at $427.50. Risk per share is $22.50.",
    "Shares = floor(1,000 / 22.50) = 44. That is about $19,800, or roughly 20% of the desk.",
    "The ticket opens pre-filled with 44 shares. Fill it, then use the calculator above with the live price to size your own."
  ],
  "symbol": "MSFT",
  "shares": 44
}
```
