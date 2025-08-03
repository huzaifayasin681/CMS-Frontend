'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore - temporary fix for react-dnd type issue
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Eye, 
  Save, 
  Undo, 
  Redo, 
  Settings,
  Layers,
  Plus,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VisualBuilderProvider, useVisualBuilder } from '@/contexts/VisualBuilderContext';
import { BuilderCanvas } from './BuilderCanvas';
import { ComponentLibrary } from './ComponentLibrary';
import { PropertiesPanel } from './PropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { DeviceType } from '@/types/visual-builder';

interface VisualBuilderProps {
  initialData?: any;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

function VisualBuilderContent({ initialData, onSave, onCancel }: VisualBuilderProps) {
  const { state, actions } = useVisualBuilder();
  const [leftPanel, setLeftPanel] = useState<'components' | 'layers'>('components');
  const [rightPanel, setRightPanel] = useState<'properties' | 'settings'>('properties');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      actions.loadBuilderData(initialData);
    }
  }, [initialData, actions]);

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      const data = actions.exportBuilderData();
      await onSave(data);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deviceIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  const deviceSizes = {
    desktop: { width: '100%', maxWidth: '1200px' },
    tablet: { width: '768px', maxWidth: '768px' },
    mobile: { width: '375px', maxWidth: '375px' },
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--background)]">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--surface)]">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Undo}
            onClick={actions.undo}
            disabled={state.undoStack.length === 0}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Redo}
            onClick={actions.redo}
            disabled={state.redoStack.length === 0}
          />
          <div className="w-px h-6 bg-[var(--border)] mx-2" />
          <Button
            variant={leftPanel === 'components' ? 'primary' : 'ghost'}
            size="sm"
            icon={Plus}
            onClick={() => setLeftPanel('components')}
          >
            Components
          </Button>
          <Button
            variant={leftPanel === 'layers' ? 'primary' : 'ghost'}
            size="sm"
            icon={Layers}
            onClick={() => setLeftPanel('layers')}
          >
            Layers
          </Button>
        </div>

        {/* Center - Device Toggles */}
        <div className="flex items-center gap-1 bg-[var(--background)] rounded-lg p-1 border border-[var(--border)]">
          {(Object.keys(deviceIcons) as DeviceType[]).map((device) => {
            const Icon = deviceIcons[device];
            return (
              <Button
                key={device}
                variant={state.device === device ? 'primary' : 'ghost'}
                size="sm"
                icon={Icon}
                onClick={() => actions.setDevice(device)}
                className="capitalize"
              >
                {device}
              </Button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={state.isPreviewMode ? 'primary' : 'ghost'}
            size="sm"
            icon={Eye}
            onClick={() => actions.setPreviewMode(!state.isPreviewMode)}
          >
            Preview
          </Button>
          <div className="w-px h-6 bg-[var(--border)] mx-2" />
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            loading={isSaving}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <AnimatePresence mode="wait">
          {!state.isPreviewMode && (
            <motion.div
              key="left-panel"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-80 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col"
            >
              <div className="p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  {leftPanel === 'components' ? (
                    <>
                      <Plus className="w-4 h-4" />
                      <span className="font-medium">Components</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span className="font-medium">Layers</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {leftPanel === 'components' ? (
                  <ComponentLibrary />
                ) : (
                  <LayersPanel />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col bg-[var(--background)] overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <div className="flex justify-center">
              <div 
                className="transition-all duration-300 bg-white shadow-lg"
                style={{
                  ...deviceSizes[state.device],
                  minHeight: '600px',
                  margin: '0 auto',
                }}
              >
                <BuilderCanvas />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <AnimatePresence mode="wait">
          {!state.isPreviewMode && state.selectedBlockId && (
            <motion.div
              key="right-panel"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 border-l border-[var(--border)] bg-[var(--surface)] flex flex-col"
            >
              <div className="p-4 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Properties</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => actions.selectBlock(null)}
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <PropertiesPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function VisualBuilder(props: VisualBuilderProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <VisualBuilderProvider>
        <VisualBuilderContent {...props} />
      </VisualBuilderProvider>
    </DndProvider>
  );
}