'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    text: string;
    onClick: () => void;
  };
}

interface TutorialContextType {
  isVisible: boolean;
  currentStep: number;
  steps: TutorialStep[];
  isCompleted: boolean;
  startTutorial: (steps: TutorialStep[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  closeTutorial: () => void;
  resetTutorial: () => void;
  shouldShowTutorial: () => boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

interface TutorialProviderProps {
  children: React.ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuthStore();

  // Check if tutorial has been completed for this user
  const getTutorialKey = () => `tutorial_completed_${user?.id || 'anonymous'}`;

  const shouldShowTutorial = useCallback(() => {
    if (!user) return false;
    
    const tutorialKey = getTutorialKey();
    const completed = localStorage.getItem(tutorialKey);
    
    // Show tutorial for new users or if explicitly requested
    return !completed;
  }, [user]);

  const startTutorial = useCallback((tutorialSteps: TutorialStep[]) => {
    setSteps(tutorialSteps);
    setCurrentStep(0);
    setIsVisible(true);
    setIsCompleted(false);
    
    // Add body class to prevent scrolling
    document.body.classList.add('tutorial-active');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      closeTutorial();
    }
  }, [currentStep, steps.length]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTutorial = useCallback(() => {
    // Mark as completed when skipped
    const tutorialKey = getTutorialKey();
    localStorage.setItem(tutorialKey, 'completed');
    
    setIsVisible(false);
    setIsCompleted(true);
    document.body.classList.remove('tutorial-active');
  }, [getTutorialKey]);

  const closeTutorial = useCallback(() => {
    // Mark as completed when finished
    const tutorialKey = getTutorialKey();
    localStorage.setItem(tutorialKey, 'completed');
    
    setIsVisible(false);
    setIsCompleted(true);
    setCurrentStep(0);
    document.body.classList.remove('tutorial-active');
  }, [getTutorialKey]);

  const resetTutorial = useCallback(() => {
    const tutorialKey = getTutorialKey();
    localStorage.removeItem(tutorialKey);
    
    setIsVisible(false);
    setIsCompleted(false);
    setCurrentStep(0);
    setSteps([]);
    document.body.classList.remove('tutorial-active');
  }, [getTutorialKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('tutorial-active');
    };
  }, []);

  const value: TutorialContextType = {
    isVisible,
    currentStep,
    steps,
    isCompleted,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    closeTutorial,
    resetTutorial,
    shouldShowTutorial,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export default TutorialProvider;