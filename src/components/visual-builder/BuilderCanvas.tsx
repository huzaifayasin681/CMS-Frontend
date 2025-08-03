'use client';

import React from 'react';
// import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { useVisualBuilder } from '@/contexts/VisualBuilderContext';
import { BuilderBlock } from './BuilderBlock';
import { DropZone } from './DropZone';

export function BuilderCanvas() {
  const { state, actions } = useVisualBuilder();

  // const [{ isOver, canDrop }, drop] = useDrop({
  //   accept: ['component', 'block'],
  //   drop: (item: any, monitor) => {
  //     if (monitor.didDrop()) return;
  //     
  //     if (item.isNew) {
  //       // Adding a new component
  //       actions.addBlock(item.componentId);
  //     }
  //   },
  //   collect: (monitor) => ({
  //     isOver: monitor.isOver({ shallow: true }),
  //     canDrop: monitor.canDrop(),
  //   }),
  // });
  const isOver = false;
  const canDrop = false;
  const drop = React.useRef(null);

  const rootBlocks = state.blocks
    .filter(block => !block.parentId)
    .sort((a, b) => a.order - b.order);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      actions.selectBlock(null);
    }
  };

  return (
    <div
      ref={drop}
      className={`min-h-full w-full relative ${
        state.isPreviewMode ? '' : 'builder-canvas'
      }`}
      onClick={handleCanvasClick}
    >
      {/* Drop zone overlay when dragging */}
      {!state.isPreviewMode && isOver && canDrop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[var(--primary)]/10 border-2 border-dashed border-[var(--primary)] z-50 flex items-center justify-center"
        >
          <div className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium">
            Drop component here
          </div>
        </motion.div>
      )}

      {/* Render blocks */}
      <div className="relative">
        {rootBlocks.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-[var(--secondary)]">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-medium mb-2">Start Building</h3>
              <p className="text-sm">
                Drag components from the left panel to start building your page
              </p>
            </div>
          </div>
        ) : (
          <>
            {!state.isPreviewMode && <DropZone parentId={null} index={0} />}
            {rootBlocks.map((block, index) => (
              <React.Fragment key={block.id}>
                <BuilderBlock block={block} />
                {!state.isPreviewMode && (
                  <DropZone parentId={null} index={index + 1} />
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* Canvas styles */}
      <style jsx>{`
        .builder-canvas {
          --builder-outline-color: var(--primary);
        }
        
        .builder-canvas :global(.builder-block:hover) {
          outline: 2px solid var(--builder-outline-color);
          outline-offset: 2px;
        }
        
        .builder-canvas :global(.builder-block.selected) {
          outline: 2px solid var(--builder-outline-color);
          outline-offset: 2px;
          background-color: var(--primary)/5%;
        }
        
        .builder-canvas :global(.builder-block) {
          position: relative;
          transition: all 0.2s ease;
        }
        
        .builder-canvas :global(.builder-block-controls) {
          position: absolute;
          top: -35px;
          left: 0;
          display: none;
          z-index: 10;
        }
        
        .builder-canvas :global(.builder-block:hover .builder-block-controls),
        .builder-canvas :global(.builder-block.selected .builder-block-controls) {
          display: flex;
        }
      `}</style>
    </div>
  );
}