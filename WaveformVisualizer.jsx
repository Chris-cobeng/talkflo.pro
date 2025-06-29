import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/dist/plugins/microphone.js';

/**
 * WaveformVisualizer component that handles both live microphone input
 * and playback of recorded audio using WaveSurfer.js
 */
const WaveformVisualizer = forwardRef(({
  audioBlob = null,
  isRecording = false,
  microphoneStream = null,
  height = 80,
  waveColor = '#ff6b6b',
  progressColor = '#4ecdc4',
  backgroundColor = '#f8f9fa',
  className = '',
  onReady = () => {},
  onError = () => {}
}, ref) => {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const microphoneRef = useRef(null);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    play: () => wavesurferRef.current?.play(),
    pause: () => wavesurferRef.current?.pause(),
    stop: () => wavesurferRef.current?.stop(),
    destroy: () => {
      cleanupResources();
    }
  }));

  /**
   * Initialize WaveSurfer instance for audio playback
   */
  const initializeWaveSurfer = () => {
    if (!containerRef.current) return;

    // Clean up existing instance
    cleanupResources();

    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      height,
      waveColor,
      progressColor,
      backgroundColor,
      responsive: true,
      normalize: true,
      barWidth: 2,
      barGap: 1,
      barRadius: 1
    });

    // Handle ready event
    wavesurferRef.current.on('ready', () => {
      onReady(wavesurferRef.current);
    });

    // Handle error events
    wavesurferRef.current.on('error', (error) => {
      console.error('WaveSurfer error:', error);
      onError(error);
    });
  };

  /**
   * Initialize microphone plugin for live recording visualization
   */
  const initializeMicrophone = async () => {
    if (!containerRef.current) return;

    try {
      // Clean up existing instance
      cleanupResources();

      wavesurferRef.current = WaveSurfer.create({
        container: containerRef.current,
        height,
        waveColor,
        progressColor,
        backgroundColor,
        responsive: true,
        normalize: true,
        barWidth: 3,
        barGap: 1,
        barRadius: 2,
        // Important: Configure for real-time visualization
        interact: false,
        hideScrollbar: true,
        audioRate: 1,
        backend: 'WebAudio'
      });

      // Create microphone plugin with proper settings
      microphoneRef.current = wavesurferRef.current.registerPlugin(
        MicrophonePlugin.create({
          // Disable continuous waveform for better real-time response
          continuousWaveform: false,
          // Set device constraints for better audio capture
          deviceId: 'default'
        })
      );

      // Add event listeners for microphone data
      microphoneRef.current.on('deviceReady', (stream) => {
        console.log('Microphone stream ready:', stream);
      });

      microphoneRef.current.on('deviceError', (error) => {
        console.error('Microphone device error:', error);
        onError(error);
      });

      // Start microphone with proper audio constraints
      await microphoneRef.current.startMic({
        audio: {
          echoCancellation: false, // Disable for better visualization
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      
      onReady(wavesurferRef.current);
    } catch (error) {
      console.error('Failed to initialize microphone:', error);
      onError(error);
    }
  };

  /**
   * Clean up all WaveSurfer resources and stop microphone
   */
  const cleanupResources = () => {
    // Stop microphone if active
    if (microphoneRef.current) {
      microphoneRef.current.stopMic?.();
      microphoneRef.current = null;
    }

    // Destroy WaveSurfer instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }
  };

  /**
   * Load audio blob into WaveSurfer for playback
   */
  useEffect(() => {
    if (audioBlob && !isRecording) {
      initializeWaveSurfer();
      
      // Convert blob to URL and load into WaveSurfer
      const audioUrl = URL.createObjectURL(audioBlob);
      wavesurferRef.current?.loadBlob(audioBlob);
      
      // Cleanup URL when component unmounts or audioBlob changes
      return () => {
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [audioBlob, isRecording]);

  /**
   * Handle recording state changes
   */
  useEffect(() => {
    if (isRecording) {
      // Start live microphone visualization
      initializeMicrophone();
    } else if (!audioBlob) {
      // If not recording and no audio to display, cleanup
      cleanupResources();
    }
  }, [isRecording]);

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  return (
    <div className={`waveform-container ${className}`}>
      <div 
        ref={containerRef} 
        className="waveform-canvas"
        style={{ 
          width: '100%', 
          height: `${height}px`,
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
      {isRecording && (
        <div className="recording-indicator">
          <span className="recording-dot"></span>
          Recording...
        </div>
      )}
    </div>
  );
});

WaveformVisualizer.displayName = 'WaveformVisualizer';

export default WaveformVisualizer;
