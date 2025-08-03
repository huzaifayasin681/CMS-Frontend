'use client';

import React, { useRef } from 'react';
// import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { Copy, Trash2, Move, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVisualBuilder } from '@/contexts/VisualBuilderContext';
import { BuilderBlock as BuilderBlockType } from '@/types/visual-builder';
import { ComponentRenderer } from './ComponentRenderer';

interface BuilderBlockProps {
  block: BuilderBlockType;
}

export function BuilderBlock({ block }: BuilderBlockProps) {
  const { state, actions } = useVisualBuilder();
  const ref = useRef<HTMLDivElement>(null);

  const isSelected = state.selectedBlockId === block.id;
  const isHovered = state.hoveredBlockId === block.id;

  // const [{ isDragging }, drag] = useDrag({
  //   type: 'block',
  //   item: { blockId: block.id, isNew: false },
  //   collect: (monitor) => ({
  //     isDragging: monitor.isDragging(),
  //   }),
  // });
  const isDragging = false;
  const drag = useRef(null);

  // const [{ isOver }, drop] = useDrop({
  //   accept: ['component', 'block'],
  //   drop: (item: any, monitor) => {
  //     if (monitor.didDrop()) return;
  //     
  //     if (item.isNew) {
  //       // Adding a new component as child
  //       actions.addBlock(item.componentId, block.id);
  //     } else if (item.blockId !== block.id) {
  //       // Moving existing block
  //       actions.moveBlock(item.blockId, block.id);
  //     }
  //   },
  //   collect: (monitor) => ({
  //     isOver: monitor.isOver({ shallow: true }),
  //   }),
  //   canDrop: (item) => {
  //     // Check if this block can accept children
  //     return block.type === 'section' || block.type === 'column';
  //   },
  // });
  const isOver = false;
  const drop = useRef(null);

  // Combine drag and drop refs
  // drag(drop(ref));

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.selectBlock(block.id);
  };

  const handleMouseEnter = () => {
    if (!state.isPreviewMode) {
      actions.hoverBlock(block.id);
    }
  };

  const handleMouseLeave = () => {
    if (!state.isPreviewMode) {
      actions.hoverBlock(null);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.duplicateBlock(block.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.removeBlock(block.id);
  };

  const currentStyles = block.styles[state.device] || {};
  
  // Get child blocks
  const childBlocks = state.blocks
    .filter(b => b.parentId === block.id)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      ref={ref}
      className={`builder-block ${isSelected ? 'selected' : ''} ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={currentStyles}
      onClick={handleBlockClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Block Controls */}
      {!state.isPreviewMode && (isSelected || isHovered) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="builder-block-controls flex items-center gap-1 bg-[var(--primary)] text-white rounded px-2 py-1 text-xs"
        >
          <span className="font-medium">{block.component}</span>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Move}
              className="text-white hover:bg-white/20 w-6 h-6 p-0"
              title="Drag to move"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Copy}
              onClick={handleDuplicate}
              className="text-white hover:bg-white/20 w-6 h-6 p-0"
              title="Duplicate"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={handleDelete}
              className="text-white hover:bg-red-500 w-6 h-6 p-0"
              title="Delete"
            />
          </div>
        </motion.div>
      )}

      {/* Drop Zone Overlay */}
      {!state.isPreviewMode && isOver && (
        <div className="absolute inset-0 bg-[var(--primary)]/10 border-2 border-dashed border-[var(--primary)] z-10 flex items-center justify-center">
          <div className="bg-[var(--primary)] text-white px-2 py-1 rounded text-xs">
            Drop here
          </div>
        </div>
      )}

      {/* Component Content */}
      <ComponentRenderer
        component={block.component}
        props={block.props}
        styles={currentStyles}
        isPreview={state.isPreviewMode}
      />

      {/* Child Blocks */}
      {childBlocks.length > 0 && (
        <div className="builder-children">
          {childBlocks.map((childBlock) => (
            <BuilderBlock key={childBlock.id} block={childBlock} />
          ))}
        </div>
      )}
    </div>
  );
}