
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { Settings } from '@/types';

export const useUserSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    inputLanguage: 'auto',
    outputLanguage: 'en',
    writingStyle: '',
    outputLength: 'medium',
    rewriteLevel: 'medium',
    specialWords: [],
    quickSelectionLanguage: false,
    quickSelectionStyle: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useUser();

  const fetchSettings = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching settings for user:', user.id);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        // Don't throw error, just use default settings
        return;
      }

      if (data) {
        console.log('Loaded settings:', data);
        setSettings({
          inputLanguage: data.input_language || 'auto',
          outputLanguage: data.output_language || 'en',
          writingStyle: data.writing_style || '',
          outputLength: data.output_length as 'short' | 'medium' | 'long' || 'medium',
          rewriteLevel: data.rewrite_level as 'low' | 'medium' | 'high' || 'medium',
          specialWords: data.special_words || [],
          quickSelectionLanguage: data.quick_selection_language || false,
          quickSelectionStyle: data.quick_selection_style || false
        });
      } else {
        console.log('No existing settings found, using defaults');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    if (!user?.id) {
      console.error('No user ID available for saving settings');
      return { success: false, error: 'User not authenticated' };
    }

    setSaving(true);
    try {
      console.log('Saving settings for user:', user.id, newSettings);
      
      const settingsData = {
        clerk_user_id: user.id,
        input_language: newSettings.inputLanguage,
        output_language: newSettings.outputLanguage,
        writing_style: newSettings.writingStyle,
        output_length: newSettings.outputLength,
        rewrite_level: newSettings.rewriteLevel,
        special_words: newSettings.specialWords,
        quick_selection_language: newSettings.quickSelectionLanguage,
        quick_selection_style: newSettings.quickSelectionStyle,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_settings')
        .upsert(settingsData, {
          onConflict: 'clerk_user_id'
        })
        .select();

      if (error) {
        console.error('Error saving settings:', error);
        throw error;
      }

      console.log('Settings saved successfully:', data);
      setSettings(newSettings);
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user?.id]);

  return {
    settings,
    loading,
    saving,
    saveSettings,
    refetch: fetchSettings
  };
};
