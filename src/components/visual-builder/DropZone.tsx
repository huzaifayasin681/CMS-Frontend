'use client';

import React from 'react';
// import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { useVisualBuilder } from '@/contexts/VisualBuilderContext';

interface DropZoneProps {
  parentId: string | null;
  index: number;
}

export function DropZone({ parentId, index }: DropZoneProps) {
  const { actions } = useVisualBuilder();

  // const [{ isOver, canDrop }, drop] = useDrop({
  //   accept: ['component', 'block'],
  //   drop: (item: any) => {
  //     if (item.isNew) {
  //       // Adding a new component
  //       actions.addBlock(item.componentId, parentId, index);
  //     } else {
  //       // Moving existing block
  //       actions.moveBlock(item.blockId, parentId, index);
  //     }
  //   },
  //   collect: (monitor) => ({
  //     isOver: monitor.isOver({ shallow: true }),
  //     canDrop: monitor.canDrop(),
  //   }),
  // });

  // Temporary fallbacks
  const isOver = false;
  const canDrop = false;
  const drop = null;

  return (
    <div
      ref={drop}
      className={`drop-zone ${isOver && canDrop ? 'active' : ''}`}
    >
      {isOver && canDrop && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          className="h-2 bg-[var(--primary)] rounded-full mx-4 my-2"
        />
      )}
      
      <style jsx>{`
        .drop-zone {
          min-height: 8px;
          margin: 4px 0;
          transition: all 0.2s ease;
        }
        
        .drop-zone.active {
          min-height: 16px;
        }
      `}</style>
    </div>
  );
}