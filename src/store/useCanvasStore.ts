import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/src/lib/firebase';

export interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
  updatedAt: number;
  authorId: string;
  isGhost?: boolean;
}

interface CanvasState {
  notes: Note[];
  scale: number;
  offset: { x: number; y: number };
  snapToGrid: boolean;
  setNotes: (notes: Note[]) => void;
  addNote: (content: string, x: number, y: number) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCanvas: (scale: number, offset: { x: number; y: number }) => void;
  toggleSnap: () => void;
}

const COLORS = [
  '#fef3c7', // Amber 100
  '#dcfce7', // Green 100
  '#dbeafe', // Blue 100
  '#f3e8ff', // Purple 100
  '#fee2e2', // Red 100
];

export const useCanvasStore = create<CanvasState>((set, get) => ({
  notes: [],
  scale: 1,
  offset: { x: 0, y: 0 },
  snapToGrid: false,
  setNotes: (notes) => set({ notes }),
  addNote: async (content, x, y) => {
    const user = auth.currentUser;
    if (!user) return;

    const id = nanoid();
    const newNote: Note = {
      id,
      content,
      x,
      y,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      authorId: user.uid,
    };

    try {
      await setDoc(doc(db, 'notes', id), newNote);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `notes/${id}`);
    }
  },
  updateNote: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'notes', id), {
        ...updates,
        updatedAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notes/${id}`);
    }
  },
  deleteNote: async (id) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${id}`);
    }
  },
  setCanvas: (scale, offset) => set({ scale, offset }),
  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
}));
