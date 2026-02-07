# How the Code Calculates Deribit Option Expiry-in-the-Money Probability

This document explains in detail how the code computes the **risk-neutral probability** that a crypto price target will be reached (or exceeded) by expiry, using data from Deribit options. The result is used to compare Polymarket prices against model probabilities and find trading edges.

---

## Overview

The code uses the **Black-76 model**, which is the standard for options on futures. Deribit lists options on BTC and ETH futures, so Black-76 is appropriate (not Black-Scholes, which applies to spot options).

**Key idea:** Under risk-neutral pricing, the probability that the underlying expires above strike \(K\) is given by **N(d2)**, where N is the standard normal CDF. This is the probability used for binary/European-style bets.

---

## Step-by-Step Calculation

### 1. Get the Forward Price (F)

The Black-76 model uses the **forward price** \(F\) at expiry, not the spot price.

**In the code** (`data_fetchers.py` → `fetch_deribit_forward_price`):

1. **Preferred:** Find a Deribit **dated future** expiring near the market’s expiry (within 7 days).
   - Call `get_instruments` with `kind='future'`
   - Exclude perpetuals (very large timestamps)
   - Take the future with expiry closest to the target date
   - Use its `mark_price` as \(F\)

2. **Fallback:** If no suitable future exists, build a **synthetic forward** from put-call parity:
   \[
   F = C - P + K
   \]
   where \(C\) = call mark price, \(P\) = put mark price, \(K\) = strike.
   - Finds options with strike within 20% of the target
   - Uses pairs of call/put at the same strike
   - Requires expiry within 14 days of the target

3. **Last resort:** Use current spot price as \(F\) (valid for short-dated markets).

---

### 2. Get Implied Volatility (σ) for the Strike

**In the code** (`data_fetchers.py` → `fetch_iv_for_market`):

1. **ATM IV:** Deribit’s index price is used to find the ATM strike. ATM call IV is fetched from the ticker (`mark_iv`).

2. **IV by strike:** For strikes between 0.5× and 2× the underlying:
   - Fetches IV for several call options
   - Builds `iv_by_strike`

3. **Strike selection:** For a target strike \(K\) (e.g. a Polymarket target like $200k):
   - Choose the listed strike closest to \(K\)
   - Use that strike’s IV as \(\sigma\)

4. **Fallback:** If no strike IV is available, use ATM IV.

---

### 3. Time to Expiry (T)

**In the code** (`crypto_math.py` → `time_to_expiry_years`):

\[
T = \frac{\text{expiry\_date} - \text{now}}{\text{ms per year}}
\]

\(T\) is in years (e.g. 0.5 for 6 months). Markets with \(T \leq 0\) are skipped.

---

### 4. Black-76 d1 and d2

**In the code** (`crypto_math.py` → `calculate_black76_d1_d2`):

\[
d_1 = \frac{\ln(F/K) + (\sigma^2/2)T}{\sigma\sqrt{T}}
\]

\[
d_2 = d_1 - \sigma\sqrt{T}
\]

Where:
- \(F\) = forward price
- \(K\) = strike (Polymarket target price)
- \(\sigma\) = implied volatility (decimal, e.g. 0.55 for 55%)
- \(T\) = time to expiry in years

**Intuition:**
- \(\ln(F/K)\) measures log-moneyness
- \(\sigma\sqrt{T}\) is the volatility over the remaining life
- \(d_2\) is the standardized “distance” to the strike in log-space at expiry

---

### 5. Risk-Neutral Probability of Expiring ITM

**In the code** (`crypto_math.py` → `calculate_black76_probability_itm`):

- **Above target (call):**  
  \(P(S_T > K) = N(d_2)\)

- **Below target (put):**  
  \(P(S_T < K) = 1 - N(d_2)\)

`N` is the standard normal CDF (`scipy.stats.norm.cdf`).

**Why N(d2)?** In Black-76, the risk-neutral probability of finishing in the money is N(d2). N(d1) is used for delta hedging; N(d2) is the probability of exercise.

---

### 6. Bet Type Adjustment

**In the code** (`arbitrage_calculator.py`):

- **Binary / settle:**  
  Uses the Black-76 probability directly (N(d2) or 1−N(d2)).

- **One-touch:**  
  Uses the approximation:
  \[
  P(\text{touch}) \approx 2 \times P(\text{settle})
  \]
  Capped at 1.0.

---

## Summary Formula

For a “will price exceed $K by expiry?” market:

\[
P(\text{expire above } K) = N\left( \frac{\ln(F/K) + (\sigma^2/2)T}{\sigma\sqrt{T}} - \sigma\sqrt{T} \right) = N(d_2)
\]

For “will price touch $K at any time before expiry?”:

\[
P(\text{touch } K) \approx \min(1, 2 \times N(d_2))
\]

---

## Data Flow in Code

```
Polymarket market (e.g. "Will BTC hit $200k by Dec 2025?")
        ↓
Extract: crypto=BTC, target_price=200000, direction=above, bet_type=one-touch
        ↓
fetch_deribit_data(BTC)     → index price, ATM IV, iv_by_strike
fetch_deribit_forward_price(BTC, expiry, strike=200000) → forward F
        ↓
fetch_iv_for_market(symbol, target_strike, expiry, direction) → strike IV σ (PUT for below, CALL for above)
        ↓
time_to_expiry_years(expiry) → T
        ↓
calculate_black76_d1_d2(F, K, σ, T) → d1, d2
        ↓
calculate_black76_probability_itm(F, K, σ, T, direction) → binary_prob
        ↓
one-touch? → probability = min(1, 2 × binary_prob)
        ↓
Edge = Polymarket price - probability
```

---

## References

- Black-76: Black, F. (1976). *The Pricing of Commodity Contracts.*
- N(d2) as risk-neutral ITM probability: standard option pricing theory.
- One-touch approximation: common rule of thumb \(P(\text{touch}) \approx 2 \times \Delta\).
