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

export const gaussian = (x: number, mu: number, sigma: number) =>
  Math.exp(-((x - mu) * (x - mu)) / (2 * sigma * sigma));

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