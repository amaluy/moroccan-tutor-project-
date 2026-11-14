'use client';

import { useState, useCallback, useRef } from 'react';

export interface BehaviorMetrics {
  interactions: string[];
  timeSpentSeconds: number;
}

export function useStudentTracker() {
  const startTimeRef = useRef<number>(Date.now());
  const [interactions, setInteractions] = useState<string[]>([]);

  const trackInteraction = useCallback((action: string) => {
    setInteractions((prev) => (prev.includes(action) ? prev : [...prev, action]));
  }, []);

  const calculateFinalScore = useCallback(() => {
    const timeSpentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    // Base score of 50 + 15 per meaningful click + up to 20 points for reading time
    const interactionPoints = interactions.length * 15;
    const timePoints = Math.min(20, Math.floor(timeSpentSeconds / 3));
    return Math.min(100, 50 + interactionPoints + timePoints);
  }, [interactions]);

  const metrics: BehaviorMetrics = {
    interactions,
    timeSpentSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
  };

  return {
    metrics,
    trackInteraction,
    calculateFinalScore,
  };
}