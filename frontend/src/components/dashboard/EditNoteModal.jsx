import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';

const EditNoteModal = ({ note, onClose, onUpdate }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [description, setDescription] = useState(note?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim() || !description.trim()) {
      setError("Title and Description cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      await onUpdate(note._id, { title, description });
    } catch (err) {
      setError("Failed to update note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Close if clicking on the backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800">Edit Note</h3>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Modify your thoughts</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            aria-label="Close Modal"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Error Message Section */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-medium">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Title
            </label>
            <input 
              type="text"
              placeholder="Enter note title..."
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm placeholder:text-slate-300" 
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Description
            </label>
            <textarea 
              placeholder="What's on your mind?"
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              rows="5" 
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm placeholder:text-slate-300" 
              required
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
                loading 
                ? 'bg-indigo-400 cursor-not-allowed text-white' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18}/> 
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNoteModal;