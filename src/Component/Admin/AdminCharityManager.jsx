import React, { useState, useEffect } from 'react';
import { HeartHandshake, RefreshCw, Trash2, Plus, Globe, Image as ImageIcon } from 'lucide-react';
import authService from '../../lib/supabase';

export default function AdminCharityManager() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const data = await authService.getCharities();
      setCharities(data || []);
    } catch (error) {
      console.error('Error fetching charities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCharity = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSaving(true);
    try {
      await authService.addCharity({
        name: name.trim(),
        description: description.trim()
      });
      setName('');
      setDescription('');
      fetchCharities();
    } catch (error) {
      console.error('Error adding charity:', error);
      alert('Failed to add charity. Check console.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCharity = async (id) => {
    if (!window.confirm('Are you sure you want to remove this charity?')) return;
    
    try {
      await authService.deleteCharity(id);
      fetchCharities();
    } catch (error) {
      console.error('Error deleting charity:', error);
      alert('Failed to delete charity.');
    }
  };

  return (
    <div className="bg-sand/10 rounded-2xl border border-olive/10 p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif italic font-bold text-golf flex items-center gap-3">
          <HeartHandshake className="h-6 w-6 text-olive/60" />
          Charity Management
        </h2>
        <button onClick={fetchCharities} className="text-olive/40 hover:text-olive transition">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Add Charity Form */}
      <form onSubmit={handleAddCharity} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-ivory/50 p-6 rounded-xl border border-olive/5">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 italic">Charity Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Water.org"
            className="w-full px-4 py-2 bg-ivory border border-olive/10 rounded-lg text-[11px] font-bold outline-none focus:border-olive transition-all"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={saving || !name.trim()}
          className="bg-olive text-white px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-olive/90 transition shadow-lg shadow-olive/10 disabled:opacity-20 flex items-center justify-center gap-2 h-[38px]"
        >
          {saving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Add Charity
        </button>
        <div className="md:col-span-3 space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 italic">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe their mission..."
            className="w-full px-4 py-2 bg-ivory border border-olive/10 rounded-lg text-[11px] font-bold outline-none focus:border-olive transition-all h-20 resize-none"
          />
        </div>
      </form>

      {/* Charities List */}
      <div className="overflow-hidden bg-ivory/30 rounded-xl border border-olive/5">
        <table className="w-full text-left">
          <thead className="bg-olive/[0.02] text-[9px] uppercase tracking-[0.2em] font-black text-olive italic">
            <tr>
              <th className="px-6 py-4">Cause</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-olive/5">
            {loading ? (
              <tr><td colSpan="3" className="px-6 py-10 text-center text-[10px] opacity-40">Loading causes...</td></tr>
            ) : charities.length === 0 ? (
              <tr><td colSpan="3" className="px-6 py-10 text-center text-[10px] opacity-40">No charities added yet.</td></tr>
            ) : (
              charities.map((c) => (
                <tr key={c.id} className="group hover:bg-olive/[0.01] transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ivory border border-olive/10 flex items-center justify-center p-1 flex-shrink-0">
                        <HeartHandshake className="w-5 h-5 text-olive/40" />
                      </div>
                      <span className="text-[11px] font-bold text-golf italic">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] opacity-40 line-clamp-1 max-w-xs">{c.description || 'No description provided.'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteCharity(c.id)}
                      className="text-red-900/20 hover:text-red-600 transition p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
