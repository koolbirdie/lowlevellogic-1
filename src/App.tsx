import { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Editor from './components/Editor/Editor';
import OutputPanel from './components/OutputPanel/OutputPanel';
import ErrorDisplay, { ErrorMessage } from './components/ErrorDisplay/ErrorDisplay';
import Toolbar from './components/Toolbar/Toolbar';
import Landing from './components/Landing/Landing';
import AuthModal from './components/Auth/AuthModal';
import SaveAsModal from './components/SaveAsModal/SaveAsModal';
import ProgramsLibrary from './components/ProgramsLibrary/ProgramsLibrary';
import DebugControls from './components/DebugControls/DebugControls';
import VariablesPanel from './components/VariablesPanel/VariablesPanel';
import MemoryView from './components/MemoryView/MemoryView';
import EmailVerificationBanner from './components/EmailVerificationBanner/EmailVerificationBanner';
import { ShareModal } from './components/ShareModal/ShareModal';
import { ExportModal } from './components/ExportModal/ExportModal';
import Tutorial from './components/Tutorial/Tutorial';
import SyntaxReference from './components/SyntaxReference/SyntaxReference';
import PracticeProblems from './components/PracticeProblems/PracticeProblems';
import ExamMode, { ExamModeStartModal } from './components/ExamMode/ExamMode';
import LearningTools from './components/LearningTools/LearningTools';
import { tokenize } from './interpreter/lexer';
import { parse } from './interpreter/parser';
import { Interpreter } from './interpreter/interpreter';
import { validate } from './validator/validator';
import { saveCode, loadCode, clearSavedCode } from './utils/storage';
import { downloadCode, readFile } from './utils/fileHandler';
import { debounce } from './utils/debounce';
import { RuntimeError, DebugState, MemoryTraceEntry } from './interpreter/types';
import { useAuth } from './contexts/AuthContext';
import { Program } from './types/program';
import { createProgram, updateProgram } from './services/programsService';
import { shareCode, getSharedCode, getShareURL } from './services/shareService';
import styles from './App.module.css';

function App() {
  const { currentUser, isGuestMode, setGuestMode } = useAuth();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const inputResolveRef = useRef<((value: string) => void) | null>(null);
  
  // File upload state
  const [waitingForFileUpload, setWaitingForFileUpload] = useState(false);
  const [fileUploadPrompt, setFileUploadPrompt] = useState('');
  const fileUploadResolveRef = useRef<((content: string) => void) | null>(null);
  const [createdFiles, setCreatedFiles] = useState<Array<{ filename: string; mode: string; lineCount: number }>>([]);
  
  // Program management state
  const [currentProgram, setCurrentProgram] = useState<{ id: string; name: string } | null>(null);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [showProgramsLibrary, setShowProgramsLibrary] = useState(false);
  const [lastSavedCode, setLastSavedCode] = useState('');

  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Export state
  const [showExportModal, setShowExportModal] = useState(false);

  // Debug state
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugState, setDebugState] = useState<DebugState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const stepResolveRef = useRef<(() => void) | null>(null);
  const interpreterRef = useRef<Interpreter | null>(null);

  // Memory view state
  const [showMemoryView, setShowMemoryView] = useState(false);
  const [memoryTrace, setMemoryTrace] = useState<MemoryTraceEntry[]>([]);

  // Guest mode auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Learning features state
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSyntaxReference, setShowSyntaxReference] = useState(false);
  const [showPracticeProblems, setShowPracticeProblems] = useState(false);
  const [showLearningTools, setShowLearningTools] = useState(false);
  const [showExamModeStart, setShowExamModeStart] = useState(false);
  const [examMode, setExamMode] = useState<{ active: boolean; duration: number }>({ active: false, duration: 45 });

  // Load code from LocalStorage on mount
  useEffect(() => {
    const savedCode = loadCode();
    if (savedCode) {
      setCode(savedCode);
    }

    // Check for shared code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    if (shareId) {
      loadSharedCode(shareId);
    }
  }, []);

  // Load shared code
  const loadSharedCode = async (shareId: string) => {
    try {
      const sharedCode = await getSharedCode(shareId);
      if (sharedCode) {
        setCode(sharedCode.code);
        // Clear the share parameter from URL
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        alert('Shared code not found or has expired');
      }
    } catch (error) {
      console.error('Error loading shared code:', error);
      alert('Failed to load shared code');
    }
  };

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce((codeToValidate: string) => {
      if (!codeToValidate.trim()) {
        setErrors([]);
        setIsValidating(false);
        return;
      }

      setIsValidating(true);
      const validationErrors = validate(codeToValidate);
      setErrors(validationErrors);
      setIsValidating(false);
    }, 500),
    []
  );

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce((codeToSave: string) => {
      saveCode(codeToSave);
    }, 1000),
    []
  );

  // Handle code changes
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    debouncedValidate(newCode);
    debouncedSave(newCode);
  };

  // Handle run execution
  const handleRun = async () => {
    // Check for syntax errors first
    if (errors.length > 0 && errors.some(e => e.type === 'syntax')) {
      alert('Fix syntax errors before running');
      return;
    }

    // Clear output and errors
    setOutput([]);
    setErrors([]);
    setIsRunning(true);
    setWaitingForInput(false);
    setCreatedFiles([]);

    try {
      // Tokenize and parse
      const tokens = tokenize(code);
      const ast = parse(tokens);

      // Create interpreter with custom input handler and file upload handler
      const interpreter = new Interpreter(
        // Input handler
        async (variableName: string, variableType: string) => {
          return new Promise<string>((resolve) => {
            setInputPrompt(`Enter value for ${variableName} (${variableType}):`);
            setWaitingForInput(true);
            inputResolveRef.current = resolve;
          });
        },
        // Debug mode
        false,
        // Step callback
        undefined,
        // File write output
        true,
        // File upload handler
        async (filename: string) => {
          return new Promise<string>((resolve) => {
            setFileUploadPrompt(`Upload file: ${filename}`);
            setWaitingForFileUpload(true);
            fileUploadResolveRef.current = resolve;
          });
        }
      );

      interpreterRef.current = interpreter;

      // Execute with animation
      const generator = interpreter.executeProgram(ast);

      for await (const line of generator) {
        setOutput(prev => [...prev, line]);
        // Wait 300ms between outputs
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Get list of created/opened files
      const files = interpreter.getAllFiles();
      setCreatedFiles(files);

      // Collect trace data from interpreter
      const traceData = interpreter.getMemoryTracer().getTraceLog();
      setMemoryTrace(traceData);

      setIsRunning(false);
      setWaitingForInput(false);
    } catch (error) {
      // Collect trace data even when runtime errors occur
      if (interpreterRef.current) {
        try {
          const traceData = interpreterRef.current.getMemoryTracer().getTraceLog();
          setMemoryTrace(traceData);
        } catch (traceError) {
          // Ignore trace collection errors during runtime errors
        }
      }

      setIsRunning(false);
      setWaitingForInput(false);

      if (error instanceof RuntimeError) {
        setErrors([{
          line: (error as RuntimeError).line,
          message: (error as RuntimeError).message,
          type: 'runtime'
        }]);
      } else {
        setErrors([{
          line: 1,
          message: (error as Error).message,
          type: 'runtime'
        }]);
      }
    }
  };

  // Handle clear
  const handleClear = () => {
    if (confirm('Are you sure? This will delete all code.')) {
      setCode('');
      setOutput([]);
      setErrors([]);
      clearSavedCode();
    }
  };

  // Handle download
  const handleDownload = () => {
    downloadCode(code);
  };

  // Handle upload
  const handleUpload = async (file: File) => {
    if (confirm('Load file? This will replace your current code.')) {
      try {
        const content = await readFile(file);
        setCode(content);
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  // Handle load example
  const handleLoadExample = (exampleCode: string) => {
    if (confirm('Load example? This will replace your current code.')) {
      setCode(exampleCode);
    }
  };

  // Handle input submission
  const handleInputSubmit = (value: string) => {
    if (inputResolveRef.current) {
      inputResolveRef.current(value);
      inputResolveRef.current = null;
      setWaitingForInput(false);
      setInputPrompt('');
    }
  };

  // Handle file upload submission
  const handleFileUploadSubmit = async (file: File) => {
    if (fileUploadResolveRef.current) {
      try {
        const content = await readFile(file);
        fileUploadResolveRef.current(content);
        fileUploadResolveRef.current = null;
        setWaitingForFileUpload(false);
        setFileUploadPrompt('');
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  // Handle file upload cancel
  const handleFileUploadCancel = () => {
    if (fileUploadResolveRef.current) {
      fileUploadResolveRef.current(''); // Empty content = empty file
      fileUploadResolveRef.current = null;
      setWaitingForFileUpload(false);
      setFileUploadPrompt('');
    }
  };

  // Debug handlers
  const handleDebug = async () => {
    // Check for syntax errors first
    if (errors.length > 0 && errors.some(e => e.type === 'syntax')) {
      alert('Fix syntax errors before debugging');
      return;
    }

    // Clear output and errors
    setOutput([]);
    setErrors([]);
    setIsRunning(true);
    setIsDebugging(true);
    setIsPaused(false);
    setWaitingForInput(false);
    setCreatedFiles([]);

    try {
      // Tokenize and parse
      const tokens = tokenize(code);
      const ast = parse(tokens);

      // Create interpreter in debug mode first
      const interpreter = new Interpreter(
        async (variableName: string, variableType: string) => {
          return new Promise<string>((resolve) => {
            setInputPrompt(`Enter value for ${variableName} (${variableType}):`);
            setWaitingForInput(true);
            inputResolveRef.current = resolve;
          });
        },
        true, // debug mode
        async () => {
          // Update debug state when pausing
          const currentDebugState = interpreter.getDebugState();
          setDebugState(currentDebugState);
          setIsPaused(true);
          
          // Wait for user to step
          return new Promise<void>((resolve) => {
            stepResolveRef.current = resolve;
          });
        },
        true, // file write output
        async (filename: string) => {
          return new Promise<string>((resolve) => {
            setFileUploadPrompt(`Upload file: ${filename}`);
            setWaitingForFileUpload(true);
            fileUploadResolveRef.current = resolve;
          });
        }
      );

      interpreterRef.current = interpreter;

      // Execute with animation
      const generator = interpreter.executeProgram(ast);

      for await (const line of generator) {
        setOutput(prev => [...prev, line]);
        // Wait 300ms between outputs
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Get list of created/opened files
      const files = interpreter.getAllFiles();
      setCreatedFiles(files);

      // Collect trace data from interpreter
      const traceData = interpreter.getMemoryTracer().getTraceLog();
      setMemoryTrace(traceData);

      setIsRunning(false);
      setIsDebugging(false);
      setIsPaused(false);
      setDebugState(null);
      setWaitingForInput(false);
    } catch (error) {
      // Collect trace data even when runtime errors occur
      if (interpreterRef.current) {
        try {
          const traceData = interpreterRef.current.getMemoryTracer().getTraceLog();
          setMemoryTrace(traceData);
        } catch (traceError) {
          // Ignore trace collection errors during runtime errors
        }
      }

      setIsRunning(false);
      setIsDebugging(false);
      setIsPaused(false);
      setDebugState(null);
      setWaitingForInput(false);

      if (error instanceof RuntimeError) {
        setErrors([{
          line: (error as RuntimeError).line,
          message: (error as RuntimeError).message,
          type: 'runtime'
        }]);
      } else {
        setErrors([{
          line: 1,
          message: (error as Error).message,
          type: 'runtime'
        }]);
      }
    }
  };

  const handleDebugStep = () => {
    if (stepResolveRef.current) {
      setIsPaused(false);
      stepResolveRef.current();
      stepResolveRef.current = null;
    }
  };

  const handleDebugContinue = () => {
    // Disable debug mode to stop pausing
    if (interpreterRef.current) {
      interpreterRef.current.disableDebugMode();
    }
    
    setIsDebugging(false);
    setIsPaused(false);
    setDebugState(null);
    
    // Resume execution
    if (stepResolveRef.current) {
      stepResolveRef.current();
      stepResolveRef.current = null;
    }
  };

  const handleDebugStop = () => {
    setIsDebugging(false);
    setIsPaused(false);
    setIsRunning(false);
    setDebugState(null);
    
    // This will cause the execution to complete
    if (stepResolveRef.current) {
      stepResolveRef.current();
      stepResolveRef.current = null;
    }
  };

  // Handle save as (create new program)
  const handleSaveAs = async (name: string) => {
    if (!currentUser) return;
    
    if (!currentUser.emailVerified) {
      alert('Please verify your email address to save programs. Check your inbox for the verification link.');
      return;
    }

    const programId = await createProgram(currentUser.uid, {
      name,
      code
    });

    setCurrentProgram({ id: programId, name });
    setLastSavedCode(code);
  };

  // Handle load program
  const handleLoadProgram = (program: Program) => {
    if (code !== lastSavedCode && code.trim()) {
      if (!confirm('You have unsaved changes. Load this program anyway?')) {
        return;
      }
    }

    setCode(program.code);
    setCurrentProgram({ id: program.id, name: program.name });
    setLastSavedCode(program.code);
  };

  // Handle open programs library
  const handleOpenLibrary = () => {
    if (!currentUser?.emailVerified) {
      alert('Please verify your email address to access saved programs. Check your inbox for the verification link.');
      return;
    }
    setShowProgramsLibrary(true);
  };

  // Handle share code
  const handleShare = async () => {
    if (!currentUser?.emailVerified) {
      alert('Please verify your email address to share code. Check your inbox for the verification link.');
      return;
    }
    
    if (!code.trim()) {
      alert('Cannot share empty code');
      return;
    }

    try {
      const title = currentProgram?.name || 'Untitled Program';
      const shareId = await shareCode(code, title);
      const url = getShareURL(shareId);
      setShareUrl(url);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error sharing code:', error);
      alert('Failed to create share link. Please try again.');
    }
  };

  // Handle export code
  const handleExport = () => {
    if (!code.trim()) {
      alert('Cannot export empty code');
      return;
    }
    setShowExportModal(true);
  };

  // Handle open auth modal from guest mode
  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };

  // Handle close auth modal
  const handleCloseAuth = () => {
    setShowAuthModal(false);
    setGuestMode(true);
  };

  // Learning features handlers
  const handleStartExam = (duration: number) => {
    setExamMode({ active: true, duration });
    setShowExamModeStart(false);
  };

  const handleExamTimeout = () => {
    alert('Time is up! Exam mode has ended.');
    setExamMode({ active: false, duration: 45 });
  };

  const handleExitExam = () => {
    setExamMode({ active: false, duration: 45 });
  };

  const handleLoadCodeFromFeature = (newCode: string) => {
    setCode(newCode);
  };

  // Handle memory view toggle
  const handleToggleMemoryView = () => {
    setShowMemoryView(!showMemoryView);
  };

  // Auto-save current program every 30 seconds
  useEffect(() => {
    if (!currentUser || !currentProgram || !currentProgram.id) return;
    if (code === lastSavedCode) return; // No changes to save

    const autoSaveInterval = setInterval(async () => {
      if (code !== lastSavedCode) {
        try {
          await updateProgram(currentProgram.id, { code });
          setLastSavedCode(code);
          console.log('Auto-saved program');
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentUser, currentProgram, code, lastSavedCode]);

  // Show landing page if not authenticated and not in guest mode
  if (!currentUser && !isGuestMode) {
    return <Landing />;
  }

  return (
    <div className={styles.container}>
      <Toolbar
        onRun={handleRun}
        onDebug={handleDebug}
        onClear={handleClear}
        onDownload={handleDownload}
        onUpload={handleUpload}
        onLoadExample={handleLoadExample}
        onSaveAs={() => setShowSaveAsModal(true)}
        onOpenLibrary={handleOpenLibrary}
        onShare={handleShare}
        onExport={handleExport}
        onOpenAuth={handleOpenAuth}
        onOpenTutorial={() => setShowTutorial(true)}
        onOpenSyntaxReference={() => setShowSyntaxReference(true)}
        onOpenPracticeProblems={() => setShowPracticeProblems(true)}
        onOpenExamMode={() => setShowExamModeStart(true)}
        onToggleMemoryView={handleToggleMemoryView}
        // onOpenLearningTools={() => setShowLearningTools(true)}
        isRunning={isRunning}
        examModeActive={examMode.active}
      />

      <ExamMode
        isActive={examMode.active}
        duration={examMode.duration}
        onTimeout={handleExamTimeout}
        onExit={handleExitExam}
      />

      {isDebugging && (
        <DebugControls
          onStep={handleDebugStep}
          onContinue={handleDebugContinue}
          onStop={handleDebugStop}
          isDebugging={isDebugging}
          isPaused={isPaused}
        />
      )}

      <EmailVerificationBanner />

      <div className={styles.splitView}>
        <div className={styles.leftPanel}>
          <Editor value={code} onChange={handleCodeChange} />
        </div>

        <div className={styles.rightPanel}>
          {isDebugging && debugState && (
            <VariablesPanel
              variables={debugState.variables}
              currentLine={debugState.currentLine}
            />
          )}

          {showMemoryView && interpreterRef.current && (
            <MemoryView
              memory={interpreterRef.current.getMemoryEngine()}
              variableAddresses={interpreterRef.current.getVariableAddresses()}
              traceLog={memoryTrace}
            />
          )}

          <OutputPanel
            output={output}
            isRunning={isRunning}
            waitingForInput={waitingForInput}
            inputPrompt={inputPrompt}
            onInputSubmit={handleInputSubmit}
            waitingForFileUpload={waitingForFileUpload}
            fileUploadPrompt={fileUploadPrompt}
            onFileUploadSubmit={handleFileUploadSubmit}
            onFileUploadCancel={handleFileUploadCancel}
            createdFiles={createdFiles}
            interpreterRef={interpreterRef}
          />
          <ErrorDisplay errors={errors} isValidating={isValidating} />
        </div>
      </div>

      {showSaveAsModal && (
        <SaveAsModal
          onSave={handleSaveAs}
          onClose={() => setShowSaveAsModal(false)}
          defaultName={currentProgram?.name || ''}
        />
      )}

      {showProgramsLibrary && (
        <ProgramsLibrary
          onLoad={handleLoadProgram}
          onClose={() => setShowProgramsLibrary(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          shareUrl={shareUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          code={code}
          programName={currentProgram?.name}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={handleCloseAuth} />
      )}

      {showTutorial && (
        <Tutorial
          onClose={() => setShowTutorial(false)}
          onLoadCode={handleLoadCodeFromFeature}
        />
      )}

      {showSyntaxReference && (
        <SyntaxReference onClose={() => setShowSyntaxReference(false)} />
      )}

      {showPracticeProblems && (
        <PracticeProblems
          onClose={() => setShowPracticeProblems(false)}
          onLoadCode={handleLoadCodeFromFeature}
        />
      )}

      {showLearningTools && (
        <LearningTools
          code={code}
          onClose={() => setShowLearningTools(false)}
        />
      )}

      {showExamModeStart && (
        <ExamModeStartModal
          onStart={handleStartExam}
          onCancel={() => setShowExamModeStart(false)}
        />
      )}

      <Analytics />
    </div>
  );
}

export default App;
