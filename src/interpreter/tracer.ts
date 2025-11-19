/**
 * Memory trace system for low-level algorithm research environment
 * Tracks all memory operations for debugging and analysis
 */

import { MemoryTraceEntry } from './types';
import { MemoryEngine } from './memory';

export class MemoryTracer {
  private traceLog: MemoryTraceEntry[];
  private stepCounter: number;
  private startTime: number;

  constructor() {
    this.traceLog = [];
    this.stepCounter = 0;
    this.startTime = Date.now();
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
  logDeclare(line: number, variable: string, address: number, type: string): void {
    console.log(`[TRACE] DECLARE: line=${line}, variable=${variable}, address=${address}, type=${type}`);
    this.addEntry('DECLARE', line, {
      variable,
      address,
      metadata: { type }
    });
  }

  /**
   * Log memory write operation
   */
  logWrite(line: number, address: number, value: any, variable?: string): void {
    console.log(`[TRACE] WRITE: line=${line}, address=${address}, value=${value}, variable=${variable || 'undefined'}`);
    this.addEntry('WRITE', line, {
      address,
      value,
      variable
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
  logAddressOf(line: number, variable: string, address: number): void {
    console.log(`[TRACE] ADDRESS_OF: line=${line}, variable=${variable}, address=${address}`);
    this.addEntry('ADDRESS_OF', line, {
      variable,
      address
    });
  }

  /**
   * Log pointer dereference operation (*)
   */
  logDereference(line: number, pointerAddress: number, value: any): void {
    this.addEntry('DEREFERENCE', line, {
      pointerAddress,
      value
    });
  }

  /**
   * Log pointer assignment
   */
  logPointerAssign(line: number, variable: string, address: number): void {
    this.addEntry('POINTER_ASSIGN', line, {
      variable,
      address
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
   * Clear the trace log
   */
  clear(): void {
    this.traceLog = [];
    this.stepCounter = 0;
    this.startTime = Date.now();
  }

  /**
   * Get the complete trace log
   */
  getTraceLog(): MemoryTraceEntry[] {
    return [...this.traceLog];
  }

  /**
   * Check if tracing is enabled
   */
  isEnabled(): boolean {
    return true; // Always enabled in this implementation
  }
}