'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { BuilderState, BuilderBlock, BuilderData, DeviceType, ComponentDefinition } from '@/types/visual-builder';
import { generateId } from '@/utils/generateId';

interface VisualBuilderContextType {
  state: BuilderState;
  actions: {
    addBlock: (componentId: string, parentId?: string, index?: number) => void;
    removeBlock: (blockId: string) => void;
    moveBlock: (blockId: string, parentId?: string, index?: number) => void;
    updateBlock: (blockId: string, updates: Partial<BuilderBlock>) => void;
    updateBlockProps: (blockId: string, props: Record<string, any>) => void;
    updateBlockStyles: (blockId: string, device: DeviceType, styles: Record<string, any>) => void;
    selectBlock: (blockId: string | null) => void;
    hoverBlock: (blockId: string | null) => void;
    setDevice: (device: DeviceType) => void;
    setPreviewMode: (enabled: boolean) => void;
    undo: () => void;
    redo: () => void;
    loadBuilderData: (data: BuilderData) => void;
    exportBuilderData: () => BuilderData;
    duplicateBlock: (blockId: string) => void;
    clearAll: () => void;
  };
}

const initialState: BuilderState = {
  blocks: [],
  selectedBlockId: null,
  hoveredBlockId: null,
  draggedBlockId: null,
  device: 'desktop',
  isPreviewMode: false,
  undoStack: [],
  redoStack: [],
  settings: {
    containerWidth: '1200px',
    spacing: 'normal',
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      lineHeight: '1.5',
    },
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      foreground: '#0f172a',
    },
  },
  globalStyles: {
    desktop: {},
    tablet: {},
    mobile: {},
  },
};

