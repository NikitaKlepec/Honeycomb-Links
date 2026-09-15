import React, { useState } from 'react';
import { useVault, Category } from '../store/useLinkVault';
import { 
  FolderPlus, 
  Trash2, 
  Edit2, 
} from 'lucide-react';
import * as Icons from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ICON_OPTIONS = [
  'Terminal', 'PenTool', 'Book', 'Heart', 'Globe', 'Settings', 'ImageIcon', 'Briefcase', 'Coffee', 'Monitor', 'Cpu', 'Database'
];

interface SortableCategoryProps {
  cat: Category;
  isActive: boolean;
  isEditMode: boolean;
  isEditing: boolean;
  newName: string;
  newIcon: string;
  canDelete: boolean;
  onSelect: () => void;
  onNameChange: (value: string) => void;
  onIconChange: (icon: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
}

function SortableCategory({
  cat,
  isActive,
  isEditMode,
  isEditing,
  newName,
  newIcon,
  canDelete,
  onSelect,
  onNameChange,
  onIconChange,
  onCancelEdit,
  onSaveEdit,
  onStartEdit,
  onDelete,
}: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cat.id,
    disabled: !isEditMode || isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const renderIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Folder;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 md:flex-shrink">
      {isEditing ? (
        <div className="glass-panel p-3 rounded-md border border-primary/30 md:mb-2 space-y-3 min-w-[200px]">
          <input
            type="text"
            value={newName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-white/50 border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary"
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((icon) => {
              const IconComp = (Icons as any)[icon] || Icons.Folder;
              return (
                <button
                  key={icon}
                  onClick={() => onIconChange(icon)}
                  className={`p-1.5 rounded-md border ${newIcon === icon ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground'}`}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={onCancelEdit} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={onSaveEdit} className="text-xs text-primary font-medium hover:text-primary/80">Save</button>
          </div>
        </div>
      ) : (
        <div
          className={`group flex items-center justify-between p-3 rounded-md cursor-pointer transition-all ${isActive ? 'bg-primary text-white border border-primary' : 'text-muted-foreground hover:bg-white hover:text-primary border border-transparent'}`}
          onClick={onSelect}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label={isEditMode ? `Drag ${cat.name} to reorder` : undefined}
              title={isEditMode ? 'Drag to reorder' : undefined}
              className={`${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-orange-600'} transition-colors flex-shrink-0 ${isEditMode ? 'cursor-grab active:cursor-grabbing touch-none rounded-md p-0.5 hover:bg-primary/10' : ''}`}
            >
              {renderIcon(cat.icon)}
            </span>
            <span className="font-medium text-sm truncate">{cat.name}</span>
          </div>
          <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-muted-foreground'}`}>
            {cat.links.length}
          </span>

          {isEditMode && (
            <div className="flex items-center gap-1 opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
                aria-label={`Edit ${cat.name}`}
                className="p-1.5 text-muted-foreground hover:text-primary rounded-md"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {canDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  aria-label={`Delete ${cat.name}`}
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { data, isEditMode, setActiveCategory, addCategory, deleteCategory, updateCategory, reorderCategories } = useVault();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Folder');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleAdd = () => {
    if (newName.trim()) {
      addCategory(newName.trim(), newIcon);
      setNewName('');
      setNewIcon('Folder');
      setIsAdding(false);
    }
  };

  const handleUpdate = (id: string) => {
    if (newName.trim()) {
      updateCategory(id, { name: newName.trim(), icon: newIcon });
      setEditingId(null);
      setNewName('');
      setNewIcon('Folder');
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setNewName(cat.name);
    setNewIcon(cat.icon);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderCategories(String(active.id), String(over.id));
    }
  };

  return (
    <div className={`w-full md:w-64 border-r border-blue-200 h-auto md:h-full flex flex-col transition-all duration-300 ${isEditMode ? 'border-primary/50 shadow-[0_0_15px_rgba(22,79,158,0.15)]' : ''}`} style={{background: '#f9f9ff'}}>
      <div className="p-6">
          <h2 className="text-xl font-[400] tracking-wider text-primary flex items-center gap-2">
          <Icons.Hexagon className="w-6 h-6 stroke-[1.5px]" />
          VAULT
        </h2>
        {isEditMode && (
          <div className="mt-2 text-[10px] font-mono tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-sm inline-block border border-primary/20">
            SYSTEM.EDIT_MODE_ACTIVE
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-none md:flex-1 overflow-x-auto md:overflow-y-auto vault-scrollbar px-4 pb-4 flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-2">
          <SortableContext items={data.categories.map((category) => category.id)} strategy={rectSortingStrategy}>
            {data.categories.map((cat) => (
              <SortableCategory
                key={cat.id}
                cat={cat}
                isActive={data.activeCategory === cat.id}
                isEditMode={isEditMode}
                isEditing={editingId === cat.id}
                newName={newName}
                newIcon={newIcon}
                canDelete={data.categories.length > 1}
                onSelect={() => setActiveCategory(cat.id)}
                onNameChange={setNewName}
                onIconChange={setNewIcon}
                onCancelEdit={() => setEditingId(null)}
                onSaveEdit={() => handleUpdate(cat.id)}
                onStartEdit={() => startEdit(cat)}
                onDelete={() => deleteCategory(cat.id)}
              />
            ))}
          </SortableContext>

          {isEditMode && !isAdding && (
            <button
              onClick={() => {
                setIsAdding(true);
                setNewName('');
                setNewIcon('Folder');
              }}
              className="w-full mt-4 flex items-center gap-2 p-3 text-sm text-muted-foreground hover:text-orange-600 border border-dashed border-primary/40 hover:border-orange-500 hover:glow-accent-subtle rounded-md transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              Add Category
            </button>
          )}

          {isAdding && (
            <div className="glass-panel p-3 rounded-md border border-primary/30 mt-4 space-y-3">
              <input
                type="text"
                placeholder="Category Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-white/50 border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => {
                  const IconComp = (Icons as any)[icon] || Icons.Folder;
                  return (
                    <button
                      key={icon}
                      onClick={() => setNewIcon(icon)}
                      className={`p-1.5 rounded-md border ${newIcon === icon ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  )
                })}
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setIsAdding(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={handleAdd} className="text-xs text-primary font-medium hover:text-primary/80">Add</button>
              </div>
            </div>
          )}
        </div>
      </DndContext>
    </div>
  );
}
