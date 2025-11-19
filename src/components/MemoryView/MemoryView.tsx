/**
 * Memory View Component
 * Displays memory state, variable addresses, and execution trace
 */

import { useState, useMemo } from 'react';
import { MemoryEngine } from '../../interpreter/memory';
import { MemoryTraceEntry, Variable, DebugState } from '../../interpreter/types';
import VisualMemory from '../VisualMemory/VisualMemory';
import styles from './MemoryView.module.css';

interface MemoryViewProps {
  memory: MemoryEngine;
  variableAddresses: Map<string, number>;
  traceLog: MemoryTraceEntry[];
  variables?: Map<string, Variable>;
  debugState?: DebugState | null;
  currentFrame?: number;
  onFrameChange?: (frame: number) => void;
}

interface VariableInfo {
  name: string;
  address: number;
  value: any;
  type: string;
}

export default function MemoryView({
  memory,
  variableAddresses,
  traceLog,
  variables = new Map(),
  currentFrame = 0,
  onFrameChange
}: MemoryViewProps) {
  const [activeTab, setActiveTab] = useState<'variables' | 'memory' | 'trace' | 'visual'>('visual');
  const [memoryStart, setMemoryStart] = useState(1024);

  // Process variable information
  const variableInfo: VariableInfo[] = useMemo(() => {
    const vars: VariableInfo[] = [];

    for (const [name, address] of variableAddresses.entries()) {
      try {
        const allocation = memory.getAllocation(address);
        const value = memory.isAllocated(address) ? memory.read(address) : undefined;
        vars.push({
          name,
          address,
          value,
          type: allocation?.type || 'UNKNOWN'
        });
      } catch (error) {
        // Variable might not be accessible
        vars.push({
          name,
          address,
          value: '<inaccessible>',
          type: 'UNKNOWN'
        });
      }
    }

    return vars.sort((a, b) => a.address - b.address);
  }, [memory, variableAddresses]);

  // Generate memory dump
  const memoryDump = useMemo(() => {
    return memory.generateHexDump(memoryStart, 256);
  }, [memory, memoryStart]);

  // Get recent trace entries
  const recentTrace = useMemo(() => {
    return traceLog.slice(-20).reverse(); // Show last 20 operations
  }, [traceLog]);

  const formatAddress = (address: number): string => {
    return `0x${address.toString(16).toUpperCase().padStart(4, '0')}`;
  };

  const formatValue = (value: any): string => {
    if (value === undefined || value === null) {
      return '<undef>';
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    return String(value);
  };

  const getOperationIcon = (operation: string): string => {
    switch (operation) {
      case 'DECLARE': return '📝';
      case 'WRITE': return '✏️';
      case 'READ': return '👁️';
      case 'ALLOCATE': return '🆕';
      case 'FREE': return '🗑️';
      case 'ADDRESS_OF': return '📍';
      case 'DEREFERENCE': return '🔗';
      case 'POINTER_ASSIGN': return '🔄';
      default: return '❓';
    }
  };

  const navigateMemory = (direction: 'up' | 'down') => {
    setMemoryStart(prev => {
      if (direction === 'up') {
        return Math.max(0, prev - 256);
      } else {
        return Math.min(65535 - 256, prev + 256);
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Memory Debug</h3>
        <div className={styles.stats}>
          <span className={styles.stat}>
            Variables: {variableAddresses.size}
          </span>
          <span className={styles.stat}>
            Operations: {traceLog.length}
          </span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'visual' ? styles.active : ''}`}
          onClick={() => setActiveTab('visual')}
        >
          Visual Memory
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'variables' ? styles.active : ''}`}
          onClick={() => setActiveTab('variables')}
        >
          Variables
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'memory' ? styles.active : ''}`}
          onClick={() => setActiveTab('memory')}
        >
          Memory Dump
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'trace' ? styles.active : ''}`}
          onClick={() => setActiveTab('trace')}
        >
          Trace Log
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'visual' && (
          <div className={styles.visualTab}>
            <VisualMemory
              memory={memory}
              variableAddresses={variableAddresses}
              traceLog={traceLog}
              variables={variables}
              currentFrame={currentFrame}
              onFrameChange={onFrameChange}
            />
          </div>
        )}

        {activeTab === 'variables' && (
          <div className={styles.variablesTab}>
            {variableInfo.length === 0 ? (
              <div className={styles.empty}>No variables declared yet</div>
            ) : (
              <div className={styles.variableList}>
                {variableInfo.map((variable) => (
                  <div key={variable.name} className={styles.variable}>
                    <div className={styles.variableName}>{variable.name}</div>
                    <div className={styles.variableAddress}>
                      {formatAddress(variable.address)}
                    </div>
                    <div className={styles.variableType}>{variable.type}</div>
                    <div className={styles.variableValue}>
                      {formatValue(variable.value)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'memory' && (
          <div className={styles.memoryTab}>
            <div className={styles.memoryControls}>
              <button
                className={styles.memoryNav}
                onClick={() => navigateMemory('up')}
                disabled={memoryStart <= 0}
              >
                ▲ Previous
              </button>
              <span className={styles.memoryRange}>
                {formatAddress(memoryStart)} - {formatAddress(memoryStart + 255)}
              </span>
              <button
                className={styles.memoryNav}
                onClick={() => navigateMemory('down')}
                disabled={memoryStart >= 65535 - 256}
              >
                Next ▼
              </button>
            </div>
            <div className={styles.memoryDump}>
              <pre>{memoryDump}</pre>
            </div>
          </div>
        )}

        {activeTab === 'trace' && (
          <div className={styles.traceTab}>
            {recentTrace.length === 0 ? (
              <div className={styles.empty}>No operations recorded yet</div>
            ) : (
              <div className={styles.traceList}>
                {recentTrace.map((entry, index) => (
                  <div key={index} className={styles.traceEntry}>
                    <div className={styles.traceHeader}>
                      <span className={styles.traceIcon}>
                        {getOperationIcon(entry.operation)}
                      </span>
                      <span className={styles.traceOperation}>
                        {entry.operation}
                      </span>
                      <span className={styles.traceStep}>
                        Step {entry.step}
                      </span>
                      <span className={styles.traceLine}>
                        Line {entry.line}
                      </span>
                    </div>
                    <div className={styles.traceDetails}>
                      {entry.variable && (
                        <span className={styles.traceDetail}>
                          Variable: {entry.variable}
                        </span>
                      )}
                      {entry.address !== undefined && (
                        <span className={styles.traceDetail}>
                          Address: {formatAddress(entry.address)}
                        </span>
                      )}
                      {entry.value !== undefined && (
                        <span className={styles.traceDetail}>
                          Value: {formatValue(entry.value)}
                        </span>
                      )}
                      {entry.pointerAddress !== undefined && (
                        <span className={styles.traceDetail}>
                          Pointer: {formatAddress(entry.pointerAddress)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}