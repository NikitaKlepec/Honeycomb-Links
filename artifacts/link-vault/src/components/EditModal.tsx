import React, { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import { Link } from '../store/useLinkVault';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Link>) => void;
  initialData: Link | null;
}

const COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#64748b', // Slate
  '#ffffff', // White
];

export function EditModal({ isOpen, onClose, onSave, initialData }: EditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    imageUrl: '',
    color: '#7c3aed',
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          url: initialData.url || '',
          description: initialData.description || '',
          imageUrl: initialData.imageUrl || '',
          color: initialData.color || '#7c3aed',
        });
      } else {
        setFormData({
          title: '',
          url: '',
          description: '',
          imageUrl: '',
          color: '#7c3aed',
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleUrlBlur = () => {
    // Basic auto-fill title if empty
    if (formData.url && !formData.title) {
      try {
        const urlObj = new URL(formData.url.startsWith('http') ? formData.url : `https://${formData.url}`);
        setFormData(prev => ({ ...prev, title: urlObj.hostname.replace('www.', '') }));
      } catch (e) {
        // invalid url, ignore
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md glass-panel-strong neo-shadow rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: `0 0 30px ${formData.color}20, inset 0 0 0 1px ${formData.color}40, 6px 6px 16px rgba(124,58,237,0.08), -4px -4px 12px rgba(255,255,255,0.9)` }}
      >
        <div className="px-6 py-4 border-b border-white/60 flex items-center justify-between">
          <h2 className="text-lg font-[300] tracking-wide text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5" style={{ color: formData.color }} />
            {initialData ? 'Edit Link' : 'Add Link'}
          </h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">URL *</label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              onBlur={handleUrlBlur}
              placeholder="https://example.com"
              className="w-full bg-white/50 neo-shadow-inset rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all border-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="My Awesome Site"
              className="w-full bg-white/50 neo-shadow-inset rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all border-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief description of this link..."
              rows={3}
              className="w-full bg-white/50 neo-shadow-inset rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none border-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Custom Image URL (optional)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-white/50 neo-shadow-inset rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all border-none"
            />
            <p className="text-[10px] text-muted-foreground/70">Overrides the auto-generated favicon background.</p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Accent Color</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className="w-6 h-6 rounded-full border border-white/50 transition-transform hover:scale-110"
                  style={{ 
                    backgroundColor: c,
                    boxShadow: formData.color === c ? `0 0 12px ${c}80, inset 0 0 0 2px white` : 'none'
                  }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-all glow-accent-subtle hover:glow-accent"
              style={{ backgroundColor: formData.color }}
            >
              Save Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
