/**
 * SCENE STORE — Context-based state management for the scene data model.
 * Provides undo/redo, mutation helpers, and serialization hooks.
 */
import { createContext, useCallback, useContext, useReducer } from 'react'
import {
  createScene, createWall, createOpening, createFurnitureItem,
  serializeScene, deserializeScene, snapToWallEndpoint,
} from '../lib/scene'

const SceneContext = createContext(null)

// ── Reducer ─────────────────────────────────────────────────────────────────

const MAX_HISTORY = 50

function cloneScene(s) { return JSON.parse(JSON.stringify(s)) }

const initialState = (() => {
  const scene = createScene()
  return { scene, history: [], future: [] }
})()

function reducer(state, action) {
  switch (action.type) {

    case 'COMMIT': {
      const next = action.updater(cloneScene(state.scene))
      return {
        scene: next,
        history: [...state.history.slice(-MAX_HISTORY + 1), state.scene],
        future: [],
      }
    }

    case 'UNDO': {
      if (!state.history.length) return state
      const prev = state.history[state.history.length - 1]
      return {
        scene: prev,
        history: state.history.slice(0, -1),
        future: [state.scene, ...state.future],
      }
    }

    case 'REDO': {
      if (!state.future.length) return state
      const next = state.future[0]
      return {
        scene: next,
        history: [...state.history, state.scene],
        future: state.future.slice(1),
      }
    }

    case 'LOAD': {
      return { scene: action.scene, history: [], future: [] }
    }

    default: return state
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function SceneProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const commit = useCallback((updater) => {
    dispatch({ type: 'COMMIT', updater })
  }, [])

  const undo  = useCallback(() => dispatch({ type: 'UNDO' }), [])
  const redo  = useCallback(() => dispatch({ type: 'REDO' }), [])

  // ── Scene-level mutations ────────────────────────────────────────────────

  const setName = useCallback((name) => {
    commit(s => { s.metadata.name = name; return s })
  }, [commit])

  const updateSettings = useCallback((patch) => {
    commit(s => { Object.assign(s.settings, patch); return s })
  }, [commit])

  const setActiveFloor = useCallback((floorId) => {
    commit(s => { s.activeFloorId = floorId; return s })
  }, [commit])

  // ── Wall mutations ───────────────────────────────────────────────────────

  const addWall = useCallback((sx, sz, ex, ez, opts) => {
    commit(s => {
      const floor = activeFloorOf(s)
      if (floor) floor.walls.push(createWall(sx, sz, ex, ez, opts ?? { height: s.settings.wallHeight, thickness: s.settings.wallThickness }))
      return s
    })
  }, [commit])

  const removeWall = useCallback((wallId) => {
    commit(s => {
      const floor = activeFloorOf(s)
      if (floor) {
        floor.walls = floor.walls.filter(w => w.id !== wallId)
        floor.openings = floor.openings.filter(o => o.wallId !== wallId)
      }
      return s
    })
  }, [commit])

  const updateWall = useCallback((wallId, patch) => {
    commit(s => {
      const floor = activeFloorOf(s)
      const wall = floor?.walls.find(w => w.id === wallId)
      if (wall) Object.assign(wall, patch)
      return s
    })
  }, [commit])

  const clearWalls = useCallback(() => {
    commit(s => {
      const floor = activeFloorOf(s)
      if (floor) { floor.walls = []; floor.openings = []; floor.rooms = [] }
      return s
    })
  }, [commit])

  // ── Opening mutations ────────────────────────────────────────────────────

  const addOpening = useCallback((type, wallId, posAlongWall, opts) => {
    commit(s => {
      const floor = activeFloorOf(s)
      if (floor) floor.openings.push(createOpening(type, wallId, posAlongWall, opts))
      return s
    })
  }, [commit])

  const removeOpening = useCallback((openingId) => {
    commit(s => {
      const floor = activeFloorOf(s)
      if (floor) floor.openings = floor.openings.filter(o => o.id !== openingId)
      return s
    })
  }, [commit])

  // ── Furniture mutations ──────────────────────────────────────────────────

  const addFurniture = useCallback((catalogItem, position, rotation = 0) => {
    commit(s => {
      const floor = activeFloorOf(s)
      if (floor) floor.furniture.push(createFurnitureItem(catalogItem, position, rotation))
      return s
    })
  }, [commit])

  const moveFurniture = useCallback((itemId, position) => {
    commit(s => {
      for (const floor of s.floors) {
        const item = floor.furniture.find(f => f.id === itemId)
        if (item) { item.position = { x: +position.x.toFixed(3), y: 0, z: +position.z.toFixed(3) }; break }
      }
      return s
    })
  }, [commit])

  const rotateFurniture = useCallback((itemId, rotation) => {
    commit(s => {
      for (const floor of s.floors) {
        const item = floor.furniture.find(f => f.id === itemId)
        if (item) { item.rotation = rotation; break }
      }
      return s
    })
  }, [commit])

  const removeFurniture = useCallback((itemId) => {
    commit(s => {
      for (const floor of s.floors) {
        floor.furniture = floor.furniture.filter(f => f.id !== itemId)
      }
      return s
    })
  }, [commit])

  const updateFurnitureMaterial = useCallback((itemId, material) => {
    commit(s => {
      for (const floor of s.floors) {
        const item = floor.furniture.find(f => f.id === itemId)
        if (item) { item.material = material; break }
      }
      return s
    })
  }, [commit])

  const clearFurniture = useCallback(() => {
    commit(s => {
      for (const floor of s.floors) floor.furniture = []
      return s
    })
  }, [commit])

  // ── Serialization ────────────────────────────────────────────────────────

  const exportJSON = useCallback(() => serializeScene(state.scene), [state.scene])

  const loadFromJSON = useCallback((json) => {
    try {
      const scene = deserializeScene(json)
      dispatch({ type: 'LOAD', scene })
      return true
    } catch (e) {
      console.error('Scene load failed:', e)
      return false
    }
  }, [])

  const resetScene = useCallback((name) => {
    const s = createScene(name)
    dispatch({ type: 'LOAD', scene: s })
  }, [])

  // ── Derived ──────────────────────────────────────────────────────────────

  const { scene } = state
  const activeFloor = scene.floors.find(f => f.id === scene.activeFloorId) ?? scene.floors[0]

  const value = {
    scene,
    activeFloor,
    canUndo: state.history.length > 0,
    canRedo: state.future.length > 0,
    undo, redo,
    setName, updateSettings, setActiveFloor,
    addWall, removeWall, updateWall, clearWalls,
    addOpening, removeOpening,
    addFurniture, moveFurniture, rotateFurniture, removeFurniture, updateFurnitureMaterial, clearFurniture,
    exportJSON, loadFromJSON, resetScene,
  }

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
}

export function useScene() {
  const ctx = useContext(SceneContext)
  if (!ctx) throw new Error('useScene must be used within <SceneProvider>')
  return ctx
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function activeFloorOf(scene) {
  return scene.floors.find(f => f.id === scene.activeFloorId) ?? scene.floors[0]
}
