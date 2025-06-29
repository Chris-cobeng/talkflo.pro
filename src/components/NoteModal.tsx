
import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Save, MessageCircle, FileText, Wand2, Loader2, Trash2, FolderOpen, Image, Share2, Copy, ArrowUpRight, ArrowDownLeft, Download, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Note } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Protect } from '@clerk/clerk-react';
import UpgradeCard from '@/components/UpgradeCard';

interface NoteModalProps {
  note: Note;
  onClose: () => void;
  onUpdateNote?: (noteId: string, updatedContent: string) => void;
  onDeleteNote?: (noteId: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const NoteModal = ({ note, onClose, onUpdateNote, onDeleteNote }: NoteModalProps) => {
  const [activeTab, setActiveTab] = useState('rewritten');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.rewrittenContent);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm here to help you with your note "${note.title}". You can ask me questions about the content, request edits, or discuss ideas related to this note.`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showTranscriptBelow, setShowTranscriptBelow] = useState(false);
  const [showMagicChat, setShowMagicChat] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showRewriteUpgrade, setShowRewriteUpgrade] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedImageSize, setSelectedImageSize] = useState({ name: 'Twitter', width: 1200, height: 675, description: 'Twitter' });
  const [selectedTheme, setSelectedTheme] = useState({ name: 'Default', bg: '#334155', text: '#ffffff', accent: '#f97316' });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Auto-resize textarea to fit content
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  // Format date to simple format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString; // fallback to original if parsing fails
    }
  };

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (onUpdateNote && hasUnsavedChanges && editedContent.trim()) {
      setIsSaving(true);
      try {
        onUpdateNote(note.id, editedContent);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [onUpdateNote, hasUnsavedChanges, editedContent, note.id]);

  // Debounced auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && isEditing) {
      const timeoutId = setTimeout(() => {
        autoSave();
      }, 2000); // Save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [editedContent, hasUnsavedChanges, isEditing, autoSave]);

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setHasUnsavedChanges(value !== note.rewrittenContent);
  };

  const handleSave = () => {
    if (onUpdateNote && hasUnsavedChanges) {
      onUpdateNote(note.id, editedContent);
      setHasUnsavedChanges(false);
    }
    setIsEditing(false);
  };

  const handleRewrite = async () => {
    setIsRewriting(true);
    try {
      const { data, error } = await supabase.functions.invoke('rewrite-content', {
        body: { 
          text: editedContent,
          style: 'professional',
          length: 'medium'
        }
      });

      if (error) throw error;

      if (data?.rewrittenText) {
        setEditedContent(data.rewrittenText);
        setHasUnsavedChanges(true);
        // toast({
        //   title: "Content Rewritten",
        //   description: "Your content has been rewritten using AI",
        // });
      }
    } catch (error) {
      console.error('Error rewriting content:', error);
      // toast({
      //   title: "Rewrite Failed",
      //   description: "Failed to rewrite content. Please try again.",
      //   variant: "destructive",
      // });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm('You have unsaved changes. Do you want to discard them?');
      if (!confirmSwitch) return;
      setEditedContent(note.rewrittenContent);
      setHasUnsavedChanges(false);
      setIsEditing(false);
    }
    setActiveTab(value);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('magic-chat', {
        body: { 
          message: userMessage.content,
          noteContent: note.rewrittenContent,
          noteTitle: note.title
        }
      });

      if (error) throw error;

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in magic chat:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      if (activeTab === 'chat') {
        handleSendMessage();
      }
      // Removed manual save since we have auto-save
    }
    if (e.key === 'Escape') {
      if (isEditing) {
        // Auto-save before exiting edit mode if there are changes
        if (hasUnsavedChanges) {
          autoSave();
        }
        setIsEditing(false);
      } else {
        onClose();
      }
    }
  };

  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(note.originalTranscript);
      // toast({
      //   title: "Copied!",
      //   description: "Transcript copied to clipboard",
      // });
    } catch (error) {
      // toast({
      //   title: "Copy Failed",
      //   description: "Failed to copy transcript",
      //   variant: "destructive",
      // });
    }
  };

  const handleCopyNoteAndTranscript = async () => {
    try {
      const combined = `${editedContent}\n\n--- Original Transcript ---\n${note.originalTranscript}`;
      await navigator.clipboard.writeText(combined);
      // toast({
      //   title: "Copied!",
      //   description: "Note and transcript copied to clipboard",
      // });
    } catch (error) {
      // toast({
      //   title: "Copy Failed",
      //   description: "Failed to copy content",
      //   variant: "destructive",
      // });
    }
  };

  const handleCopyAiMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // toast({
      //   title: "Copied!",
      //   description: "AI response copied to clipboard",
      // });
    } catch (error) {
      // toast({
      //   title: "Copy Failed",
      //   description: "Failed to copy AI response",
      //   variant: "destructive",
      // });
    }
  };

  // Image generation functions
  const imageSizes = [
    { name: 'Square', width: 1080, height: 1080, description: 'Instagram' },
    { name: 'Twitter', width: 1200, height: 675, description: 'Twitter' },
    { name: 'Story', width: 1080, height: 1920, description: 'Story' },
  ];

  const colorThemes = [
    { name: 'Default', bg: '#334155', text: '#ffffff', accent: '#f97316' },
    { name: 'Ocean', bg: '#0f172a', text: '#e2e8f0', accent: '#06b6d4' },
    { name: 'Forest', bg: '#14532d', text: '#f0fdf4', accent: '#22c55e' },
    { name: 'Sunset', bg: '#7c2d12', text: '#fef7ff', accent: '#f59e0b' },
    { name: 'Purple', bg: '#581c87', text: '#f3e8ff', accent: '#a855f7' },
    { name: 'Pink', bg: '#831843', text: '#fdf2f8', accent: '#ec4899' },
  ];

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const generateImage = async () => {
    if (!canvasRef.current) return;

    setIsGeneratingImage(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setIsGeneratingImage(false);
      return;
    }

    // Set canvas size
    canvas.width = selectedImageSize.width;
    canvas.height = selectedImageSize.height;

    // Clear canvas and set background
    ctx.fillStyle = selectedTheme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate responsive sizing
    const padding = Math.min(canvas.width, canvas.height) * 0.08;
    const maxContentWidth = canvas.width - (padding * 2);

    // Set text styles
    ctx.fillStyle = selectedTheme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Draw date
    const dateSize = Math.max(16, canvas.width * 0.025);
    ctx.font = `${dateSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillStyle = selectedTheme.text;
    ctx.globalAlpha = 0.8;
    ctx.fillText(formatDate(note.createdAt), canvas.width / 2, padding);
    ctx.globalAlpha = 1;

    // Draw title
    const titleSize = Math.max(24, canvas.width * 0.045);
    ctx.font = `bold ${titleSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillStyle = selectedTheme.text;
    
    const titleLines = wrapText(ctx, note.title, maxContentWidth);
    let currentY = padding + dateSize + 40;
    
    titleLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, currentY + (index * (titleSize + 10)));
    });
    currentY += titleLines.length * (titleSize + 10) + 30;

    // Draw accent line
    ctx.fillStyle = selectedTheme.accent;
    const lineWidth = Math.min(80, canvas.width * 0.1);
    const lineHeight = 4;
    ctx.fillRect((canvas.width - lineWidth) / 2, currentY, lineWidth, lineHeight);
    currentY += 40;

    // Draw content
    const contentSize = Math.max(16, canvas.width * 0.035);
    ctx.font = `${contentSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillStyle = selectedTheme.text;
    ctx.textAlign = 'left';

    // Limit content length for better readability
    const maxContentLength = selectedImageSize.height > selectedImageSize.width ? 400 : 300;
    let contentText = editedContent;
    if (contentText.length > maxContentLength) {
      contentText = contentText.substring(0, maxContentLength) + '...';
    }

    const contentLines = wrapText(ctx, contentText, maxContentWidth);
    const maxLines = Math.floor((canvas.height - currentY - padding - 60) / (contentSize + 8));
    const displayLines = contentLines.slice(0, maxLines);

    displayLines.forEach((line, index) => {
      ctx.fillText(line, padding, currentY + (index * (contentSize + 8)));
    });

    // Add branding at bottom
    ctx.textAlign = 'center';
    ctx.font = `${Math.max(12, canvas.width * 0.02)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillStyle = selectedTheme.text;
    ctx.globalAlpha = 0.6;
    ctx.fillText('Created with Talkflo', canvas.width / 2, canvas.height - padding / 2);
    ctx.globalAlpha = 1;

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setGeneratedImageUrl(url);
        setShowDownloadModal(true);
      }
      setIsGeneratingImage(false);
    }, 'image/png');
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;

    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${selectedImageSize.name.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // toast({
    //   title: "Image Downloaded",
    //   description: "Your note image has been downloaded successfully",
    // });
    setShowDownloadModal(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/50 to-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto" 
      onKeyDown={handleKeyPress}
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-slate-700 to-slate-800 backdrop-blur-xl rounded-3xl w-full max-w-4xl my-8 shadow-2xl border border-slate-600/30 relative"
        onClick={(e) => e.stopPropagation()}
      >


        {/* Header */}
        <div className="p-4 sm:p-6 text-center">
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute left-0 flex items-center space-x-2">
              <Protect
                plan="talkflo_pro"
                fallback={
                  <button
                    onClick={() => setShowRewriteUpgrade(true)}
                    className="p-2 hover:bg-slate-600/30 rounded-lg transition-all duration-200 group"
                    title="AI Rewrite"
                  >
                    <Wand2 className="w-4 h-4 text-slate-400 group-hover:text-orange-400 transition-colors" />
                  </button>
                }
              >
                <button
                  onClick={handleRewrite}
                  disabled={isRewriting}
                  className="p-2 hover:bg-slate-600/30 rounded-lg transition-all duration-200 disabled:opacity-50 group"
                  title="AI Rewrite"
                >
                  {isRewriting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                  ) : (
                    <Wand2 className="w-4 h-4 text-slate-400 group-hover:text-orange-400 transition-colors" />
                  )}
                </button>
              </Protect>
            </div>
            <button 
              onClick={() => setShowMagicChat(!showMagicChat)}
              className="px-3 py-1 bg-slate-600/50 hover:bg-slate-500/50 text-slate-300 hover:text-white text-sm rounded-full transition-all duration-200 cursor-pointer"
            >
              {showMagicChat ? 'note' : 'magic chat'}
            </button>
            <div className="absolute right-0 flex items-center space-x-2">
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-600/30 rounded-full transition-all duration-200 group"
                title="Close"
              >
                <X className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
          
          <div className="text-slate-300 text-base mb-5 font-medium">
            {formatDate(note.createdAt)}
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight max-w-4xl">
            {note.title}
          </h1>
          
          <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mb-8 rounded-full"></div>
          
          {!showMagicChat ? (
            <>
              <div className="text-white text-base sm:text-lg leading-8 mb-10 max-w-4xl w-full">
                {isEditing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => {
                      handleContentChange(e.target.value);
                      adjustTextareaHeight(e.target);
                    }}
                    ref={(el) => {
                      if (el) {
                        // Set initial height when component mounts
                        setTimeout(() => adjustTextareaHeight(el), 0);
                      }
                    }}
                    className="w-full resize-none text-base sm:text-lg leading-8 bg-transparent border-none text-white placeholder-slate-400 p-6 font-normal tracking-wide focus:outline-none focus:ring-0 focus:border-none overflow-hidden"
                    placeholder="Edit your note content..."
                    autoFocus
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      minHeight: 'auto',
                      height: 'auto'
                    }}
                  />
                ) : (
                  <div 
                    className="cursor-text p-6 rounded-xl font-normal tracking-wide whitespace-pre-wrap w-full"
                    onClick={() => setIsEditing(true)}
                  >
                    {editedContent}
                  </div>
                )}
              </div>
              
              {isEditing && (isSaving || hasUnsavedChanges) && (
                <div className="flex justify-center mb-10">
                  <div className="flex items-center text-sm text-slate-400">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                        <span>Auto-saving in 2s</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Protect
              plan="talkflo_pro"
              fallback={
                <div className="flex items-center justify-center py-8">
                  <UpgradeCard 
                    title="Magic Chat is Talkflo Prime Feature"
                    description="Unlock AI-powered conversations about your notes with Magic Chat. Get suggestions, ask questions, and explore ideas."
                    feature="Magic Chat assistant"
                  />
                </div>
              }
            >
              {/* Magic Chat Content */}
              <div className="space-y-8 mb-10 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 px-2">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] sm:max-w-[85%] ${message.role === 'user' ? '' : 'group'}`}>
                      <div
                        className={`rounded-3xl shadow-xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6'
                            : 'bg-gradient-to-br from-slate-600/70 to-slate-700/70 text-white border border-slate-500/20 backdrop-blur-sm p-6 relative'
                        }`}
                      >
                        <div className="text-sm sm:text-base leading-8 font-normal tracking-wide whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                        {message.role === 'assistant' && (
                        <div className="flex justify-end mt-4">
                        <button
                            onClick={() => handleCopyAiMessage(message.content)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-slate-500/30 rounded-lg"
                          title="Copy AI response"
                        >
                        <Copy className="w-4 h-4 text-slate-300 hover:text-white" />
                        </button>
                        </div>
                        )}
                      </div>
                      
                      
                    </div>
                  </div>
                ))}
                
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] sm:max-w-[85%]">
                      <div className="bg-gradient-to-br from-slate-600/70 to-slate-700/70 border border-slate-500/20 text-white rounded-3xl p-6 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce"></div>
                          <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <span className="ml-3 text-sm text-slate-300">AI is thinking...</span>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="bg-slate-600/30 rounded-2xl p-4 border border-slate-500/20 backdrop-blur-sm">
                <div className="flex items-end space-x-4">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything about this note..."
                    className="flex-1 min-h-[60px] max-h-[120px] resize-none text-sm sm:text-base bg-slate-700/50 border-slate-500/50 text-white placeholder-slate-400 rounded-xl p-4 font-normal leading-7 focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isAiTyping}
                    className="px-6 py-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-sm font-medium shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
                  >
                    {isAiTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
                

              </div>
            </Protect>
          )}
        </div>

        {/* Bottom Action Buttons - Always shown below note content when not in Magic Chat */}
        {!showMagicChat && (
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-center space-x-6 sm:space-x-8 mb-8">
              <button 
                onClick={async () => {
                  const confirmDelete = window.confirm('Are you sure you want to delete this note? This action cannot be undone.');
                  if (confirmDelete && onDeleteNote) {
                    try {
                      await onDeleteNote(note.id);
                      onClose();
                      // toast({
                      //   title: "Note deleted",
                      //   description: "Note has been successfully deleted",
                      // });
                    } catch (error) {
                      // toast({
                      //   title: "Error",
                      //   description: "Failed to delete note",
                      //   variant: "destructive",
                      // });
                    }
                  }
                }}
                className="p-3 hover:bg-slate-600/30 rounded-xl transition-all duration-200 group"
                title="Delete note"
              >
                <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                  <Trash2 className="w-5 h-5 text-slate-700" />
                </div>
              </button>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(editedContent);
                  // toast({
                  //   title: "Copied!",
                  //   description: "Note content copied to clipboard",
                  // });
                }}
                className="p-3 hover:bg-slate-600/30 rounded-xl transition-all duration-200 group"
                title="Copy note"
              >
                <div className="w-10 h-10 bg-slate-300 rounded-xl flex items-center justify-center group-hover:bg-slate-400 transition-colors">
                  <Copy className="w-5 h-5 text-slate-700" />
                </div>
              </button>
              
              <button 
                onClick={() => setShowImageGenerator(!showImageGenerator)}
                className="p-3 hover:bg-slate-600/30 rounded-xl transition-all duration-200 group"
                title="Create image"
              >
                <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                  <Image className="w-5 h-5 text-slate-700" />
                </div>
              </button>
              
              <button 
                onClick={async () => {
                  const shareData = {
                    title: note.title,
                    text: editedContent,
                  };

                  if (navigator.share) {
                    try {
                      await navigator.share(shareData);
                    } catch (error) {
                      if (error.name !== 'AbortError') {
                        await navigator.clipboard.writeText(`${note.title}\n\n${editedContent}`);
                        // toast({
                        //   title: "Copied to clipboard",
                        //   description: "Note content copied since sharing failed",
                        // });
                      }
                    }
                  } else {
                    await navigator.clipboard.writeText(`${note.title}\n\n${editedContent}`);
                    // toast({
                    //   title: "Copied to clipboard",
                    //   description: "Note content copied (sharing not supported)",
                    // });
                  }
                }}
                className="p-3 hover:bg-slate-600/30 rounded-xl transition-all duration-200 group"
                title="Share note"
              >
                <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                  <Share2 className="w-5 h-5 text-slate-700" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Image Generator Section */}
        {showImageGenerator && !showMagicChat && (
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="text-center">
              {/* Divider line */}
              <div className="w-16 h-1 bg-white/80 mx-auto mb-12 rounded-full"></div>
              
              {/* Title */}
              <h2 className="text-3xl font-bold text-white mb-12">Create a shareable image</h2>
              
              {/* Size Selection */}
              <div className="flex items-center justify-center space-x-3 sm:space-x-6 mb-8">
                {imageSizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedImageSize(size)}
                    className="relative transition-all duration-200 hover:scale-105"
                  >
                    <div
                      className={`rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ${
                        selectedImageSize.name === size.name
                          ? 'border-white/40 bg-gradient-to-b from-white/20 to-transparent'
                          : 'border-white/20 bg-slate-600/30'
                      }`}
                      style={{
                        width: size.width > size.height ? '70px' : size.width === size.height ? '60px' : '50px',
                        height: size.width > size.height ? '50px' : size.width === size.height ? '60px' : '70px'
                      }}
                    />
                  </button>
                ))}
              </div>
              
              {/* Description */}
              <p className="text-slate-300 text-lg mb-12">
                Perfectly sized for {selectedImageSize.description}.
              </p>
              
              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={generateImage}
                  disabled={isGeneratingImage}
                  className="w-full max-w-xs mx-auto block px-8 py-4 bg-white/90 hover:bg-white text-slate-800 rounded-full font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {isGeneratingImage ? 'creating...' : 'create'}
                </button>
                
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full max-w-xs mx-auto block px-8 py-4 bg-slate-600/50 hover:bg-slate-600/70 text-white rounded-full font-medium transition-all duration-200"
                >
                  customize colors
                </button>
              </div>
              
              {/* Color Theme Selection */}
              {showColorPicker && (
                <div className="mt-8 p-6 bg-slate-800/50 rounded-2xl">
                  <div className="grid grid-cols-3 gap-3">
                    {colorThemes.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => setSelectedTheme(theme)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          selectedTheme.name === theme.name
                            ? 'border-orange-400'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: theme.bg }}
                          />
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: theme.text }}
                          />
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </div>
                        <div className="text-white text-sm">{theme.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs - Hidden but functionality preserved */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="hidden">
          <TabsList className="hidden">
            <TabsTrigger value="rewritten">AI</TabsTrigger>
            <TabsTrigger value="original">Original</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* AI Rewritten Content - Hidden */}
          <TabsContent value="rewritten" className="hidden">
          </TabsContent>

          {/* Original Transcript - Hidden */}
          <TabsContent value="original" className="hidden">
          </TabsContent>

          {/* Magic Chat - Hidden */}
          <TabsContent value="chat" className="hidden">
          </TabsContent>
        </Tabs>
        


        
        {/* Orange button positioned at bottom edge of card - Hidden in Magic Chat mode */}
        {!showMagicChat && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <button
              onClick={() => setShowTranscriptBelow(!showTranscriptBelow)}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{
                borderRadius: '24px',
                border: 'none'
              }}
            >
              {showTranscriptBelow ? 'hide original transcript' : 'view original transcript'}
            </button>
          </div>
        )}
        
        {/* Original Transcript Below Card */}
        {showTranscriptBelow && (
          <div className="mt-12 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 max-w-3xl mx-auto">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm sm:text-base mb-6">
              {note.originalTranscript}
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={handleCopyTranscript}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">copy transcript</span>
              </button>
              
              <button
                onClick={handleCopyNoteAndTranscript}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">copy note + transcript</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden Canvas for Image Generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Download Modal */}
        {showDownloadModal && generatedImageUrl && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-600/30">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-6">Image Ready!</h3>
                
                {/* Image Preview */}
                <div className="mb-8 bg-slate-800/50 rounded-2xl p-4">
                  <img 
                    src={generatedImageUrl} 
                    alt="Generated note image"
                    className="max-w-full max-h-80 object-contain rounded-lg shadow-lg mx-auto"
                  />
                </div>
                

                
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={downloadImage}
                    className="flex items-center space-x-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                  </button>
                  
                  <button
                    onClick={() => setShowDownloadModal(false)}
                    className="px-8 py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Rewrite Upgrade Modal */}
        {showRewriteUpgrade && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="relative">
              <UpgradeCard 
                title="AI Rewrite is Talkflo Prime Feature"
                description="Unlock AI-powered content enhancement for your notes. Transform your writing with intelligent rewriting suggestions."
                feature="AI Rewrite assistant"
              />
              <button
                onClick={() => setShowRewriteUpgrade(false)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteModal;
