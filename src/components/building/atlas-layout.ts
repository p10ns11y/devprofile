import {
  type AreaId,
  BUILDING_AREAS,
  BUILDING_BLURB,
  BUILDING_CLUSTERS,
  BUILDING_FALLBACK_URL,
  BUILDING_PRIVATE,
  BUILDING_PROJECTS,
  BUILDING_SINGULARITY,
  type ClusterId,
} from "@/data/building-landscape";
import { projectByKey } from "@/lib/homepage-from-cvdata";

export type InkRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "name" | "cluster" | "epithet" | "area" | "sink";
};

export type PlacedStar = {
  key: string;
  name: string;
  href?: string;
  detail: string;
  privateCooking: boolean;
  epithet?: "writing" | "metre";
  role?: "operator";
  cluster: ClusterId;
  area: AreaId;
  x: number;
  y: number;
  r: number;
};

export type ClusterBand = {
  cluster: ClusterId;
  title: string;
  y: number;
  height: number;
  titleX: number;
  titleY: number;
};

export type AreaDock = {
  area: AreaId;
  title: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
};

export type Curve = { d: string; kind: "hop" | "trunk"; key: string };
export type GridSeg = { x1: number; y1: number; x2: number; y2: number };

export type AtlasScene = {
  width: number;
  height: number;
  bands: ClusterBand[];
  stars: PlacedStar[];
  operator: PlacedStar | undefined;
  docks: AreaDock[];
  sink: { x: number; y: number };
  hops: Curve[];
  trunks: Curve[];
  grid: GridSeg[];
  ink: InkRect[];
  collisions: Array<{ curveOrGrid: string; ink: InkRect }>;
};

const GUTTER_LEFT = 20;
const TITLE_TO_NAME_GAP = 18;
const NAME_STAR_GAP = 14;
const STAR_RADIUS = 6;
const OPERATOR_RADIUS = 9;
const CHAR_WIDTH = 7.2;
const MAX_TITLE_WIDTH = 210;
const MAX_NAME_WIDTH = 240;
const ROW_HEIGHT = 28;
const EPITHET_ROW_HEIGHT = 42;
const BAND_PAD = 14;
const BAND_SEAM = 8;
const TOP_PAD = 28;
const BOTTOM_PAD = 56;
const SCENE_WIDTH = 1100;
const SINK_X = 980;
const VOID_PAD = 40;
const HOLE_CLEARANCE = 155;
const DOCK_RX = 8;
const DOCK_RY = 8;
const MIN_DOCK_GAP = 54;
const AREA_LABEL_GAP = 8;
const TRUNK_AFTER_LABEL = 8;
const EPITHET_DY = 18;
const NAME_BASELINE = 4;
const GRID_INSET = 8;
const HOP_RIM = 2;
const SINK_TRUNK_INSET = 92;
const OPERATOR_BACK = 42;
const CUBIC_SAMPLES = 36;
const NAME_INK_HEIGHT = 14;
const SINK_LABEL_TOP = 46;
const SINK_LABEL_HEIGHT = 36;
const OPERATOR_BELOW_SINK = 102;

