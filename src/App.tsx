// src/App.tsx
import { useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { AuthProvider } from './components/AuthProvider';
import { useCanvasStore } from './store/useCanvasStore';
import { supabase } from './lib/supabase';

function BulletinApp() {
  const setNotes = useCanvasStore((state) => state.setNotes);

  useEffect(() => {
    // 1. Fetch initial dataset
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching notes:', error);
        return;
      }
      if (data) setNotes(data);
    };

    fetchNotes();

    // 2. Subscribe to Postgres changes (Real-time)
    const channel = supabase
      .channel('public:notes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
          // For a frictionless sync, re-fetching is safest, 
          // or you can optimize by updating Zustand state directly using payload.new/payload.old
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setNotes]);

  return (
    <main className="w-full h-screen overflow-hidden">
      <Canvas />
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BulletinApp />
    </AuthProvider>
  );
}