import React, { useRef, useEffect } from 'react';
import { MemoryTraceEntry, Variable } from '../../interpreter/types';

interface MemoryStateSnapshot {
  memoryState: Map<number, any>;
  memoryMetadata: Map<string, any>;
  variableAddresses: Map<string, number>;
  variables: Map<string, Variable>;
  allocations: Array<{ address: number; size: number; type: string; variable?: string }>;
}

interface MemoryStateManagerProps {
  traceLog: MemoryTraceEntry[];
  variables: Map<string, Variable>;
  onStateUpdate?: (frame: number, state: MemoryStateSnapshot) => void;
}

// Utility class for managing memory states across frames
export class MemoryStateManager {
  private traceLog: MemoryTraceEntry[];
  private variables: Map<string, Variable>;
  private stateCache: Map<number, MemoryStateSnapshot> = new Map();
  private maxCacheSize: number;

  constructor(traceLog: MemoryTraceEntry[], variables: Map<string, Variable>, maxCacheSize: number = 50) {
    this.traceLog = traceLog;
    this.variables = new Map(variables);
    this.maxCacheSize = maxCacheSize;
  }

  // Get memory state at a specific frame
  getStateAtFrame(frameNumber: number): MemoryStateSnapshot {
    // Check cache first
    if (this.stateCache.has(frameNumber)) {
      return this.stateCache.get(frameNumber)!;
    }

    // Find the closest cached frame below the requested frame
    let startFrame = -1;
    let startState: MemoryStateSnapshot | null = null;

    for (let i = frameNumber - 1; i >= 0; i--) {
      if (this.stateCache.has(i)) {
        startFrame = i;
        startState = this.stateCache.get(i)!;
        break;
      }
    }

    // If no cached state found, start from scratch
    if (!startState) {
      startState = {
        memoryState: new Map<number, any>(),
        memoryMetadata: new Map<string, any>(),
        variableAddresses: new Map<string, number>(),
        variables: new Map(this.variables),
        allocations: []
      };
      startFrame = -1;
    }

    // Process operations from startFrame to frameNumber
    const finalState = this.processOperations(
      startState,
      startFrame + 1,
      frameNumber
    );

    // Cache the result
    this.cacheState(frameNumber, finalState);

    return finalState;
  }

  // Process operations between fromFrame and toFrame (inclusive)
  private processOperations(
    startState: MemoryStateSnapshot,
    fromFrame: number,
    toFrame: number
  ): MemoryStateSnapshot {
    const memoryState = new Map(startState.memoryState);
    const memoryMetadata = new Map(startState.memoryMetadata);
    const variableAddresses = new Map(startState.variableAddresses);
    const allocations = [...startState.allocations];
    const variables = new Map(startState.variables);

    for (let i = fromFrame; i <= toFrame && i < this.traceLog.length; i++) {
      const operation = this.traceLog[i];
      this.processOperation(operation, memoryState, memoryMetadata, variableAddresses, allocations, variables);
    }

    return {
      memoryState,
      memoryMetadata,
      variableAddresses,
      variables,
      allocations
    };
  }

