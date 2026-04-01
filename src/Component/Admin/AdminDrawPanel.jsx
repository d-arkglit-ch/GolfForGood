import React from 'react';
import { Trophy, RefreshCw, Lock, Sparkles, CheckCircle, LandPlot } from 'lucide-react';

export default function AdminDrawPanel({ 
  currentMonthName, 
  handleRunDraw, 
  isDrawing, 
  drawAlreadyExists, 
  drawNumbers 
}) {
  return (
    <div className="bg-sand/10 rounded-2xl border border-olive/10 p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-serif italic font-bold text-golf flex items-center gap-3">
            <Trophy className="h-6 w-6 text-olive/60" />
            The Monthly Draw
          </h2>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1 italic">{currentMonthName}</p>
        </div>
        <button
          onClick={handleRunDraw}
          disabled={isDrawing || drawAlreadyExists}
          className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition flex items-center gap-2 disabled:opacity-50 ${
            drawAlreadyExists
              ? 'bg-olive text-white cursor-not-allowed opacity-20'
              : 'bg-olive hover:bg-olive/90 text-white shadow-xl shadow-olive/20'
          }`}
        >
          {isDrawing ? <RefreshCw className="h-3 w-3 animate-spin" /> : drawAlreadyExists ? <Lock className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
          {drawAlreadyExists ? 'Drawn' : isDrawing ? 'Rolling...' : 'Ignite Draw'}
        </button>
      </div>

      <div className="bg-sand/5 rounded-2xl border border-olive/5 p-10 flex flex-col items-center justify-center min-h-[180px] transition-all">
        {drawNumbers ? (
          <div className="text-center animate-fade-in-up">
            <p className="text-[10px] text-olive/40 mb-6 font-bold uppercase tracking-[0.3em] font-display">Authenticated Sequence</p>
            <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
              {drawNumbers.map((num, i) => (
                <div
                  key={i}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-ivory text-olive border border-olive/20 flex items-center justify-center text-xl sm:text-2xl font-serif italic font-black shadow-2xl shadow-olive/5 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {num}
                </div>
              ))}
            </div>
            {drawAlreadyExists && (
              <p className="text-[10px] text-olive font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2 opacity-40">
                <CheckCircle className="h-3 w-3" />
                Legacy Locked
              </p>
            )}
          </div>
        ) : (
          <div className="text-center opacity-30">
            <LandPlot className="h-10 w-10 mx-auto mb-4 stroke-[1px]" />
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold">Awaiting Selection</p>
          </div>
        )}
      </div>
    </div>
  );
}
