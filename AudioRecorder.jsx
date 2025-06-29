import React, { useState, useRef, useCallback } from 'react';
import WaveformVisualizer from './WaveformVisualizer';

/**
 * AudioRecorder component that handles audio recording with live waveform visualization
 * and playback of recorded audio
 */
const AudioRecorder = ({
  className = '',
  onRecordingComplete = () => {},
  onError = () => {},
  maxRecordingTime = 300000, // 5 minutes default
  waveformConfig = {}
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);
  const waveformRef = useRef(null);

  /**
   * Start recording audio from microphone
   */
  const startRecording = useCallback(async () => {
    try {
      setErrorMessage('');
      
      // Request microphone access with optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false, // Disable for better waveform visualization
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
          channelCount: 1,
          latency: 0 // Minimize latency for real-time visualization
        }
      });

      streamRef.current = stream;

      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop event
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        onRecordingComplete(audioBlob);
        
        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setAudioBlob(null);
      setRecordingTime(0);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1000;
          
          // Auto-stop if max recording time reached
          if (newTime >= maxRecordingTime) {
            stopRecording();
            return prev;
          }
          
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      const errorMsg = error.name === 'NotAllowedError' 
        ? 'Microphone access denied. Please allow microphone access and try again.'
        : 'Failed to start recording. Please check your microphone.';
      
      setErrorMessage(errorMsg);
      onError(error);
    }
  }, [maxRecordingTime, onRecordingComplete, onError]);

  /**
   * Stop recording audio
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Clear recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [isRecording]);

  /**
   * Pause/resume recording
   */
  const togglePauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1000);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      // Pause timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [isPaused, isRecording]);

  /**
   * Play recorded audio
   */
  const playAudio = useCallback(() => {
    if (waveformRef.current && audioBlob) {
      waveformRef.current.play();
      setIsPlaying(true);
    }
  }, [audioBlob]);

  /**
   * Pause audio playback
   */
  const pauseAudio = useCallback(() => {
    if (waveformRef.current) {
      waveformRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  /**
   * Stop audio playback
   */
  const stopAudio = useCallback(() => {
    if (waveformRef.current) {
      waveformRef.current.stop();
      setIsPlaying(false);
    }
  }, []);

  /**
   * Reset recorder state and clear audio
   */
  const resetRecorder = useCallback(() => {
    setAudioBlob(null);
    setIsPlaying(false);
    setRecordingTime(0);
    setErrorMessage('');
    
    if (waveformRef.current) {
      waveformRef.current.destroy();
    }
  }, []);

  /**
   * Format recording time for display
   */
  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Cleanup on component unmount
   */
  React.useEffect(() => {
    return () => {
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      // Stop recording if active
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      
      // Close media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  return (
    <div className={`audio-recorder ${className}`}>
      {/* Waveform Visualizer */}
      <div className="waveform-section">
        <WaveformVisualizer
          ref={waveformRef}
          audioBlob={audioBlob}
          isRecording={isRecording && !isPaused}
          microphoneStream={streamRef.current}
          onReady={() => console.log('Waveform ready')}
          onError={(error) => {
            console.error('Waveform error:', error);
            setErrorMessage('Waveform visualization error');
          }}
          {...waveformConfig}
        />
      </div>

      {/* Recording Timer */}
      {(isRecording || recordingTime > 0) && (
        <div className="recording-timer">
          <span className={`timer-text ${isPaused ? 'paused' : ''}`}>
            {formatTime(recordingTime)}
          </span>
          {isPaused && <span className="paused-indicator">PAUSED</span>}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      {/* Control Buttons */}
      <div className="controls">
        {!isRecording && !audioBlob && (
          <button 
            onClick={startRecording}
            className="btn btn-record"
            disabled={!!errorMessage}
          >
            🎤 Start Recording
          </button>
        )}

        {isRecording && (
          <div className="recording-controls">
            <button 
              onClick={togglePauseRecording}
              className="btn btn-pause"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            
            <button 
              onClick={stopRecording}
              className="btn btn-stop"
            >
              ⏹️ Stop
            </button>
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="playback-controls">
            <button 
              onClick={isPlaying ? pauseAudio : playAudio}
              className="btn btn-play"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            
            <button 
              onClick={stopAudio}
              className="btn btn-stop"
              disabled={!isPlaying}
            >
              ⏹️ Stop
            </button>
            
            <button 
              onClick={resetRecorder}
              className="btn btn-reset"
            >
              🗑️ Clear
            </button>
            
            <button 
              onClick={startRecording}
              className="btn btn-record-new"
            >
              🎤 Record New
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
