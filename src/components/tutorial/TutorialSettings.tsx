'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, RotateCcw, Play, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTutorial } from '@/contexts/TutorialContext';
import { useAuthStore } from '@/lib/auth';
import { 
  getTutorialStepsForRole, 
  resetAllTutorials,
  TUTORIAL_SECTIONS,
  shouldShowSectionTutorial,
  markSectionTutorialCompleted,
  type TutorialSection
} from '@/data/tutorialSteps';

interface TutorialSettingsProps {
  currentSection?: TutorialSection;
  className?: string;
}

export const TutorialSettings: React.FC<TutorialSettingsProps> = ({
  currentSection = 'dashboard',
  className = ''
}) => {
  const { user } = useAuthStore();
  const { startTutorial, shouldShowTutorial, resetTutorial } = useTutorial();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!user) return null;

  const handleStartTutorial = (section: TutorialSection) => {
    const steps = getTutorialStepsForRole(user.role, section);
    if (steps.length > 0) {
      startTutorial(steps);
      setIsOpen(false);
    }
  };

  const handleResetAllTutorials = () => {
    resetAllTutorials(user.id);
    resetTutorial();
    setIsOpen(false);
  };

  const getAvailableSections = () => {
    return TUTORIAL_SECTIONS.filter(section => {
      // Users section only for admins
      if (section === 'users' && !['admin', 'superadmin'].includes(user.role)) {
        return false;
      }
      return true;
    });
  };

  const getSectionDisplayName = (section: TutorialSection) => {
    const names = {
      dashboard: 'Dashboard Overview',
      posts: 'Posts Management',
      pages: 'Pages Management', 
      media: 'Media Library',
      users: 'User Management'
    };
    return names[section];
  };

  const getSectionDescription = (section: TutorialSection) => {
    const descriptions = {
      dashboard: 'Learn the basics of navigating your CMS dashboard',
      posts: 'Discover how to create, edit, and manage blog posts',
      pages: 'Master static page creation and management',
      media: 'Understand the media library and file management',
      users: 'Learn user management and role permissions'
    };
    return descriptions[section];
  };

  const availableSections = getAvailableSections();

  return (
    <div className={`relative ${className}`}>
      {/* Tutorial trigger button - always visible */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        title="Tutorial & Help"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Tutorial</span>
      </Button>

      {/* Tutorial settings dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Tutorial & Help
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose a tutorial to get started or reset your progress
            </p>
          </div>

          <div className="p-2 max-h-80 overflow-y-auto">
            {/* Current section quick start */}
            {currentSection && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Current Section
                  </span>
                  <Button
                    onClick={() => handleStartTutorial(currentSection)}
                    size="sm"
                    variant="outline"
                    className="text-xs flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Start</span>
                  </Button>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {getSectionDisplayName(currentSection)}
                </p>
              </div>
            )}

            {/* All available tutorials */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 py-1">
                Available Tutorials
              </h4>
              
              {availableSections.map((section) => {
                const isCompleted = !shouldShowSectionTutorial(section, user.id, user.role);
                
                return (
                  <div
                    key={section}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {getSectionDisplayName(section)}
                        </p>
                        {isCompleted && (
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {getSectionDescription(section)}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => handleStartTutorial(section)}
                      size="sm"
                      variant="ghost"
                      className="ml-2 flex items-center space-x-1 text-xs"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleResetAllTutorials}
              variant="ghost"
              size="sm"
              className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Tutorials</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TutorialSettings;