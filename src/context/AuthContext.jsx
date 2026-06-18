import { createContext, useContext, useEffect, useState } from 'react'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const API  = BASE.replace('/api', '')
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(undefined) // undefined = loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('es_token')
    if (!token) { setUser(null); setLoading(false); return }
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(u => { setUser(u); setLoading(false) })
      .catch(() => { setUser(null); setLoading(false) })
  }, [])

  function login(token, userData) {
    localStorage.setItem('es_token', token)
    localStorage.setItem('es_user', JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('es_token')
    localStorage.removeItem('es_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, session: user, profile: user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
