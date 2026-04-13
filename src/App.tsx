import { useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { AuthProvider } from './components/AuthProvider';
import { useCanvasStore } from './store/useCanvasStore';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

function BulletinApp() {
  const setNotes = useCanvasStore((state) => state.setNotes);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as any[];
      setNotes(notesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
    });

    return () => unsubscribe();
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
