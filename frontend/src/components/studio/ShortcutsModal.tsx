import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore } from '../../store/useStudioStore';
import { X } from '@phosphor-icons/react';

export const ShortcutsModal: React.FC = () => {
  const isShortcutsOpen = useStudioStore((s) => s.isShortcutsOpen);
  const setShortcutsOpen = useStudioStore((s) => s.setShortcutsOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShortcutsOpen(!isShortcutsOpen);
      } else if (e.key === 'Escape') {
        setShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortcutsOpen, setShortcutsOpen]);

  return (
    <AnimatePresence>
      {isShortcutsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          onClick={() => setShortcutsOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-white/12 rounded-2xl p-5 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-sm font-semibold text-white">Keyboard Shortcuts</span>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-150"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Left Click + Drag</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-white/15 rounded text-[11px] font-mono text-slate-200">
                  Drag / Throw Body
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Pause / Resume Physics</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-white/15 rounded text-[11px] font-mono text-slate-200">
                  Space
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Invert Gravity</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-white/15 rounded text-[11px] font-mono text-slate-200">
                  G
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Toggle Slow Motion</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-white/15 rounded text-[11px] font-mono text-slate-200">
                  S
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Open Command Shortcuts</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-white/15 rounded text-[11px] font-mono text-slate-200">
                  ⌘K
                </kbd>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
