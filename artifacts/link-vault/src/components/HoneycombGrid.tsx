import React, { useState, useEffect } from 'react';
import { useVault, Link } from '../store/useLinkVault';
import { HexCard, AddHexCard } from './HexCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { EditModal } from './EditModal';

const HEX_WIDTH = 173;
const HEX_HEIGHT = 150;
const GAP = 10;
const X_OFFSET = HEX_WIDTH + GAP;
const Y_OFFSET = HEX_HEIGHT * 0.75 + GAP;

export function HoneycombGrid() {
  const { data, isEditMode, updateLink, deleteLink, addLink, reorderLinks } = useVault();
  
  const activeCategory = data.categories.find(c => c.id === data.activeCategory);
  const links = activeCategory ? activeCategory.links.sort((a, b) => a.order - b.order) : [];

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  
  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id && activeCategory) {
      reorderLinks(activeCategory.id, active.id, over.id);
    }

    setActiveDragId(null);
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const handleDelete = (linkId: string) => {
    if (activeCategory) {
      deleteLink(activeCategory.id, linkId);
    }
  };

  const handleSaveModal = (linkData: Partial<Link>) => {
    if (activeCategory) {
      if (editingLink) {
        updateLink(activeCategory.id, editingLink.id, linkData);
      } else {
        addLink(activeCategory.id, linkData as Omit<Link, 'id' | 'order'>);
      }
    }
    setIsModalOpen(false);
  };

  // Calculate layout container dimensions based on screen size to determine max columns
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const handleResize = () => {
      const el = document.getElementById('grid-container');
      if (el) setContainerWidth(el.clientWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cols = Math.max(1, Math.floor(containerWidth / X_OFFSET) - 1);

  const renderHexes = () => {
    let items = links.map((link, index) => {
      // Calculate row and col for offset math
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      const isOddRow = row % 2 !== 0;
      const x = col * X_OFFSET + (isOddRow ? X_OFFSET / 2 : 0);
      const y = row * Y_OFFSET;

      return (
        <div 
          key={link.id} 
          style={{ position: 'absolute', left: x, top: y }}
        >
          <HexCard 
            link={link} 
            isEditMode={isEditMode} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
          />
        </div>
      );
    });

    if (isEditMode) {
      const index = links.length;
      const row = Math.floor(index / cols);
      const col = index % cols;
      const isOddRow = row % 2 !== 0;
      const x = col * X_OFFSET + (isOddRow ? X_OFFSET / 2 : 0);
      const y = row * Y_OFFSET;
      
      items.push(
        <div key="add-button" style={{ position: 'absolute', left: x, top: y }}>
          <AddHexCard onClick={handleAdd} index={index} />
        </div>
      );
    }

    return items;
  };

  const getActiveLink = () => {
    return links.find(l => l.id === activeDragId);
  };

  if (!activeCategory) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select or create a category
      </div>
    );
  }

  return (
    <div className="w-full h-full p-8 md:p-12 overflow-auto vault-scrollbar" id="grid-container">
      <div className="mb-8">
        <h1 className="text-[2rem] font-[300] tracking-wide text-foreground mb-2">
          {activeCategory.name}
        </h1>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="relative" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <SortableContext 
            items={links.map(l => l.id)}
            strategy={rectSortingStrategy}
          >
            {renderHexes()}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeDragId ? (
            <div style={{ position: 'relative' }}>
              <HexCard 
                link={getActiveLink()} 
                isEditMode={isEditMode} 
                onEdit={() => {}} 
                onDelete={() => {}} 
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <EditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingLink}
      />
    </div>
  );
}
