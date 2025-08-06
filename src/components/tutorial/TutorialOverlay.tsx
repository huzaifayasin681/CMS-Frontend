'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    text: string;
    onClick: () => void;
  };
}

interface TutorialOverlayProps {
  isVisible: boolean;
  currentStep: number;
  steps: TutorialStep[];
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isVisible,
  currentStep,
  steps,
  onNext,
  onPrevious,
  onSkip,
  onClose,
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Update target element highlighting
  useEffect(() => {
    if (!currentStepData?.target || !isVisible) {
      setTargetRect(null);
      return;
    }

    const updateTargetRect = () => {
      const targetElement = document.querySelector(currentStepData.target!);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
        
        // Calculate tooltip position
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        const margin = 20;
        
        let x = 0;
        let y = 0;
        
        switch (currentStepData.position) {
          case 'top':
            x = rect.left + rect.width / 2 - tooltipWidth / 2;
            y = rect.top - tooltipHeight - margin;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2 - tooltipWidth / 2;
            y = rect.bottom + margin;
            break;
          case 'left':
            x = rect.left - tooltipWidth - margin;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
          case 'right':
            x = rect.right + margin;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
          default:
            x = window.innerWidth / 2 - tooltipWidth / 2;
            y = window.innerHeight / 2 - tooltipHeight / 2;
        }
        
        // Ensure tooltip stays within viewport
        x = Math.max(margin, Math.min(x, window.innerWidth - tooltipWidth - margin));
        y = Math.max(margin, Math.min(y, window.innerHeight - tooltipHeight - margin));
        
        setTooltipPosition({ x, y });
        
        // Scroll element into view if needed
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    };

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [currentStepData, isVisible]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
        case 'Enter':
          if (!isLastStep) onNext();
          break;
        case 'ArrowLeft':
          if (!isFirstStep) onPrevious();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, isFirstStep, isLastStep, onNext, onPrevious, onClose]);

  if (!isVisible || !currentStepData) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        {/* Dark overlay with cutout for highlighted element */}
        <div className="absolute inset-0 pointer-events-auto">
          <svg className="w-full h-full">
            <defs>
              <mask id="tutorial-mask">
                <rect width="100%" height="100%" fill="white" />
                {targetRect && (
                  <rect
                    x={targetRect.left - 4}
                    y={targetRect.top - 4}
                    width={targetRect.width + 8}
                    height={targetRect.height + 8}
                    rx="8"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.7)"
              mask="url(#tutorial-mask)"
            />
          </svg>
        </div>

        {/* Highlighted element border */}
        {targetRect && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute border-2 border-blue-500 rounded-lg shadow-lg"
            style={{
              left: targetRect.left - 4,
              top: targetRect.top - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)',
            }}
          />
        )}

        {/* Tutorial tooltip */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl pointer-events-auto"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            width: 320,
            maxWidth: '90vw',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
              {currentStepData.content}
            </p>

            {/* Action button if provided */}
            {currentStepData.action && (
              <div className="mb-4">
                <Button
                  onClick={currentStepData.action.onClick}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {currentStepData.action.text}
                </Button>
              </div>
            )}
          </div>

          {/* Footer with navigation */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={onPrevious}
                disabled={isFirstStep}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 px-3 py-2"
              >
                <ArrowLeft className="w-3 h-3 flex-shrink-0" />
                <span className="text-sm">Previous</span>
              </Button>
              
              <Button
                onClick={onSkip}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <SkipForward className="w-3 h-3 flex-shrink-0" />
                <span className="text-sm">Skip Tour</span>
              </Button>
            </div>

            <Button
              onClick={isLastStep ? onClose : onNext}
              size="sm"
              className="flex items-center gap-2 px-4 py-2 ml-auto"
            >
              <span className="text-sm">{isLastStep ? 'Finish' : 'Next'}</span>
              {!isLastStep && <ArrowRight className="w-3 h-3 flex-shrink-0" />}
            </Button>
          </div>

          {/* Progress bar */}
          <div className="px-4 pb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <motion.div
                className="bg-blue-500 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialOverlay;