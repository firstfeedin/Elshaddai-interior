/**
 * Project save / load — localStorage-backed with JSON serialisation.
 * Each project: { id, name, createdAt, updatedAt, thumbnail, walls, furniture, materials, roomName }
 */

const KEY = 'es_projects'
const MAX_PROJECTS = 50

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') }
  catch { return [] }
}

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function listProjects() {
  return readAll().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export function getProject(id) {
  return readAll().find(p => p.id === id) || null
}

export function saveProject({ id, name, walls, furniture, materials, roomName, thumbnail }) {
  const list = readAll()
  const now  = new Date().toISOString()
  const existing = list.findIndex(p => p.id === id)
  const project = {
    id:        id || `proj_${Date.now()}`,
    name:      name || 'Untitled Design',
    roomName:  roomName || '',
    createdAt: existing >= 0 ? list[existing].createdAt : now,
    updatedAt: now,
    thumbnail: thumbnail || null,
    walls:     walls || [],
    furniture: furniture || [],
    materials: materials || {},
  }
  if (existing >= 0) list[existing] = project
  else list.unshift(project)
  writeAll(list.slice(0, MAX_PROJECTS))
  return project
}

export function deleteProject(id) {
  writeAll(readAll().filter(p => p.id !== id))
}

export function duplicateProject(id) {
  const src = getProject(id)
  if (!src) return null
  return saveProject({
    ...src,
    id: null,
    name: src.name + ' (Copy)',
  })
}

export function exportProjectJSON(id) {
  const p = getProject(id)
  if (!p) return null
  return JSON.stringify(p, null, 2)
}

export function importProjectJSON(jsonStr) {
  try {
    const data = JSON.parse(jsonStr)
    return saveProject({ ...data, id: null, name: (data.name || 'Imported') + ' (Imported)' })
  } catch { return null }
}

/** Encode a project as a base64 URL param so it can be shared via link */
export function encodeShareLink(project) {
  const minimal = {
    n: project.name,
    r: project.roomName,
    w: project.walls,
    f: project.furniture,
    m: project.materials,
  }
  return btoa(encodeURIComponent(JSON.stringify(minimal)))
}

/** Decode a shared project link param */
export function decodeShareLink(encoded) {
  try {
    const raw = JSON.parse(decodeURIComponent(atob(encoded)))
    return {
      name:      raw.n || 'Shared Design',
      roomName:  raw.r || '',
      walls:     raw.w || [],
      furniture: raw.f || [],
      materials: raw.m || {},
    }
  } catch { return null }
}
