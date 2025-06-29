import { useAuth } from '@clerk/clerk-react';
import { useMemo } from 'react';

export interface SubscriptionLimits {
  maxRecordingsPerMonth: number;
  maxRecordingDuration: number; // in minutes
  hasUnlimitedRecordings: boolean;
  hasMagicChat: boolean;
  hasAdvancedAI: boolean;
  hasPrioritySupport: boolean;
  hasCustomStyles: boolean;
  hasTeamFeatures: boolean;
}

export interface PlanInfo {
  name: 'Free' | 'Pro' | 'Enterprise';
  displayName: string;
  limits: SubscriptionLimits;
}

export const useSubscription = () => {
  const { has } = useAuth();

  // Check current plan
  const hasProPlan = has({ plan: 'talkflo_pro' });
  const hasEnterprisePlan = has({ plan: 'enterprise' });
  
  // Check individual features
  const hasUnlimitedRecordings = has({ feature: 'unlimited_recordings' });
  const hasMagicChat = has({ feature: 'magic_chat' });
  const hasAdvancedAI = has({ feature: 'advanced_ai' });
  const hasPrioritySupport = has({ feature: 'priority_support' });
  const hasCustomStyles = has({ feature: 'custom_styles' });
  const hasTeamFeatures = has({ feature: 'team_features' });

  const planInfo: PlanInfo = useMemo(() => {
    if (hasEnterprisePlan) {
      return {
        name: 'Enterprise',
        displayName: 'Enterprise',
        limits: {
          maxRecordingsPerMonth: -1, // unlimited
          maxRecordingDuration: 120, // 2 hours
          hasUnlimitedRecordings: true,
          hasMagicChat: true,
          hasAdvancedAI: true,
          hasPrioritySupport: true,
          hasCustomStyles: true,
          hasTeamFeatures: true,
        }
      };
    }
    
    if (hasProPlan) {
      return {
        name: 'Pro',
        displayName: 'Pro',
        limits: {
          maxRecordingsPerMonth: -1, // unlimited
          maxRecordingDuration: 60,
          hasUnlimitedRecordings: true,
          hasMagicChat: true,
          hasAdvancedAI: true,
          hasPrioritySupport: true,
          hasCustomStyles: true,
          hasTeamFeatures: false,
        }
      };
    }
    
    // Free plan
    return {
      name: 'Free',
      displayName: 'Free',
      limits: {
        maxRecordingsPerMonth: 10,
        maxRecordingDuration: 5,
        hasUnlimitedRecordings: false,
        hasMagicChat: false,
        hasAdvancedAI: false,
        hasPrioritySupport: false,
        hasCustomStyles: false,
        hasTeamFeatures: false,
      }
    };
  }, [hasProPlan, hasEnterprisePlan]);

  // Helper functions
  const canCreateRecording = (currentMonthlyCount: number): boolean => {
    if (planInfo.limits.hasUnlimitedRecordings) return true;
    return currentMonthlyCount < planInfo.limits.maxRecordingsPerMonth;
  };

  const getRemainingRecordings = (currentMonthlyCount: number): number => {
    if (planInfo.limits.hasUnlimitedRecordings) return -1; // unlimited
    return Math.max(0, planInfo.limits.maxRecordingsPerMonth - currentMonthlyCount);
  };

  const canUseFeature = (feature: keyof SubscriptionLimits): boolean => {
    return planInfo.limits[feature] as boolean;
  };

  const getUpgradeMessage = (): string => {
    if (planInfo.name === 'Free') {
      return 'Upgrade to Pro for unlimited recordings and advanced features';
    }
    if (planInfo.name === 'Pro') {
      return 'Upgrade to Enterprise for team features and advanced integrations';
    }
    return '';
  };

  const isFeatureLocked = (feature: keyof SubscriptionLimits): boolean => {
    return !canUseFeature(feature);
  };

  return {
    planInfo,
    limits: planInfo.limits,
    
    // Plan checks
    isFreePlan: planInfo.name === 'Free',
    isProPlan: planInfo.name === 'Pro',
    isEnterprisePlan: planInfo.name === 'Enterprise',
    
    // Feature checks
    hasUnlimitedRecordings,
    hasMagicChat,
    hasAdvancedAI,
    hasPrioritySupport,
    hasCustomStyles,
    hasTeamFeatures,
    
    // Helper functions
    canCreateRecording,
    getRemainingRecordings,
    canUseFeature,
    isFeatureLocked,
    getUpgradeMessage,
  };
};

// Hook for checking recording limits specifically
export const useRecordingLimits = () => {
  const { limits, canCreateRecording, getRemainingRecordings } = useSubscription();
  
  // In a real app, you'd fetch this from your database
  // For now, we'll simulate it
  const currentMonthlyRecordings = 7; // This should come from your notes data
  
  return {
    maxDuration: limits.maxRecordingDuration,
    maxPerMonth: limits.maxRecordingsPerMonth,
    currentCount: currentMonthlyRecordings,
    canCreate: canCreateRecording(currentMonthlyRecordings),
    remaining: getRemainingRecordings(currentMonthlyRecordings),
    isUnlimited: limits.hasUnlimitedRecordings,
  };
};
