import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Circle, Square, Stack, Triangle, Trash, Wrench, Gear, Eye } from '@phosphor-icons/react';

interface ControlSidebarProps {
  onAddCircle: () => void;
  onAddBox: () => void;
  onAddStack: () => void;
  onAddPyramid: () => void;
  onPresetCradle: () => void;
  onPresetRamp: () => void;
  onClear: () => void;
}

export const ControlSidebar: React.FC<ControlSidebarProps> = ({
  onAddCircle,
  onAddBox,
  onAddStack,
  onAddPyramid,
  onPresetCradle,
  onPresetRamp,
  onClear,
}) => {
  const {
    activeTab,
    setActiveTab,
    gravityY,
    setGravityY,
    restitution,
    setRestitution,
    friction,
    setFriction,
    iterations,
    setIterations,
    showContacts,
    setShowContacts,
    showNormals,
    setShowNormals,
    showVelocities,
    setShowVelocities,
    showTrails,
    setShowTrails,
    theme,
    setTheme,
  } = useStudioStore();

  return (
    <aside className="w-80 bg-slate-900/80 backdrop-blur-md border-r border-white/10 flex flex-col z-10 select-none">
      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 bg-slate-950/40">
        <button
          onClick={() => setActiveTab('spawn')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all duration-150 ${
            activeTab === 'spawn'
              ? 'text-sky-400 border-sky-400 bg-sky-400/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Wrench size={14} />
          <span>Spawn</span>
        </button>
        <button
          onClick={() => setActiveTab('physics')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all duration-150 ${
            activeTab === 'physics'
              ? 'text-sky-400 border-sky-400 bg-sky-400/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Gear size={14} />
          <span>Physics</span>
        </button>
        <button
          onClick={() => setActiveTab('render')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all duration-150 ${
            activeTab === 'render'
              ? 'text-sky-400 border-sky-400 bg-sky-400/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Eye size={14} />
          <span>Visuals</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-5">
        {activeTab === 'spawn' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Add Rigid Bodies
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onAddCircle}
                className="p-2.5 text-xs font-medium rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 border border-blue-400 text-white shadow-md hover:from-blue-700 hover:to-blue-600 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5"
              >
                <Circle size={16} weight="bold" />
                <span>Circle</span>
              </button>
              <button
                onClick={onAddBox}
                className="p-2.5 text-xs font-medium rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 border border-blue-400 text-white shadow-md hover:from-blue-700 hover:to-blue-600 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5"
              >
                <Square size={16} weight="bold" />
                <span>Box</span>
              </button>
              <button
                onClick={onAddStack}
                className="p-2.5 text-xs font-medium rounded-lg bg-slate-800/80 border border-white/10 text-slate-200 hover:bg-slate-700/80 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5"
              >
                <Stack size={16} />
                <span>Box Stack</span>
              </button>
              <button
                onClick={onAddPyramid}
                className="p-2.5 text-xs font-medium rounded-lg bg-slate-800/80 border border-white/10 text-slate-200 hover:bg-slate-700/80 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5"
              >
                <Triangle size={16} />
                <span>Pyramid</span>
              </button>
            </div>

            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-2">
              Preset Scenes
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onPresetCradle}
                className="p-2.5 text-xs font-medium rounded-lg bg-slate-800/80 border border-white/10 text-slate-200 hover:bg-slate-700/80 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1"
              >
                <span>🎾 Cradle</span>
              </button>
              <button
                onClick={onPresetRamp}
                className="p-2.5 text-xs font-medium rounded-lg bg-slate-800/80 border border-white/10 text-slate-200 hover:bg-slate-700/80 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1"
              >
                <span>📐 Ramp</span>
              </button>
            </div>

            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-2">
              Actions
            </span>
            <button
              onClick={onClear}
              className="p-2.5 text-xs font-medium rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5"
            >
              <Trash size={16} />
              <span>Clear All Bodies</span>
            </button>
          </div>
        )}

        {activeTab === 'physics' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Gravity Y</span>
                <span className="font-mono text-sky-400">{gravityY.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-1000"
                max="1500"
                step="10"
                value={gravityY}
                onChange={(e) => setGravityY(parseFloat(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Restitution (Bounciness)</span>
                <span className="font-mono text-sky-400">{restitution.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={restitution}
                onChange={(e) => setRestitution(parseFloat(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Friction</span>
                <span className="font-mono text-sky-400">{friction.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={friction}
                onChange={(e) => setFriction(parseFloat(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Solver Iterations</span>
                <span className="font-mono text-sky-400">{iterations}</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'render' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Debug Overlays
            </span>

            <div className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-lg border border-white/5 text-xs text-slate-200">
              <span>Contact Points</span>
              <input
                type="checkbox"
                checked={showContacts}
                onChange={(e) => setShowContacts(e.target.checked)}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-lg border border-white/5 text-xs text-slate-200">
              <span>Collision Normals</span>
              <input
                type="checkbox"
                checked={showNormals}
                onChange={(e) => setShowNormals(e.target.checked)}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-lg border border-white/5 text-xs text-slate-200">
              <span>Velocity Vectors</span>
              <input
                type="checkbox"
                checked={showVelocities}
                onChange={(e) => setShowVelocities(e.target.checked)}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-lg border border-white/5 text-xs text-slate-200">
              <span>Motion Trails</span>
              <input
                type="checkbox"
                checked={showTrails}
                onChange={(e) => setShowTrails(e.target.checked)}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
            </div>

            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-2">
              Render Theme
            </span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="w-full p-2.5 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="neon">Neon Electric</option>
              <option value="cyan">Cyan Tech</option>
              <option value="monochrome">Monochrome Slate</option>
            </select>
          </div>
        )}
      </div>
    </aside>
  );
};
