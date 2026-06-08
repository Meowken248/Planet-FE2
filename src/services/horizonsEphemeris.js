import { planets } from '../data/planets.js';

const HORIZONS_URL = import.meta.env.VITE_HORIZONS_PROXY_URL || '/api/horizons';
const CACHE_PREFIX = 'solarverse:horizons:v1';
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'UTC',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const toHorizonsDate = (date) => DATE_FORMATTER.format(date);

const parseVectorTable = (result) => {
  const table = result.match(/\$\$SOE([\s\S]*?)\$\$EOE/);
  if (!table) return [];

  return table[1]
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const columns = line.split(',').map((value) => value.trim());
      const jd = Number(columns[0]);
      const epochMs = Number.isFinite(jd) ? (jd - 2440587.5) * DAY_MS : Date.parse(columns[1]);
      const numbers = columns.map(Number).filter(Number.isFinite);

      return {
        epochMs,
        x: numbers[1],
        y: numbers[2],
        z: numbers[3],
        vx: numbers[4],
        vy: numbers[5],
        vz: numbers[6],
      };
    })
    .filter((sample) => Number.isFinite(sample.epochMs) && Number.isFinite(sample.x));
};

const fetchPlanetVectors = async (planet, startDate, stopDate, signal) => {
  const params = new URLSearchParams({
    format: 'json',
    COMMAND: `'${planet.nasa.horizonsId}'`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTORS',
    CENTER: "'@sun'",
    START_TIME: `'${startDate}'`,
    STOP_TIME: `'${stopDate}'`,
    STEP_SIZE: "'12 h'",
    OUT_UNITS: 'AU-D',
    VEC_TABLE: '2',
    CSV_FORMAT: 'YES',
    VEC_LABELS: 'NO',
    REF_PLANE: 'ECLIPTIC',
  });

  const response = await fetch(`${HORIZONS_URL}?${params.toString().replace(/\+/g, '%20')}`, { signal });
  if (!response.ok) {
    throw new Error(`Horizons ${planet.id}: HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(`Horizons ${planet.id}: ${payload.error}`);
  }

  const samples = parseVectorTable(payload.result || '');
  if (samples.length < 2) {
    throw new Error(`Horizons ${planet.id}: thieu du lieu vector`);
  }

  return [planet.id, samples];
};

export async function loadHorizonsEphemeris({ signal } = {}) {
  const start = new Date(Date.now() - DAY_MS);
  const stop = new Date(Date.now() + 32 * DAY_MS);
  const startDate = toHorizonsDate(start);
  const stopDate = toHorizonsDate(stop);
  const cacheKey = `${CACHE_PREFIX}:${startDate}:${stopDate}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const parsed = JSON.parse(cached);
    return { ...parsed, fromCache: true };
  }

  const entries = await Promise.all(planets.map((planet) => fetchPlanetVectors(planet, startDate, stopDate, signal)));
  const payload = {
    source: 'NASA/JPL Horizons VECTORS, heliocentric ecliptic, AU-D',
    startDate,
    stopDate,
    fetchedAt: Date.now(),
    bodies: Object.fromEntries(entries),
  };

  localStorage.setItem(cacheKey, JSON.stringify(payload));
  return { ...payload, fromCache: false };
}

export function interpolateEphemeris(samples, epochMs) {
  if (!samples?.length) return null;
  if (epochMs <= samples[0].epochMs) return samples[0];
  if (epochMs >= samples[samples.length - 1].epochMs) return samples[samples.length - 1];

  let nextIndex = samples.findIndex((sample) => sample.epochMs >= epochMs);
  if (nextIndex < 1) nextIndex = 1;

  const previous = samples[nextIndex - 1];
  const next = samples[nextIndex];
  const span = next.epochMs - previous.epochMs || 1;
  const t = Math.min(1, Math.max(0, (epochMs - previous.epochMs) / span));

  return {
    epochMs,
    x: previous.x + (next.x - previous.x) * t,
    y: previous.y + (next.y - previous.y) * t,
    z: previous.z + (next.z - previous.z) * t,
    vx: previous.vx + (next.vx - previous.vx) * t,
    vy: previous.vy + (next.vy - previous.vy) * t,
    vz: previous.vz + (next.vz - previous.vz) * t,
  };
}
