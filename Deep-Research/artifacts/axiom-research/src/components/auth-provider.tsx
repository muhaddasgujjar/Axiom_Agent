import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Redirect } from 'wouter';
import { getAuthMeQueryKey, useAuthMe, type User } from '@workspace/api-client-react';
import { getToken, setToken } from '@/lib/auth';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => Boolean(getToken()));
  const [user, setUser] = useState<User | null>(null);

  const me = useAuthMe({
    query: {
      queryKey: getAuthMeQueryKey(),
      enabled: hasToken,
      retry: false,
      staleTime: 5 * 60_000,
    },
  });

  useEffect(() => {
    if (me.isError) {
      setToken(null);
      setHasToken(false);
      setUser(null);
    } else if (me.data) {
      setUser(me.data);
    }
  }, [me.isError, me.data]);

  const signIn = (token: string) => {
    setToken(token);
    setHasToken(true);
    setUser(null);
    queryClient.clear();
  };

  const signOut = () => {
    setToken(null);
    setHasToken(false);
    setUser(null);
    queryClient.clear();
  };

  const loading = hasToken && !user && !me.isError && me.isPending;

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-[#f4f2ed]">
        <div className="size-8 animate-spin rounded-full border-2 border-[#214e4a] border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Redirect to="/login" />;
  return <>{children}</>;
}
