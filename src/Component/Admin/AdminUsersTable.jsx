import React from 'react';
import { RefreshCw, HeartHandshake } from 'lucide-react';

export default function AdminUsersTable({ users, loading, fetchAdminData, drawNumbers }) {
  return (
    <div className="bg-sand/10 rounded-2xl border border-olive/10 overflow-hidden shadow-2xl shadow-olive/5 mb-24">
      <div className="px-8 py-8 border-b border-olive/5 flex justify-between items-center bg-ivory">
        <h2 className="text-3xl font-serif italic font-bold text-golf">Patron Directory</h2>
        <button
           onClick={fetchAdminData}
           className="text-olive/40 hover:text-olive transition flex items-center gap-2 text-[10px] uppercase font-black tracking-widest"
        >
          <RefreshCw className="h-3 w-3" />
          Synchronize
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.3em] font-black text-olive italic">
            <tr>
              <th className="px-8 py-5 border-b border-olive/5 min-w-[200px]">Identity</th>
              <th className="px-8 py-5 border-b border-olive/5 min-w-[150px]">Standing</th>
              <th className="px-8 py-5 border-b border-olive/5 min-w-[150px]">Cause</th>
              <th className="px-8 py-5 border-b border-olive/5 min-w-[250px]">Recent Performance</th>
              <th className="px-8 py-5 border-b border-olive/5 min-w-[150px]">Sequence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-olive/5">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-8 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                   Synchronizing patron data...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-16 text-center text-gray-500">
                  No users found in the database.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-olive/[0.01] transition duration-500 group">
                  <td className="px-8 py-8">
                    <div className="text-lg font-serif italic font-bold text-golf leading-tight">{u.full_name || 'Anonymous Patron'}</div>
                    <div className="text-[9px] uppercase tracking-widest font-black opacity-20 mt-1">UID: {u.id.slice(0, 12)}</div>
                  </td>
                  <td className="px-8 py-8">
                    {u.subscription?.status === 'active' ? (
                      <span className="inline-flex items-center gap-2 bg-olive/[0.05] text-olive border border-olive/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                        <div className="w-1 h-1 rounded-full bg-olive animate-pulse" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 bg-sand/20 text-golf/30 border border-olive/5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                         Dormant
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-8">
                    {u.charity_id ? (
                        <div className="flex items-center gap-2 group/charity transition-all duration-300">
                            <div className="w-8 h-8 rounded-full bg-olive/5 border border-olive/10 flex items-center justify-center p-1.5 flex-shrink-0 group-hover/charity:border-olive/30 group-hover/charity:scale-110 transition-all duration-500">
                                <HeartHandshake className="h-4 w-4 text-olive/40" />
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 group-hover/charity:opacity-100 group-hover/charity:text-olive transition-all duration-300 italic">{u.charity?.name || 'Assigned'}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 opacity-10">
                            <HeartHandshake className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Unset</span>
                        </div>
                    )}
                  </td>
                  <td className="px-8 py-8">
                    {u.scores.length > 0 ? (
                      <div className="flex gap-2">
                        {u.scores.map((score, idx) => (
                          <span 
                            key={score.id}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-700 ${
                              idx === 0 
                              ? 'bg-olive text-white shadow-xl shadow-olive/20' 
                              : 'bg-ivory border border-olive/10 text-golf/50 group-hover:border-olive/30'
                            }`}
                            title={new Date(score.date_played).toLocaleDateString()}
                          >
                            {score.score}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-20 italic">No Recent Rounds</span>
                    )}
                  </td>
                  <td className="px-8 py-8">
                    {u.ticket ? (
                      <div className="flex gap-2">
                        {u.ticket.map((num, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              drawNumbers?.includes(num)
                                ? 'bg-olive text-white'
                                : 'bg-sand/30 text-golf/30 border border-olive/5'
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-10">Undetermined</span>
                    )}
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
