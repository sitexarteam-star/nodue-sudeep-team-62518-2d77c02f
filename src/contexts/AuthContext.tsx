import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRoles: string[];
  profile: any;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string, roles: string[]) => {
    // Fetch from staff_profiles if user has admin/staff role, otherwise from profiles
    const table = roles.some(r => ['admin', 'library', 'hostel', 'college_office', 'hod', 'lab_instructor', 'faculty'].includes(r))
      ? 'staff_profiles'
      : 'profiles';
    
    const { data } = await (supabase as any)
      .from(table)
      .select('*')
      .eq('id', userId)
      .single();
    
    setProfile(data);
  };

  const refreshProfile = async () => {
    if (user && userRoles.length > 0) {
      await fetchProfile(user.id, userRoles);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch user roles and profile when session changes
        if (currentSession?.user) {
          setTimeout(async () => {
            const { data: roles } = await (supabase as any)
              .from('user_roles')
              .select('role')
              .eq('user_id', currentSession.user.id);
            
            const userRolesList = roles?.map((r: any) => r.role) || [];
            setUserRoles(userRolesList);
            
            // Fetch profile
            if (userRolesList.length > 0) {
              await fetchProfile(currentSession.user.id, userRolesList);
            }
          }, 0);
        } else {
          setUserRoles([]);
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Fetch user roles and profile for existing session
      if (currentSession?.user) {
        (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', currentSession.user.id)
          .then(async ({ data: roles }: any) => {
            const userRolesList = roles?.map((r: any) => r.role) || [];
            setUserRoles(userRolesList);
            
            // Fetch profile
            if (userRolesList.length > 0) {
              await fetchProfile(currentSession.user.id, userRolesList);
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRoles([]);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, userRoles, profile, logout, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
