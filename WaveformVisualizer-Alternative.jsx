import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';

/**
 * Alternative WaveformVisualizer with custom real-time audio analysis
 * This version uses Web Audio API directly for more responsive live visualization
 */
const WaveformVisualizerAlternative = forwardRef(({
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
  const canvasRef = useRef(null);
  const wavesurferRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

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
      barRadius: 2
    });

    wavesurferRef.current.on('ready', () => {
      onReady(wavesurferRef.current);
    });

    wavesurferRef.current.on('error', (error) => {
      console.error('WaveSurfer error:', error);
      onError(error);
    });
  };

  /**
   * Draw real-time waveform visualization using canvas
   */
  const drawRealTimeWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = height;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording || !analyserRef.current) return;

      analyser.getByteTimeDomainData(dataArray);

      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = waveColor;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, [isRecording, height, waveColor, backgroundColor]);

  /**
   * Initialize real-time audio analysis
   */
  const initializeRealTimeAnalysis = useCallback(async (stream) => {
    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const audioContext = audioContextRef.current;

      // Create analyser node
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.3;

      // Connect microphone stream to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Start drawing waveform
      drawRealTimeWaveform();

    } catch (error) {
      console.error('Failed to initialize real-time analysis:', error);
      onError(error);
    }
  }, [drawRealTimeWaveform, onError]);

  /**
   * Clean up all resources
   */
  const cleanupResources = () => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear analyser
    analyserRef.current = null;

    // Destroy WaveSurfer instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }
  };

  /**
   * Handle microphone stream changes
   */
  useEffect(() => {
    if (isRecording && microphoneStream) {
      initializeRealTimeAnalysis(microphoneStream);
    } else if (!isRecording) {
      // Stop real-time analysis
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isRecording, microphoneStream, initializeRealTimeAnalysis]);

  /**
   * Handle audio blob for playback
   */
  useEffect(() => {
    if (audioBlob && !isRecording) {
      initializeWaveSurfer();
      
      const audioUrl = URL.createObjectURL(audioBlob);
      wavesurferRef.current?.loadBlob(audioBlob);
      
      return () => {
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [audioBlob, isRecording]);

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
      {/* Canvas for real-time visualization */}
      {isRecording ? (
        <canvas 
          ref={canvasRef}
          className="waveform-canvas realtime-canvas"
          style={{ 
            width: '100%', 
            height: `${height}px`,
            borderRadius: '8px',
            backgroundColor: backgroundColor,
            border: '2px solid #e9ecef'
          }}
        />
      ) : (
        /* WaveSurfer container for playback */
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
      )}
      
      {isRecording && (
        <div className="recording-indicator">
          <span className="recording-dot"></span>
          Recording...
        </div>
      )}
    </div>
  );
});

WaveformVisualizerAlternative.displayName = 'WaveformVisualizerAlternative';

export default WaveformVisualizerAlternative;
