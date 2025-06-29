import { useEffect, useRef, useState } from 'react';
import { Mic, Square, RotateCcw, X, Loader2, Upload, FileText, Wand2, Save } from 'lucide-react';
import { useRecording } from '@/hooks/useRecording';
import { useAuth, Protect } from '@clerk/clerk-react';
import { Progress } from '@/components/ui/progress';
import { Note } from '@/types';
import UpgradeCard from '@/components/UpgradeCard';


interface RecordingInterfaceProps {
  onRecordingComplete?: (note: Note) => void;
  currentFolder?: string | null;
  noteCount?: number;
  hasProPlan?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

const RecordingInterface = ({ onRecordingComplete, currentFolder, noteCount = 0, hasProPlan: hasProPlanProp, onRecordingStateChange }: RecordingInterfaceProps) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const {
    isRecording,
    isPaused,
    recordingTime,
    isProcessing,
    isUploading,
    isTranscribing,
    isRewriting,
    isSaving,
    startRecording,
    stopRecording,
    pauseRecording,
    resetRecording,
    cancelRecording
  } = useRecording({ onRecordingComplete, currentFolder });

  const { has } = useAuth();
  const hasProPlan = hasProPlanProp ?? has({ plan: 'talkflo_pro' });

  // Auto-stop recording for free users at 3 minutes - MOVED BEFORE EARLY RETURNS
  useEffect(() => {
    if (isRecording && !hasProPlan && recordingTime >= 180) { // 3 minutes = 180 seconds
      stopRecording();
    }
  }, [isRecording, hasProPlan, recordingTime, stopRecording]);

  // Notify parent component about recording state changes
  useEffect(() => {
    if (onRecordingStateChange) {
      onRecordingStateChange(isRecording);
    }
  }, [isRecording, onRecordingStateChange]);

  const handleStartRecording = () => {
    // Check if free user has reached 10 notes limit
    if (!hasProPlan && noteCount >= 10) {
      setShowUpgradeModal(true);
      return;
    }
    // Scroll to top of page when recording starts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    startRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateWaveform = () => {
    return Array.from({ length: 50 }, () => Math.random() * 40 + 10);
  };

  const getProcessingStatus = () => {
    if (isUploading) return { text: 'Uploading', progress: 25, step: 1, total: 3 };
    if (isTranscribing) return { text: 'Transcribing', progress: 50, step: 2, total: 3 };
    if (isRewriting) return { text: 'Rewriting', progress: 75, step: 3, total: 3 };
    if (isSaving) return { text: 'Saving...', progress: 90, step: null, total: null };
    return { text: 'Processing complete!', progress: 100, step: null, total: null };
  };

