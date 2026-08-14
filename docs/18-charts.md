# Charts

A league runs on figures, so charts appear in nearly every deck and report. This is where accessibility usually dies quietly, because chart colours get picked by eye.

So this palette was not picked. It was **searched**, then validated.

```bash
npm run palette     # re-derive and re-validate
```

---

## The palette

Eight hues, fixed order, assigned in sequence and **never cycled**. Light and dark are different steps of the same hues — no single hex clears 3:1 against both white and near-black, so dark is a selected palette rather than an automatic flip.

| Slot | Hue | Light | Dark |
|---|---|---|---|
| 1 | blue | `#1844B9` | `#2959CF` |
| 2 | orange | `#E77412` | `#DE6C00` |
| 3 | teal | `#07A4A4` | `#00A0A1` |
| 4 | red | `#AC0311` | `#BE2323` |
| 5 | purple | `#BC70EE` | `#B468E6` |
| 6 | green | `#03A14A` | `#02AE50` |
| 7 | magenta | `#9B0065` | `#B22578` |
| 8 | gold | `#B78D19` | `#B48A12` |

Slot 1 is anchored on the brand navy's own hue, so the first series in any chart is recognisably MLS.

**Verified, both modes:**

```
light   worst adjacent pair 16.2 (simulated protanopia / deuteranopia)
        normal-vision floor 26.8
        all eight >= 3:1 on white
dark    worst adjacent pair 16.3
        normal-vision floor 26.5
        all eight >= 3:1 on near-black
```

The standard's CVD target is 8 and the normal-vision floor is 15, so both modes clear with roughly double the required margin.

### How it was derived

`scripts/gen_chart_palette.mjs`:

1. Fix eight hue families in OKLCH, anchored on the brand navy and red.
2. Per hue, per mode, generate candidate steps inside that mode's lightness band, with chroma held in a professional range rather than at the gamut edge, that clear 3:1 on the surface.
3. Search the hue **order** while choosing each slot's step greedily.
4. Validate against the six categorical checks.

One design decision worth naming: the search **satisfices rather than maximises**. Maximising separation overshoots to about 19 and pays for it in chroma — it pushes every slot to a lightness extreme and the palette comes out muddy, brown instead of orange and maroon instead of red. So the greedy step picks the most chromatic candidate that still clears a comfortable margin over the target. Safety is a constraint here, not the objective.

---

## Sequential and diverging

**Sequential** encodes magnitude: one hue, light to dark, on the brand navy. Six steps. Never a rainbow.

**Diverging** encodes polarity around a baseline: red on one arm, navy on the other, with a **neutral grey midpoint**. Never a hue in the middle — a coloured midpoint reads as a third category.

Running the categorical validator on either of these will fail by design: they span the lightness band and their steps sit close together. That is expected, not a real failure. The check for a ramp is lightness monotonicity.

---

## Rules

**One axis. Never a dual-axis chart.** Two measures at different scales become two charts, small multiples, or both indexed to a common base. This is the single most common charting mistake, and a dual axis lets the author imply any correlation they like by choosing the scales.

**Colour follows the entity, never its rank.** A filter that changes how many series are shown must not repaint the survivors. If Portland is slot 3, Portland stays slot 3.

**A ninth series does not get a ninth colour.** It folds into "Other", becomes small multiples, or the chart is answering too many questions at once.

**Status colours are reserved.** Success, warning and danger mean state. They never become "series 4", and they always ship with a label or an icon, never colour alone.

**Text wears text tokens, not series colours.** Values, axis labels and legend text stay in the ink tokens; a coloured mark beside the label carries the identity.

**Never a number on every point.** Label selectively — the endpoints, the peak, the one that matters. The line-chart helper turns value labels off by default for exactly this reason; at six points across two series they collide with the marks.

**Recessive frame.** Value gridlines only, in `chart.gridline`. Category gridlines off. Axis lines off. Axis labels in `chart.axis`.

**A legend for two or more series, none for one.** With one series the title names it, and a legend box is noise.

**Club colours are not chart colours.** Charting Portland in Ponderosa Green and Seattle in Rave Green is intuitive and produces two greens that collapse under deuteranopia. Use the categorical palette and label the series. The one exception is a single-club chart inside that club's own theme, where one series takes the club accent.

---

## In a deck

```js
deck.chart({
  title: 'Attendance by conference',
  type: 'bar',
  data: [{ name: 'East', labels: [...], values: [...] }],
  note: 'Illustrative figures.',
});
```

Native PowerPoint charts, pre-themed: palette applied, value labels on for bar and column and off for line, quiet gridlines, no chart title because the slide title does that job.

Two pptxgenjs faults the module already avoids, both of which produce a file PowerPoint refuses to open while every other tool accepts it:

- On a **stacked** bar or column, `dataLabelPosition` must be `ctr`, `inEnd` or `inBase`. `outEnd` corrupts the file.
- A combo series using a secondary axis needs **both** `valAxes` and `catAxes` declared, two entries each. Supplying only `valAxes` is not enough.

Run `validate.py` after generating. It reports both by name.

---

## In Office generally

`templates/office/mls-theme.thmx` wires accent1 through accent6 to chart slots 1 through 6, so a chart inserted by hand in Word, PowerPoint or Excel picks up the MLS palette with no intervention.

Accent1 is deliberately **not** the brand red. Office assigns accents to series in order, so a red accent1 would make every single-series chart in the organisation red — and red is a status colour here.
