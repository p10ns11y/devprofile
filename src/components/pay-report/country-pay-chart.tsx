import {
  bandsFor,
  CHART_DOMAIN_THOUSANDS,
  CHART_TICKS,
  chartSummary,
} from "@/lib/pay-report-bands";

const LABEL_WIDTH = 228;
const PLOT_WIDTH = 520;
const PAD_RIGHT = 16;
const ROW_HEIGHT = 28;
const AXIS_HEIGHT = 36;
const LEGEND_HEIGHT = 22;
const WIDTH = LABEL_WIDTH + PLOT_WIDTH + PAD_RIGHT;

function xOf(usd: number): number {
  return LABEL_WIDTH + (usd / 1000 / CHART_DOMAIN_THOUSANDS) * PLOT_WIDTH;
}

function tickLabelX(tick: number, x: number): number {
  return x - String(tick).length * 3.4;
}

export function CountryPayChart() {
  const rows = bandsFor("8-15y");
  const plotBottom = rows.length * ROW_HEIGHT;
  const height = plotBottom + AXIS_HEIGHT + LEGEND_HEIGHT;
  const summary = chartSummary(rows);

  return (
    <figure className="pay-report__chart-figure">
      <figcaption className="pay-report__chart-caption">
        <span className="pay-report__chart-heading">
          Individual-contributor developers, 8–15 years of experience
        </span>
        <span className="pay-report__chart-subheading">
          Stack Overflow Developer Survey 2025, employed full-time
        </span>
      </figcaption>
      <div className="pay-report__chart-scroll">
        <svg
          className="pay-report__chart"
          viewBox={`0 0 ${WIDTH} ${height}`}
          role="img"
          aria-label={summary}
        >
          <title>Individual-contributor developers, 8–15 years of experience</title>
          <desc>
            Stack Overflow Developer Survey 2025, employed full-time. Each country shows total
            yearly pay in thousand USD: a bar from the 25th to the 75th percentile and a dot at the
            median. Sweden is emphasised. The table under this chart lists the same figures.
          </desc>
          {rows.map((row, index) => {
            const y = index * ROW_HEIGHT;
            const mid = y + ROW_HEIGHT / 2;
            const emphasised = row.label === "Sweden";
            return (
              <g key={row.country}>
                <text
                  className="pay-report__chart-label"
                  x="0"
                  y={mid}
                  dominantBaseline="middle"
                  fontWeight={emphasised ? 700 : 450}
                >
                  {row.label} (n={row.n})
                </text>
                <line
                  className="pay-report__chart-guide"
                  x1={LABEL_WIDTH}
                  x2={LABEL_WIDTH + PLOT_WIDTH}
                  y1={mid}
                  y2={mid}
                />
                <rect
                  className="pay-report__chart-bar"
                  x={xOf(row.p25)}
                  y={mid - 5}
                  width={Math.max(xOf(row.p75) - xOf(row.p25), 1)}
                  height={10}
                  rx={2}
                />
                <circle
                  className="pay-report__chart-median"
                  cx={xOf(row.median)}
                  cy={mid}
                  r={4.5}
                />
              </g>
            );
          })}
          {CHART_TICKS.map((tick) => {
            const x = xOf(tick * 1000);
            return (
              <g key={tick}>
                <line
                  className="pay-report__chart-tick"
                  x1={x}
                  x2={x}
                  y1={plotBottom}
                  y2={plotBottom + 6}
                />
                <text
                  className="pay-report__chart-tick-label"
                  x={tickLabelX(tick, x)}
                  y={plotBottom + 18}
                >
                  {tick}
                </text>
              </g>
            );
          })}
          <text className="pay-report__chart-axis" x={LABEL_WIDTH} y={plotBottom + AXIS_HEIGHT - 4}>
            Total yearly pay, thousand USD (converted by Stack Overflow)
          </text>
          <g transform={`translate(${LABEL_WIDTH}, ${height - 12})`}>
            <rect className="pay-report__chart-bar" x="0" y="-8" width="22" height="10" rx={2} />
            <text className="pay-report__chart-legend" x="28" y="0">
              25th to 75th percentile
            </text>
            <circle className="pay-report__chart-median" cx="196" cy="-3" r="4.5" />
            <text className="pay-report__chart-legend" x="208" y="0">
              Median
            </text>
          </g>
        </svg>
      </div>
    </figure>
  );
}
