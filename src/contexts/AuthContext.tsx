import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

type UserRole = 'admin' | 'cliente' | null
type AuthResultRole = UserRole | 'unconfirmed'

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
  const [isInitialized, setIsInitialized] = useState(false)

  const loadRoleAndData = async (currentUser: User | null): Promise<AuthResultRole> => {
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

    const isClienteMetadata = currentUser.user_metadata?.role === 'cliente'

    try {
      const { data, error } = await supabase
        .from('usuarios_cliente')
        .select('*, clientes(*)')
        .eq('email', currentUser.email)
        .single()

      if (error && !isClienteMetadata && error.code !== 'PGRST116') {
        setRole(null)
        setCustomerData(null)
        return null
      }

      if (data && data.email_confirmado === false) {
        setRole(null)
        setCustomerData(null)
        return 'unconfirmed'
      }

      if (isClienteMetadata || (data && data.ativo)) {
        setRole('cliente')
        setCustomerData(data || null)
        return 'cliente'
      }
    } catch (err) {
      if (isClienteMetadata) {
        setRole('cliente')
        return 'cliente'
      }
    }

    setRole(null)
    setCustomerData(null)
    return null
  }

  useEffect(() => {
    let isMounted = true

    // Fallback timeout for initialization
    const initTimeout = setTimeout(() => {
      if (isMounted && !isInitialized) {
        setIsInitialized(true)
        setLoading(false)
      }
    }, 5000)

    // Fetch initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (isMounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setIsInitialized(true)
          clearTimeout(initTimeout)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsInitialized(true)
          setLoading(false)
          clearTimeout(initTimeout)
        }
      })

    // Listen for auth changes (synchronous only inside callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session)
        setUser(session?.user ?? null)
      }
    })

    return () => {
      isMounted = false
      clearTimeout(initTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const previousUserId = useRef<string | null>(null)

  useEffect(() => {
    // Prevent premature role loading and loading state flip before initialization
    if (!isInitialized) return

    // Avoid triggering on token refresh / tab focus when user id hasn't changed
    const currentUserId = user?.id || null
    if (currentUserId === previousUserId.current && currentUserId !== null) {
      return
    }

    previousUserId.current = currentUserId
    let isMounted = true

    if (user) {
      setLoading(true) // Ensure we are loading while fetching role

      const roleTimeoutId = setTimeout(() => {
        if (isMounted) setLoading(false)
      }, 5000)

      loadRoleAndData(user)
        .then((r) => {
          clearTimeout(roleTimeoutId)
          if (!isMounted) return

          if (r === 'unconfirmed') {
            supabase.auth
              .signOut()
              .then(() => {
                if (isMounted) {
                  setLoading(false)
                  previousUserId.current = null
                }
              })
              .catch(() => {
                if (isMounted) setLoading(false)
              })
          } else {
            if (isMounted) setLoading(false)
          }
        })
        .catch(() => {
          clearTimeout(roleTimeoutId)
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
  }, [user, isInitialized])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error, role: null }

    const r = await loadRoleAndData(data.user)

    if (r === 'unconfirmed') {
      await supabase.auth.signOut()
      return { error: new Error('UNCONFIRMED_EMAIL'), role: null }
    }

    return { error: null, role: r as UserRole }
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