    if (isProcessing) {
    const status = getProcessingStatus();
    
    return (
      <div className="flex justify-center mb-8 sm:mb-12">
        <div className="relative group">
          {/* Enhanced outer glow */}
          <div className="absolute -inset-6 bg-gradient-to-r from-orange-200/30 via-orange-300/20 to-orange-200/30 rounded-3xl sm:rounded-[2rem] blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
          
          {/* Main card */}
          <div className="relative bg-gradient-to-br from-white via-orange-50/30 to-white backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/60 max-w-sm sm:max-w-md w-full mx-4 animate-scale-in overflow-hidden">
            
            {/* Subtle animated background pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-20 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.1)_0%,transparent_70%)]"></div>
            </div>
            
            {/* Content */}
            <div className="relative text-center">
              {/* Enhanced title with better typography */}
              <h2 className="text-slate-800 text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text tracking-tight">
                {status.text}
              </h2>
              
              {/* Enhanced step indicator */}
              {status.step && (
                <p className="text-slate-500 text-lg sm:text-xl font-medium mb-8 sm:mb-10 opacity-80">
                  Step <span className="font-bold text-slate-600">{status.step}</span> of <span className="font-bold text-slate-600">{status.total}</span>
                </p>
              )}
              
              {/* Enhanced progress section */}
              <div className="mb-6 sm:mb-8">
                {/* Progress bar container with enhanced styling */}
                <div className="relative mb-5">
                  <div className="h-4 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 overflow-hidden rounded-full shadow-inner border border-slate-200/50">
                    <div 
                      className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 h-full relative overflow-hidden transition-all duration-700 ease-out rounded-full"
                      style={{ width: `${status.progress}%` }}
                    >
                      {/* Animated shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced percentage display */}
                <p className="text-slate-600 text-base sm:text-lg font-semibold">
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    {status.progress}%
                  </span> complete
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isRecording) {
    return (
      <>
         <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="space-y-4 text-center">
          <div className="relative">
            <button
              onClick={handleStartRecording}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </button>
          </div>
        </div>
      </div>
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="relative">
            <UpgradeCard 
              title="Recording Limit Reached"
              description="You've reached the 10-note limit for free users. Upgrade to Talkflo Prime for unlimited notes and advanced features."
              feature="unlimited notes"
            />
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      </>
    );
  }

  return (
    <div className="flex justify-center mb-12 sm:mb-16">
      <div className="glass rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-beautiful max-w-sm sm:max-w-md w-full mx-4 relative animate-scale-in min-h-[280px] sm:min-h-[320px]">
        {/* Bottom Corner Control Buttons */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-between px-4 sm:px-6 pb-4 sm:pb-6 pointer-events-none">
          <button
            onClick={resetRecording}
            className="p-2.5 hover:bg-white/20 rounded-full transition-beautiful min-w-[44px] min-h-[44px] flex items-center justify-center group ripple pointer-events-auto"
            title="Restart recording"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 group-hover:text-orange-600 group-hover:rotate-180 transform transition-all duration-300" />
          </button>
          <button
            onClick={cancelRecording}
            className="p-2.5 hover:bg-white/20 rounded-full transition-beautiful min-w-[44px] min-h-[44px] flex items-center justify-center group ripple pointer-events-auto"
            title="Cancel recording"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 group-hover:text-red-500 transition-colors duration-300" />
          </button>
        </div>

        <div className="text-center mt-1 sm:mt-0">
          {/* Enhanced Timer */}
          <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2 sm:mb-3 font-mono">
            {formatTime(recordingTime)}
          </div>
          
          {/* Duration warning for free users */}
          {!hasProPlan && recordingTime >= 150 && recordingTime < 180 && (
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-4 text-center">
              <p className="text-orange-700 text-sm font-medium">
                Approaching 3-minute limit for free plan
              </p>
            </div>
          )}
          
          {!hasProPlan && recordingTime >= 180 && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4 text-center">
              <p className="text-red-700 text-sm font-medium">
                Recording auto-stopped at 3-minute limit
              </p>
            </div>
          )}
          
          {/* Enhanced Controls */}
          {isPaused ? (
            <button 
              onClick={pauseRecording}
              className="glass hover:bg-white/30 text-gray-700 px-6 sm:px-8 py-2 rounded-full text-sm font-medium mb-2 sm:mb-3 transition-beautiful min-h-[40px] shadow-beautiful ripple"
            >
              Resume
            </button>
          ) : (
            <div className="mb-2 sm:mb-3">
              <button 
                onClick={pauseRecording}
                className="glass hover:bg-white/30 text-gray-700 px-6 sm:px-8 py-2 rounded-full text-sm font-medium mb-1 sm:mb-2 transition-beautiful min-h-[40px] shadow-beautiful ripple"
              >
                Pause
              </button>
              
              {/* Enhanced Animated Waveform */}
              <div className="flex justify-center items-end space-x-1 h-4 sm:h-8 px-4">
                {generateWaveform().slice(0, 30).map((height, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-orange-400 to-orange-600 rounded-full opacity-80"
                    style={{
                      height: `${Math.max(height * 0.8, 12)}px`,
                      animation: `pulse ${Math.random() * 0.5 + 0.8}s infinite alternate`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Stop Button */}
          <div className="flex justify-center">
            <div className="absolute left-1/2 -translate-x-1/2 bottom-4 sm:bottom-6 z-20 group">
              <div className="absolute -inset-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <button
                onClick={stopRecording}
                className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-orange-600 to-red-500 rounded-full flex items-center justify-center transition-beautiful shadow-lg border-4 border-white ripple"
              >
                <Square className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RecordingInterface;
