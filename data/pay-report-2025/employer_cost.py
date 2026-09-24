FX = {"SEK": 9.9098, "EUR": 0.87974, "GBP": 0.75645, "CHF": 0.82775, "NOK": 9.492}
MED = {"Sweden": 73375, "Norway": 101792, "Germany": 87591, "United Kingdom": 102106, "Switzerland": 142592, "United States": 161100}

def sweden(s):
    cap = 7.5 * 83400 * 12 / 12
    p = 0.045 * min(s, cap) + 0.30 * max(0, s - cap)
    return {"social fees": 0.3142 * s, "pension (ITP1 + payroll tax on it)": p * 1.2426}

def norway(s):
    return {"social fees": 0.141 * s, "pension (OTP minimum 2%)": 0.02 * s}

def germany(s):
    return {"social fees": (0.093 + 0.013) * min(s, 101400) + (0.073 + 0.0145 + 0.018) * min(s, 69750)}

def uk(s):
    return {"social fees": 0.15 * max(0, s - 5000), "pension (auto-enrolment 3%)": 0.03 * max(0, min(s, 50270) - 6240)}

def switzerland(s):
    return {"social fees": 0.053 * s + 0.011 * min(s, 148200), "pension (BVG minimum, age 35-44)": 0.5 * 0.10 * max(0, min(s, 90720) - 26460)}

def us(s):
    return {"social fees": 0.062 * min(s, 184500) + 0.0145 * s + 0.006 * 7000}

RULES = [("Sweden", "SEK", sweden), ("Norway", "NOK", norway), ("Germany", "EUR", germany),
         ("United Kingdom", "GBP", uk), ("Switzerland", "CHF", switzerland), ("United States", None, us)]

rows = []
for name, cur, f in RULES:
    usd = MED[name]
    local = usd * FX[cur] if cur else usd
    parts = f(local)
    extra = sum(parts.values())
    rows.append((name, usd, extra / local))
    print(f"{name:15} median ${usd:>8,.0f}  mandatory extra {extra/local:6.1%}  total ${usd*(1+extra/local):>9,.0f}  " + "; ".join(f"{k} {v/local:.1%}" for k, v in parts.items()))
print("US employer share of family health premium (KFF 2025):", 26993 - 6850, "=", f"{(26993-6850)/161100:.1%} of median")
