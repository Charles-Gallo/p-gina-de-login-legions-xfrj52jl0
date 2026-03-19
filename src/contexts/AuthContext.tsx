import React, { createContext, useContext, useState, useEffect } from 'react'

type UserRole = 'admin' | 'customer' | null

interface AuthContextType {
  role: UserRole
  isAuthenticated: boolean
  login: (role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('@legions:role')
    if (savedRole === 'admin' || savedRole === 'customer') {
      return savedRole as UserRole
    }
    return null
  })

  useEffect(() => {
    if (role) {
      localStorage.setItem('@legions:role', role)
    } else {
      localStorage.removeItem('@legions:role')
    }
  }, [role])

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        role,
        isAuthenticated: role !== null,
        login: (newRole: UserRole) => setRole(newRole),
        logout: () => setRole(null),
      },
    },
    children,
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
