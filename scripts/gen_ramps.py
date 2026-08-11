#!/usr/bin/env python3
"""
Generate perceptually-even colour ramps in OKLCH and emit sRGB hex.

Why OKLCH: stepping lightness in OKLab keeps the visual distance between
adjacent steps roughly constant, which sRGB/HSL do not. That matters here
because the neutral ramp carries a navy cast, and a naive HSL ramp would
go muddy through the mid-tones.

Also reports WCAG contrast for every pair we actually rely on, so the
values baked into tokens.json are verified rather than asserted.
"""
import math, json

# ---------- sRGB <-> OKLab ----------

def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def linear_to_srgb(c):
    return c * 12.92 if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4))

def rgb_to_hex(r, g, b):
    f = lambda c: max(0, min(255, round(c * 255)))
    return '#{:02X}{:02X}{:02X}'.format(f(r), f(g), f(b))

def rgb_to_oklab(r, g, b):
    r, g, b = srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b)
    l = 0.4122214708*r + 0.5363325363*g + 0.0514459929*b
    m = 0.2119034982*r + 0.6806995451*g + 0.1073969566*b
    s = 0.0883024619*r + 0.2817188376*g + 0.6299787005*b
    l_, m_, s_ = l ** (1/3), m ** (1/3), s ** (1/3)
    return (
        0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_,
        1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_,
        0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_,
    )

def oklab_to_rgb(L, a, b):
    l_ = L + 0.3963377774*a + 0.2158037573*b
    m_ = L - 0.1055613458*a - 0.0638541728*b
    s_ = L - 0.0894841775*a - 1.2914855480*b
    l, m, s = l_**3, m_**3, s_**3
    r =  4.0767416621*l - 3.3077115913*m + 0.2309699292*s
    g = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s
    bb=  -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
    return tuple(linear_to_srgb(max(0.0, min(1.0, c))) for c in (r, g, bb))

def oklch(L, C, H):
    h = math.radians(H)
    return oklab_to_rgb(L, C * math.cos(h), C * math.sin(h))

def to_lch(hexv):
    L, a, b = rgb_to_oklab(*hex_to_rgb(hexv))
    return L, math.hypot(a, b), math.degrees(math.atan2(b, a)) % 360

# ---------- WCAG contrast ----------

def relative_luminance(hexv):
    r, g, b = (srgb_to_linear(c) for c in hex_to_rgb(hexv))
    return 0.2126*r + 0.7152*g + 0.0722*b

def contrast(a, b):
    la, lb = relative_luminance(a), relative_luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

# ---------- ramps ----------

STEPS = [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000]
# Lightness targets in OKLab L. Tuned so 500 lands near mid and the dark
# end has enough separation for dark-mode surfaces (which need 3-4 usable
# near-black steps, not one).
L_TARGETS = [1.000, 0.985, 0.968, 0.936, 0.876, 0.812, 0.740, 0.660,
             0.578, 0.492, 0.404, 0.312, 0.246, 0.000]

def build_ramp(name, hue, chroma_curve, l_targets=L_TARGETS):
    out = {}
    for step, L, C in zip(STEPS, l_targets, chroma_curve):
        out[str(step)] = rgb_to_hex(*oklch(L, C, hue))
    return name, out

# Neutral: navy-cast. Hue borrowed from the league navy so greys read as
# "MLS grey" rather than generic. Chroma stays low and rises slightly at
# the dark end where a flat grey would look dead.
_, NAVY_C, NAVY_H = to_lch('#001F5B')
NEUTRAL_CHROMA = [0.000, 0.003, 0.005, 0.008, 0.011, 0.013, 0.015, 0.016,
                  0.017, 0.019, 0.022, 0.026, 0.030, 0.000]

# Red: hue from the league red.
_, RED_C, RED_H = to_lch('#E2231A')
RED_CHROMA = [0.000, 0.012, 0.024, 0.048, 0.090, 0.132, 0.170, 0.196,
              0.205, 0.186, 0.158, 0.126, 0.100, 0.000]
