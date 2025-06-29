
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  isLoading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupUser = async () => {
      if (isLoaded && user) {
        // Create or update user profile
        const { error } = await supabase
          .from('profiles')
          .upsert({
            clerk_user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            first_name: user.firstName,
            last_name: user.lastName,
            avatar_url: user.imageUrl,
          });

        if (error) {
          console.error('Error upserting user profile:', error);
        }
      }
      setIsLoading(false);
    };

    setupUser();
  }, [user, isLoaded]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        userId: user?.id || null,
        isLoading: isLoading || !isLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
