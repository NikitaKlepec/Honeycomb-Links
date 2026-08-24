import React, { useState } from 'react';
import { useVault } from '../store/useLinkVault';
import { X, Plus, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface HexCardProps {
  link: any;
  isEditMode: boolean;
  onEdit: (link: any) => void;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
}

export function HexCard({ link, isEditMode, onEdit, onDelete, isOverlay }: HexCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: link.id,
    disabled: !isEditMode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging || isOverlay ? 50 : 1,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
  };

  const color = link.color || 'rgba(124, 58, 237, 1)';
  const backgroundUrl = link.imageUrl || (link.url ? `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=128` : null);

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      onEdit(link);
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`absolute w-[173px] h-[150px] group ${isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...attributes}
      {...listeners}
    >
      <div 
        className="w-full h-full relative hex-clip glass-panel transition-all duration-300 group-hover:scale-105 group-hover:glow-accent"
        onClick={handleClick}
        style={{
           boxShadow: `inset 0 0 0 1px rgba(22,79,158,0.2)`,
        }}
      >
        {/* Glow effect on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
             boxShadow: `inset 0 0 8px rgba(243,111,33,0.45)`,
            zIndex: 10,
          }}
        />

        {/* Background image (unblurred, very subtle opacity) */}
        {backgroundUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-100 transition-opacity"
                    style={{
                      backgroundImage: `url(${backgroundUrl})`,
                      backgroundPosition: link.imagePosition
                        ? `${link.imagePosition.x}% ${link.imagePosition.y}%`
                        : '50% 50%',
                    }}
          />
        )}
        
        {/* Border Overlay */}
        <div 
           className="absolute inset-0 hex-clip pointer-events-none border-2 transition-colors duration-300 group-hover:border-orange-500"
           style={{ borderColor: `rgba(22,79,158,0.28)` }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-20">
          <h3 className="text-[11px] font-[600] text-foreground mb-1 line-clamp-1 break-all w-full leading-tight">{link.title}</h3>
          <p className="text-[9px] text-muted-foreground line-clamp-2 leading-tight w-full">{link.description}</p>
        </div>

        {/* Edit mode badge */}
        {isEditMode && (
          <div className="absolute top-1 right-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(link.id);
              }}
              className="p-1 bg-destructive/60 backdrop-blur-sm text-white rounded-full hover:bg-destructive shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Tooltip on hover (view mode) */}
      {!isEditMode && !isDragging && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap glass-panel text-foreground text-[10px] px-2 py-1 rounded border border-white/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">
          {link.url}
        </div>
      )}
    </motion.div>
  );
}

export function AddHexCard({ onClick, index }: { onClick: () => void, index: number }) {
  return (
    <motion.div
      className="absolute w-[173px] h-[150px] cursor-pointer group z-0"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
    >
      <div className="w-full h-full relative hex-clip glass-panel border-2 border-dashed border-primary/30 flex items-center justify-center transition-all duration-300 group-hover:border-primary/60 group-hover:scale-105 group-hover:glow-accent-subtle">
         <Plus className="w-8 h-8 text-primary/50 group-hover:text-orange-500 transition-colors" />
      </div>
    </motion.div>
  );
}