function approxInkWidth(text: string, cap: number): number {
  return Math.min(Math.max(text.length * CHAR_WIDTH, 8), cap);
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function hopCurve(startX: number, startY: number, endX: number, endY: number): string {
  const spanX = endX - startX;
  const control1X = startX + spanX * 0.42;
  const control2X = startX + spanX * 0.72;
  return `M ${startX} ${startY} C ${control1X} ${startY}, ${control2X} ${endY}, ${endX} ${endY}`;
}

const CUBIC_PATH =
  /^M ([-\d.]+) ([-\d.]+) C ([-\d.]+) ([-\d.]+), ([-\d.]+) ([-\d.]+), ([-\d.]+) ([-\d.]+)$/;

function cubicPoint(
  startX: number,
  startY: number,
  control1X: number,
  control1Y: number,
  control2X: number,
  control2Y: number,
  endX: number,
  endY: number,
  sampleT: number
): { x: number; y: number } {
  const oneMinusT = 1 - sampleT;
  const oneMinusTSquared = oneMinusT * oneMinusT;
  const oneMinusTCubed = oneMinusTSquared * oneMinusT;
  const tSquared = sampleT * sampleT;
  const tCubed = tSquared * sampleT;
  return {
    x:
      oneMinusTCubed * startX +
      3 * oneMinusTSquared * sampleT * control1X +
      3 * oneMinusT * tSquared * control2X +
      tCubed * endX,
    y:
      oneMinusTCubed * startY +
      3 * oneMinusTSquared * sampleT * control1Y +
      3 * oneMinusT * tSquared * control2Y +
      tCubed * endY,
  };
}

function pointHitsInk(pointX: number, pointY: number, ink: InkRect): boolean {
  return pointX >= ink.x && pointX <= ink.x + ink.w && pointY >= ink.y && pointY <= ink.y + ink.h;
}

function curveHitsInk(curve: Curve, ink: InkRect): boolean {
  const match = curve.d.match(CUBIC_PATH);
  if (!match) {
    return false;
  }
  const startX = Number(match[1]);
  const startY = Number(match[2]);
  const control1X = Number(match[3]);
  const control1Y = Number(match[4]);
  const control2X = Number(match[5]);
  const control2Y = Number(match[6]);
  const endX = Number(match[7]);
  const endY = Number(match[8]);
  for (let sample = 1; sample < CUBIC_SAMPLES; sample += 1) {
    const sampleT = sample / CUBIC_SAMPLES;
    const point = cubicPoint(
      startX,
      startY,
      control1X,
      control1Y,
      control2X,
      control2Y,
      endX,
      endY,
      sampleT
    );
    if (pointHitsInk(point.x, point.y, ink)) {
      return true;
    }
  }
  return false;
}

function gridHitsInk(seg: GridSeg, ink: InkRect): boolean {
  const segLeft = Math.min(seg.x1, seg.x2);
  const segRight = Math.max(seg.x1, seg.x2);
  const inkBottom = ink.y + ink.h;
  const inkRight = ink.x + ink.w;
  if (seg.y1 < ink.y || seg.y1 > inkBottom) {
    return false;
  }
  return segRight >= ink.x && segLeft <= inkRight;
}

function separateDockYs(orderedYs: number[], minGap: number, minY: number, maxY: number): number[] {
  const packed = [...orderedYs];
  for (let pass = 0; pass < packed.length; pass += 1) {
    for (let index = 1; index < packed.length; index += 1) {
      if (packed[index] < packed[index - 1] + minGap) {
        packed[index] = packed[index - 1] + minGap;
      }
    }
    if (packed[packed.length - 1] > maxY) {
      packed[packed.length - 1] = maxY;
      for (let index = packed.length - 2; index >= 0; index -= 1) {
        if (packed[index] > packed[index + 1] - minGap) {
          packed[index] = packed[index + 1] - minGap;
        }
      }
    }
    if (packed[0] < minY) {
      packed[0] = minY;
    }
  }
  return packed;
}

function nameInkRect(placedStar: PlacedStar, nameWidth: number): InkRect {
  return {
    x: placedStar.x - placedStar.r - NAME_STAR_GAP - nameWidth,
    y: placedStar.y - 10,
    w: nameWidth,
    h: NAME_INK_HEIGHT,
    kind: "name",
  };
}

export function starNameAnchorX(placedStar: PlacedStar): number {
  return placedStar.x - placedStar.r - NAME_STAR_GAP;
}

export function dockLabelX(areaDock: AreaDock): number {
  return areaDock.x + areaDock.rx + AREA_LABEL_GAP;
}

export function visibleProjects(): PlacedStar[] {
  return BUILDING_PROJECTS.flatMap((project) => {
    const catalogRow = projectByKey(project.key);
    const href = catalogRow?.url ?? BUILDING_FALLBACK_URL[project.key];
    const detail = BUILDING_BLURB[project.key] ?? catalogRow?.description;
    const privateCooking = BUILDING_PRIVATE.has(project.key);
    if (!detail) {
      return [];
    }
    if (!href && !privateCooking) {
      return [];
    }
    return [
      {
        key: project.key,
        name: catalogRow?.name ?? project.key,
        href: privateCooking ? undefined : href,
        detail,
        privateCooking,
        epithet: project.epithet,
        role: project.role,
        cluster: project.cluster,
        area: project.area,
        x: 0,
        y: 0,
        r: 0,
      },
    ];
  });
}

export function layoutAtlas(): AtlasScene {
  const resolved = visibleProjects();
  const members = resolved.filter((star) => star.role !== "operator");
  const operatorSeed = resolved.find((star) => star.role === "operator");

  const maxTitleWidth = Math.max(
    ...BUILDING_CLUSTERS.map((clusterRecord) =>
      approxInkWidth(clusterRecord.title, MAX_TITLE_WIDTH)
    )
  );
  const maxNameWidth = Math.max(
    ...members.map((star) => approxInkWidth(star.name, MAX_NAME_WIDTH)),
    12
  );
  const starX =
    GUTTER_LEFT + maxTitleWidth + TITLE_TO_NAME_GAP + maxNameWidth + NAME_STAR_GAP + STAR_RADIUS;

  const bands: ClusterBand[] = [];
  const stars: PlacedStar[] = [];
  let bandCursorY = TOP_PAD;

  for (const clusterRecord of BUILDING_CLUSTERS) {
    const clusterMembers = members.filter((star) => star.cluster === clusterRecord.id);
    if (clusterMembers.length === 0) {
      continue;
    }
    const rowHeights = clusterMembers.map((star) =>
      star.epithet ? EPITHET_ROW_HEIGHT : ROW_HEIGHT
    );
    const rowsTotal = rowHeights.reduce((total, rowHeight) => total + rowHeight, 0);
    const bandHeight = rowsTotal + BAND_PAD * 2;
    bands.push({
      cluster: clusterRecord.id,
      title: clusterRecord.title,
      y: bandCursorY,
      height: bandHeight,
      titleX: GUTTER_LEFT,
      titleY: bandCursorY + bandHeight / 2 + NAME_BASELINE,
    });
    let rowCursor = bandCursorY + BAND_PAD;
    clusterMembers.forEach((member, memberIndex) => {
      const rowHeight = rowHeights[memberIndex];
      stars.push({
        ...member,
        x: starX,
        y: rowCursor + rowHeight / 2,
        r: STAR_RADIUS,
      });
      rowCursor += rowHeight;
    });
    bandCursorY += bandHeight + BAND_SEAM;
  }

  let sceneHeight = Math.max(bandCursorY + BOTTOM_PAD, 520);
  const sink = { x: SINK_X, y: sceneHeight / 2 };
  const dockX = lerp(starX + VOID_PAD, sink.x - HOLE_CLEARANCE, 0.62);

  const dockDrafts = BUILDING_AREAS.map((areaRecord) => {
    const memberYs = stars.filter((star) => star.area === areaRecord.id).map((star) => star.y);
    const centroidY =
      memberYs.length === 0
        ? sink.y
        : memberYs.reduce((total, starY) => total + starY, 0) / memberYs.length;
    return { areaRecord, centroidY };
  });
  const packOrder = dockDrafts
    .map((draft, draftIndex) => ({ draftIndex, y: draft.centroidY }))
    .sort((left, right) => left.y - right.y);
  const packedYs = separateDockYs(
    packOrder.map((item) => item.y),
    MIN_DOCK_GAP,
    TOP_PAD + 16,
    sceneHeight - 28
  );
  const docks: AreaDock[] = dockDrafts.map((draft) => ({
    area: draft.areaRecord.id,
    title: draft.areaRecord.title,
    x: dockX,
    y: draft.centroidY,
    rx: DOCK_RX,
    ry: DOCK_RY,
  }));
  packOrder.forEach((item, packedIndex) => {
    docks[item.draftIndex].y = packedYs[packedIndex];
  });

  const hops: Curve[] = stars.flatMap((placedStar) => {
    const areaDock = docks.find((dock) => dock.area === placedStar.area);
    if (!areaDock) {
      return [];
    }
    return [
      {
        key: placedStar.key,
        d: hopCurve(
          placedStar.x + placedStar.r + HOP_RIM,
          placedStar.y,
          areaDock.x - areaDock.rx - HOP_RIM,
          areaDock.y
        ),
        kind: "hop" as const,
      },
    ];
  });

  const trunks: Curve[] = docks.map((areaDock) => {
    const areaTitleWidth = approxInkWidth(areaDock.title, 80);
    const startX = areaDock.x + areaDock.rx + AREA_LABEL_GAP + areaTitleWidth + TRUNK_AFTER_LABEL;
    return {
      key: areaDock.area,
      d: hopCurve(startX, areaDock.y, sink.x - SINK_TRUNK_INSET, sink.y),
      kind: "trunk" as const,
    };
  });

  const gridStartX = starX + STAR_RADIUS + GRID_INSET;
  const gridEndX = dockX - DOCK_RX - GRID_INSET;
  const grid: GridSeg[] = bands.slice(0, -1).map((clusterBand) => ({
    x1: gridStartX,
    y1: clusterBand.y + clusterBand.height,
    x2: gridEndX,
    y2: clusterBand.y + clusterBand.height,
  }));

  let operator: PlacedStar | undefined;
  if (operatorSeed) {
    // Lower-left of the halo, below sink type, so trunks meeting at sink.y miss the name.
    const operatorY = sink.y + OPERATOR_BELOW_SINK;
    operator = {
      ...operatorSeed,
      x: sink.x - OPERATOR_BACK,
      y: operatorY,
      r: OPERATOR_RADIUS,
    };
    sceneHeight = Math.max(sceneHeight, operatorY + BOTTOM_PAD);
  }

  const ink: InkRect[] = [];
  for (const clusterBand of bands) {
    ink.push({
      x: clusterBand.titleX,
      y: clusterBand.titleY - 11,
      w: approxInkWidth(clusterBand.title, MAX_TITLE_WIDTH),
      h: 14,
      kind: "cluster",
    });
  }
  for (const placedStar of stars) {
    ink.push(nameInkRect(placedStar, approxInkWidth(placedStar.name, MAX_NAME_WIDTH)));
    if (placedStar.epithet) {
      ink.push({
        x: starNameAnchorX(placedStar) - approxInkWidth(placedStar.epithet, 80),
        y: placedStar.y + EPITHET_DY - 8,
        w: approxInkWidth(placedStar.epithet, 80),
        h: 11,
        kind: "epithet",
      });
    }
  }
  for (const areaDock of docks) {
    ink.push({
      x: dockLabelX(areaDock),
      y: areaDock.y - 10,
      w: approxInkWidth(areaDock.title, 80),
      h: 14,
      kind: "area",
    });
  }
  ink.push({
    x: sink.x - approxInkWidth(BUILDING_SINGULARITY.label, 180) / 2,
    y: sink.y + SINK_LABEL_TOP,
    w: approxInkWidth(BUILDING_SINGULARITY.label, 180),
    h: SINK_LABEL_HEIGHT,
    kind: "sink",
  });
  if (operator) {
    ink.push(nameInkRect(operator, approxInkWidth(operator.name, MAX_NAME_WIDTH)));
  }

  const collisions: AtlasScene["collisions"] = [];
  for (const inkRect of ink) {
    for (const hop of hops) {
      if (curveHitsInk(hop, inkRect)) {
        collisions.push({ curveOrGrid: hop.d, ink: inkRect });
      }
    }
    for (const trunk of trunks) {
      if (curveHitsInk(trunk, inkRect)) {
        collisions.push({ curveOrGrid: trunk.d, ink: inkRect });
      }
    }
    for (const seg of grid) {
      if (gridHitsInk(seg, inkRect)) {
        collisions.push({ curveOrGrid: `grid:${seg.y1}`, ink: inkRect });
      }
    }
  }

  return {
    width: SCENE_WIDTH,
    height: sceneHeight,
    bands,
    stars,
    operator,
    docks,
    sink,
    hops,
    trunks,
    grid,
    ink,
    collisions,
  };
}

export const ATLAS_EPITHET_DY = EPITHET_DY;
export const ATLAS_NAME_BASELINE = NAME_BASELINE;
