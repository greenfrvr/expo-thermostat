import { Skia } from "@shopify/react-native-skia";

export type OuterTicksParams = {
  center: number;
  centerY: number;
  radius: number;
  startAngle?: number;
  endAngle?: number;
  units: number;
  rangeStart?: number;
  rangeEnd?: number;
  bellCenter: number;
  bellAmp?: number;
  bellSigma?: number;
  innerBase?: number;
  outerOffset?: number;
};

export const gaussian = (x: number, mu: number, sigma: number) => {
  return Math.exp(-((x - mu) * (x - mu)) / (2 * sigma * sigma));
}

export const pxToRad = (px: number, r: number) => px / r;

export const createBellTicksPath = (opts: OuterTicksParams) => {
  const {
    center,
    centerY,
    radius,
    startAngle = 0,
    endAngle = 2 * Math.PI,
    units,
    rangeStart = 0,
    rangeEnd = units - 1,
    bellCenter,
    bellAmp = 20,
    bellSigma = 60,
    innerBase = -8,
    outerOffset = -24,
  } = opts;

  let d = '';

  for (let i = rangeStart; i <= rangeEnd; i++) {
    const t = i / units;
    const angle = startAngle + (endAngle - startAngle) * t;

    // bell height for this tick
    const bell = bellAmp * gaussian(i, bellCenter, bellSigma);

    const inner = innerBase - bell; // e.g. -bell(367, i) - 8
    const x1 = center + (radius - inner) * Math.cos(angle);
    const y1 = centerY + (radius - inner) * Math.sin(angle);
    const x2 = center + (radius + outerOffset) * Math.cos(angle);
    const y2 = centerY + (radius + outerOffset) * Math.sin(angle);

    d += `M ${x1} ${y1} L ${x2} ${y2} `;
  }

  return Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make();
};

type InnerTicksParams = {
  radius: number;
  start: number;
  end: number;
  units: number;
  unitsStep: number;
  center: number;
  centerY: number;
  startAngle?: number;
  endAngle?: number;
}

export const createUnitsPath = (params: InnerTicksParams) => {
  const {
    radius,
    start,
    end,
    units,
    unitsStep,
    center,
    centerY,
    startAngle = 0,
    endAngle = 2 * Math.PI,
  } = params;

  let path = '';

  for (let i = start; i < end; i++) {
    const angle = startAngle + (endAngle - startAngle) * i / units;

    const tickLength = i % unitsStep === 0 ? 16 : 8;
    const x1 = center + radius * Math.cos(angle);
    const y1 = centerY + radius * Math.sin(angle);
    const x2 = center + (radius - tickLength) * Math.cos(angle);
    const y2 = centerY + (radius - tickLength) * Math.sin(angle);

    path += `M ${x1} ${y1} L ${x2} ${y2} `;
  }

  return Skia.Path.MakeFromSVGString(path);
};

export const createUnitsPath2 = (params: InnerTicksParams) => {
  const {
    radius,
    start,
    end,
    units,
    unitsStep,
    center,
    centerY,
    startAngle = 0,
    endAngle = 2 * Math.PI,
  } = params;

  let path = '';

  for (let i = start; i < end; i += unitsStep) {
    const angle = startAngle + (endAngle - startAngle) * i / units;

    const x3 = center + (radius + 24) * Math.cos(angle);
    const y3 = centerY + (radius + 24) * Math.sin(angle);
    const x4 = center + (radius + 32) * Math.cos(angle);
    const y4 = centerY + (radius + 32) * Math.sin(angle);
    path += `M ${x3} ${y3} L ${x4} ${y4} `;
  }

  return Skia.Path.MakeFromSVGString(path);
};

export const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0; // 1: CW, 0: CCW (matches SVG flags)
  return Skia.Path.MakeFromSVGString(`M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`)!;
};

export const ringSegmentPath = (cx: number, cy: number, R: number, r: number, a0: number, a1: number) => {
  const x = (rr: number, a: number) => cx + rr * Math.cos(a);
  const y = (rr: number, a: number) => cy + rr * Math.sin(a);
  
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  const d =
    `M ${x(R,a0)} ${y(R,a0)} A ${R} ${R} 1 ${large} ${sweep} ${x(R,a1)} ${y(R,a1)} ` +
    `L ${x(r,a1)} ${y(r,a1)} A ${r} ${r} 1 ${large} ${1 - sweep} ${x(r,a0)} ${y(r,a0)} Z`;
  return Skia.Path.MakeFromSVGString(d)!;
};

export const fullCirclePath = (cx: number, cy: number, r: number) =>
  Skia.Path.MakeFromSVGString(
    `M ${cx + r} ${cy}
     A ${r} ${r} 0 1 1 ${cx - r} ${cy}
     A ${r} ${r} 0 1 1 ${cx + r} ${cy}
     Z`
  )!;