  // Process a single operation
  private processOperation(
    operation: MemoryTraceEntry,
    memoryState: Map<number, any>,
    memoryMetadata: Map<string, any>,
    variableAddresses: Map<string, number>,
    allocations: Array<{ address: number; size: number; type: string; variable?: string }>,
    variables: Map<string, Variable>
  ): void {
    switch (operation.operation) {
      case 'DECLARE':
        if (operation.address !== undefined && operation.variable) {
          const variable = variables.get(operation.variable);
          if (variable) {
            variableAddresses.set(operation.variable, operation.address);

            // Handle regular variable declaration
            if (variable.type !== 'ARRAY') {
              memoryState.set(operation.address, variable.value);
              allocations.push({
                address: operation.address,
                size: this.getDataTypeSize(variable.type),
                type: variable.type,
                variable: operation.variable
              });
            }
            // Handle array declaration
            else if (variable.dimensions && variable.elementType) {
              const elementSize = this.getDataTypeSize(variable.elementType);
              const totalElements = variable.dimensions.reduce(
                (acc, dim) => acc * (dim.upper - dim.lower + 1), 1
              );
              const totalSize = elementSize * totalElements;

              allocations.push({
                address: operation.address,
                size: totalSize,
                type: variable.type,
                variable: operation.variable
              });

              // Initialize array elements
              for (let i = 0; i < totalElements; i++) {
                const elementAddress = operation.address + (i * elementSize);
                const value = variable.value ? variable.value[i] : undefined;
                memoryState.set(elementAddress, value);
              }
            }
          }
        }
        break;

      case 'WRITE':
        if (operation.address !== undefined) {
          // Store old value for potential undo/visualization
          const oldValue = memoryState.get(operation.address);
          if (operation.metadata) {
            operation.metadata.oldValue = oldValue;
          }

          memoryState.set(operation.address, operation.value);
        }
        break;

      case 'ALLOCATE':
        if (operation.address !== undefined) {
          const size = operation.metadata?.size || 1;
          allocations.push({
            address: operation.address,
            size,
            type: operation.metadata?.type || 'ALLOCATED',
            variable: operation.variable
          });
        }
        break;

      case 'FREE':
        if (operation.address !== undefined) {
          // Find and remove allocation
          const index = allocations.findIndex(alloc => alloc.address === operation.address);
          if (index !== -1) {
            allocations.splice(index, 1);
          }

          // Clear memory state for freed memory
          const alloc = allocations.find(a => a.address === operation.address);
          if (alloc) {
            for (let i = 0; i < alloc.size; i++) {
              memoryState.delete(operation.address + i);
            }
          }
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
          // Store old target for visualization
          const oldTarget = memoryState.get(operation.pointerAddress);
          if (operation.metadata) {
            operation.metadata.oldTarget = oldTarget;
          }

          memoryState.set(operation.pointerAddress, operation.address);
        }
        break;

      case 'READ':
        // Read operations don't change state but can be tracked for visualization
        if (operation.address !== undefined) {
          memoryMetadata.set(`${operation.address}_last_read`, operation.timestamp);
        }
        break;

      case 'DEREFERENCE':
        // Track dereference operations for visualization
        if (operation.pointerAddress !== undefined && operation.address !== undefined) {
          memoryMetadata.set(`${operation.pointerAddress}_last_deref`, operation.address);
        }
        break;
    }
  }

  // Get the size in bytes for a data type
  private getDataTypeSize(dataType: string): number {
    switch (dataType) {
      case 'INTEGER':
      case 'POINTER_TO_INTEGER':
      case 'POINTER_TO_REAL':
      case 'POINTER_TO_CHAR':
      case 'VOID_POINTER':
        return 4;
      case 'REAL':
        return 8;
      case 'CHAR':
        return 1;
      case 'BOOLEAN':
        return 1;
      case 'STRING':
        return 32; // Variable, but use a reasonable default
      default:
        return 4;
    }
  }

  // Cache a state snapshot
  private cacheState(frameNumber: number, state: MemoryStateSnapshot): void {
    // Remove oldest entries if cache is too large
    if (this.stateCache.size >= this.maxCacheSize) {
      const oldestFrames = Array.from(this.stateCache.keys())
        .sort((a, b) => a - b)
        .slice(0, Math.floor(this.maxCacheSize / 2));

      oldestFrames.forEach(frame => this.stateCache.delete(frame));
    }

    this.stateCache.set(frameNumber, {
      memoryState: new Map(state.memoryState),
      memoryMetadata: new Map(state.memoryMetadata),
      variableAddresses: new Map(state.variableAddresses),
      variables: new Map(state.variables),
      allocations: [...state.allocations]
    });
  }

  // Get memory usage statistics
  getMemoryStats(frameNumber: number): {
    totalAllocations: number;
    totalMemoryUsed: number;
    variableCount: number;
  } {
    const state = this.getStateAtFrame(frameNumber);

    const totalMemoryUsed = state.allocations.reduce(
      (total, alloc) => total + alloc.size, 0
    );

    return {
      totalAllocations: state.allocations.length,
      totalMemoryUsed,
      variableCount: state.variableAddresses.size
    };
  }

  // Clear all cached states
  clearCache(): void {
    this.stateCache.clear();
  }

  // Update trace log and clear cache
  updateTraceLog(newTraceLog: MemoryTraceEntry[], newVariables?: Map<string, Variable>): void {
    this.traceLog = newTraceLog;
    if (newVariables) {
      this.variables = new Map(newVariables);
    }
    this.clearCache();
  }
}

// React component wrapper
export const MemoryStateManagerComponent: React.FC<MemoryStateManagerProps> = ({
  traceLog,
  variables
}) => {
  const managerRef = useRef<MemoryStateManager | null>(null);

  useEffect(() => {
    managerRef.current = new MemoryStateManager(traceLog, variables);
  }, [traceLog, variables]);

  // This component doesn't render anything - it's a utility

  return null;
};