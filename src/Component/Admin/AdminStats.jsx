import React from 'react';
import { Users, Trophy } from 'lucide-react';

export default function AdminStats({ users, allTickets }) {
  const activeSubsCount = users.filter(u => u.subscription?.status === 'active').length;

  return (
    <div className="bg-sand/10 rounded-2xl border border-olive/10 p-8 flex flex-col justify-center">
      <h2 className="text-2xl font-serif italic font-bold text-golf mb-8 flex items-center gap-3">
        <Users className="h-6 w-6 text-olive/60" />
        Platform Statistics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-4 border border-olive/5 rounded-xl">
          <div className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Total Patrons</div>
          <div className="text-3xl sm:text-4xl font-display italic font-black text-golf">{users.length}</div>
        </div>
        <div className="p-4 border border-olive/5 rounded-xl">
          <div className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Active Subs</div>
          <div className="text-3xl sm:text-4xl font-display italic font-black text-olive">
            {activeSubsCount}
          </div>
        </div>
        <div className="p-4 border border-olive/5 rounded-xl">
          <div className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Monthly Entry</div>
          <div className="text-3xl sm:text-4xl font-display italic font-black text-golf">
            {allTickets.length}
          </div>
        </div>
      </div>
    </div>
  );
}