type Action = 
  | { type: 'ADD_BLOCK'; payload: { componentId: string; parentId?: string; index?: number } }
  | { type: 'REMOVE_BLOCK'; payload: { blockId: string } }
  | { type: 'MOVE_BLOCK'; payload: { blockId: string; parentId?: string; index?: number } }
  | { type: 'UPDATE_BLOCK'; payload: { blockId: string; updates: Partial<BuilderBlock> } }
  | { type: 'UPDATE_BLOCK_PROPS'; payload: { blockId: string; props: Record<string, any> } }
  | { type: 'UPDATE_BLOCK_STYLES'; payload: { blockId: string; device: DeviceType; styles: Record<string, any> } }
  | { type: 'SELECT_BLOCK'; payload: { blockId: string | null } }
  | { type: 'HOVER_BLOCK'; payload: { blockId: string | null } }
  | { type: 'SET_DEVICE'; payload: { device: DeviceType } }
  | { type: 'SET_PREVIEW_MODE'; payload: { enabled: boolean } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_BUILDER_DATA'; payload: { data: BuilderData } }
  | { type: 'DUPLICATE_BLOCK'; payload: { blockId: string } }
  | { type: 'CLEAR_ALL' }
  | { type: 'SAVE_STATE' };

function builderReducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case 'ADD_BLOCK': {
      const { componentId, parentId, index } = action.payload;
      
      // Get component definition (this would come from a component registry)
      const componentDef = getComponentDefinition(componentId);
      if (!componentDef) return state;

      const newBlock: BuilderBlock = {
        id: generateId(),
        type: componentDef.canHaveChildren ? 'section' : 'component',
        component: componentId,
        props: { ...componentDef.defaultProps },
        styles: {
          desktop: { ...componentDef.defaultStyles.desktop },
          tablet: { ...componentDef.defaultStyles.tablet },
          mobile: { ...componentDef.defaultStyles.mobile },
        },
        parentId,
        order: index ?? state.blocks.filter(b => b.parentId === parentId).length,
      };

      return {
        ...state,
        blocks: [...state.blocks, newBlock],
        selectedBlockId: newBlock.id,
        undoStack: [...state.undoStack, { blocks: state.blocks, globalStyles: state.globalStyles, settings: state.settings }],
        redoStack: [],
      };
    }

    case 'REMOVE_BLOCK': {
      const { blockId } = action.payload;
      const blocksToRemove = getAllChildBlocks(state.blocks, blockId);
      
      return {
        ...state,
        blocks: state.blocks.filter(b => !blocksToRemove.includes(b.id)),
        selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
        undoStack: [...state.undoStack, { blocks: state.blocks, globalStyles: state.globalStyles, settings: state.settings }],
        redoStack: [],
      };
    }

    case 'MOVE_BLOCK': {
      const { blockId, parentId, index } = action.payload;
      const blocks = state.blocks.map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            parentId,
            order: index ?? state.blocks.filter(b => b.parentId === parentId).length,
          };
        }
        return block;
      });

      return {
        ...state,
        blocks,
        undoStack: [...state.undoStack, { blocks: state.blocks, globalStyles: state.globalStyles, settings: state.settings }],
        redoStack: [],
      };
    }

    case 'UPDATE_BLOCK': {
      const { blockId, updates } = action.payload;
      const blocks = state.blocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      );

      return {
        ...state,
        blocks,
        undoStack: [...state.undoStack, { blocks: state.blocks, globalStyles: state.globalStyles, settings: state.settings }],
        redoStack: [],
      };
    }

    case 'UPDATE_BLOCK_PROPS': {
      const { blockId, props } = action.payload;
      const blocks = state.blocks.map(block => 
        block.id === blockId ? { ...block, props: { ...block.props, ...props } } : block
      );

      return {
        ...state,
        blocks,
        undoStack: [...state.undoStack, { blocks: state.blocks, globalStyles: state.globalStyles, settings: state.settings }],
        redoStack: [],
      };
    }

    case 'UPDATE_BLOCK_STYLES': {
      const { blockId, device, styles } = action.payload;
      const blocks = state.blocks.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              styles: { 
                ...block.styles, 
                [device]: { ...block.styles[device], ...styles } 
              } 
            } 
          : block
      );

      return {
        ...state,
        blocks,
        undoStack: [...state.undoStack, { blocks: state.blocks, globalStyles: state.globalStyles, settings: state.settings }],
        redoStack: [],
      };
    }

    case 'SELECT_BLOCK':
      return {
        ...state,
        selectedBlockId: action.payload.blockId,
      };

    case 'HOVER_BLOCK':
      return {
        ...state,
        hoveredBlockId: action.payload.blockId,
      };

    case 'SET_DEVICE':
      return {
        ...state,
        device: action.payload.device,
      };

    case 'SET_PREVIEW_MODE':
      return {
        ...state,
        isPreviewMode: action.payload.enabled,
        selectedBlockId: action.payload.enabled ? null : state.selectedBlockId,
      };

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      
      const previousState = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        blocks: previousState.blocks,
        globalStyles: previousState.globalStyles,
        settings: previousState.settings,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, { blocks: state.blocks, globalStyles: state.globalStyles, settings: state.settings }],
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      
      const nextState = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        blocks: nextState.blocks,
        globalStyles: nextState.globalStyles,
        settings: nextState.settings,
        undoStack: [...state.undoStack, { blocks: state.blocks, globalStyles: state.globalStyles, settings: state.settings }],
        redoStack: state.redoStack.slice(0, -1),
      };
    }

    case 'LOAD_BUILDER_DATA': {
      const { data } = action.payload;
      return {
        ...state,
        blocks: data.blocks,
        globalStyles: data.globalStyles,
        settings: data.settings,
        selectedBlockId: null,
        undoStack: [],
        redoStack: [],
      };
    }

    case 'DUPLICATE_BLOCK': {
      const { blockId } = action.payload;
      const blockToDuplicate = state.blocks.find(b => b.id === blockId);
      if (!blockToDuplicate) return state;

      const duplicatedBlock: BuilderBlock = {
        ...blockToDuplicate,
        id: generateId(),
        order: blockToDuplicate.order + 1,
      };

      return {
        ...state,
        blocks: [...state.blocks, duplicatedBlock],
        selectedBlockId: duplicatedBlock.id,
        undoStack: [...state.undoStack, { blocks: state.blocks, globalStyles: state.globalStyles, settings: state.settings }],
        redoStack: [],
      };
    }

    case 'CLEAR_ALL':
      return {
        ...initialState,
        undoStack: [...state.undoStack, { blocks: state.blocks, globalStyles: state.globalStyles, settings: state.settings }],
      };

    default:
      return state;
  }
}

