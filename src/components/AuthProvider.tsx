import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, login, logout } from '@/src/lib/supabase';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(loading => false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const signOutUser = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" />
          <span className="text-xs font-mono text-black/40 uppercase tracking-widest">Initializing Bulletin</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="max-w-md w-full p-8 bg-white border border-black/5 rounded-2xl shadow-sm flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <span className="text-white font-bold text-2xl">B.</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black">Welcome to Bulletin</h1>
            <p className="text-sm text-black/40 mt-2">A zero-friction spatial workspace for your ideas.</p>
          </div>
          <Button onClick={signIn} className="w-full h-12 rounded-xl bg-black hover:bg-black/90 text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
            <LogIn className="w-4 h-4 mr-2" />
            Sign in with Google
          </Button>
          <p className="text-[10px] text-black/20 uppercase tracking-wider font-mono">Secure collaborative workspace</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut: signOutUser }}>
      <div className="fixed top-6 left-6 z-50 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-black/5 rounded-full pl-1 pr-4 py-1 shadow-sm">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="w-7 h-7 rounded-full border border-black/5" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center">
              <UserIcon className="w-3 h-3 text-black/40" />
            </div>
          )}
          <span className="text-xs font-medium text-black/60">{user.displayName}</span>
        </div>
        <button
          onClick={signOutUser}
          className="p-2 bg-white/80 backdrop-blur-sm border border-black/5 rounded-full shadow-sm hover:bg-red-50 transition-colors group"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 text-black/40 group-hover:text-red-500" />
        </button>
      </div>
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
