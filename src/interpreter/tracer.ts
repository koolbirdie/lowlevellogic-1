/**
 * Memory trace system for low-level algorithm research environment
 * Tracks all memory operations for debugging and analysis with enhanced visual support
 */

import { MemoryTraceEntry, Variable } from './types';
import { MemoryEngine } from './memory';

export class MemoryTracer {
  private traceLog: MemoryTraceEntry[];
  private stepCounter: number;
  private startTime: number;
  private variableStates: Map<string, any>; // Track variable states for visual diff

  constructor() {
    this.traceLog = [];
    this.stepCounter = 0;
    this.startTime = Date.now();
    this.variableStates = new Map();
  }

  /**
   * Add a trace entry for a memory operation
   */
  addEntry(
    operation: MemoryTraceEntry['operation'],
    line: number,
    data: {
      address?: number;
      value?: any;
      variable?: string;
      pointerAddress?: number;
      metadata?: any;
    }
  ): void {
    this.traceLog.push({
      step: ++this.stepCounter,
      operation,
      line,
      timestamp: Date.now() - this.startTime,
      ...data
    });
  }

  /**
   * Log variable declaration
   */
<<<<<<< HEAD
  logDeclare(line: number, variable: string, address: number, type: string, variableData?: Variable): void {
    const isArray = type === 'ARRAY';
    let metadata: any = { type, isArray };

    if (isArray && variableData) {
      // Enhanced array metadata for visualization
      metadata = {
        type,
        isArray: true,
        elementType: variableData.elementType,
        dimensions: variableData.dimensions,
        elementSize: this.getElementTypeSize(variableData.elementType),
        elements: variableData.dimensions?.reduce((acc, dim) =>
          acc * (dim.upper - dim.lower + 1), 1) || 0,
        values: variableData.value
      };
    }

=======
  logDeclare(line: number, variable: string, address: number, type: string): void {
    console.log(`[TRACE] DECLARE: line=${line}, variable=${variable}, address=${address}, type=${type}`);
>>>>>>> main
    this.addEntry('DECLARE', line, {
      variable,
      address,
      value: variableData?.value,
      metadata
    });
  }

  /**
   * Log memory write operation
   */
<<<<<<< HEAD
  logWrite(line: number, address: number, value: any, variable?: string, oldValue?: any): void {
    const metadata: any = {};
    if (oldValue !== undefined) {
      metadata.oldValue = oldValue;
      metadata.valueChanged = oldValue !== value;
    }

    // Track variable state for animation
    if (variable) {
      const oldState = this.variableStates.get(variable);
      metadata.oldVariableState = oldState;
      this.variableStates.set(variable, value);
    }

=======
  logWrite(line: number, address: number, value: any, variable?: string): void {
    console.log(`[TRACE] WRITE: line=${line}, address=${address}, value=${value}, variable=${variable || 'undefined'}`);
>>>>>>> main
    this.addEntry('WRITE', line, {
      address,
      value,
      variable,
      metadata
    });
  }

  /**
   * Log memory read operation
   */
  logRead(line: number, address: number, value: any, variable?: string): void {
    this.addEntry('READ', line, {
      address,
      value,
      variable
    });
  }

  /**
   * Log memory allocation
   */
  logAllocate(line: number, address: number, size: number, type: string): void {
    this.addEntry('ALLOCATE', line, {
      address,
      metadata: { size, type }
    });
  }

  /**
   * Log memory deallocation
   */
  logFree(line: number, address: number): void {
    this.addEntry('FREE', line, {
      address
    });
  }

  /**
   * Log address-of operation (&)
   */
<<<<<<< HEAD
  logAddressOf(line: number, variable: string, address: number, pointerAddress: number): void {
=======
  logAddressOf(line: number, variable: string, address: number): void {
    console.log(`[TRACE] ADDRESS_OF: line=${line}, variable=${variable}, address=${address}`);
>>>>>>> main
    this.addEntry('ADDRESS_OF', line, {
      variable,
      address,
      pointerAddress,
      metadata: {
        isPointerCreation: true,
        targetVariable: variable
      }
    });
  }

  /**
   * Log pointer dereference operation (*)
   */
  logDereference(line: number, pointerAddress: number, value: any, targetAddress: number): void {
    this.addEntry('DEREFERENCE', line, {
      pointerAddress,
      value,
      address: targetAddress,
      metadata: {
        isDereference: true,
        targetAddress
      }
    });
  }

  /**
   * Log pointer assignment
   */
  logPointerAssign(line: number, variable: string, address: number, pointerAddress: number, oldTarget?: number): void {
    this.addEntry('POINTER_ASSIGN', line, {
      variable,
      address,
      pointerAddress,
      metadata: {
        oldTarget,
        isNewTarget: oldTarget !== address,
        isPointerReassignment: oldTarget !== undefined
      }
    });
  }

  /**
   * Generate a comprehensive trace report
   */
  generateReport(): string {
    let report = "MEMORY TRACE REPORT\n";
    report += "==================\n\n";

    // Summary statistics
    const stats = this.getStatistics();
    report += `Total Operations: ${stats.total}\n`;
    report += `Variables Declared: ${stats.declares}\n`;
    report += `Memory Writes: ${stats.writes}\n`;
    report += `Memory Reads: ${stats.reads}\n`;
    report += `Allocations: ${stats.allocations}\n`;
    report += `Deallocations: ${stats.frees}\n`;
    report += `Pointer Operations: ${stats.pointerOps}\n\n`;

    // Detailed trace log
    report += "DETAILED TRACE LOG\n";
    report += "-------------------\n\n";

    for (const entry of this.traceLog) {
      report += `Step ${entry.step}: ${entry.operation} (Line ${entry.line})\n`;

      if (entry.variable !== undefined) {
        report += `  Variable: ${entry.variable}\n`;
      }

      if (entry.address !== undefined) {
        report += `  Address: 0x${entry.address.toString(16).toUpperCase()}\n`;
      }

      if (entry.value !== undefined) {
        report += `  Value: ${entry.value}\n`;
      }

      if (entry.pointerAddress !== undefined) {
        report += `  Pointer Address: 0x${entry.pointerAddress.toString(16).toUpperCase()}\n`;
      }

      if (entry.metadata !== undefined) {
        report += `  Metadata: ${JSON.stringify(entry.metadata)}\n`;
      }

      report += `  Timestamp: ${entry.timestamp}ms\n`;
      report += "\n";
    }

    return report;
  }

  /**
   * Generate hex dump of current memory state
   */
  generateMemoryDump(memory: MemoryEngine, startAddress: number = 1024, size: number = 256): string {
    return memory.generateHexDump(startAddress, size);
  }

  /**
   * Get trace statistics
   */
  getStatistics(): {
    total: number;
    declares: number;
    writes: number;
    reads: number;
    allocations: number;
    frees: number;
    pointerOps: number;
  } {
    const stats = {
      total: this.traceLog.length,
      declares: 0,
      writes: 0,
      reads: 0,
      allocations: 0,
      frees: 0,
      pointerOps: 0
    };

    for (const entry of this.traceLog) {
      switch (entry.operation) {
        case 'DECLARE':
          stats.declares++;
          break;
        case 'WRITE':
          stats.writes++;
          break;
        case 'READ':
          stats.reads++;
          break;
        case 'ALLOCATE':
          stats.allocations++;
          break;
        case 'FREE':
          stats.frees++;
          break;
        case 'ADDRESS_OF':
        case 'DEREFERENCE':
        case 'POINTER_ASSIGN':
          stats.pointerOps++;
          break;
      }
    }

    return stats;
  }

  /**
   * Get trace entries for a specific variable
   */
  getVariableTrace(variableName: string): MemoryTraceEntry[] {
    return this.traceLog.filter(entry => entry.variable === variableName);
  }

  /**
   * Get trace entries for a specific memory address
   */
  getAddressTrace(address: number): MemoryTraceEntry[] {
    return this.traceLog.filter(entry =>
      entry.address === address || entry.pointerAddress === address
    );
  }

  /**
   * Get operations within a step range
   */
  getOperationsByStepRange(startStep: number, endStep: number): MemoryTraceEntry[] {
    return this.traceLog.filter(entry =>
      entry.step >= startStep && entry.step <= endStep
    );
  }

  /**
   * Get operations within a line range
   */
  getOperationsByLineRange(startLine: number, endLine: number): MemoryTraceEntry[] {
    return this.traceLog.filter(entry =>
      entry.line >= startLine && entry.line <= endLine
    );
  }

  /**
   * Export trace log as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify({
      metadata: {
        totalSteps: this.stepCounter,
        duration: Date.now() - this.startTime,
        statistics: this.getStatistics()
      },
      traceLog: this.traceLog
    }, null, 2);
  }

  /**
   * Get the complete trace log
   */
  getTraceLog(): MemoryTraceEntry[] {
    console.log(`[TRACE] getTraceLog called, returning ${this.traceLog.length} entries`);
    return [...this.traceLog];
  }

  /**
   * Check if tracing is enabled
   */
  isEnabled(): boolean {
    return true; // Always enabled in this implementation
  }

  /**
   * Get element type size in bytes for array calculations
   */
  private getElementTypeSize(elementType?: string): number {
    if (!elementType) return 4; // Default size

    switch (elementType) {
      case 'INTEGER':
      case 'POINTER_TO_INTEGER':
      case 'POINTER_TO_REAL':
      case 'POINTER_TO_CHAR':
      case 'VOID_POINTER':
        return 4;
      case 'REAL':
        return 8;
      case 'CHAR':
      case 'BOOLEAN':
        return 1;
      case 'STRING':
        return 32; // Variable length, use reasonable default
      default:
        return 4;
    }
  }

  /**
   * Get animation hints for a specific operation
   */
  getAnimationHints(step: number): {
    duration: number;
    easing: string;
    priority: number;
  } | null {
    if (step < 0 || step >= this.traceLog.length) {
      return null;
    }

    const entry = this.traceLog[step];
    const hints: any = {
      duration: 300,
      easing: 'ease-in-out',
      priority: 1
    };

    // Customize hints based on operation type
    switch (entry.operation) {
      case 'DECLARE':
        hints.duration = entry.metadata?.isArray ? 600 : 400;
        hints.easing = 'ease-out';
        hints.priority = 2;
        break;
      case 'WRITE':
        hints.duration = entry.metadata?.valueChanged ? 400 : 200;
        hints.easing = 'ease-in-out';
        hints.priority = 1;
        break;
      case 'ADDRESS_OF':
        hints.duration = 500;
        hints.easing = 'ease-out';
        hints.priority = 2;
        break;
      case 'POINTER_ASSIGN':
        hints.duration = 800;
        hints.easing = 'ease-in-out';
        hints.priority = 3;
        break;
      case 'DEREFERENCE':
        hints.duration = 400;
        hints.easing = 'ease-in-out';
        hints.priority = 1;
        break;
      case 'ALLOCATE':
        hints.duration = 500;
        hints.easing = 'ease-out';
        hints.priority = 2;
        break;
      case 'FREE':
        hints.duration = 300;
        hints.easing = 'ease-in';
        hints.priority = 2;
        break;
    }

    return hints;
  }

  /**
   * Get operations that should be animated together
   */
  getAnimationGroup(step: number): MemoryTraceEntry[] {
    if (step < 0 || step >= this.traceLog.length) {
      return [];
    }

    const entry = this.traceLog[step];
    const group = [entry];

    // Group related operations for smoother animation
    if (entry.operation === 'WRITE' && entry.metadata?.isArray) {
      // Group array element writes
      const line = entry.line;
      for (let i = step + 1; i < this.traceLog.length; i++) {
        const nextEntry = this.traceLog[i];
        if (nextEntry.line === line && nextEntry.operation === 'WRITE') {
          group.push(nextEntry);
        } else {
          break;
        }
      }
    }

    return group;
  }

  /**
   * Clear all state including variable tracking
   */
  clear(): void {
    this.traceLog = [];
    this.stepCounter = 0;
    this.startTime = Date.now();
    this.variableStates.clear();
  }
}