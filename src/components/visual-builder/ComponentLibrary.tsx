'use client';

import React, { useState } from 'react';
// import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { 
  Box, 
  Columns, 
  Layout, 
  Type, 
  AlignLeft, 
  Square, 
  Image, 
  MoveVertical,
  Monitor,
  Quote,
  CreditCard,
  Search
} from 'lucide-react';

import { componentRegistry, getAllCategories } from '@/lib/component-registry';
import { ComponentDefinition } from '@/types/visual-builder';

const categoryIcons = {
  layout: Layout,
  content: Type,
  media: Image,
  form: Square,
  navigation: Monitor,
};

export const componentIcons: Record<string, any> = {
  container: Box,
  row: Columns,
  column: Layout,
  heading: Type,
  text: AlignLeft,
  button: Square,
  image: Image,
  spacer: MoveVertical,
  'hero-section': Monitor,
  'testimonial-card': Quote,
  'pricing-card': CreditCard,
};

interface DraggableComponentProps {
  component: ComponentDefinition;
}

function DraggableComponent({ component }: DraggableComponentProps) {
  // const [{ isDragging }, drag] = useDrag({
  //   type: 'component',
  //   item: { componentId: component.id, isNew: true },
  //   collect: (monitor) => ({
  //     isDragging: monitor.isDragging(),
  //   }),
  // });

  const Icon = componentIcons[component.id] || Box;
  const isDragging = false; // Temporary fallback
  const drag = null; // Temporary fallback

  return (
    <motion.div
      ref={drag}
      className={`p-3 border border-[var(--border)] rounded-lg cursor-grab hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[var(--primary)]/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[var(--primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-[var(--foreground)] truncate">
            {component.name}
          </div>
          <div className="text-xs text-[var(--secondary)] truncate">
            {component.description}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ComponentLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...getAllCategories()];
  
  const filteredComponents = componentRegistry.filter((component) => {
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--secondary)]" />
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1">
        {categories.map((category) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--secondary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {Icon && <Icon className="w-3 h-3" />}
                <span className="capitalize">{category}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Components Grid */}
      <div className="space-y-2">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-8 text-[var(--secondary)]">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm">No components found</p>
          </div>
        ) : (
          filteredComponents.map((component) => (
            <DraggableComponent key={component.id} component={component} />
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="border-t border-[var(--border)] pt-4 mt-4">
        <div className="text-xs text-[var(--secondary)] space-y-2">
          <p className="font-medium">How to use:</p>
          <ul className="space-y-1 ml-4">
            <li>• Drag components to the canvas</li>
            <li>• Click to select and edit</li>
            <li>• Use device toggles for responsive design</li>
            <li>• Preview mode hides editing tools</li>
          </ul>
        </div>
      </div>
    </div>
  );
}