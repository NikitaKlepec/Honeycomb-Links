import React, { useState } from 'react';
import { useVault } from '../store/useLinkVault';
import { 
  FolderPlus, 
  Trash2, 
  Edit2, 
  Plus,
  Terminal,
  PenTool,
  Book,
  Heart,
  Globe,
  Settings,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import * as Icons from 'lucide-react';

const ICON_OPTIONS = [
  'Terminal', 'PenTool', 'Book', 'Heart', 'Globe', 'Settings', 'ImageIcon', 'Briefcase', 'Coffee', 'Monitor', 'Cpu', 'Database'
];

export function Sidebar() {
  const { data, isEditMode, setActiveCategory, addCategory, deleteCategory, updateCategory } = useVault();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Folder');

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

  const renderIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Folder;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className={`w-full md:w-64 border-r border-violet-200 h-auto md:h-full flex flex-col transition-all duration-300 ${isEditMode ? 'border-primary/50 shadow-[0_0_15px_rgba(124,58,237,0.15)]' : ''}`} style={{background: '#f9f9ff'}}>
      <div className="p-6">
        <h2 className="text-xl font-[300] tracking-wider text-primary flex items-center gap-2">
          <Icons.Hexagon className="w-6 h-6 stroke-[1.5px]" />
          VAULT
        </h2>
        {isEditMode && (
          <div className="mt-2 text-[10px] font-mono tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-sm inline-block border border-primary/20">
            SYSTEM.EDIT_MODE_ACTIVE
          </div>
        )}
      </div>

      <div className="flex-none md:flex-1 overflow-x-auto md:overflow-y-auto vault-scrollbar px-4 pb-4 flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-2">
        {data.categories.map((cat) => (
          <div key={cat.id} className="flex-shrink-0 md:flex-shrink">
            {editingId === cat.id ? (
              <div className="glass-panel p-3 rounded-md border border-primary/30 md:mb-2 space-y-3 min-w-[200px]">
                <input
                  type="text"
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
                  <button onClick={() => setEditingId(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  <button onClick={() => handleUpdate(cat.id)} className="text-xs text-primary font-medium hover:text-primary/80">Save</button>
                </div>
              </div>
            ) : (
              <div 
                className={`group flex items-center justify-between p-3 rounded-md cursor-pointer transition-all ${data.activeCategory === cat.id ? 'glass-panel glow-accent-subtle border border-primary/40 text-primary' : 'text-muted-foreground hover:bg-white/50 hover:text-foreground border border-transparent'}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`${data.activeCategory === cat.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors flex-shrink-0`}>
                    {renderIcon(cat.icon)}
                  </span>
                  <span className="font-medium text-sm truncate">{cat.name}</span>
                </div>
                <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full font-mono ${data.activeCategory === cat.id ? 'bg-primary/20 text-primary' : 'bg-black/5 text-muted-foreground'}`}>
                  {cat.links.length}
                </span>
                
                {isEditMode && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEdit(cat); }}
                      className="p-1.5 text-muted-foreground hover:text-primary rounded-md"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {data.categories.length > 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
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
        ))}

        {isEditMode && !isAdding && (
          <button 
            onClick={() => {
              setIsAdding(true);
              setNewName('');
              setNewIcon('Folder');
            }}
            className="w-full mt-4 flex items-center gap-2 p-3 text-sm text-muted-foreground hover:text-primary border border-dashed border-primary/30 hover:border-primary/60 hover:glow-accent-subtle rounded-md transition-all glass-panel"
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
    </div>
  );
}
