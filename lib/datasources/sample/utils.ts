const seeded = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export async function withSampleLatency<T>(
  factory: () => T,
  baseMs = 220,
  varianceMs = 380,
) {
  const jitter = Math.floor(Math.random() * varianceMs);
  await new Promise((resolve) => setTimeout(resolve, baseMs + jitter));
  return factory();
}

export function timeOscillator(periodMs: number, phase = 0) {
  return Math.sin(Date.now() / periodMs + phase);
}

export function pickSeeded<T>(seed: number, values: T[]) {
  const index = Math.floor(seeded(seed) * values.length);
  return values[index];
}
