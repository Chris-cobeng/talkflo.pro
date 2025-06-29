# React Audio Recorder with Waveform Visualization

A complete React audio recording solution with live waveform visualization using WaveSurfer.js.

## Features

- 🎤 Record audio from microphone using MediaRecorder API
- 📊 Live waveform visualization during recording
- ▶️ Playback recorded audio with interactive waveform
- ⏸️ Pause/resume recording functionality  
- 🎨 Fully customizable styling and responsive design
- 🧹 Automatic resource cleanup on component unmount
- ♿ Accessible controls with keyboard support
- 🌙 Dark theme support

## Installation

```bash
npm install wavesurfer.js
```

For TypeScript projects:
```bash
npm install --save-dev @types/react @types/react-dom
```

## Basic Usage

```jsx
import React from 'react';
import AudioRecorder from './AudioRecorder';
import './AudioRecorder.css';

function App() {
  const handleRecordingComplete = (audioBlob) => {
    console.log('Recording completed:', audioBlob);
    // Save to server, local storage, etc.
  };

  const handleError = (error) => {
    console.error('Recording error:', error);
  };

  return (
    <div className="app">
      <h1>Audio Recorder Demo</h1>
      <AudioRecorder
        onRecordingComplete={handleRecordingComplete}
        onError={handleError}
        maxRecordingTime={300000} // 5 minutes
        waveformConfig={{
          height: 100,
          waveColor: '#ff6b6b',
          progressColor: '#4ecdc4',
          backgroundColor: '#f8f9fa'
        }}
      />
    </div>
  );
}

export default App;
```

## Component Props

### AudioRecorder Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | `''` | Additional CSS classes |
| `onRecordingComplete` | function | `() => {}` | Callback when recording finishes |
| `onError` | function | `() => {}` | Callback for error handling |
| `maxRecordingTime` | number | `300000` | Max recording time in milliseconds |
| `waveformConfig` | object | `{}` | Configuration for waveform visualizer |

### WaveformVisualizer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `audioBlob` | Blob | `null` | Audio blob for playback |
| `isRecording` | boolean | `false` | Whether currently recording |
| `height` | number | `80` | Waveform height in pixels |
| `waveColor` | string | `'#ff6b6b'` | Waveform color |
| `progressColor` | string | `'#4ecdc4'` | Progress indicator color |
| `backgroundColor` | string | `'#f8f9fa'` | Background color |
| `className` | string | `''` | Additional CSS classes |
| `onReady` | function | `() => {}` | Callback when waveform is ready |
| `onError` | function | `() => {}` | Callback for error handling |

## Advanced Usage

### Custom Styling

```jsx
const customWaveformConfig = {
  height: 120,
  waveColor: '#9b59b6',
  progressColor: '#e74c3c',
  backgroundColor: '#2c3e50',
  className: 'my-custom-waveform'
};

<AudioRecorder
  className="my-recorder"
  waveformConfig={customWaveformConfig}
  maxRecordingTime={600000} // 10 minutes
/>
```

### Saving Recordings

```jsx
const saveRecording = async (audioBlob) => {
  // Save to local storage
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem('recording', reader.result);
  };
  reader.readAsDataURL(audioBlob);

  // Or upload to server
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  
  await fetch('/api/upload-audio', {
    method: 'POST',
    body: formData
  });
};

<AudioRecorder onRecordingComplete={saveRecording} />
```

### Using with React Refs

```jsx
import { useRef } from 'react';

function MyComponent() {
  const recorderRef = useRef();

  const startExternalRecording = () => {
    // Access internal methods if needed
    recorderRef.current?.startRecording();
  };

  return (
    <AudioRecorder 
      ref={recorderRef}
      onRecordingComplete={handleRecording}
    />
  );
}
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Limited (no microphone plugin in some versions)
- **Mobile**: iOS 14.3+, Android Chrome 88+

## Troubleshooting

### Common Issues

1. **Microphone Permission Denied**
   - Ensure HTTPS in production
   - Check browser permissions
   - Handle the `NotAllowedError` in your error callback

2. **No Waveform Visible**
   - Check that WaveSurfer.js is properly installed
   - Verify container has proper dimensions
   - Check browser console for errors

3. **Recording Not Working**
   - Verify MediaRecorder API support
   - Check microphone hardware
   - Test with different audio formats

### Example Error Handling

```jsx
const handleError = (error) => {
  switch(error.name) {
    case 'NotAllowedError':
      alert('Please allow microphone access');
      break;
    case 'NotFoundError':
      alert('No microphone found');
      break;
    default:
      console.error('Recording error:', error);
  }
};
```

## File Structure

```
src/
├── components/
│   ├── AudioRecorder.jsx       # Main recorder component
│   ├── WaveformVisualizer.jsx  # Waveform display component
│   └── AudioRecorder.css       # Component styles
└── App.jsx                     # Usage example
```

## License

MIT License - feel free to use in your projects!
