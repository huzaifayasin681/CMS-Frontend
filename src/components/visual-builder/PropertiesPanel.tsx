'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, Layout, Type, Image, Square } from 'lucide-react';
import { useVisualBuilder } from '@/contexts/VisualBuilderContext';
import { getComponentDefinition } from '@/lib/component-registry';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ComponentDefinition } from '@/types/visual-builder';

type PropertyTab = 'content' | 'style' | 'advanced';

const tabConfig = {
  content: { icon: Settings, label: 'Content' },
  style: { icon: Palette, label: 'Style' },
  advanced: { icon: Layout, label: 'Advanced' },
};

const styleCategories = {
  layout: { icon: Layout, label: 'Layout' },
  typography: { icon: Type, label: 'Typography' },
  spacing: { icon: Square, label: 'Spacing' },
  background: { icon: Palette, label: 'Background' },
  border: { icon: Layout, label: 'Border' },
  effects: { icon: Image, label: 'Effects' },
};

interface PropertyFieldProps {
  label: string;
  type: string;
  value: any;
  onChange: (value: any) => void;
  options?: any[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function PropertyField({ label, type, value, onChange, options, min, max, step, unit }: PropertyFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : 
                     type === 'boolean' ? (e.target as HTMLInputElement).checked :
                     e.target.value;
    onChange(newValue);
  };

  switch (type) {
    case 'text':
      return (
        <Input
          label={label}
          value={value || ''}
          onChange={handleChange}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      );

    case 'textarea':
      return (
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {label}
          </label>
          <textarea
            value={value || ''}
            onChange={handleChange}
            placeholder={`Enter ${label.toLowerCase()}`}
            rows={3}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-vertical"
          />
        </div>
      );

    case 'number':
    case 'range':
      return (
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {label} {unit && `(${unit})`}
          </label>
          <input
            type="number"
            value={value || 0}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
          />
        </div>
      );

    case 'select':
      return (
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {label}
          </label>
          <select
            value={value || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
          >
            {options?.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        </div>
      );

    case 'color':
      return (
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {label}
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={handleChange}
              className="w-12 h-10 border border-[var(--border)] rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={handleChange}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
            />
          </div>
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value || false}
            onChange={handleChange}
            className="w-4 h-4 text-[var(--primary)] border-[var(--border)] rounded focus:ring-[var(--ring)]"
          />
          <label className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        </div>
      );

    case 'image':
      return (
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {label}
          </label>
          <input
            type="url"
            value={value || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
          />
          {value && (
            <div className="mt-2">
              <img
                src={value}
                alt="Preview"
                className="w-full h-20 object-cover rounded border border-[var(--border)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      );

    default:
      return (
        <Input
          label={label}
          value={value || ''}
          onChange={handleChange}
        />
      );
  }
}

export function PropertiesPanel() {
  const { state, actions } = useVisualBuilder();
  const [activeTab, setActiveTab] = useState<PropertyTab>('content');
  const [activeStyleCategory, setActiveStyleCategory] = useState<string>('layout');

  const selectedBlock = state.blocks.find(b => b.id === state.selectedBlockId);
  if (!selectedBlock) {
    return (
      <div className="p-4 text-center text-[var(--secondary)]">
        <div className="text-4xl mb-2">👆</div>
        <p className="text-sm">Select a component to edit its properties</p>
      </div>
    );
  }

  const componentDef = getComponentDefinition(selectedBlock.component);
  if (!componentDef) {
    return (
      <div className="p-4 text-center text-[var(--secondary)]">
        <p className="text-sm">Component definition not found</p>
      </div>
    );
  }

  const handlePropChange = (propKey: string, value: any) => {
    actions.updateBlockProps(selectedBlock.id, { [propKey]: value });
  };

  const handleStyleChange = (styleKey: string, value: any) => {
    const processedValue = value && componentDef.styleProps[styleKey]?.unit 
      ? `${value}${componentDef.styleProps[styleKey].unit}`
      : value;
    
    actions.updateBlockStyles(selectedBlock.id, state.device, { [styleKey]: processedValue });
  };

  const currentStyles = selectedBlock.styles[state.device] || {};
  
  // Group style properties by category
  const stylePropsGrouped = Object.entries(componentDef.styleProps || {}).reduce((acc, [key, prop]) => {
    const category = prop.category || 'layout';
    if (!acc[category]) acc[category] = {};
    acc[category][key] = prop;
    return acc;
  }, {} as Record<string, Record<string, ComponentDefinition['styleProps'][string]>>);

  return (
    <div className="p-4 space-y-4">
      {/* Component Info */}
      <div className="text-center pb-4 border-b border-[var(--border)]">
        <h3 className="font-semibold text-[var(--foreground)]">{componentDef.name}</h3>
        <p className="text-xs text-[var(--secondary)] mt-1">{componentDef.description}</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-[var(--surface)] p-1">
        {(Object.keys(tabConfig) as PropertyTab[]).map((tab) => {
          const { icon: Icon, label } = tabConfig[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === tab
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--secondary)] hover:text-[var(--primary)]'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <motion.div
          key="content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {Object.entries(componentDef.editableProps || {}).map(([key, prop]) => (
            <PropertyField
              key={key}
              label={prop.label}
              type={prop.type}
              value={selectedBlock.props[key]}
              onChange={(value) => handlePropChange(key, value)}
              options={prop.options}
              min={prop.min}
              max={prop.max}
              step={prop.step}
            />
          ))}
          
          {Object.keys(componentDef.editableProps || {}).length === 0 && (
            <div className="text-center py-8 text-[var(--secondary)]">
              <p className="text-sm">No content properties available</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Style Tab */}
      {activeTab === 'style' && (
        <motion.div
          key="style"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Device Indicator */}
          <div className="text-center text-xs text-[var(--secondary)] bg-[var(--surface)] py-2 px-3 rounded">
            Editing styles for <span className="font-medium capitalize">{state.device}</span>
          </div>

          {/* Style Categories */}
          {Object.keys(stylePropsGrouped).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Object.keys(stylePropsGrouped).map((category) => {
                const categoryInfo = styleCategories[category as keyof typeof styleCategories];
                const Icon = categoryInfo?.icon || Layout;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveStyleCategory(category)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      activeStyleCategory === category
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--surface)] text-[var(--secondary)] hover:text-[var(--primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      <span className="capitalize">{categoryInfo?.label || category}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Style Properties */}
          <div className="space-y-4">
            {Object.entries(stylePropsGrouped[activeStyleCategory] || {}).map(([key, prop]) => {
              const currentValue = currentStyles[key];
              const numericValue = typeof currentValue === 'string' && prop.unit
                ? parseFloat(currentValue.replace(prop.unit, '')) || 0
                : currentValue;

              return (
                <PropertyField
                  key={key}
                  label={prop.label}
                  type={prop.type}
                  value={numericValue}
                  onChange={(value) => handleStyleChange(key, value)}
                  options={prop.options}
                  min={prop.min}
                  max={prop.max}
                  step={prop.step}
                  unit={prop.unit}
                />
              );
            })}
            
            {Object.keys(stylePropsGrouped[activeStyleCategory] || {}).length === 0 && (
              <div className="text-center py-8 text-[var(--secondary)]">
                <p className="text-sm">No {activeStyleCategory} properties available</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <motion.div
          key="advanced"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="space-y-4">
            <Input
              label="Block ID"
              value={selectedBlock.id}
              disabled
              hint="Unique identifier for this block"
            />
            
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Component Type
              </label>
              <div className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--secondary)]">
                {selectedBlock.component}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Block Type
              </label>
              <div className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--secondary)]">
                {selectedBlock.type}
              </div>
            </div>

            <Input
              label="Order"
              type="number"
              value={selectedBlock.order}
              onChange={(e) => actions.updateBlock(selectedBlock.id, { order: parseInt(e.target.value) || 0 })}
              hint="Display order within parent"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[var(--border)] space-y-2">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => actions.duplicateBlock(selectedBlock.id)}
            >
              Duplicate Block
            </Button>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => actions.removeBlock(selectedBlock.id)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              Delete Block
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}