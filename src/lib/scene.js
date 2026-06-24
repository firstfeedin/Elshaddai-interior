/**
 * SCENE DATA MODEL — v1.0
 * Single source of truth for both the editor and the render pipeline.
 * All coordinates are in real-world METERS (Y = up).
 * 2D floor plan uses XZ plane: x = left-right, z = front-back.
 */

export const SCENE_VERSION = '1.0'
export const GRID_SIZE = 0.1        // 10 cm snap
export const DEFAULT_WALL_HEIGHT = 2.8   // m
export const DEFAULT_WALL_THICKNESS = 0.15 // m
export const PIXELS_PER_METER = 80  // 2D canvas: 80px = 1m

// ── Factories ──────────────────────────────────────────────────────────────

export function createScene(name = 'Untitled Project') {
  const floor = createFloor('Ground Floor', 0)
  return {
    version: SCENE_VERSION,
    id: uid(),
    metadata: {
      name,
      created: now(),
      modified: now(),
      units: 'meters',
      author: null,
    },
    settings: {
      gridSize: GRID_SIZE,
      wallHeight: DEFAULT_WALL_HEIGHT,
      wallThickness: DEFAULT_WALL_THICKNESS,
      unit: 'metric', // 'metric' | 'imperial'
    },
    floors: [floor],
    activeFloorId: floor.id,
    camera: { position: [0, 8, 8], target: [0, 0, 0] },
  }
}

export function createFloor(name = 'Floor 1', elevation = 0) {
  return {
    id: uid(),
    name,
    elevation, // meters above 0
    walls: [],
    openings: [],
    furniture: [],
    rooms: [],
  }
}

/**
 * Wall in 2D (XZ plane):
 *   start/end are {x, z} in meters relative to scene origin.
 */
export function createWall(sx, sz, ex, ez, opts = {}) {
  return {
    id: uid(),
    type: 'wall',
    start: { x: +sx.toFixed(3), z: +sz.toFixed(3) },
    end:   { x: +ex.toFixed(3), z: +ez.toFixed(3) },
    height:    opts.height    ?? DEFAULT_WALL_HEIGHT,
    thickness: opts.thickness ?? DEFAULT_WALL_THICKNESS,
    material: opts.material ?? { color: '#f5f0e8', finish: 'matte', name: 'Default Wall' },
  }
}

export function createOpening(type, wallId, posAlongWall, opts = {}) {
  const door   = { width: 0.9, height: 2.1, sillHeight: 0 }
  const window = { width: 1.2, height: 1.0, sillHeight: 0.9 }
  const base   = type === 'door' ? door : window
  return {
    id: uid(),
    type,           // 'door' | 'window' | 'opening'
    wallId,
    position: +posAlongWall.toFixed(3), // 0–1 normalized along wall
    ...base,
    ...opts,
    style: opts.style ?? (type === 'door' ? 'single-swing' : 'casement'),
  }
}

export function createFurnitureItem(catalogItem, position, rotation = 0) {
  return {
    id: uid(),
    catalogId: catalogItem.id,
    name: catalogItem.name,
    sku: catalogItem.sku,
    position: { x: +(position.x ?? 0).toFixed(3), y: 0, z: +(position.z ?? 0).toFixed(3) },
    rotation,  // radians around Y axis
    scale: { x: 1, y: 1, z: 1 },
    glbUrl: catalogItem.glb ?? null,
    dims: catalogItem.dims ?? { w: 1, h: 1, d: 1 },
    material: null,
    locked: false,
    price: catalogItem.price ?? 0,
  }
}

// ── Geometry helpers ────────────────────────────────────────────────────────

export function wallLength(wall) {
  const dx = wall.end.x - wall.start.x
  const dz = wall.end.z - wall.start.z
  return Math.sqrt(dx * dx + dz * dz)
}

export function wallAngle(wall) {
  return Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x)
}

export function wallMidpoint(wall) {
  return {
    x: (wall.start.x + wall.end.x) / 2,
    z: (wall.start.z + wall.end.z) / 2,
  }
}

export function snapToGrid(value, gridSize = GRID_SIZE) {
  return Math.round(value / gridSize) * gridSize
}

export function snapPoint(x, z, gridSize = GRID_SIZE) {
  return { x: snapToGrid(x, gridSize), z: snapToGrid(z, gridSize) }
}

/** Snap point to nearest wall endpoint within threshold (meters) */
export function snapToWallEndpoint(x, z, walls, thresholdM = 0.15) {
  let best = null, bestDist = Infinity
  for (const w of walls) {
    for (const pt of [w.start, w.end]) {
      const d = Math.hypot(pt.x - x, pt.z - z)
      if (d < thresholdM && d < bestDist) { bestDist = d; best = pt }
    }
  }
  return best ?? { x: snapToGrid(x), z: snapToGrid(z) }
}

/** Floor area from outer wall bounding box (approximate) */
export function sceneFloorArea(floor) {
  if (!floor.walls.length) return 0
  const xs = floor.walls.flatMap(w => [w.start.x, w.end.x])
  const zs = floor.walls.flatMap(w => [w.start.z, w.end.z])
  const w = Math.max(...xs) - Math.min(...xs)
  const d = Math.max(...zs) - Math.min(...zs)
  return +(w * d).toFixed(2)
}

/** Convert from 2D canvas pixel coords to scene meters */
export function pxToMeters(px, py, ppm = PIXELS_PER_METER, offset = { x: 0, z: 0 }) {
  return { x: px / ppm - offset.x, z: py / ppm - offset.z }
}

/** Convert from scene meters to 2D canvas pixel coords */
export function metersToPx(x, z, ppm = PIXELS_PER_METER, offset = { x: 0, z: 0 }) {
  return { px: (x + offset.x) * ppm, py: (z + offset.z) * ppm }
}

// ── Serialization ───────────────────────────────────────────────────────────

export function serializeScene(scene) {
  return JSON.stringify({
    ...scene,
    metadata: { ...scene.metadata, modified: now() },
  })
}

export function deserializeScene(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json
  if (!data.version) throw new Error('Invalid scene: missing version')
  return data
}

// ── Internal utils ──────────────────────────────────────────────────────────

function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function now() { return new Date().toISOString() }
