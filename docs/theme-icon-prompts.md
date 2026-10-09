# Innovation theme illustrations: Gemini prompts (v2, concept-led)

The current icons are 80×100 px and only label a sector (globe, DNA, robot arm…). These prompts give each theme
**one visual idea** that explains what students are being asked to build, in the **faceted style of the GIC lightbulb
logo**, with each theme in its **brochure colour** (teal / mint / blue / gold / coral).

> **Decision (Oct 2026):** the shipped icons are the *classic symbol* set from the first Gemini round
> (globe, DNA, robot arm, sprinter, shopping bag), chosen over the concept-led set below in an A/B review.
> The prompts below produced the rejected set and are kept only as reference for a possible future refresh.

| # | Theme | Colour | The idea | File |
|---|---|---|---|---|
| 1 | Planet & Sustainability | Teal `#007367` | A small town that runs on its own waste | `sustainability.png` |
| 2 | Bio Economy & Agriculture | Mint `#8ECDB8` | From soil to health | `bioeconomy.png` |
| 3 | DeepTech & Manufacturing | Blue `#6090CF` | The factory is a microchip | `deeptech.png` |
| 4 | Sports & Fitness | Gold `#E2B33F` | The pulse of the game | `sports.png` |
| 5 | D2C & Consumer Brands | Coral `#DC7570` | A shop that fits in a phone | `d2c.png` |

## How to use
1. Use **one** Gemini chat. Paste the **master prompt**, wait for "ready".
2. Paste each theme prompt one at a time; ask for 4 variations and pick the best.
3. If one drifts: *"Keep exactly the same style as icon 1."*
4. Save as the file names above and give them to the dev team (`public/media/themes/`, converted to WebP).

Expect to regenerate #4 (track from above) and #5 (phone + awning) a few times: they are the hardest to render cleanly.

## Master prompt
```
I'm designing 5 matching illustrations for a national student startup
competition website (the GITAM Innovation Challenge, tagline "Ideate. Innovate.
Impact."). Each illustration explains one innovation THEME through a single
visual idea, not just a sector symbol. Follow this style for every request in
this chat.

FORMAT: square 1:1, 1024x1024. A solid flat background in the theme's color
(I will specify), edge to edge. No border, frame, or rounded corners.

STYLE: modern flat vector with a LOW-POLY / FACETED look. Surfaces are built
from clean triangles and angular facets, like a faceted gemstone, echoing a
geometric lightbulb logo. Bold simple shapes, readable at 100 px. No gradients
(facets use flat tints and shades), no outlines, no shadows, no 3D rendering,
no photorealism.

BRAND DETAIL (every illustration): 4-6 small triangular "idea shards" drifting
off the subject toward the top-right, like sparks from a lightbulb. Keep them
small, in cream and a lighter tint of the background color.

PALETTE (nothing else):
- Deep green #00473F: main dark shapes
- Cream #FCF3E4: main light shapes
- White #FFFFFF: tiny highlights only
- Theme color: the background and ONE accent area; facets may use lighter and
  darker tints of it.

COMPOSITION: centered; subject about 65% of the canvas; at least 12% empty
margin on every side; one clear focal point.
DO NOT include text, letters, numbers, logos, watermarks, or human faces.
Any people must be faceless simple shapes.
Reply "ready" and wait for the first request.
```

## Theme prompts

### 1. Planet & Sustainability: teal
```
Icon 1 of 5, "Planet & Sustainability". Background: teal #007367.
Idea: a small town that runs on its own waste. Draw a compact faceted town
(3-4 low buildings, solar panels on the roofs, one wind turbine) sitting inside
a thick circular loop band with arrowheads, which represents the circular
economy. At the bottom of the loop, a plastic bottle has a young sapling
growing out of its neck. Main shapes cream and deep green.
```
Explains: clean energy · waste → resource · circular design · Tier 2/3 cities.

### 2. Bio Economy & Agriculture: mint
```
Icon 2 of 5, "Bio Economy & Agriculture". Background: mint #8ECDB8.
Idea: from soil to health. Draw a cross-section of the ground: above the
surface a wheat stalk with a faceted ear of grain; below the surface the roots
form a DNA double-helix ladder reaching downward; a small heart shape sits on
one of the leaves. Deep green for the soil and DNA, cream for the wheat.
Exact same style as icon 1.
```
Explains: agriculture · biotech · health outcomes, as one chain.

### 3. DeepTech & Manufacturing: blue
```
Icon 3 of 5, "DeepTech & Manufacturing". Background: blue #6090CF.
Idea: the factory is a microchip. Draw a top-down faceted microchip with pins
on all four sides; its circuit traces are conveyor belts carrying tiny cubes
(products) toward a small robot arm in the center of the chip. Add three small
curved IoT signal arcs in one corner. Cream chip body, deep green traces.
Exact same style as the previous icons.
```
Explains: smart factory · robotics · IoT · automation for MSMEs.

### 4. Sports & Fitness: gold
```
Icon 4 of 5, "Sports & Fitness". Background: gold #E2B33F.
Idea: the pulse of the game. Draw a running track oval seen from above with
three lanes; one straight section of a lane breaks into a heartbeat/ECG spike;
a comet-like trail of dots follows a single round runner marker around the
bend, representing performance tracking. Deep green dominant, cream lane
lines. Exact same style as the previous icons.
```
Explains: athlete performance tracking · wearables · grassroots sport.

### 5. D2C & Consumer Brands: coral
```
Icon 5 of 5, "D2C & Consumer Brands". Background: coral #DC7570.
Idea: a shop that fits in a phone. Draw a smartphone whose top edge has a
striped shop awning (canopy); a small parcel box lifts off the screen and
travels along a curved dotted path to a tiny house door with a heart above it.
Cream phone, deep green details. Exact same style as the previous icons.
```
Explains: digital-first brands · direct delivery · community commerce.

## Checklist before sending to dev
- [ ] Each icon uses its own theme colour as the background, same palette otherwise
- [ ] Faceted look and 4-6 idea shards on every icon
- [ ] Clear margin on all sides (corners get rounded by CSS)
- [ ] Readable at ~100 px
- [ ] No text, faces, or watermarks
