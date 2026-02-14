'use client'

import { api } from '@/lib/api'
import { AUTH_TOKEN_KEY, useAuthStore, type User } from '@/stores/auth-store'
import React, { createContext, useCallback, useContext, useEffect } from 'react'

type AuthContextValue = {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    token,
    user,
    isLoading,
    isHydrated,
    setToken,
    setUser,
    setLoading,
    setHydrated,
    clearAuth,
  } = useAuthStore()

  const loadUser = useCallback(async (t: string) => {
    setLoading(true)
    try {
      const u = await api.auth.me()
      setUser(u)
      setToken(t)
    } catch {
      clearAuth()
    } finally {
      setLoading(false)
    }
  }, [setToken, setUser, setLoading, clearAuth])


  useEffect(() => {
    if (!isHydrated) return
    const currentToken = useAuthStore.getState().token ?? (typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null)
    if (currentToken) {
      loadUser(currentToken)
    } else {
      setLoading(false)
    }
  }, [isHydrated, loadUser, setLoading])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const t = setTimeout(() => {
      if (!useAuthStore.getState().isHydrated) {
        useAuthStore.getState().setHydrated()
      }
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuth()
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [clearAuth])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.auth.login({ email, password })
      setToken(res.token)
      await loadUser(res.token)
    },
    [loadUser, setToken],
  )

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const res = await api.auth.register({ email, password, name })
      setToken(res.token)
      await loadUser(res.token)
    },
    [loadUser, setToken],
  )

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  const refreshUser = useCallback(async () => {
    const t = useAuthStore.getState().token ?? (typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null)
    if (t) await loadUser(t)
  }, [loadUser])

  const value: AuthContextValue = {
    user,
    token,
    isLoading: isLoading || !isHydrated,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
