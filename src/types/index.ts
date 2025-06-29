
export interface Note {
  id: string;
  title: string;
  originalTranscript: string;
  rewrittenContent: string;
  createdAt: string;
  tags: string[];
  category: string;
  isPrivate: boolean;
  audioUrl?: string;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  noteCount: number;
}

export interface Settings {
  inputLanguage: string;
  outputLanguage: string;
  writingStyle: string;
  outputLength: 'short' | 'medium' | 'long';
  rewriteLevel: 'low' | 'medium' | 'high';
  specialWords: string[];
  quickSelectionLanguage: boolean;
  quickSelectionStyle: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob?: Blob;
}
