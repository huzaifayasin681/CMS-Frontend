'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useVisualBuilder } from '@/contexts/VisualBuilderContext';
import { BuilderBlock } from '@/types/visual-builder';
import { Button } from '@/components/ui/Button';
import { componentIcons } from './ComponentLibrary';

interface LayerItemProps {
  block: BuilderBlock;
  level: number;
  isExpanded: boolean;
  onToggleExpand: (blockId: string) => void;
}

function LayerItem({ block, level, isExpanded, onToggleExpand }: LayerItemProps) {
  const { state, actions } = useVisualBuilder();
  
  const childBlocks = state.blocks
    .filter(b => b.parentId === block.id)
    .sort((a, b) => a.order - b.order);
  
  const hasChildren = childBlocks.length > 0;
  const isSelected = state.selectedBlockId === block.id;
  const isHovered = state.hoveredBlockId === block.id;
  
  const Icon = componentIcons[block.component] || componentIcons.container;

  const handleClick = () => {
    actions.selectBlock(block.id);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(block.id);
  };

  const handleMouseEnter = () => {
    actions.hoverBlock(block.id);
  };

  const handleMouseLeave = () => {
    actions.hoverBlock(null);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
          isSelected
            ? 'bg-[var(--primary)] text-white'
            : isHovered
            ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
            : 'hover:bg-[var(--surface)] text-[var(--foreground)]'
        }`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Expand/Collapse Button */}
        <div className="w-4 h-4 flex items-center justify-center">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className={`w-4 h-4 p-0 ${
                isSelected ? 'text-white hover:bg-white/20' : 'text-[var(--secondary)] hover:text-[var(--primary)]'
              }`}
              onClick={handleToggleExpand}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          ) : null}
        </div>

        {/* Component Icon */}
        <div className="w-4 h-4 flex items-center justify-center">
          <Icon className="w-3 h-3" />
        </div>

        {/* Component Name */}
        <span className="flex-1 text-sm font-medium truncate">
          {block.component}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className={`w-4 h-4 p-0 ${
              isSelected ? 'text-white hover:bg-white/20' : 'text-[var(--secondary)] hover:text-[var(--primary)]'
            }`}
            title="Toggle visibility"
          >
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Child Blocks */}
      {hasChildren && isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {childBlocks.map((childBlock) => (
            <LayerItem
              key={childBlock.id}
              block={childBlock}
              level={level + 1}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export function LayersPanel() {
  const { state, actions } = useVisualBuilder();
  const [expandedBlocks, setExpandedBlocks] = React.useState<Set<string>>(new Set());

  const rootBlocks = state.blocks
    .filter(block => !block.parentId)
    .sort((a, b) => a.order - b.order);

  const handleToggleExpand = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
    } else {
      newExpanded.add(blockId);
    }
    setExpandedBlocks(newExpanded);
  };

  const handleExpandAll = () => {
    const allBlockIds = new Set(state.blocks.map(b => b.id));
    setExpandedBlocks(allBlockIds);
  };

  const handleCollapseAll = () => {
    setExpandedBlocks(new Set());
  };

  return (
    <div className="p-4 space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--foreground)]">
          Page Structure
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpandAll}
            className="text-xs"
          >
            Expand All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCollapseAll}
            className="text-xs"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Layers Tree */}
      <div className="space-y-1 group">
        {rootBlocks.length === 0 ? (
          <div className="text-center py-8 text-[var(--secondary)]">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm">No components yet</p>
            <p className="text-xs mt-1">Add components to see them here</p>
          </div>
        ) : (
          rootBlocks.map((block) => (
            <LayerItem
              key={block.id}
              block={block}
              level={0}
              isExpanded={expandedBlocks.has(block.id)}
              onToggleExpand={handleToggleExpand}
            />
          ))
        )}
      </div>

      {/* Stats */}
      {state.blocks.length > 0 && (
        <div className="border-t border-[var(--border)] pt-4 text-xs text-[var(--secondary)]">
          <div className="flex justify-between">
            <span>Total blocks:</span>
            <span>{state.blocks.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Selected:</span>
            <span>{state.selectedBlockId ? '1' : '0'}</span>
          </div>
        </div>
      )}
    </div>
  );
}