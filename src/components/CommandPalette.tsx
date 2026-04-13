import React, { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCanvasStore } from '@/src/store/useCanvasStore';
import { Plus, Search, Trash2 } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { notes, addNote, deleteNote, scale, offset } = useCanvasStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleCreateNote = () => {
    // Create in center of viewport
    const x = (window.innerWidth / 2 - offset.x) / scale;
    const y = (window.innerHeight / 2 - offset.y) / scale;
    addNote('', x, y);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search notes..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleCreateNote}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Note</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Notes">
          {notes.map((note) => (
            <CommandItem
              key={note.id}
              onSelect={() => {
                // In a real app, we'd pan to the note
                setOpen(false);
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              <span className="truncate">{note.content || "Empty Note"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                className="ml-auto p-1 hover:bg-red-500/10 rounded"
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </button>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
