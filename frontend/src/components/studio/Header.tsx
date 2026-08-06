import React from 'react';
import { Atom, GithubLogo, Command } from '@phosphor-icons/react';
import { useStudioStore } from '../../store/useStudioStore';

export const Header: React.FC = () => {
  const setShortcutsOpen = useStudioStore((s) => s.setShortcutsOpen);

  return (
    <header className="h-14 bg-slate-900/85 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-5 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_14px_rgba(59,130,246,0.4)] transition-transform duration-200 hover:scale-105 hover:rotate-3">
          <Atom size={20} className="text-white weight-bold" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-white">PhysX 2D Studio</span>
          <span className="text-[10px] font-mono bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
            v1.0.0
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setShortcutsOpen(true)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 border border-white/10 hover:bg-slate-700/80 active:scale-95 transition-all duration-150 flex items-center gap-1.5 text-slate-200"
        >
          <Command size={14} />
          <span>Shortcuts</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          <span>60 FPS</span>
        </div>

        <a
          href="https://github.com/chukwusuccess/2d-physics-engine"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 border border-white/10 hover:bg-slate-700/80 active:scale-95 transition-all duration-150 flex items-center gap-1.5 text-slate-200"
        >
          <GithubLogo size={14} />
          <span>GitHub</span>
        </a>
      </div>
    </header>
  );
};
