/**
 * Zustand store for DualStudio — replaces scattered useState calls.
 * Single source of truth for walls, furniture, materials, tool, history.
 */
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { saveProject } from '../utils/projectStorage'

const MAX_HISTORY = 50

export const useStudioStore = create(
  subscribeWithSelector((set, get) => ({
    /* ── Canvas state ────────────────────────────────────────────── */
    walls:     [],
    furniture: [],
    materials: { walls:'white-paint', floors:'oak-floor', ceilings:'white-ceiling' },

    /* ── Selection & tool ────────────────────────────────────────── */
    tool:       'wall',
    selectedId: null,
    viewMode:   'dual',   // 'dual' | '2d' | '3d'
    autoRotate: false,

    /* ── Project meta ────────────────────────────────────────────── */
    projectId:   null,
    projectName: 'Untitled Design',
    isDirty:     false,

    /* ── History (undo/redo) ─────────────────────────────────────── */
    history:  [{ walls:[], furniture:[] }],
    histIdx:  0,

    /* ── Custom uploaded GLBs ────────────────────────────────────── */
    customModels: [],   // [{id, name, url, dims}]

    /* ── Version snapshots ───────────────────────────────────────── */
    versions: [],  // [{id, label, ts, walls, furniture}]

    /* ─────────────────── Actions ─────────────────────────────────── */

    setTool:       (tool)       => set({ tool }),
    setSelectedId: (id)         => set({ selectedId: id }),
    setViewMode:   (m)          => set({ viewMode: m }),
    setAutoRotate: (v)          => set({ autoRotate: v }),
    setProjectName:(n)          => set({ projectName: n, isDirty: true }),

    setWalls: (walls) => {
      set({ walls, isDirty: true })
      get()._pushHistory()
    },

    setFurniture: (furniture) => {
      set({ furniture, isDirty: true })
    },

    addFurniture: (catalogItem) => {
      const item = {
        id: `fi_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        x: 2 + Math.random() * 3,
        z: 2 + Math.random() * 3,
        rotY: 0,
        catalogItem,
      }
      set(s => ({ furniture: [...s.furniture, item], isDirty: true }))
      return item.id
    },

    removeFurniture: (id) =>
      set(s => ({ furniture: s.furniture.filter(f => f.id !== id), isDirty: true })),

    updateFurniture: (id, patch) =>
      set(s => ({ furniture: s.furniture.map(f => f.id === id ? { ...f, ...patch } : f), isDirty: true })),

    setMaterial: (layer, id) =>
      set(s => ({ materials: { ...s.materials, [layer]: id }, isDirty: true })),

    clearAll: () => {
      set({ walls:[], furniture:[], selectedId:null, isDirty:true })
      get()._pushHistory()
    },

    addCustomModel: (model) =>
      set(s => ({ customModels: [...s.customModels, model] })),

    /* ── History helpers ─────────────────────────────────────────── */
    _pushHistory: () => {
      const { walls, furniture, history, histIdx } = get()
      const next = history.slice(0, histIdx + 1)
      next.push({ walls: JSON.parse(JSON.stringify(walls)), furniture: JSON.parse(JSON.stringify(furniture)) })
      if (next.length > MAX_HISTORY) next.shift()
      set({ history: next, histIdx: next.length - 1 })
    },

    undo: () => {
      const { history, histIdx } = get()
      if (histIdx <= 0) return
      const ni = histIdx - 1
      const snap = history[ni]
      set({ walls: snap.walls, furniture: snap.furniture, histIdx: ni, isDirty: true })
    },

    redo: () => {
      const { history, histIdx } = get()
      if (histIdx >= history.length - 1) return
      const ni = histIdx + 1
      const snap = history[ni]
      set({ walls: snap.walls, furniture: snap.furniture, histIdx: ni, isDirty: true })
    },

    /* ── Version snapshots ───────────────────────────────────────── */
    saveVersion: (label) => {
      const { walls, furniture, versions } = get()
      const v = {
        id:   `v_${Date.now()}`,
        label: label || `Version ${versions.length + 1}`,
        ts:   new Date().toISOString(),
        walls: JSON.parse(JSON.stringify(walls)),
        furniture: JSON.parse(JSON.stringify(furniture)),
      }
      set(s => ({ versions: [v, ...s.versions].slice(0, 20) }))
      return v
    },

    restoreVersion: (id) => {
      const v = get().versions.find(x => x.id === id)
      if (!v) return
      set({ walls: v.walls, furniture: v.furniture, isDirty: true })
      get()._pushHistory()
    },

    /* ── Project CRUD ────────────────────────────────────────────── */
    saveProject: () => {
      const { projectId, projectName, walls, furniture, materials } = get()
      const p = saveProject({ id: projectId, name: projectName, walls, furniture, materials })
      set({ projectId: p.id, isDirty: false })
      return p
    },

    loadProject: (p) => {
      set({
        projectId:   p.id,
        projectName: p.name,
        walls:       p.walls || [],
        furniture:   p.furniture || [],
        materials:   p.materials || { walls:'white-paint', floors:'oak-floor', ceilings:'white-ceiling' },
        versions:    p.versions || [],
        isDirty:     false,
        history:     [{ walls: p.walls||[], furniture: p.furniture||[] }],
        histIdx:     0,
      })
    },
  }))
)
