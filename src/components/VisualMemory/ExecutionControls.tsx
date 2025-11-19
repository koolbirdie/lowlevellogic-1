import React, { useState } from 'react';
import styles from './ExecutionControls.module.css';

interface ExecutionControlsProps {
  currentFrame: number;
  totalFrames: number;
  isPlaying: boolean;
  onStepForward: () => void;
  onStepBackward: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onFrameChange: (frame: number) => void;
  onSpeedChange: (speed: number) => void;
  animationSpeed: number;
}

const ExecutionControls: React.FC<ExecutionControlsProps> = ({
  currentFrame,
  totalFrames,
  isPlaying,
  onStepForward,
  onStepBackward,
  onPlay,
  onPause,
  onReset,
  onFrameChange,
  onSpeedChange,
  animationSpeed
}) => {
  const [isHoveringSpeed, setIsHoveringSpeed] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frame = parseInt(e.target.value);
    onFrameChange(frame);
  };

  const formatFrameNumber = (frame: number): string => {
    return `Frame ${frame + 1} / ${totalFrames}`;
  };

  const formatSpeed = (speed: number): string => {
    if (speed === 0.5) return '0.5x';
    if (speed === 1) return '1x';
    if (speed === 2) return '2x';
    return `${speed}x`;
  };

  const speedOptions = [0.5, 1, 2, 4];

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.playbackControls}>
        <button
          className={`${styles.controlButton} ${styles.resetButton}`}
          onClick={onReset}
          disabled={currentFrame === 0}
          title="Reset to beginning"
        >
          ⏮️
        </button>

        <button
          className={`${styles.controlButton} ${styles.stepButton}`}
          onClick={onStepBackward}
          disabled={currentFrame === 0}
          title="Step backward"
        >
          ⏪
        </button>

        <button
          className={`${styles.controlButton} ${isPlaying ? styles.pauseButton : styles.playButton}`}
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>

        <button
          className={`${styles.controlButton} ${styles.stepButton}`}
          onClick={onStepForward}
          disabled={currentFrame >= totalFrames - 1}
          title="Step forward"
        >
          ⏩
        </button>
      </div>

      <div className={styles.frameControls}>
        <div className={styles.frameSlider}>
          <label className={styles.frameLabel}>
            {formatFrameNumber(currentFrame)}
          </label>
          <input
            type="range"
            min="0"
            max={totalFrames - 1}
            value={currentFrame}
            onChange={handleSliderChange}
            className={styles.slider}
            disabled={isPlaying}
          />
        </div>

        <div
          className={styles.speedControl}
          onMouseEnter={() => setIsHoveringSpeed(true)}
          onMouseLeave={() => setIsHoveringSpeed(false)}
        >
          <button
            className={`${styles.controlButton} ${styles.speedButton}`}
            title="Animation speed"
          >
            ⚡ {formatSpeed(animationSpeed)}
          </button>

          {isHoveringSpeed && (
            <div className={styles.speedMenu}>
              {speedOptions.map((speed) => (
                <button
                  key={speed}
                  className={`${styles.speedOption} ${animationSpeed === speed ? styles.activeSpeed : ''}`}
                  onClick={() => {
                    onSpeedChange(speed);
                    setIsHoveringSpeed(false);
                  }}
                >
                  {formatSpeed(speed)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.executionInfo}>
        <span className={styles.infoText}>
          Line: {currentFrame + 1}
        </span>
        <span className={styles.infoSeparator}>•</span>
        <span className={styles.infoText}>
          {totalFrames} total steps
        </span>
      </div>
    </div>
  );
};

export default ExecutionControls;