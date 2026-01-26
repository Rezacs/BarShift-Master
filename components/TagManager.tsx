
import React, { useState } from 'react';
import { Tag } from '../types';
import { WORKER_COLORS } from '../constants';

interface TagManagerProps {
  tags: Tag[];
  onAddTag: (tag: Tag) => void;
  onUpdateTag: (tag: Tag) => void;
  onRemoveTag: (id: string) => void;
}

const TagManager: React.FC<TagManagerProps> = ({ tags, onAddTag, onUpdateTag, onRemoveTag }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(WORKER_COLORS[0]);

  const resetForm = () => {
    setName('');
    setSelectedColor(WORKER_COLORS[0]);
    setEditingTagId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const tagData: Tag = {
      id: editingTagId || crypto.randomUUID(),
      name,
      color: selectedColor
    };

    if (editingTagId) {
      onUpdateTag(tagData);
    } else {
      onAddTag(tagData);
    }
    resetForm();
  };

  const handleEdit = (tag: Tag) => {
    setName(tag.name);
    setSelectedColor(tag.color);
    setEditingTagId(tag.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff Roles & Skills</h2>
          <p className="text-slate-500 text-sm">Define specialized tags to categorize your team members.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
          <span>{showForm ? 'Cancel' : 'Create Role'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mixologist, Security, Shift Lead"
                className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white text-slate-900 transition-all font-bold"
                required
              />
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label Color</label>
              <div className="flex flex-wrap gap-2">
                {WORKER_COLORS.slice(0, 10).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-xl border-4 transition-all hover:scale-110 ${selectedColor === color ? 'border-slate-900 scale-105 shadow-md' : 'border-transparent opacity-60'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-50 pt-8">
            <button type="button" onClick={resetForm} className="px-6 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Discard</button>
            <button type="submit" className="bg-amber-500 text-slate-900 px-8 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-amber-400 shadow-lg shadow-amber-500/20">
              {editingTagId ? 'Update Role' : 'Save New Role'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tags.map(tag => (
          <div key={tag.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: tag.color }}></div>
              <span className="font-black text-slate-800 uppercase text-[11px] tracking-widest">{tag.name}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => handleEdit(tag)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all flex items-center justify-center">
                <i className="fas fa-edit text-[10px]"></i>
              </button>
              <button onClick={() => onRemoveTag(tag.id)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                <i className="fas fa-trash-alt text-[10px]"></i>
              </button>
            </div>
          </div>
        ))}
        {tags.length === 0 && !showForm && (
          <div className="col-span-full py-16 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-tags text-2xl text-slate-200"></i>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No roles defined yet</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-amber-600 text-[10px] font-black uppercase tracking-widest hover:text-amber-700">Add first role</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagManager;
