import React, { useState, useEffect } from 'react';
import { MemoryTraceEntry, PointerVisualization } from '../../interpreter/types';
import styles from './PointerOperations.module.css';

interface PointerOperationsProps {
  traceLog: MemoryTraceEntry[];
  currentFrame: number;
  onHighlightPointer?: (pointerName: string) => void;
  onHighlightAddress?: (address: number) => void;
}

interface PointerOperation {
  type: 'ADDRESS_OF' | 'POINTER_ASSIGN' | 'DEREFERENCE';
  pointerName: string;
  targetAddress: number;
  pointerAddress?: number;
  line: number;
  step: number;
  description: string;
}

const PointerOperations: React.FC<PointerOperationsProps> = ({
  traceLog,
  currentFrame,
  onHighlightPointer,
  onHighlightAddress
}) => {
  const [pointerOperations, setPointerOperations] = useState<PointerOperation[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<PointerOperation | null>(null);

  // Extract pointer operations from trace log
  useEffect(() => {
    const operations: PointerOperation[] = [];

    for (let i = 0; i <= currentFrame && i < traceLog.length; i++) {
      const entry = traceLog[i];

      switch (entry.operation) {
        case 'ADDRESS_OF':
          if (entry.variable && entry.address !== undefined && entry.pointerAddress !== undefined) {
            operations.push({
              type: 'ADDRESS_OF',
              pointerName: entry.variable,
              targetAddress: entry.address,
              pointerAddress: entry.pointerAddress,
              line: entry.line,
              step: entry.step,
              description: `Created pointer ${entry.variable} pointing to address 0x${entry.address.toString(16).toUpperCase().padStart(4, '0')}`
            });
          }
          break;

        case 'POINTER_ASSIGN':
          if (entry.variable && entry.address !== undefined && entry.pointerAddress !== undefined) {
            operations.push({
              type: 'POINTER_ASSIGN',
              pointerName: entry.variable,
              targetAddress: entry.address,
              pointerAddress: entry.pointerAddress,
              line: entry.line,
              step: entry.step,
              description: `Pointer ${entry.variable} now points to address 0x${entry.address.toString(16).toUpperCase().padStart(4, '0')}`
            });
          }
          break;

        case 'DEREFERENCE':
          if (entry.pointerAddress !== undefined && entry.metadata?.targetAddress !== undefined) {
            operations.push({
              type: 'DEREFERENCE',
              pointerName: `*0x${entry.pointerAddress.toString(16).toUpperCase().padStart(4, '0')}`,
              targetAddress: entry.metadata.targetAddress,
              pointerAddress: entry.pointerAddress,
              line: entry.line,
              step: entry.step,
              description: `Dereferenced pointer at 0x${entry.pointerAddress.toString(16).toUpperCase().padStart(4, '0')} -> value: ${entry.value}`
            });
          }
          break;
      }
    }

    setPointerOperations(operations);
  }, [traceLog, currentFrame]);

  const handleOperationClick = (operation: PointerOperation) => {
    setSelectedOperation(operation);

    // Highlight the pointer
    if (onHighlightPointer) {
      onHighlightPointer(operation.pointerName);
    }

    // Highlight the target address
    if (onHighlightAddress) {
      onHighlightAddress(operation.targetAddress);
    }
  };

  const getOperationIcon = (type: string): string => {
    switch (type) {
      case 'ADDRESS_OF': return '📍';
      case 'POINTER_ASSIGN': return '🔄';
      case 'DEREFERENCE': return '🔗';
      default: return '❓';
    }
  };

  const getOperationColor = (type: string): string => {
    switch (type) {
      case 'ADDRESS_OF': return '#28a745'; // Green
      case 'POINTER_ASSIGN': return '#ffc107'; // Yellow
      case 'DEREFERENCE': return '#17a2b8'; // Cyan
      default: return '#6c757d'; // Grey
    }
  };

  const formatAddress = (address: number): string => {
    return `0x${address.toString(16).toUpperCase().padStart(4, '0')}`;
  };

  // Get the most recent operations
  const recentOperations = pointerOperations.slice(-10).reverse();

  return (
    <div className={styles.pointerOperations}>
      <div className={styles.header}>
        <h4 className={styles.title}>Pointer Operations</h4>
        <span className={styles.count}>
          {pointerOperations.length} operations
        </span>
      </div>

      {recentOperations.length === 0 ? (
        <div className={styles.empty}>
          No pointer operations yet. Use address-of (&) and dereference (*) operators.
        </div>
      ) : (
        <div className={styles.operationsList}>
          {recentOperations.map((operation, index) => (
            <div
              key={`${operation.step}-${index}`}
              className={`${styles.operation} ${selectedOperation?.step === operation.step ? styles.selected : ''}`}
              onClick={() => handleOperationClick(operation)}
              style={{ borderLeftColor: getOperationColor(operation.type) }}
            >
              <div className={styles.operationHeader}>
                <span className={styles.operationIcon}>
                  {getOperationIcon(operation.type)}
                </span>
                <span className={styles.operationType}>
                  {operation.type}
                </span>
                <span className={styles.operationStep}>
                  Step {operation.step}
                </span>
                <span className={styles.operationLine}>
                  Line {operation.line}
                </span>
              </div>

              <div className={styles.operationDetails}>
                <div className={styles.pointerName}>
                  {operation.pointerName}
                </div>
                <div className={styles.addresses}>
                  <span className={styles.pointerAddr}>
                    Pointer: {formatAddress(operation.pointerAddress || 0)}
                  </span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.targetAddr}>
                    Target: {formatAddress(operation.targetAddress)}
                  </span>
                </div>
              </div>

              <div className={styles.description}>
                {operation.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOperation && (
        <div className={styles.selectedInfo}>
          <div className={styles.selectedHeader}>
            <h5>Selected Operation Details</h5>
            <button
              className={styles.clearSelection}
              onClick={() => setSelectedOperation(null)}
            >
              ✕
            </button>
          </div>
          <div className={styles.selectedDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Type:</span>
              <span className={styles.detailValue}>
                {selectedOperation.type}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Pointer:</span>
              <span className={styles.detailValue}>
                {selectedOperation.pointerName}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Target Address:</span>
              <span className={styles.detailValue}>
                {formatAddress(selectedOperation.targetAddress)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Line:</span>
              <span className={styles.detailValue}>
                {selectedOperation.line}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Step:</span>
              <span className={styles.detailValue}>
                {selectedOperation.step}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointerOperations;