import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Plus, Trash2, Pin, Search, StickyNote, Loader2, Tag } from 'lucide-react';
import { authenticatedFetch } from '../../lib/api';

interface Note {
  id: string;
  content: string;
  tags?: string;
  updated_at?: string;
  pinned?: boolean;
}

const Notepad: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSave = async (noteToSave: Note) => {
    if (!noteToSave) return;
    setSaving(true);
    setStatus('Saving...');
    try {
      // Use PUT as requested by prompt for updates
      const res = await authenticatedFetch(`/api/notes/${encodeURIComponent(noteToSave.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: noteToSave.content, 
          tags: noteToSave.tags,
          pinned: noteToSave.pinned 
        })
      });

      if (res.ok) {
        setStatus(`Saved at ${new Date().toLocaleTimeString()}`);
        // Refresh list to get updated_at etc.
        const listRes = await authenticatedFetch('/api/notes');
        if (listRes.ok) {
            setNotes(await listRes.json());
        }
      } else {
        // Fallback to POST if PUT fails (matching vanilla behavior)
        const resPost = await authenticatedFetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteToSave)
        });
        if (resPost.ok) {
            setStatus(`Saved at ${new Date().toLocaleTimeString()}`);
            const listRes = await authenticatedFetch('/api/notes');
            if (listRes.ok) {
                setNotes(await listRes.json());
            }
        } else {
            setStatus('Save failed');
        }
      }
    } catch (err) {
      setStatus('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = (note: Note) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(note);
    }, 1500);
  };

  const handleCreate = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const newId = `Note-${timestamp}`;
    const newNote: Note = { id: newId, content: '', tags: '', pinned: false };
    
    setSaving(true);
    try {
      const res = await authenticatedFetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });
      if (res.ok) {
        await fetchNotes();
        setSelectedNote(newNote);
        setStatus('New note created');
      }
    } catch (err) {
      setStatus('Failed to create note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete note "${id}"?`)) return;
    try {
      const res = await authenticatedFetch(`/api/notes/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== id));
        if (selectedNote?.id === id) setSelectedNote(null);
        setStatus('Note deleted');
      }
    } catch (err) {
      setStatus('Delete failed');
    }
  };

  const handleNoteChange = (updates: Partial<Note>) => {
    if (!selectedNote) return;
    const updatedNote = { ...selectedNote, ...updates };
    setSelectedNote(updatedNote);
    debouncedSave(updatedNote);
  };

  const parseTags = (tagsStr: string) => {
    return tagsStr.split(/[\s,]+/).map(t => t.trim().replace(/^#+/, '')).filter(Boolean);
  };

  const allTags = Array.from(new Set(
    notes.flatMap(n => parseTags(n.tags || ''))
  ));

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const tags = parseTags(n.tags || '');
    const matchesTag = !activeTag || tags.includes(activeTag);
    return matchesSearch && matchesTag;
  }).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
  });

  return (
    <div className="glass rounded-3xl w-full max-w-6xl mx-auto overflow-hidden flex flex-col h-[700px] border border-white/10 shadow-2xl">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-white/10 flex flex-col bg-slate-900/40">
          <div className="p-4 border-b border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <StickyNote className="w-6 h-6 text-nexus-accent" />
                <span className="glow-text">Notepad</span>
              </h2>
              <button 
                onClick={handleCreate}
                className="p-2 bg-nexus-accent/10 hover:bg-nexus-accent/20 text-nexus-accent rounded-xl transition-all hover:scale-105 active:scale-95"
                title="New Note"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search notes..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`text-[10px] px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${activeTag === tag ? 'bg-nexus-accent text-slate-900 font-bold' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                  >
                    <Tag className="w-2.5 h-2.5" /> {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading && notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <span className="text-sm">Loading notes...</span>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm italic">
                No notes found
              </div>
            ) : (
              filteredNotes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 group ${selectedNote?.id === note.id ? 'bg-nexus-accent/10 border-r-2 border-r-nexus-accent' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className={`font-medium text-sm truncate ${selectedNote?.id === note.id ? 'text-nexus-accent' : 'text-slate-200 group-hover:text-white'}`}>
                      {note.id}
                    </span>
                    {note.pinned && <Pin className="w-3 h-3 text-nexus-accent fill-nexus-accent shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {(note.content || '').replace(/<[^>]*>/g, '') || 'Empty note'}
                  </p>
                  {note.updated_at && (
                    <div className="text-[10px] text-slate-600 mt-2 flex justify-between items-center">
                      <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                      {note.tags && <span className="text-nexus-accent/50">#{parseTags(note.tags)[0]}</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col bg-slate-950/40">
          {selectedNote ? (
            <>
              <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4 bg-slate-900/20">
                <div className="flex-1 flex items-center gap-3">
                   <div className="flex flex-col flex-1">
                      <input 
                        className="bg-transparent font-bold text-lg focus:outline-none text-slate-100 w-full placeholder:text-slate-700" 
                        value={selectedNote.id}
                        readOnly // In vanilla, ID is often treated as the unique key; renaming might need a separate logic
                        placeholder="Note Title"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <Tag className="w-3 h-3 text-slate-500" />
                        <input 
                          className="bg-transparent text-xs text-slate-500 focus:outline-none w-full placeholder:text-slate-700" 
                          value={selectedNote.tags || ''}
                          onChange={e => handleNoteChange({ tags: e.target.value })}
                          placeholder="tags (comma or space separated)"
                        />
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 mr-2 italic">{status}</span>
                  <button 
                    onClick={() => handleNoteChange({ pinned: !selectedNote.pinned })}
                    className={`p-2 rounded-xl transition-all hover:scale-105 active:scale-95 ${selectedNote.pinned ? 'bg-nexus-accent text-slate-900 font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                    title={selectedNote.pinned ? "Unpin" : "Pin"}
                  >
                    <Pin className={`w-5 h-5 ${selectedNote.pinned ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={() => handleSave(selectedNote)}
                    disabled={saving}
                    className="p-2 bg-nexus-accent/20 text-nexus-accent hover:bg-nexus-accent/30 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 border border-nexus-accent/20"
                    title="Save Now"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedNote.id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all hover:scale-105 active:scale-95 border border-red-500/10"
                    title="Delete Note"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <textarea 
                className="flex-1 bg-transparent p-8 resize-none focus:outline-none font-mono text-sm leading-relaxed text-slate-300 custom-scrollbar placeholder:text-slate-800"
                placeholder="Start writing your note..."
                value={selectedNote.content}
                onChange={e => handleNoteChange({ content: e.target.value })}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-6">
              <div className="w-24 h-24 bg-nexus-accent/5 rounded-full flex items-center justify-center border border-nexus-accent/10 shadow-inner">
                <StickyNote className="w-12 h-12 opacity-20 text-nexus-accent" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-400">Your Personal Space</h3>
                <p className="text-sm opacity-50 max-w-xs">Capture ideas, snippets, and thoughts. Your notes are securely synced across your devices.</p>
              </div>
              <button 
                onClick={handleCreate}
                className="px-8 py-3 bg-nexus-accent text-slate-900 rounded-2xl font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-95"
              >
                Create First Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notepad;
