import React, { useRef, useEffect } from 'react';
import { MemoryTraceEntry, VisualFrame } from '../../interpreter/types';

interface FrameExtractorProps {
  traceLog: MemoryTraceEntry[];
  onFramesExtracted?: (frames: VisualFrame[]) => void;
}

// Utility class for extracting frames from trace logs
export class FrameExtractor {
  private traceLog: MemoryTraceEntry[];
  private cache: Map<number, VisualFrame> = new Map();

  constructor(traceLog: MemoryTraceEntry[]) {
    this.traceLog = traceLog;
  }

  // Extract all frames from the trace log
  extractAllFrames(): VisualFrame[] {
    const frames: VisualFrame[] = [];

    for (let i = 0; i < this.traceLog.length; i++) {
      const frame = this.extractFrame(i);
      if (frame) {
        frames.push(frame);
      }
    }

    return frames;
  }

  // Extract a specific frame at the given trace index
  extractFrame(traceIndex: number): VisualFrame | null {
    // Check cache first
    if (this.cache.has(traceIndex)) {
      return this.cache.get(traceIndex)!;
    }

    if (traceIndex < 0 || traceIndex >= this.traceLog.length) {
      return null;
    }

    // Rebuild memory state up to this point
    const memoryState = new Map<number, any>();
    const variableAddresses = new Map<string, number>();
    const operations = this.traceLog.slice(0, traceIndex + 1);

    // Process operations in order to build state
    for (const operation of operations) {
      this.processOperation(operation, memoryState, variableAddresses);
    }

    const frame: VisualFrame = {
      frameNumber: traceIndex,
      memoryState: new Map(memoryState),
      variableAddresses: new Map(variableAddresses),
      operations: [...operations],
      timestamp: operations[operations.length - 1]?.timestamp || Date.now()
    };

    // Cache the frame
    this.cache.set(traceIndex, frame);

    return frame;
  }

  // Process a single operation to update memory state
  private processOperation(
    operation: MemoryTraceEntry,
    memoryState: Map<number, any>,
    variableAddresses: Map<string, number>
  ): void {
    switch (operation.operation) {
      case 'DECLARE':
        if (operation.address !== undefined && operation.variable) {
          variableAddresses.set(operation.variable, operation.address);
          if (operation.value !== undefined) {
            memoryState.set(operation.address, operation.value);
          }

          // Handle array declarations
          if (operation.metadata?.isArray && operation.metadata?.elements) {
            const elementSize = operation.metadata.elementSize || 4;
            for (let i = 0; i < operation.metadata.elements; i++) {
              const elementAddress = operation.address + (i * elementSize);
              if (operation.metadata.values && operation.metadata.values[i] !== undefined) {
                memoryState.set(elementAddress, operation.metadata.values[i]);
              }
            }
          }
        }
        break;

      case 'WRITE':
        if (operation.address !== undefined) {
          memoryState.set(operation.address, operation.value);
        }
        break;

      case 'READ':
        // Read operations don't change state, but we can track reads for visualization
        if (operation.address !== undefined) {
          // Store read metadata if needed
          memoryState.set(`${operation.address}_read_at`, operation.timestamp);
        }
        break;

      case 'ALLOCATE':
        if (operation.address !== undefined) {
          // Mark memory as allocated
          memoryState.set(`${operation.address}_allocated`, true);
          memoryState.set(`${operation.address}_size`, operation.metadata?.size || 1);
        }
        break;

      case 'FREE':
        if (operation.address !== undefined) {
          // Clear allocated memory
          memoryState.delete(`${operation.address}_allocated`);
          memoryState.delete(`${operation.address}_size`);
          // Also clear the actual value
          memoryState.delete(operation.address);
        }
        break;

      case 'ADDRESS_OF':
        if (operation.pointerAddress !== undefined && operation.address !== undefined && operation.variable) {
          variableAddresses.set(operation.variable, operation.pointerAddress);
          memoryState.set(operation.pointerAddress, operation.address);
        }
        break;

      case 'POINTER_ASSIGN':
        if (operation.pointerAddress !== undefined && operation.address !== undefined) {
          memoryState.set(operation.pointerAddress, operation.address);
        }
        break;

      case 'DEREFERENCE':
        // Dereference operations don't change the pointer value itself
        // But they can be used for visualization purposes
        if (operation.pointerAddress !== undefined && operation.address !== undefined) {
          memoryState.set(`${operation.pointerAddress}_dereferenced_to`, operation.address);
        }
        break;
    }
  }

  // Get the difference between two frames
  getFrameDifference(fromFrame: number, toFrame: number): MemoryTraceEntry[] {
    if (fromFrame < 0 || toFrame >= this.traceLog.length || fromFrame > toFrame) {
      return [];
    }

    return this.traceLog.slice(fromFrame, toFrame + 1);
  }

  // Find all operations that affected a specific memory address
  getOperationsForAddress(address: number): MemoryTraceEntry[] {
    return this.traceLog.filter(operation =>
      operation.address === address || operation.pointerAddress === address
    );
  }

  // Find all operations that affected a specific variable
  getOperationsForVariable(variableName: string): MemoryTraceEntry[] {
    return this.traceLog.filter(operation =>
      operation.variable === variableName
    );
  }

  // Group operations by execution line
  getOperationsByLine(): Map<number, MemoryTraceEntry[]> {
    const operationsByLine = new Map<number, MemoryTraceEntry[]>();

    for (const operation of this.traceLog) {
      const line = operation.line;
      if (!operationsByLine.has(line)) {
        operationsByLine.set(line, []);
      }
      operationsByLine.get(line)!.push(operation);
    }

    return operationsByLine;
  }

  // Get memory state at any point in time
  getMemoryStateAtFrame(frameNumber: number): Map<number, any> {
    const frame = this.extractFrame(frameNumber);
    return frame ? frame.memoryState : new Map();
  }

  // Get variable addresses at any point in time
  getVariableAddressesAtFrame(frameNumber: number): Map<string, number> {
    const frame = this.extractFrame(frameNumber);
    return frame ? frame.variableAddresses : new Map();
  }

  // Clear the cache (useful when trace log changes)
  clearCache(): void {
    this.cache.clear();
  }

  // Update the trace log and clear cache
  updateTraceLog(newTraceLog: MemoryTraceEntry[]): void {
    this.traceLog = newTraceLog;
    this.clearCache();
  }
}

// React component wrapper
const FrameExtractorComponent: React.FC<FrameExtractorProps> = ({
  traceLog,
  onFramesExtracted
}) => {
  const extractorRef = useRef<FrameExtractor | null>(null);

  useEffect(() => {
    extractorRef.current = new FrameExtractor(traceLog);

    // Extract all frames and pass to parent
    if (onFramesExtracted && extractorRef.current) {
      const frames = extractorRef.current.extractAllFrames();
      onFramesExtracted(frames);
    }
  }, [traceLog, onFramesExtracted]);

  // This component doesn't render anything - it's a utility
  return null;
};

export default FrameExtractorComponent;