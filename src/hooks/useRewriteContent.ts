
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

export const useRewriteContent = () => {
  const [isRewriting, setIsRewriting] = useState(false);
  const { user } = useUser();

  const rewriteContent = async (text: string): Promise<string | null> => {
    if (!text.trim()) {
      toast.error('Please provide text to rewrite');
      return null;
    }

    setIsRewriting(true);
    try {
      const { data, error } = await supabase.functions.invoke('rewrite-content', {
        body: { 
          text,
          userId: user?.id || null
        }
      });

      if (error) {
        console.error('Rewrite error:', error);
        toast.error('Failed to rewrite content. Please try again.');
        return null;
      }

      if (!data?.rewrittenText) {
        toast.error('No rewritten content received');
        return null;
      }

      return data.rewrittenText;
    } catch (error) {
      console.error('Error calling rewrite function:', error);
      toast.error('Failed to rewrite content. Please try again.');
      return null;
    } finally {
      setIsRewriting(false);
    }
  };

  return {
    rewriteContent,
    isRewriting
  };
};
