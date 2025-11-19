import React, { useState, useEffect, useMemo } from 'react';
import { MemoryTraceEntry, Variable, DataType, PointerVisualization } from '../../interpreter/types';
import MemoryBlock from './MemoryBlock';
import ArrayBlock from './ArrayBlock';
import PointerArrow from './PointerArrow';
import ExecutionControls from './ExecutionControls';
import styles from './VisualMemory.module.css';

interface VisualMemoryProps {
  memory: MemoryEngine;
  variableAddresses: Map<string, number>;
  traceLog: MemoryTraceEntry[];
  variables: Map<string, Variable>;
  currentFrame?: number;
  onFrameChange?: (frame: number) => void;
}

interface ArrayInfo {
  name: string;
  baseAddress: number;
  elements: Array<{
    address: number;
    value: any;
    index: number;
  }>;
  elementType: DataType;
  dimensions: Array<{ lower: number; upper: number }>;
}

interface MemoryCell {
  address: number;
  value: any;
  dataType: string;
  variableName?: string;
}

const VisualMemory: React.FC<VisualMemoryProps> = ({
  variableAddresses,
  traceLog,
  variables,
  currentFrame = 0,
  onFrameChange
}) => {
  const [selectedFrame, setSelectedFrame] = useState(currentFrame);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [highlightedAddresses, setHighlightedAddresses] = useState<Set<number>>(new Set());
  const [pointerVisualizations, setPointerVisualizations] = useState<PointerVisualization[]>([]);

  // Reconstruct memory state at specific frame
  const memoryStateAtFrame = useMemo(() => {
    const cellData: MemoryCell[] = [];
    const arrays: ArrayInfo[] = [];
    const pointers: PointerVisualization[] = [];

    // Process trace entries up to the selected frame
    const relevantTrace = traceLog.slice(0, selectedFrame + 1);

    for (const entry of relevantTrace) {
      switch (entry.operation) {
        case 'DECLARE':
          if (entry.address && entry.variable) {
            const variable = variables.get(entry.variable);
            if (variable) {
              cellData.push({
                address: entry.address,
                value: variable.value,
                dataType: variable.type,
                variableName: entry.variable
              });

              // Handle array declarations
              if (variable.type === 'ARRAY' && variable.dimensions) {
                const elementSize = 4; // Assuming 4 bytes per element
                const arrayLength = variable.dimensions.reduce((acc, dim) =>
                  acc * (dim.upper - dim.lower + 1), 1);

                const elements: ArrayInfo['elements'] = [];
                for (let i = 0; i < arrayLength; i++) {
                  elements.push({
                    address: entry.address + i * elementSize,
                    value: variable.value ? variable.value[i] : undefined,
                    index: i
                  });
                }

                arrays.push({
                  name: entry.variable,
                  baseAddress: entry.address,
                  elements,
                  elementType: variable.elementType || 'INTEGER',
                  dimensions: variable.dimensions
                });
              }
            }
          }
          break;

        case 'WRITE':
          if (entry.address !== undefined) {
            const existingIndex = cellData.findIndex(cell => cell.address === entry.address);
            if (existingIndex >= 0) {
              cellData[existingIndex].value = entry.value;
            } else {
              cellData.push({
                address: entry.address,
                value: entry.value,
                dataType: 'UNKNOWN'
              });
            }
          }
          break;

        case 'ADDRESS_OF':
          if (entry.pointerAddress !== undefined && entry.address !== undefined && entry.variable) {
            const variable = variables.get(entry.variable);
            if (variable?.type?.startsWith('POINTER')) {
              pointers.push({
                variableName: entry.variable,
                pointerAddress: entry.pointerAddress,
                targetAddress: entry.address,
                pointerType: variable.type,
                color: getPointerColor(variable.type),
                curve: 'straight'
              });
            }
          }
          break;

        case 'POINTER_ASSIGN':
          if (entry.pointerAddress !== undefined && entry.address !== undefined && entry.variable) {
            const existingPointer = pointers.find(p => p.variableName === entry.variable);
            if (existingPointer) {
              existingPointer.targetAddress = entry.address;
              existingPointer.curve = calculateCurveType(existingPointer.pointerAddress, entry.address);
            }
          }
          break;
      }
    }

    return { cellData, arrays, pointers };
  }, [traceLog, selectedFrame, variables]);

  // Update highlighted addresses based on current trace operation
  useEffect(() => {
    if (selectedFrame < traceLog.length) {
      const currentEntry = traceLog[selectedFrame];
      if (currentEntry) {
        const highlighted = new Set<number>();
        if (currentEntry.address !== undefined) {
          highlighted.add(currentEntry.address);
        }
        if (currentEntry.pointerAddress !== undefined) {
          highlighted.add(currentEntry.pointerAddress);
        }
        setHighlightedAddresses(highlighted);
      }
    } else {
      setHighlightedAddresses(new Set());
    }
  }, [selectedFrame, traceLog]);

  // Update pointer visualizations
  useEffect(() => {
    setPointerVisualizations(memoryStateAtFrame.pointers);
  }, [memoryStateAtFrame.pointers]);

  const getPointerColor = (type: DataType): string => {
    switch (type) {
      case 'POINTER_TO_INTEGER': return '#4CAF50';
      case 'POINTER_TO_REAL': return '#2196F3';
      case 'POINTER_TO_CHAR': return '#FF9800';
      case 'VOID_POINTER': return '#607D8B';
      default: return '#9E9E9E';
    }
  };

  const calculateCurveType = (pointerAddr: number, targetAddr: number): 'straight' | 'curved' => {
    // Simple heuristic: use curved arrows for longer distances
    const distance = Math.abs(targetAddr - pointerAddr);
    return distance > 100 ? 'curved' : 'straight';
  };

  const handleMemoryCellClick = (address: number) => {
    console.log('Memory cell clicked:', address);
  };

  const handleArrayElementClick = (index: number, address: number) => {
    console.log(`Array element [${index}] at address ${address} clicked`);
  };

  const handleStepForward = () => {
    if (selectedFrame < traceLog.length - 1) {
      const newFrame = selectedFrame + 1;
      setSelectedFrame(newFrame);
      onFrameChange?.(newFrame);
    }
  };

  const handleStepBackward = () => {
    if (selectedFrame > 0) {
      const newFrame = selectedFrame - 1;
      setSelectedFrame(newFrame);
      onFrameChange?.(newFrame);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setSelectedFrame(0);
    setIsPlaying(false);
    onFrameChange?.(0);
  };

  const handleFrameChange = (frame: number) => {
    setSelectedFrame(frame);
    onFrameChange?.(frame);
  };

  const handleSpeedChange = (speed: number) => {
    setAnimationSpeed(speed);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && selectedFrame < traceLog.length - 1) {
      const timer = setTimeout(() => {
        handleStepForward();
      }, 1000 / animationSpeed);

      return () => clearTimeout(timer);
    } else if (isPlaying && selectedFrame >= traceLog.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, selectedFrame, animationSpeed, traceLog.length]);

  // Separate arrays from individual memory cells
  const { cellData, arrays } = memoryStateAtFrame;
  const nonArrayCells = cellData.filter(cell =>
    !arrays.some(array =>
      array.elements.some(element => element.address === cell.address)
    )
  );

  return (
    <div className={styles.visualMemory}>
      <div className={styles.header}>
        <h3 className={styles.title}>Visual Memory</h3>
        <div className={styles.stats}>
          <span className={styles.stat}>
            Variables: {variableAddresses.size}
          </span>
          <span className={styles.stat}>
            Arrays: {arrays.length}
          </span>
          <span className={styles.stat}>
            Pointers: {pointerVisualizations.length}
          </span>
          <span className={styles.stat}>
            Frame: {selectedFrame + 1} / {traceLog.length}
          </span>
        </div>
      </div>

      <ExecutionControls
        currentFrame={selectedFrame}
        totalFrames={traceLog.length}
        isPlaying={isPlaying}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onPlay={handlePlay}
        onPause={handlePause}
        onReset={handleReset}
        onFrameChange={handleFrameChange}
        onSpeedChange={handleSpeedChange}
        animationSpeed={animationSpeed}
      />

      <div className={styles.memoryContainer}>
        <div className={styles.pointersLayer}>
          {pointerVisualizations.map((pointer, index) => (
            <PointerArrow
              key={`${pointer.variableName}-${index}`}
              variableName={pointer.variableName}
              sourceAddress={pointer.pointerAddress}
              targetAddress={pointer.targetAddress}
              pointerType={pointer.pointerType}
              color={pointer.color}
              curve={pointer.curve}
              isHighlighted={highlightedAddresses.has(pointer.pointerAddress)}
            />
          ))}
        </div>

        <div className={styles.arraysSection}>
          {arrays.map((array) => (
            <ArrayBlock
              key={array.name}
              arrayName={array.name}
              baseAddress={array.baseAddress}
              elements={array.elements}
              elementType={array.elementType}
              highlightedIndices={array.elements
                .filter(el => highlightedAddresses.has(el.address))
                .map(el => el.index)}
              onElementClick={handleArrayElementClick}
            />
          ))}
        </div>

        <div className={styles.variablesSection}>
          <h4 className={styles.sectionTitle}>Variables</h4>
          <div className={styles.memoryGrid}>
            {nonArrayCells.map((cell) => (
              <MemoryBlock
                key={cell.address}
                address={cell.address}
                value={cell.value}
                dataType={cell.dataType}
                isHighlighted={highlightedAddresses.has(cell.address)}
                onClick={() => handleMemoryCellClick(cell.address)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualMemory;