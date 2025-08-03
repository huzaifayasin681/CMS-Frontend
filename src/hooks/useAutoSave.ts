import { useEffect, useRef, useState } from 'react';
import { showToast } from '@/components/ui/Toast';

interface AutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  key?: string;
}

interface AutoSaveReturn {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  saveNow: () => Promise<void>;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
}

export const useAutoSave = ({
  data,
  onSave,
  delay = 3000,
  enabled = true,
  key = 'default'
}: AutoSaveOptions): AutoSaveReturn => {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(enabled);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>('');
  const saveCountRef = useRef(0);

  // Initialize with current data
  useEffect(() => {
    lastDataRef.current = JSON.stringify(data);
  }, []);

  const saveNow = async () => {
    if (!data || isAutoSaving) return;

    setIsAutoSaving(true);
    try {
      await onSave(data);
      setLastSaved(new Date());
      lastDataRef.current = JSON.stringify(data);
      saveCountRef.current += 1;
    } catch (error) {
      console.error('Auto-save failed:', error);
      showToast.error('Failed to auto-save content');
      throw error;
    } finally {
      setIsAutoSaving(false);
    }
  };

  const enableAutoSave = () => setAutoSaveEnabled(true);
  const disableAutoSave = () => setAutoSaveEnabled(false);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !data) return;

    const currentDataString = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (currentDataString === lastDataRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveNow();
      } catch (error) {
        // Error already handled in saveNow
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, autoSaveEnabled, delay, onSave]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAutoSaving,
    lastSaved,
    saveNow,
    enableAutoSave,
    disableAutoSave
  };
};