export interface BuilderBlock {
  id: string;
  type: 'section' | 'column' | 'component';
  component: string;
  props: Record<string, any>;
  styles: {
    desktop: Record<string, any>;
    tablet: Record<string, any>;
    mobile: Record<string, any>;
  };
  children?: string[];
  parentId?: string;
  order: number;
}

export interface BuilderData {
  blocks: BuilderBlock[];
  globalStyles: {
    desktop: Record<string, any>;
    tablet: Record<string, any>;
    mobile: Record<string, any>;
  };
  settings: {
    containerWidth: string;
    spacing: string;
    typography: Record<string, any>;
    colors: Record<string, any>;
  };
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: 'layout' | 'content' | 'media' | 'form' | 'navigation';
  icon: string;
  description: string;
  defaultProps: Record<string, any>;
  defaultStyles: {
    desktop: Record<string, any>;
    tablet: Record<string, any>;
    mobile: Record<string, any>;
  };
  editableProps: {
    [key: string]: {
      type: 'text' | 'textarea' | 'number' | 'select' | 'color' | 'image' | 'boolean' | 'range';
      label: string;
      options?: string[] | { value: string; label: string }[];
      min?: number;
      max?: number;
      step?: number;
    };
  };
  styleProps: {
    [key: string]: {
      type: 'text' | 'number' | 'select' | 'color' | 'range';
      label: string;
      category: 'layout' | 'typography' | 'spacing' | 'background' | 'border' | 'effects';
      options?: string[] | { value: string; label: string }[];
      min?: number;
      max?: number;
      step?: number;
      unit?: string;
    };
  };
  canHaveChildren: boolean;
  maxChildren?: number;
  allowedChildren?: string[];
  allowedParents?: string[];
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface BuilderState {
  blocks: BuilderBlock[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  draggedBlockId: string | null;
  device: DeviceType;
  isPreviewMode: boolean;
  undoStack: BuilderData[];
  redoStack: BuilderData[];
  settings: BuilderData['settings'];
  globalStyles: BuilderData['globalStyles'];
}

export interface DragData {
  blockId?: string;
  componentId?: string;
  isNew: boolean;
}

export interface DropZone {
  blockId: string;
  position: 'before' | 'after' | 'inside';
  index?: number;
}