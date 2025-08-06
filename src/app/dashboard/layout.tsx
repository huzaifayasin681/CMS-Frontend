'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
// import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { Header } from '@/components/layout/Header';
import { TutorialProvider, useTutorial } from '@/contexts/TutorialContext';
import TutorialOverlay from '@/components/tutorial/TutorialOverlay';
import { useAuthStore } from '@/lib/auth';
import { getTutorialStepsForRole, shouldShowSectionTutorial } from '@/data/tutorialSteps';

// Inner dashboard content component
function DashboardContent({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const { 
    isVisible, 
    currentStep, 
    steps, 
    nextStep, 
    previousStep, 
    skipTutorial, 
    closeTutorial,
    shouldShowTutorial,
    startTutorial
  } = useTutorial();

  // Auto-start dashboard tutorial for new users
  useEffect(() => {
    if (user && shouldShowTutorial()) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const dashboardSteps = getTutorialStepsForRole(user.role);
        if (dashboardSteps.length > 0) {
          startTutorial(dashboardSteps);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, shouldShowTutorial, startTutorial]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        <DashboardSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          data-tutorial="sidebar"
        />
        
        <main className="flex-1 overflow-auto" data-tutorial="main-content">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isVisible={isVisible}
        currentStep={currentStep}
        steps={steps}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={skipTutorial}
        onClose={closeTutorial}
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="editor">
      <TutorialProvider>
        <DashboardContent>
          {children}
        </DashboardContent>
      </TutorialProvider>
    </ProtectedRoute>
  );
}