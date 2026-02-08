#!/usr/bin/env python3
"""Run arbitrage calculator and print Deribit vs Polymarket probability comparison."""

from arbitrage_calculator import calculate_arbitrage_opportunities

if __name__ == "__main__":
    print("Fetching opportunities...")
    result = calculate_arbitrage_opportunities(limit=50)
    opportunities = result.get("opportunities", [])

    if not opportunities:
        print("No opportunities found.")
    else:
        print()
        print("=" * 100)
        print("DERIBIT vs POLYMARKET PROBABILITY COMPARISON")
        print("=" * 100)
        for i, opp in enumerate(opportunities, 1):
            m = opp["market"]
            poly_pct = opp["polymarket_prob"] * 100
            deribit_pct = opp["deribit_prob"]["probability"] * 100
            edge_pct = opp["edge_vs_deribit"] * 100
            signal = opp["signal"]

            question = (m.get("question", ""))[:70]
            if len(m.get("question", "")) > 70:
                question += "..."

            print(f"\n{i}. {question}")
            print(f"   Crypto: {m['crypto']} | Target: ${m['target_price']:,.0f} | {m['direction']} | {m['bet_type']}")
            print(f"   Polymarket: {poly_pct:.1f}%  |  Deribit: {deribit_pct:.1f}%  |  Edge: {edge_pct:+.1f}%  |  Signal: {signal}")

        print()
        print("=" * 100)
        print(f"Total: {len(opportunities)} opportunities")
