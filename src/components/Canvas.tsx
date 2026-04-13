import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useCanvasStore } from '@/src/store/useCanvasStore';
import NoteComponent from './Note';
import { CommandPalette } from './CommandPalette';
import { cn } from '@/lib/utils';

export const Canvas: React.FC = () => {
  const { notes, addNote, scale, offset, setCanvas, snapToGrid, toggleSnap } = useCanvasStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;
    
    addNote('', x, y);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setCanvas(scale, {
      x: offset.x + e.movementX,
      y: offset.y + e.movementY,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const zoomSpeed = 0.001;
      const newScale = Math.min(Math.max(scale - e.deltaY * zoomSpeed, 0.1), 5);
      
      // Zoom towards mouse position
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldX = (mouseX - offset.x) / scale;
        const worldY = (mouseY - offset.y) / scale;
        
        const newOffsetX = mouseX - worldX * newScale;
        const newOffsetY = mouseY - worldY * newScale;
        
        setCanvas(newScale, { x: newOffsetX, y: newOffsetY });
      }
    } else {
      setCanvas(scale, {
        x: offset.x - e.deltaX,
        y: offset.y - e.deltaY,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#fafafa] cursor-crosshair select-none"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{
        backgroundImage: `radial-gradient(#e5e5e5 1px, transparent 1px)`,
        backgroundSize: `${20 * scale}px ${20 * scale}px`,
        backgroundPosition: `${offset.x}px ${offset.y}px`,
      }}
    >
      <div
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {notes.map((note) => (
          <NoteComponent key={note.id} note={note} />
        ))}
      </div>

      <CommandPalette />

      <div className="absolute bottom-6 left-6 flex flex-col gap-2 pointer-events-none">
        <button
          onClick={toggleSnap}
          className={cn(
            "pointer-events-auto bg-white/80 backdrop-blur-sm border border-black/5 rounded-lg px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors",
            snapToGrid ? "text-blue-600 font-bold" : "text-black/40"
          )}
        >
          Snap: {snapToGrid ? "ON" : "OFF"}
        </button>
        <div className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-lg px-3 py-1.5 text-[10px] font-mono text-black/40 uppercase tracking-wider">
          Scale: {(scale * 100).toFixed(0)}%
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-lg px-3 py-1.5 text-[10px] font-mono text-black/40 uppercase tracking-wider">
          Notes: {notes.length}
        </div>
      </div>

      <div className="absolute top-6 right-6 pointer-events-none">
        {/* User profile is now handled by AuthProvider in top-left */}
      </div>
    </div>
  );
};
