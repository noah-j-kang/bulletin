import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Note {
  id: string; // Supabase uses UUIDs
  content: string;
  x: number;
  y: number;
  created_at?: string;
  user_id?: string;
}

interface CanvasState {
  notes: Note[];
  scale: number;
  offset: { x: number; y: number };
  snapToGrid: boolean;

  // Actions
  setNotes: (notes: Note[]) => void;
  addNote: (content: string, x: number, y: number) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCanvas: (scale: number, offset: { x: number; y: number }) => void;
  toggleSnap: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  notes: [],
  scale: 1,
  offset: { x: 0, y: 0 },
  snapToGrid: false,

  setNotes: (notes) => set({ notes }),

  addNote: async (content, x, y) => {
    // For creation, we wait for Supabase to generate the definitive UUID
    // Alternatively, you could generate a UUID client-side for true instant creation
    const { data, error } = await supabase
      .from('notes')
      .insert([{ content, x, y }])
      .select()
      .single();

    if (error) {
      console.error('Error adding note:', error.message);
      return;
    }

    if (data) {
      set((state) => ({ notes: [...state.notes, data] }));
    }
  },

  updateNote: async (id, updates) => {
    // 1. Optimistic Update: Instantly reflect the change in the UI
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      ),
    }));

    // 2. Network Update: Send the change to Supabase in the background
    const { error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating note:', error.message);
      // In a production environment, you would revert the optimistic 
      // update here if the network request fails.
    }
  },

  deleteNote: async (id) => {
    // 1. Optimistic Update: Instantly remove the note from the UI
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }));

    // 2. Network Update: Remove from Supabase
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error.message);
    }
  },

  setCanvas: (scale, offset) => set({ scale, offset }),

  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
}));