RED_L = [1.000, 0.980, 0.958, 0.912, 0.836, 0.760, 0.688, 0.620,
         0.556, 0.482, 0.408, 0.322, 0.256, 0.000]

# Navy: hue from the league navy.
NAVY_CHROMA = [0.000, 0.008, 0.016, 0.032, 0.060, 0.090, 0.118, 0.140,
               0.155, 0.162, 0.158, 0.140, 0.118, 0.000]
NAVY_L = [1.000, 0.980, 0.958, 0.914, 0.842, 0.766, 0.690, 0.612,
          0.534, 0.450, 0.368, 0.284, 0.222, 0.000]

ramps = {}
ramps.update(dict([build_ramp('neutral', NAVY_H, NEUTRAL_CHROMA)]))
ramps.update(dict([build_ramp('red', RED_H, RED_CHROMA, RED_L)]))
ramps.update(dict([build_ramp('navy', NAVY_H, NAVY_CHROMA, NAVY_L)]))

# Pin the two league brand anchors to their documented values rather than
# to a computed ramp step. The ramp is scaffolding; the brand colour is
# the brand colour.
ramps['red']['600'] = '#E2231A'
ramps['navy']['900'] = '#001F5B'

# Support ramps for status. Hues chosen to sit clearly apart from the
# brand red so "error" never reads as "brand".
SUPPORT = {
    'green':  (150.0, [0,0.014,0.028,0.056,0.098,0.132,0.156,0.168,0.170,0.156,0.134,0.108,0.088,0]),
    'amber':  ( 76.0, [0,0.016,0.032,0.062,0.104,0.136,0.156,0.164,0.162,0.150,0.132,0.108,0.088,0]),
    'cyan':   (228.0, [0,0.012,0.024,0.048,0.084,0.114,0.136,0.148,0.152,0.146,0.132,0.110,0.092,0]),
}
for nm, (hue, ch) in SUPPORT.items():
    ramps.update(dict([build_ramp(nm, hue, ch)]))

print(json.dumps(ramps, indent=2))

# ---------- verification ----------
print('\n--- contrast checks (WCAG 2.1) ---')
checks = [
    ('light fg on light bg',  ramps['neutral']['900'], '#FFFFFF', 4.5),
    ('light muted on light',  ramps['neutral']['700'], '#FFFFFF', 4.5),
    ('light subtle on light', ramps['neutral']['600'], '#FFFFFF', 3.0),
    ('brand red on white',    '#E2231A',               '#FFFFFF', 3.0),
    ('white on brand red',    '#FFFFFF',               '#E2231A', 3.0),
    ('white on navy',         '#FFFFFF',               '#001F5B', 4.5),
    ('dark fg on dark bg',    ramps['neutral']['50'],  ramps['neutral']['950'], 4.5),
    ('dark muted on dark',    ramps['neutral']['300'], ramps['neutral']['950'], 4.5),
    ('dark subtle on dark',   ramps['neutral']['400'], ramps['neutral']['950'], 3.0),
    ('red-400 on dark',       ramps['red']['400'],     ramps['neutral']['950'], 4.5),
    ('green-400 on dark',     ramps['green']['400'],   ramps['neutral']['950'], 4.5),
    ('amber-400 on dark',     ramps['amber']['400'],   ramps['neutral']['950'], 4.5),
    ('green-700 on white',    ramps['green']['700'],   '#FFFFFF', 4.5),
    ('amber-800 on white',    ramps['amber']['800'],   '#FFFFFF', 4.5),
]
fails = 0
for label, fg, bg, need in checks:
    r = contrast(fg, bg)
    ok = r >= need
    fails += (not ok)
    print(f'{"PASS" if ok else "FAIL"}  {label:24s} {fg} on {bg}  {r:5.2f}:1  (need {need})')
print(f'\n{fails} failing check(s)')
