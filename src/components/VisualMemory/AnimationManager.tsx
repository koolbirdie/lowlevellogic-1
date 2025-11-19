import React, { useEffect, useState, useRef } from 'react';
import { MemoryTraceEntry, AnimationEvent } from '../../interpreter/types';

interface AnimationManagerProps {
  traceLog: MemoryTraceEntry[];
  currentFrame: number;
  onAnimationEvent?: (event: AnimationEvent) => void;
  onAnimationComplete?: () => void;
}

interface QueuedAnimation {
  event: AnimationEvent;
  timeoutId: number;
}

const AnimationManager: React.FC<AnimationManagerProps> = ({
  traceLog,
  currentFrame,
  onAnimationEvent,
  onAnimationComplete
}) => {
  const [activeAnimations, setActiveAnimations] = useState<Map<string, QueuedAnimation>>(new Map());
  const previousFrameRef = useRef<number>(currentFrame);
  const isAnimatingRef = useRef<boolean>(false);

  // Generate animation events based on trace entries
  const generateAnimationEvents = (fromFrame: number, toFrame: number): AnimationEvent[] => {
    const events: AnimationEvent[] = [];

    // Get trace entries between frames
    const entriesToProcess = traceLog.slice(fromFrame, toFrame + 1);

    for (const entry of entriesToProcess) {
      switch (entry.operation) {
        case 'DECLARE':
          if (entry.address !== undefined && entry.variable) {
            events.push({
              type: 'CREATE',
              target: 'MEMORY_CELL',
              address: entry.address,
              variable: entry.variable,
              toValue: entry.value,
              duration: 400,
              easing: 'ease-out'
            });

            if (entry.metadata?.isArray) {
              events.push({
                type: 'CREATE',
                target: 'ARRAY_BLOCK',
                address: entry.address,
                variable: entry.variable,
                toValue: entry.metadata,
                duration: 600,
                easing: 'ease-out'
              });
            }
          }
          break;

        case 'WRITE':
          if (entry.address !== undefined) {
            events.push({
              type: 'UPDATE',
              target: 'MEMORY_CELL',
              address: entry.address,
              variable: entry.variable,
              fromValue: entry.metadata?.oldValue,
              toValue: entry.value,
              duration: 300,
              easing: 'ease-in-out'
            });

            events.push({
              type: 'HIGHLIGHT',
              target: 'MEMORY_CELL',
              address: entry.address,
              toValue: entry.value,
              duration: 600,
              easing: 'ease-out'
            });
          }
          break;

        case 'READ':
          if (entry.address !== undefined) {
            events.push({
              type: 'HIGHLIGHT',
              target: 'MEMORY_CELL',
              address: entry.address,
              toValue: entry.value,
              duration: 400,
              easing: 'ease-in-out'
            });
          }
          break;

        case 'ALLOCATE':
          if (entry.address !== undefined) {
            events.push({
              type: 'CREATE',
              target: 'MEMORY_CELL',
              address: entry.address,
              variable: entry.variable,
              toValue: entry.metadata?.size,
              duration: 500,
              easing: 'ease-out'
            });
          }
          break;

        case 'FREE':
          if (entry.address !== undefined) {
            events.push({
              type: 'DELETE',
              target: 'MEMORY_CELL',
              address: entry.address,
              variable: entry.variable,
              duration: 400,
              easing: 'ease-in'
            });
          }
          break;

        case 'ADDRESS_OF':
          if (entry.pointerAddress !== undefined && entry.address !== undefined && entry.variable) {
            events.push({
              type: 'CREATE',
              target: 'POINTER_ARROW',
              address: entry.pointerAddress,
              variable: entry.variable,
              toValue: entry.address,
              duration: 600,
              easing: 'ease-out'
            });
          }
          break;

        case 'DEREFERENCE':
          if (entry.address !== undefined) {
            events.push({
              type: 'HIGHLIGHT',
              target: 'MEMORY_CELL',
              address: entry.address,
              toValue: entry.value,
              duration: 500,
              easing: 'ease-in-out'
            });
          }
          break;

        case 'POINTER_ASSIGN':
          if (entry.pointerAddress !== undefined && entry.address !== undefined && entry.variable) {
            events.push({
              type: 'ARROW_MOVE',
              target: 'POINTER_ARROW',
              address: entry.pointerAddress,
              variable: entry.variable,
              fromValue: entry.metadata?.oldTarget,
              toValue: entry.address,
              duration: 800,
              easing: 'ease-in-out'
            });
          }
          break;
      }
    }

    return events;
  };

  // Clear all active animations
  const clearAnimations = () => {
    activeAnimations.forEach((animation) => {
      clearTimeout(animation.timeoutId);
    });
    setActiveAnimations(new Map());
    isAnimatingRef.current = false;
  };

  // Execute animation event
  const executeAnimation = (event: AnimationEvent, delay: number = 0) => {
    const animationKey = `${event.target}-${event.address || event.variable}-${Date.now()}`;

    const timeoutId = window.setTimeout(() => {
      onAnimationEvent?.(event);

      // Remove from active animations
      setActiveAnimations(prev => {
        const newMap = new Map(prev);
        newMap.delete(animationKey);
        return newMap;
      });

      // Check if this was the last animation
      setTimeout(() => {
        if (activeAnimations.size <= 1) { // 1 because we haven't removed this one yet
          isAnimatingRef.current = false;
          onAnimationComplete?.();
        }
      }, 100);
    }, delay);

    // Add to active animations
    setActiveAnimations(prev => {
      const newMap = new Map(prev);
      newMap.set(animationKey, {
        event,
        timeoutId
      });
      return newMap;
    });

    isAnimatingRef.current = true;
  };

  // Handle frame changes
  useEffect(() => {
    if (previousFrameRef.current === currentFrame) {
      return; // No change
    }

    const previousFrame = previousFrameRef.current;
    previousFrameRef.current = currentFrame;

    // Clear existing animations
    clearAnimations();

    // Determine animation direction
    const isForward = currentFrame > previousFrame;
    const fromFrame = Math.min(previousFrame, currentFrame);
    const toFrame = Math.max(previousFrame, currentFrame);

    // Generate animation events
    const events = generateAnimationEvents(fromFrame, toFrame);

    // If going backward, don't animate (instant update)
    if (!isForward) {
      events.forEach(event => {
        onAnimationEvent?.(event);
      });
      return;
    }

    // Execute animations with delays for smooth playback
    let cumulativeDelay = 0;
    events.forEach((event) => {
      // Stagger animations slightly
      const delay = cumulativeDelay;
      executeAnimation(event, delay);

      // Add small delay between concurrent animations
      cumulativeDelay += Math.min(100, event.duration / 4);
    });
  }, [currentFrame, traceLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAnimations();
    };
  }, []);

  // This component doesn't render anything - it's purely for animation management
  return null;
};

export default AnimationManager;