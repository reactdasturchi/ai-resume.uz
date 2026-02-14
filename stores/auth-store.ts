'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const AUTH_TOKEN_KEY = 'token'

export type User = {
  id: string
  email: string
  name: string | null
  avatarUrl?: string | null
  phone?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  linkedIn?: string | null
  tokens: number
  resumeCount: number
  planId?: string | null
  isAdmin?: boolean
}

type AuthState = {
  token: string | null
  user: User | null
  isLoading: boolean
  isHydrated: boolean
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setHydrated: () => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: true,
      isHydrated: false,
      setToken: (token) => {
        if (typeof window !== 'undefined' && token) {
          window.localStorage.setItem(AUTH_TOKEN_KEY, token)
        }
        set({ token })
      },
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setHydrated: () => set({ isHydrated: true }),
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(AUTH_TOKEN_KEY)
        }
        set({ token: null, user: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state, err) => {
        if (!err && state?.token && typeof window !== 'undefined') {
          window.localStorage.setItem(AUTH_TOKEN_KEY, state.token)
        }
        useAuthStore.getState().setHydrated()
      },
    },
  ),
)
