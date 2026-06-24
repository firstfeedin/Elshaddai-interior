/**
 * glTF EXPORT — Serialize a scene to glTF 2.0 for the render pipeline.
 * Uses THREE.GLTFExporter when a Three.js scene ref is available,
 * falling back to a structural JSON export otherwise.
 *
 * Contract: the output is valid glTF that Blender Cycles can import.
 */

/** Export a Three.js scene graph to a glTF ArrayBuffer or JSON */
export async function exportSceneToGLTF(threeScene, opts = {}) {
  const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js')
  const exporter = new GLTFExporter()

  return new Promise((resolve, reject) => {
    exporter.parse(
      threeScene,
      (result) => resolve(result),
      (err)    => reject(err),
      {
        binary: opts.binary ?? true,          // .glb
        embedImages: opts.embedImages ?? true,
        onlyVisible: opts.onlyVisible ?? true,
        animations: opts.animations ?? [],
        trs: false,  // keep matrix, not separate T/R/S
      }
    )
  })
}

/**
 * Upload a glTF blob to the backend render queue.
 * Returns the render job { id, status, estimatedSeconds }.
 */
export async function submitRenderJob(glbBuffer, sceneId, opts = {}) {
  const blob = new Blob([glbBuffer], { type: 'model/gltf-binary' })
  const fd   = new FormData()
  fd.append('scene', blob, `${sceneId}.glb`)
  fd.append('sceneId', sceneId)
  fd.append('resolution', opts.resolution ?? '1920x1080')
  fd.append('samples',    String(opts.samples  ?? 128))
  fd.append('format',     opts.format    ?? 'png')
  fd.append('type',       opts.type      ?? 'still') // 'still' | 'panorama' | 'video'

  const res = await fetch('/api/render/jobs', { method: 'POST', body: fd })
  if (!res.ok) throw new Error(`Render submit failed: ${res.status}`)
  return res.json()
}

/** Poll a render job until done or failed */
export async function pollRenderJob(jobId, onProgress, intervalMs = 3000) {
  return new Promise((resolve, reject) => {
    const iv = setInterval(async () => {
      try {
        const res  = await fetch(`/api/render/jobs/${jobId}`)
        const job  = await res.json()
        onProgress?.(job)
        if (job.status === 'done')   { clearInterval(iv); resolve(job) }
        if (job.status === 'failed') { clearInterval(iv); reject(new Error(job.error ?? 'Render failed')) }
      } catch (e) { clearInterval(iv); reject(e) }
    }, intervalMs)
  })
}

/**
 * Structural scene export — a lightweight JSON descriptor usable
 * without a live Three.js scene (for server-side preview generation).
 * Maps 1:1 to the scene data model + PBR material spec.
 */
export function exportSceneDescriptor(scene) {
  const floor = scene.floors.find(f => f.id === scene.activeFloorId) ?? scene.floors[0]

  return {
    format:   'elshaddai-scene-descriptor',
    version:  '1.0',
    metadata: scene.metadata,
    settings: scene.settings,
    geometry: {
      walls: floor.walls.map(w => ({
        id: w.id,
        start: w.start, end: w.end,
        height: w.height, thickness: w.thickness,
        material: pbrMaterial(w.material),
      })),
      openings: floor.openings,
    },
    furniture: floor.furniture.map(f => ({
      id: f.id, catalogId: f.catalogId, name: f.name,
      position: f.position, rotation: f.rotation, scale: f.scale,
      glbUrl: f.glbUrl, dims: f.dims,
      material: f.material ? pbrMaterial(f.material) : null,
    })),
    lighting: {
      preset: 'studio',       // 'studio' | 'natural' | 'evening' | 'custom'
      sunAzimuth: 225,        // degrees
      sunElevation: 45,
      ambientIntensity: 0.3,
    },
    camera: scene.camera,
    renderSpec: {
      engine:   'blender-cycles',
      samples:  128,
      denoiser: 'OPTIX',
      colorSpace: 'ACES',
    },
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function pbrMaterial(mat) {
  if (!mat) return null
  return {
    baseColor:   mat.color  ?? '#ffffff',
    roughness:   mat.roughness  ?? 0.75,
    metalness:   mat.metalness  ?? 0.0,
    normalScale: mat.normalScale ?? 1.0,
    finish:      mat.finish ?? 'matte',
  }
}
