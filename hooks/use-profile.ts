/**
 * Profile Hooks
 * Custom hooks for profile management
 */

import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  voterId: string;
  nin: string;
  profileImage?: string;
  isVerified: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  lastUpdated: string;
  createdAt: string;
  roles: string[];
  permissions: string[];
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  nin: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface ProfileStats {
  totalVotes: number;
  electionsParticipated: number;
  accountAge: number;
  lastLogin: string;
  verificationScore: number;
  profileCompleteness: number;
}

export interface UseProfileReturn {
  profile: UserProfile | null;
  stats: ProfileStats | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  isUpdating: boolean;
  updateProfile: (data: ProfileFormData) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  downloadProfile: () => void;
  startEditing: () => void;
  cancelEditing: () => void;
  refreshProfile: () => Promise<void>;
  validateProfile: (data: ProfileFormData) => Record<string, string>;
}

/**
 * Main Profile Hook
 */
export function useProfile(userId?: string): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock profile data
  const mockProfile: UserProfile = {
    id: userId || '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+234 801 234 5678',
    dateOfBirth: '1990-05-15',
    address: '123 Main Street, Victoria Island',
    state: 'Lagos',
    lga: 'Eti-Osa',
    ward: 'Ward 1',
    pollingUnit: 'PU 001',
    voterId: 'VOT123456789',
    nin: '12345678901',
    isVerified: true,
    verificationStatus: 'verified',
    lastUpdated: new Date().toISOString(),
    createdAt: '2023-01-01T00:00:00Z',
    roles: ['voter'],
    permissions: ['vote', 'view_elections'],
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsUpdates: false,
      language: 'en',
      theme: 'light'
    }
  };

  const mockStats: ProfileStats = {
    totalVotes: 15,
    electionsParticipated: 8,
    accountAge: 365,
    lastLogin: new Date().toISOString(),
    verificationScore: 95,
    profileCompleteness: 88
  };

  // Load profile data
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(mockProfile);
      setStats(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update profile
  const updateProfile = useCallback(async (data: ProfileFormData) => {
    setIsUpdating(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedProfile: UserProfile = {
        ...profile!,
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [profile]);

  // Upload image
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    try {
      // Simulate image upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      
      // Update profile with new image
      if (profile) {
        setProfile({
          ...profile,
          profileImage: imageUrl,
          lastUpdated: new Date().toISOString()
        });
      }
      
      return imageUrl;
    } catch (err) {
      throw new Error('Failed to upload image');
    }
  }, [profile]);

  // Download profile
  const downloadProfile = useCallback(() => {
    if (!profile) return;

    const profileData = {
      personalInfo: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        voterId: profile.voterId,
        nin: profile.nin
      },
      address: {
        address: profile.address,
        state: profile.state,
        lga: profile.lga,
        ward: profile.ward,
        pollingUnit: profile.pollingUnit
      },
      preferences: profile.preferences,
      stats: stats,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile-${profile.voterId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [profile, stats]);

  // Start editing
  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  // Validate profile data
  const validateProfile = useCallback((data: ProfileFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!data.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!data.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        errors.dateOfBirth = 'You must be at least 18 years old to vote';
      }
    }

    if (!data.nin.trim()) {
      errors.nin = 'NIN is required';
    } else if (!/^\d{11}$/.test(data.nin)) {
      errors.nin = 'NIN must be 11 digits';
    }

    if (!data.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!data.state) {
      errors.state = 'State is required';
    }

    if (!data.lga) {
      errors.lga = 'LGA is required';
    }

    if (!data.ward.trim()) {
      errors.ward = 'Ward is required';
    }

    if (!data.pollingUnit.trim()) {
      errors.pollingUnit = 'Polling unit is required';
    }

    return errors;
  }, []);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    stats,
    isLoading,
    error,
    isEditing,
    isUpdating,
    updateProfile,
    uploadImage,
    downloadProfile,
    startEditing,
    cancelEditing,
    refreshProfile,
    validateProfile
  };
}

/**
 * Profile Image Hook
 */
export function useProfileImage(profileId: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image size must be less than 5MB');
      }

      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeImage = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
  }, [imageUrl]);

  return {
    imageUrl,
    isUploading,
    uploadError,
    uploadImage,
    removeImage
  };
}

/**
 * Profile Validation Hook
 */
export function useProfileValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const validateField = useCallback((field: string, value: any, rules: any) => {
    const fieldErrors: string[] = [];

    if (rules.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${rules.label || field} is required`);
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      fieldErrors.push(`${rules.label || field} must be at least ${rules.minLength} characters`);
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      fieldErrors.push(`${rules.label || field} must be no more than ${rules.maxLength} characters`);
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      fieldErrors.push(`${rules.label || field} format is invalid`);
    }

    if (value && rules.custom && !rules.custom(value)) {
      fieldErrors.push(rules.message || `${rules.label || field} is invalid`);
    }

    return fieldErrors[0] || null;
  }, []);

  const validateForm = useCallback((data: ProfileFormData, rules: Record<string, any>) => {
    const newErrors: Record<string, string> = {};

    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const fieldValue = (data as any)[field];
      const error = validateField(field, fieldValue, fieldRules);
      
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
    
    return newErrors;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValid,
    validateForm,
    validateField,
    clearErrors,
    clearFieldError
  };
}

/**
 * Profile Preferences Hook
 */
export function useProfilePreferences(profileId: string) {
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailUpdates: true,
    smsUpdates: false,
    language: 'en',
    theme: 'light' as 'light' | 'dark' | 'auto'
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePreference = useCallback(async (key: string, value: any) => {
    setIsUpdating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPreferences(prev => ({
        ...prev,
        [key]: value
      }));
    } catch (err) {
      console.error('Failed to update preference:', err);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences: typeof preferences) => {
    setIsUpdating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPreferences(newPreferences);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    preferences,
    isUpdating,
    updatePreference,
    updatePreferences
  };
}

export default useProfile;
