import React from 'react';
import { Header } from './components/studio/Header';
import { ControlSidebar } from './components/studio/ControlSidebar';
import { CanvasViewport } from './components/studio/CanvasViewport';
import { ShortcutsModal } from './components/studio/ShortcutsModal';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      <Header />
      <div className="flex-1 flex relative overflow-hidden">
        <ControlSidebar
          onAddCircle={() => {}}
          onAddBox={() => {}}
          onAddStack={() => {}}
          onAddPyramid={() => {}}
          onPresetCradle={() => {}}
          onPresetRamp={() => {}}
          onClear={() => {}}
        />
        <CanvasViewport />
      </div>
      <ShortcutsModal />
    </div>
  );
};

export default App;