// Helper functions
function getAllChildBlocks(blocks: BuilderBlock[], parentId: string): string[] {
  const children = blocks.filter(b => b.parentId === parentId);
  const allChildren = [parentId];
  
  children.forEach(child => {
    allChildren.push(...getAllChildBlocks(blocks, child.id));
  });
  
  return allChildren;
}

function getComponentDefinition(componentId: string): ComponentDefinition | null {
  // This would normally come from a component registry
  // For now, return a basic component definition
  return {
    id: componentId,
    name: componentId,
    category: 'content',
    icon: 'box',
    description: 'A basic component',
    defaultProps: {},
    defaultStyles: {
      desktop: {},
      tablet: {},
      mobile: {},
    },
    editableProps: {},
    styleProps: {},
    canHaveChildren: false,
  };
}

const VisualBuilderContext = createContext<VisualBuilderContextType | null>(null);

export function VisualBuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  const actions = {
    addBlock: useCallback((componentId: string, parentId?: string, index?: number) => {
      dispatch({ type: 'ADD_BLOCK', payload: { componentId, parentId, index } });
    }, []),

    removeBlock: useCallback((blockId: string) => {
      dispatch({ type: 'REMOVE_BLOCK', payload: { blockId } });
    }, []),

    moveBlock: useCallback((blockId: string, parentId?: string, index?: number) => {
      dispatch({ type: 'MOVE_BLOCK', payload: { blockId, parentId, index } });
    }, []),

    updateBlock: useCallback((blockId: string, updates: Partial<BuilderBlock>) => {
      dispatch({ type: 'UPDATE_BLOCK', payload: { blockId, updates } });
    }, []),

    updateBlockProps: useCallback((blockId: string, props: Record<string, any>) => {
      dispatch({ type: 'UPDATE_BLOCK_PROPS', payload: { blockId, props } });
    }, []),

    updateBlockStyles: useCallback((blockId: string, device: DeviceType, styles: Record<string, any>) => {
      dispatch({ type: 'UPDATE_BLOCK_STYLES', payload: { blockId, device, styles } });
    }, []),

    selectBlock: useCallback((blockId: string | null) => {
      dispatch({ type: 'SELECT_BLOCK', payload: { blockId } });
    }, []),

    hoverBlock: useCallback((blockId: string | null) => {
      dispatch({ type: 'HOVER_BLOCK', payload: { blockId } });
    }, []),

    setDevice: useCallback((device: DeviceType) => {
      dispatch({ type: 'SET_DEVICE', payload: { device } });
    }, []),

    setPreviewMode: useCallback((enabled: boolean) => {
      dispatch({ type: 'SET_PREVIEW_MODE', payload: { enabled } });
    }, []),

    undo: useCallback(() => {
      dispatch({ type: 'UNDO' });
    }, []),

    redo: useCallback(() => {
      dispatch({ type: 'REDO' });
    }, []),

    loadBuilderData: useCallback((data: BuilderData) => {
      dispatch({ type: 'LOAD_BUILDER_DATA', payload: { data } });
    }, []),

    exportBuilderData: useCallback((): BuilderData => {
      return {
        blocks: state.blocks,
        globalStyles: state.globalStyles,
        settings: state.settings,
      };
    }, [state.blocks, state.globalStyles, state.settings]),

    duplicateBlock: useCallback((blockId: string) => {
      dispatch({ type: 'DUPLICATE_BLOCK', payload: { blockId } });
    }, []),

    clearAll: useCallback(() => {
      dispatch({ type: 'CLEAR_ALL' });
    }, []),
  };

  return (
    <VisualBuilderContext.Provider value={{ state, actions }}>
      {children}
    </VisualBuilderContext.Provider>
  );
}

export function useVisualBuilder() {
  const context = useContext(VisualBuilderContext);
  if (!context) {
    throw new Error('useVisualBuilder must be used within a VisualBuilderProvider');
  }
  return context;
}