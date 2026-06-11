import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/index.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const res = await authApi.me()
      if (res.code === 200 && res.data) {
        setUser(res.data)
      } else {
        setUser(null)
      }
    } catch (e) {
      console.error('Check auth error:', e)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (email, name) => {
    const res = await authApi.login({ email, name })
    if (res.code === 200) {
      setUser(res.data)
      setShowLoginModal(false)
      return true
    }
    throw new Error(res.message || '登录失败')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.error('Logout error:', e)
    }
    setUser(null)
  }, [])

  const openLogin = useCallback(() => setShowLoginModal(true), [])
  const closeLogin = useCallback(() => setShowLoginModal(false), [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser: checkAuth,
        showLoginModal,
        openLogin,
        closeLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
