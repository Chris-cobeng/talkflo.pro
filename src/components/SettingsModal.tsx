import { X, Save, Globe, Languages, BookOpen, Wand2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Settings } from '@/types';
import { toast } from 'sonner';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const { settings, loading, saving, saveSettings } = useUserSettings();
  const [formSettings, setFormSettings] = useState<Settings>(settings);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    const result = await saveSettings(formSettings);
    if (result?.success) {
      toast.success('Settings saved successfully!');
      onClose();
    } else {
      toast.error('Failed to save settings. Please try again.');
    }
  };

  const handleSpecialWordsChange = (value: string) => {
    const words = value.split(',').map(word => word.trim()).filter(word => word.length > 0);
    setFormSettings(prev => ({ ...prev, specialWords: words }));
  };

  const languageOptions = [
    { value: 'auto', label: 'Auto Detect' },
    { value: 'en', label: 'English (US)' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ru', label: 'Russian' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
            <div className="text-slate-700 text-center font-medium">Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 animate-in fade-in duration-500">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-2xl border-b border-white/50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-24">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Settings</h1>
                <p className="text-slate-500 text-sm">Customize your Talkflo experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white/70 hover:bg-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:shadow-xl border border-white/60 hover:border-white/80 hover:scale-105"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="space-y-8 sm:space-y-12">
          
          {/* Language Settings Section */}
          <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:bg-white/80">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Language Settings</h3>
                <p className="text-slate-500 text-sm">Configure your input and output languages</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <Languages className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-lg font-bold text-slate-800">Input Language</h4>
                  </div>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    Choose the language you will be speaking in. Leave as auto detect for automatic detection.
                  </p>
                  <select
                    value={formSettings.inputLanguage}
                    onChange={(e) => setFormSettings(prev => ({ ...prev, inputLanguage: e.target.value }))}
                    className="w-full bg-white/80 backdrop-blur-sm text-slate-700 p-4 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {languageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <Languages className="w-5 h-5 text-teal-600" />
                    <h4 className="text-lg font-bold text-slate-800">Output Language</h4>
                  </div>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    Generate written content in your preferred language.
                  </p>
                  <select
                    value={formSettings.outputLanguage}
                    onChange={(e) => setFormSettings(prev => ({ ...prev, outputLanguage: e.target.value }))}
                    className="w-full bg-white/80 backdrop-blur-sm text-slate-700 p-4 rounded-xl border border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {languageOptions.filter(option => option.value !== 'auto').map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Special Words Section */}
          <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:bg-white/80">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Special Words</h3>
                <p className="text-slate-500 text-sm">Define custom vocabulary for accurate transcription</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Add names or specific terms that you want Talkflo to spell correctly.
              </p>
              <textarea
                value={formSettings.specialWords.join(', ')}
                onChange={(e) => handleSpecialWordsChange(e.target.value)}
                placeholder="separate each word with a comma"
                className="w-full bg-white/80 backdrop-blur-sm text-slate-700 p-4 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none h-36 resize-none transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* AI Rewrite Settings Section */}
          <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:bg-white/80">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">AI Rewrite Settings</h3>
                <p className="text-slate-500 text-sm">Customize how AI transforms your content</p>
              </div>
            </div>
            
            {/* Rewrite Level */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-6">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h4 className="text-lg font-bold text-slate-800">Rewrite Level</h4>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  {['low', 'medium', 'high'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormSettings(prev => ({ ...prev, rewriteLevel: level as 'low' | 'medium' | 'high' }))}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                        formSettings.rewriteLevel === level
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'bg-white/80 text-slate-700 hover:bg-white border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  Your voice note will be rewritten according to your chosen level and style. Talkflo may restructure content as needed.
                </p>
              </div>

              {/* Writing Style */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center space-x-3 mb-6">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-lg font-bold text-slate-800">Writing Style</h4>
                </div>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Describe the writing style you want Talkflo to use when rewriting your notes.
                </p>
                <textarea
                  value={formSettings.writingStyle}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, writingStyle: e.target.value }))}
                  placeholder="e.g., professional and formal, casual and conversational, academic, creative and engaging..."
                  className="w-full bg-white/80 backdrop-blur-sm text-slate-700 p-4 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none h-36 resize-none transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-12">
            <button
              onClick={handleSave}
              disabled={saving}
              className="group relative flex items-center gap-4 px-12 py-5 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-900 hover:to-black text-white rounded-2xl transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-slate-500/50 hover:shadow-2xl hover:scale-105 transform"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Save className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">{saving ? 'Saving Settings...' : 'Save Settings'}</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
