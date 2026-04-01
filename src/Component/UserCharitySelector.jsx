import React, { useState, useEffect } from 'react';
import { HeartHandshake, Check, RefreshCw, ChevronRight } from 'lucide-react';
import authService from '../lib/supabase';
import { useAuth } from './context/AuthContext';

export default function UserCharitySelector() {
  const { user, profile } = useAuth();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selectedId, setSelectedId] = useState(profile?.charity_id || null);

  useEffect(() => {
    fetchCharities();
  }, []);

  useEffect(() => {
    setSelectedId(profile?.charity_id);
  }, [profile]);

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

  const handleSelect = async (charityId) => {
    if (!user) return;
    setUpdating(charityId);
    try {
      await authService.updateUserCharity(user.id, charityId);
      setSelectedId(charityId);
      // In a real app, we'd trigger a profile refresh in the AuthContext here
      window.location.reload(); // Hard refresh to update globally for now
    } catch (error) {
      console.error('Error updating charity:', error);
      alert('Failed to update your selection.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse">
        <HeartHandshake className="h-8 w-8 mx-auto mb-4 text-olive/20" />
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-20">Discovering Causes...</p>
      </div>
    );
  }

  return (
    <div className="bg-sand/10 rounded-2xl border border-olive/10 p-8 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-serif italic font-bold text-golf flex items-center gap-3">
          <HeartHandshake className="h-6 w-6 text-olive/60" />
          Choose Your Cause
        </h2>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1 italic">
          Your loyalty fuels their mission. Select a beneficiary for your patronage.
        </p>
      </div>

      <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {charities.length === 0 ? (
          <div className="text-center py-10 opacity-30">
             <p className="text-[11px] uppercase tracking-widest font-bold">No causes registered yet.</p>
          </div>
        ) : (
          charities.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              disabled={updating !== null}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-500 group flex items-start gap-4 ${
                selectedId === c.id
                  ? 'bg-olive text-white border-olive shadow-xl shadow-olive/20'
                  : 'bg-ivory border-olive/5 hover:border-olive/30 hover:bg-olive/[0.02]'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center p-2 flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${
                selectedId === c.id ? 'bg-white/20' : 'bg-olive/5 border border-olive/10'
              }`}>
                <HeartHandshake className={`w-6 h-6 ${selectedId === c.id ? 'text-white' : 'text-olive/40'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-serif italic font-bold text-lg leading-tight truncate">{c.name}</h3>
                  {selectedId === c.id ? (
                     <Check className="h-4 w-4" />
                  ) : updating === c.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                  )}
                </div>
                <p className={`text-[10px] leading-relaxed line-clamp-2 ${selectedId === c.id ? 'text-white/70' : 'opacity-40'}`}>
                   {c.description || "Dedicated to making a difference in the community."}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {selectedId && (
          <p className="mt-8 text-[9px] uppercase tracking-[0.2em] font-black opacity-20 text-center italic">
              Legacy Contribution: 10% of monthly membership
          </p>
      )}
    </div>
  );
}
