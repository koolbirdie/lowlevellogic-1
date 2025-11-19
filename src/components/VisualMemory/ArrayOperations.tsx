import React, { useState, useEffect } from 'react';
import { MemoryTraceEntry } from '../../interpreter/types';
import styles from './ArrayOperations.module.css';

interface ArrayOperationsProps {
  traceLog: MemoryTraceEntry[];
  currentFrame: number;
  onHighlightArray?: (arrayName: string) => void;
  onHighlightElement?: (arrayName: string, index: number) => void;
}

interface ArrayOperation {
  type: 'DECLARE' | 'WRITE' | 'READ';
  arrayName: string;
  baseAddress: number;
  elementIndex?: number;
  elementAddress?: number;
  value?: any;
  line: number;
  step: number;
  description: string;
  metadata?: any;
}

const ArrayOperations: React.FC<ArrayOperationsProps> = ({
  traceLog,
  currentFrame,
  onHighlightArray,
  onHighlightElement
}) => {
  const [arrayOperations, setArrayOperations] = useState<ArrayOperation[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<ArrayOperation | null>(null);

  // Extract array operations from trace log
  useEffect(() => {
    const operations: ArrayOperation[] = [];

    for (let i = 0; i <= currentFrame && i < traceLog.length; i++) {
      const entry = traceLog[i];

      switch (entry.operation) {
        case 'DECLARE':
          if (entry.variable && entry.address !== undefined && entry.metadata?.isArray) {
            operations.push({
              type: 'DECLARE',
              arrayName: entry.variable,
              baseAddress: entry.address,
              line: entry.line,
              step: entry.step,
              description: `Declared array ${entry.variable} with ${entry.metadata.elements} elements of type ${entry.metadata.elementType}`,
              metadata: entry.metadata
            });
          }
          break;

        case 'WRITE':
          if (entry.address !== undefined && entry.metadata?.isArrayElement !== undefined) {
            const arrayName = entry.metadata.arrayName || 'Unknown';
            operations.push({
              type: 'WRITE',
              arrayName,
              baseAddress: entry.metadata.baseAddress || 0,
              elementIndex: entry.metadata.isArrayElement,
              elementAddress: entry.address,
              value: entry.value,
              line: entry.line,
              step: entry.step,
              description: `Wrote ${entry.value} to ${arrayName}[${entry.metadata.isArrayElement}]`,
              metadata: entry.metadata
            });
          }
          break;

        case 'READ':
          if (entry.address !== undefined && entry.metadata?.isArrayElement !== undefined) {
            const arrayName = entry.metadata.arrayName || 'Unknown';
            operations.push({
              type: 'READ',
              arrayName,
              baseAddress: entry.metadata.baseAddress || 0,
              elementIndex: entry.metadata.isArrayElement,
              elementAddress: entry.address,
              value: entry.value,
              line: entry.line,
              step: entry.step,
              description: `Read ${entry.value} from ${arrayName}[${entry.metadata.isArrayElement}]`,
              metadata: entry.metadata
            });
          }
          break;
      }
    }

    setArrayOperations(operations);
  }, [traceLog, currentFrame]);

  const handleOperationClick = (operation: ArrayOperation) => {
    setSelectedOperation(operation);

    // Highlight the array
    if (onHighlightArray) {
      onHighlightArray(operation.arrayName);
    }

    // Highlight specific element if applicable
    if (operation.elementIndex !== undefined && onHighlightElement) {
      onHighlightElement(operation.arrayName, operation.elementIndex);
    }
  };

  const getOperationIcon = (type: string): string => {
    switch (type) {
      case 'DECLARE': return '🆕';
      case 'WRITE': return '✏️';
      case 'READ': return '👁️';
      default: return '❓';
    }
  };

  const getOperationColor = (type: string): string => {
    switch (type) {
      case 'DECLARE': return '#28a745'; // Green
      case 'WRITE': return '#ffc107'; // Yellow
      case 'READ': return '#17a2b8'; // Cyan
      default: return '#6c757d'; // Grey
    }
  };

  const formatAddress = (address: number): string => {
    return `0x${address.toString(16).toUpperCase().padStart(4, '0')}`;
  };

  // Group operations by array
  const operationsByArray = arrayOperations.reduce((acc, operation) => {
    if (!acc[operation.arrayName]) {
      acc[operation.arrayName] = [];
    }
    acc[operation.arrayName].push(operation);
    return acc;
  }, {} as Record<string, ArrayOperation[]>);

  // Get the most recent operations
  const recentOperations = arrayOperations.slice(-8).reverse();

  return (
    <div className={styles.arrayOperations}>
      <div className={styles.header}>
        <h4 className={styles.title}>Array Operations</h4>
        <span className={styles.count}>
          {arrayOperations.length} operations
        </span>
      </div>

      {recentOperations.length === 0 ? (
        <div className={styles.empty}>
          No array operations yet. Declare arrays and access elements with index notation.
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.recentOperations}>
            <h5 className={styles.sectionTitle}>Recent Operations</h5>
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
                    <div className={styles.arrayName}>
                      {operation.arrayName}
                      {operation.elementIndex !== undefined && `[${operation.elementIndex}]`}
                    </div>
                    <div className={styles.addresses}>
                      <span className={styles.elementAddr}>
                        {formatAddress(operation.elementAddress || operation.baseAddress)}
                      </span>
                      {operation.value !== undefined && (
                        <>
                          <span className={styles.equals}>=</span>
                          <span className={styles.value}>
                            {operation.value}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.description}>
                    {operation.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.arraysSummary}>
            <h5 className={styles.sectionTitle}>Arrays Summary</h5>
            <div className={styles.arraysList}>
              {Object.entries(operationsByArray).map(([arrayName, operations]) => {
                const latestOperation = operations[operations.length - 1];
                const arrayMetadata = latestOperation?.metadata;

                return (
                  <div
                    key={arrayName}
                    className={styles.arraySummary}
                    onClick={() => onHighlightArray?.(arrayName)}
                  >
                    <div className={styles.arraySummaryHeader}>
                      <span className={styles.arrayName}>{arrayName}</span>
                      <span className={styles.operationCount}>
                        {operations.length} ops
                      </span>
                    </div>

                    {arrayMetadata && (
                      <div className={styles.arrayInfo}>
                        <span className={styles.arrayInfoItem}>
                          {arrayMetadata.elements} elements
                        </span>
                        <span className={styles.arrayInfoItem}>
                          {arrayMetadata.elementType}
                        </span>
                        <span className={styles.arrayInfoItem}>
                          Base: {formatAddress(latestOperation.baseAddress)}
                        </span>
                      </div>
                    )}

                    <div className={styles.arrayStats}>
                      <span className={styles.stat}>
                        Writes: {operations.filter(op => op.type === 'WRITE').length}
                      </span>
                      <span className={styles.stat}>
                        Reads: {operations.filter(op => op.type === 'READ').length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedOperation && (
        <div className={styles.selectedInfo}>
          <div className={styles.selectedHeader}>
            <h5>Operation Details</h5>
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
              <span className={styles.detailLabel}>Array:</span>
              <span className={styles.detailValue}>
                {selectedOperation.arrayName}
              </span>
            </div>
            {selectedOperation.elementIndex !== undefined && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Index:</span>
                <span className={styles.detailValue}>
                  [{selectedOperation.elementIndex}]
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Address:</span>
              <span className={styles.detailValue}>
                {formatAddress(selectedOperation.elementAddress || selectedOperation.baseAddress)}
              </span>
            </div>
            {selectedOperation.value !== undefined && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Value:</span>
                <span className={styles.detailValue}>
                  {selectedOperation.value}
                </span>
              </div>
            )}
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

export default ArrayOperations;