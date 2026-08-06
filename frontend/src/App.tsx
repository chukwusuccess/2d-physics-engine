import React, { useRef } from 'react';
import { Header } from './components/studio/Header';
import { ControlSidebar } from './components/studio/ControlSidebar';
import { CanvasViewport, CanvasViewportHandle } from './components/studio/CanvasViewport';
import { ShortcutsModal } from './components/studio/ShortcutsModal';

export const App: React.FC = () => {
  const canvasViewportRef = useRef<CanvasViewportHandle>(null);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      <Header />
      <div className="flex-1 flex relative overflow-hidden">
        <ControlSidebar
          onAddCircle={() => canvasViewportRef.current?.addCircle()}
          onAddBox={() => canvasViewportRef.current?.addBox()}
          onAddStack={() => canvasViewportRef.current?.addStack()}
          onAddPyramid={() => canvasViewportRef.current?.addPyramid()}
          onPresetCradle={() => canvasViewportRef.current?.presetCradle()}
          onPresetRamp={() => canvasViewportRef.current?.presetRamp()}
          onClear={() => canvasViewportRef.current?.clear()}
        />
        <CanvasViewport ref={canvasViewportRef} />
      </div>
      <ShortcutsModal />
    </div>
  );
};

export default App;
