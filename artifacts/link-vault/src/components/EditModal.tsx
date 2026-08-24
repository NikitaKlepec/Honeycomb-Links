import React, { useState, useEffect, useRef } from 'react';
import { X, Globe, Upload, Image as ImageIcon } from 'lucide-react';
import { Link } from '../store/useLinkVault';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Link>) => void;
  initialData: Link | null;
}

const COLORS = [
  '#164f9e', // Blue
  '#f36f21', // Orange
  '#171717', // Black
  '#777777', // Gray
  '#8aa9d1', // Soft blue
  '#f7a875', // Soft orange
  '#ffffff', // White
];

export function EditModal({ isOpen, onClose, onSave, initialData }: EditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    imageUrl: '',
    imagePosition: { x: 50, y: 50 },
    titleColor: '#171717',
    descriptionColor: '#777777',
    color: '#164f9e',
  });
  const [uploadError, setUploadError] = useState('');
  const [isPositioning, setIsPositioning] = useState(false);
  const dragState = useRef<{ clientX: number; clientY: number; x: number; y: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUploadError('');
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          url: initialData.url || '',
          description: initialData.description || '',
          imageUrl: initialData.imageUrl || '',
          imagePosition: initialData.imagePosition || { x: 50, y: 50 },
          titleColor: initialData.titleColor || '#171717',
          descriptionColor: initialData.descriptionColor || '#777777',
           color: initialData.color || '#164f9e',
        });
      } else {
        setFormData({
          title: '',
          url: '',
          description: '',
          imageUrl: '',
          imagePosition: { x: 50, y: 50 },
          titleColor: '#171717',
          descriptionColor: '#777777',
           color: '#164f9e',
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file.');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Image must be smaller than 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string, imagePosition: { x: 50, y: 50 } }));
        setUploadError('');
      }
    };
    reader.onerror = () => setUploadError('Could not read this image.');
    reader.readAsDataURL(file);
  };

  const handlePreviewPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!formData.imageUrl) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      x: formData.imagePosition.x,
      y: formData.imagePosition.y,
    };
    setIsPositioning(true);
  };

  const handlePreviewPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nextX = Math.max(0, Math.min(100, dragState.current.x + ((e.clientX - dragState.current.clientX) / rect.width) * 100));
    const nextY = Math.max(0, Math.min(100, dragState.current.y + ((e.clientY - dragState.current.clientY) / rect.height) * 100));
    setFormData(prev => ({ ...prev, imagePosition: { x: nextX, y: nextY } }));
  };

  const handlePreviewPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragState.current = null;
    setIsPositioning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-white/20 p-4 backdrop-blur-sm md:items-center">
      <div 
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-lg glass-panel-strong neo-shadow animate-in fade-in zoom-in-95 duration-200"
         style={{ boxShadow: `0 0 24px ${formData.color}18, inset 0 0 0 1px ${formData.color}35, 6px 6px 16px rgba(23,23,23,0.08), -4px -4px 12px rgba(255,255,255,0.9)` }}
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

        <form onSubmit={handleSubmit} className="modal-scroll-left min-h-0 space-y-4 p-6">
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
           <div className="flex items-center justify-between gap-3 pt-1">
             <span className="text-[10px] text-muted-foreground">Title color</span>
             <div className="flex flex-wrap justify-end gap-2">
               {COLORS.map((c) => (
                 <button
                   key={`title-${c}`}
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, titleColor: c }))}
                   className="h-5 w-5 rounded-full border border-white/70 transition-transform hover:scale-110"
                   style={{
                     backgroundColor: c,
                     boxShadow: formData.titleColor === c ? `0 0 0 2px #f5f5f1, 0 0 0 3px #f36f21` : 'none',
                   }}
                   aria-label={`Title color: ${c}`}
                 />
               ))}
             </div>
           </div>
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
           <div className="flex items-center justify-between gap-3 pt-1">
             <span className="text-[10px] text-muted-foreground">Description color</span>
             <div className="flex flex-wrap justify-end gap-2">
               {COLORS.map((c) => (
                 <button
                   key={`description-${c}`}
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, descriptionColor: c }))}
                   className="h-5 w-5 rounded-full border border-white/70 transition-transform hover:scale-110"
                   style={{
                     backgroundColor: c,
                     boxShadow: formData.descriptionColor === c ? `0 0 0 2px #f5f5f1, 0 0 0 3px #f36f21` : 'none',
                   }}
                   aria-label={`Description color: ${c}`}
                 />
               ))}
             </div>
           </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Card Background</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-primary/30 px-3 py-2 text-xs font-medium text-primary transition-colors hover:border-orange-500 hover:text-orange-600">
                <Upload className="w-4 h-4" />
                Upload from computer
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
              {formData.imageUrl && (
                <div className="h-10 w-10 overflow-hidden rounded-md border border-primary/20 bg-white" aria-label="Selected image preview">
                  <img src={formData.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
            {uploadError && <p className="text-[10px] text-destructive">{uploadError}</p>}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
              <ImageIcon className="h-3 w-3" />
              Or paste an image URL below.
            </div>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-white/50 neo-shadow-inset rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all border-none"
            />
            <p className="text-[10px] text-muted-foreground/70">The uploaded image or URL overrides the auto-generated favicon.</p>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Background Preview</label>
            <div className="flex min-h-[174px] items-center justify-center rounded-md border border-border/70 bg-[#f5f5f1] p-3">
              <div
                className={`relative h-[150px] w-[173px] overflow-hidden hex-clip border-2 border-primary/30 bg-white shadow-sm ${formData.imageUrl ? (isPositioning ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                onPointerDown={handlePreviewPointerDown}
                onPointerMove={handlePreviewPointerMove}
                onPointerUp={handlePreviewPointerUp}
                onPointerCancel={handlePreviewPointerUp}
              >
                {formData.imageUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-100"
                    style={{
                      backgroundImage: `url(${formData.imageUrl})`,
                      backgroundPosition: `${formData.imagePosition.x}% ${formData.imagePosition.y}%`,
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                    No background selected
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-[11px] font-semibold" style={{ color: formData.titleColor }}>
                    {formData.title || 'Link title'}
                  </span>
                  <span className="mt-1 line-clamp-2 text-[9px] leading-tight" style={{ color: formData.descriptionColor }}>
                    {formData.description || 'Your description will appear here'}
                  </span>
                </div>
              </div>
            </div>
            {formData.imageUrl && (
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Drag the image to reposition it</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imagePosition: { x: 50, y: 50 } }))}
                  className="text-primary hover:text-orange-600 transition-colors"
                >
                  Center image
                </button>
              </div>
            )}
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
               className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-all glow-accent-subtle hover:glow-accent"
               style={{ backgroundColor: '#f36f21' }}
            >
              Save Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
