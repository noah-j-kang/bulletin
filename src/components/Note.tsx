import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Note, useCanvasStore } from '@/src/store/useCanvasStore';
import { Trash2, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteProps {
  note: Note;
}

const NoteComponent: React.FC<NoteProps> = ({ note }) => {
  const { updateNote, deleteNote, scale, snapToGrid } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(note.content === '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNote(note.id, { content: e.target.value });
  };

  const handleDragEnd = (_: any, info: any) => {
    let newX = note.x + info.offset.x / scale;
    let newY = note.y + info.offset.y / scale;

    if (snapToGrid) {
      const gridSize = 20;
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    updateNote(note.id, {
      x: newX,
      y: newY,
    });
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{
        position: 'absolute',
        left: note.x,
        top: note.y,
        backgroundColor: note.color,
        zIndex: isEditing ? 100 : 1,
      }}
      className={cn(
        "group pointer-events-auto min-w-[200px] min-h-[120px] p-4 rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-black/5 flex flex-col gap-2 transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
        isEditing && "ring-2 ring-black/10"
      )}
    >
      <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-black/5 rounded">
          <GripHorizontal className="w-3 h-3 text-black/40" />
        </div>
        <button
          onClick={() => deleteNote(note.id)}
          className="p-1 hover:bg-red-500/10 rounded group/del"
        >
          <Trash2 className="w-3 h-3 text-black/40 group-hover/del:text-red-500" />
        </button>
      </div>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={handleContentChange}
          onBlur={() => setIsEditing(false)}
          className="w-full h-full bg-transparent border-none outline-none resize-none text-sm font-medium text-black/80 placeholder:text-black/20"
          placeholder="Type something..."
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="w-full h-full text-sm font-medium text-black/80 whitespace-pre-wrap break-words cursor-text min-h-[60px]"
        >
          {note.content || <span className="text-black/20 italic">Empty note...</span>}
        </div>
      )}

      <div className="mt-auto pt-2 flex justify-between items-center text-[9px] font-mono text-black/30 uppercase tracking-tighter">
        <span>
          {note.created_at
            ? new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now'}
        </span>
        {note.isGhost && <span className="text-orange-500/60">Ephemeral</span>}
      </div>
    </motion.div>
  );
};

export default NoteComponent;
