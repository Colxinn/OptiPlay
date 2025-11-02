const PARAM_TO_ENUM = {
  "1080p": "R1080P",
  "1440p": "R1440P",
  "4k": "R4K",
  "2160p": "R4K"
};

const ENUM_TO_LABEL = {
  R1080P: "1080p",
  R1440P: "1440p",
  R4K: "4K"
};

export function normalizeResolutionParam(value) {
  if (!value) return null;
  const key = value.toString().trim().toLowerCase();
  return PARAM_TO_ENUM[key] ?? null;
}

export function resolutionLabelFromEnum(value) {
  if (!value) return null;
  return ENUM_TO_LABEL[value] ?? value;
}

export function computeWeightedIndex(avgFps, cpuScore) {
  const fps = Number(avgFps ?? 0);
  const cpu = Number(cpuScore ?? 0);
  return Number(((fps * 0.7) + (cpu * 0.3)).toFixed(2));
}

export function computePerformancePerDollar(avgFps, gpuPrice, cpuPrice) {
  const totalPrice = Number(gpuPrice ?? 0) + Number(cpuPrice ?? 0);
  if (!totalPrice) return null;
  return Number((avgFps / totalPrice).toFixed(3));
}

export function computePowerEnvelope(gpuPower, cpuPower) {
  const total = Number(gpuPower ?? 0) + Number(cpuPower ?? 0);
  return total || null;
}
