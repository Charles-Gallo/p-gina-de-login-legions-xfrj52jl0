import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

type UserRole = 'admin' | 'customer' | null

interface AuthContextType {
  user: User | null
  session: Session | null
  role: UserRole
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: any; role: UserRole }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
  customerData: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const [customerData, setCustomerData] = useState<any>(null)

  const loadRoleAndData = async (currentUser: User | null) => {
    if (!currentUser) {
      setRole(null)
      setCustomerData(null)
      return null
    }

    if (currentUser.user_metadata?.role === 'admin') {
      setRole('admin')
      setCustomerData(null)
      return 'admin'
    }

    const { data } = await supabase
      .from('usuarios_cliente')
      .select('*, clientes(*)')
      .eq('email', currentUser.email)
      .single()

    if (data && data.ativo) {
      setRole('customer')
      setCustomerData(data)
      return 'customer'
    }

    setRole(null)
    setCustomerData(null)
    return null
  }

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (isMounted) {
        setSession(session)
        setUser(session?.user ?? null)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    if (user) {
      loadRoleAndData(user).then(() => {
        if (isMounted) setLoading(false)
      })
    } else {
      setRole(null)
      setCustomerData(null)
      setLoading(false)
    }
    return () => {
      isMounted = false
    }
  }, [user])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error, role: null }
    const r = await loadRoleAndData(data.user)
    return { error: null, role: r }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const contextValue = {
    user,
    session,
    role,
    isAuthenticated: !!user && !!role,
    signIn,
    signOut,
    loading,
    customerData,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
