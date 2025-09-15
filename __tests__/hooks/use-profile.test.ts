/**
 * Profile Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { 
  useProfile, 
  useProfileImage, 
  useProfileValidation, 
  useProfilePreferences 
} from '@/hooks/use-profile';

describe('useProfile', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useProfile('1'));

    expect(result.current.profile).toBeNull();
    expect(result.current.stats).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isUpdating).toBe(false);
  });

  it('should load profile data', async () => {
    const { result } = renderHook(() => useProfile('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.profile).toBeTruthy();
    expect(result.current.stats).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile?.firstName).toBe('John');
    expect(result.current.profile?.lastName).toBe('Doe');
  });

  it('should update profile', async () => {
    const { result } = renderHook(() => useProfile('1'));

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const updateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+234 801 234 5679',
      dateOfBirth: '1992-03-20',
      address: '456 New Street, Ikoyi',
      state: 'Lagos',
      lga: 'Ikeja',
      ward: 'Ward 2',
      pollingUnit: 'PU 002',
      nin: '12345678902',
      preferences: {
        notifications: false,
        emailUpdates: true,
        smsUpdates: true,
        language: 'yo',
        theme: 'dark' as const
      }
    };

    await act(async () => {
      await result.current.updateProfile(updateData);
    });

    expect(result.current.profile?.firstName).toBe('Jane');
    expect(result.current.profile?.lastName).toBe('Smith');
    expect(result.current.isEditing).toBe(false);
  });

  it('should handle profile update error', async () => {
    const { result } = renderHook(() => useProfile('1'));

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    // Mock update to throw error
    const originalUpdate = result.current.updateProfile;
    result.current.updateProfile = jest.fn().mockRejectedValue(new Error('Update failed'));

    await act(async () => {
      try {
        await result.current.updateProfile({} as any);
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.error).toBe('Update failed');
  });

  it('should upload image', async () => {
    const { result } = renderHook(() => useProfile('1'));

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    let imageUrl: string;

    await act(async () => {
      imageUrl = await result.current.uploadImage(file);
    });

    expect(imageUrl!).toBeTruthy();
    expect(result.current.profile?.profileImage).toBe(imageUrl);
  });

  it('should download profile', () => {
    const { result } = renderHook(() => useProfile('1'));

    // Mock document methods
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };
    const mockCreateElement = jest.fn(() => mockLink);
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true
    });
    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild,
      writable: true
    });
    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild,
      writable: true
    });

    act(() => {
      result.current.downloadProfile();
    });

    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
  });

  it('should start and cancel editing', () => {
    const { result } = renderHook(() => useProfile('1'));

    act(() => {
      result.current.startEditing();
    });

    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.cancelEditing();
    });

    expect(result.current.isEditing).toBe(false);
  });

  it('should validate profile data', () => {
    const { result } = renderHook(() => useProfile('1'));

    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+2348012345678',
      dateOfBirth: '1990-05-15',
      address: '123 Main Street',
      state: 'Lagos',
      lga: 'Eti-Osa',
      ward: 'Ward 1',
      pollingUnit: 'PU 001',
      nin: '12345678901',
      preferences: {
        notifications: true,
        emailUpdates: true,
        smsUpdates: false,
        language: 'en',
        theme: 'light' as const
      }
    };

    const errors = result.current.validateProfile(validData);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should validate profile data with errors', () => {
    const { result } = renderHook(() => useProfile('1'));

    const invalidData = {
      firstName: '',
      lastName: '',
      email: 'invalid-email',
      phone: 'invalid-phone',
      dateOfBirth: '2010-05-15', // Under 18
      address: '',
      state: '',
      lga: '',
      ward: '',
      pollingUnit: '',
      nin: '123', // Too short
      preferences: {
        notifications: true,
        emailUpdates: true,
        smsUpdates: false,
        language: 'en',
        theme: 'light' as const
      }
    };

    const errors = result.current.validateProfile(invalidData);
    expect(Object.keys(errors).length).toBeGreaterThan(0);
    expect(errors.firstName).toBe('First name is required');
    expect(errors.email).toBe('Please enter a valid email address');
    expect(errors.dateOfBirth).toBe('You must be at least 18 years old to vote');
  });
});

describe('useProfileImage', () => {
  it('should initialize with no image', () => {
    const { result } = renderHook(() => useProfileImage('1'));

    expect(result.current.imageUrl).toBeNull();
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadError).toBeNull();
  });

  it('should upload image successfully', async () => {
    const { result } = renderHook(() => useProfileImage('1'));

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      const imageUrl = await result.current.uploadImage(file);
      expect(imageUrl).toBeTruthy();
    });

    expect(result.current.imageUrl).toBeTruthy();
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadError).toBeNull();
  });

  it('should handle upload error for invalid file type', async () => {
    const { result } = renderHook(() => useProfileImage('1'));

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    await act(async () => {
      try {
        await result.current.uploadImage(file);
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.uploadError).toBe('Please select an image file');
    expect(result.current.isUploading).toBe(false);
  });

  it('should handle upload error for large file', async () => {
    const { result } = renderHook(() => useProfileImage('1'));

    // Create a large file (6MB)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

    await act(async () => {
      try {
        await result.current.uploadImage(largeFile);
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.uploadError).toBe('Image size must be less than 5MB');
    expect(result.current.isUploading).toBe(false);
  });

  it('should remove image', () => {
    const { result } = renderHook(() => useProfileImage('1'));

    // Set initial image
    act(() => {
      result.current.imageUrl = 'test-url';
    });

    act(() => {
      result.current.removeImage();
    });

    expect(result.current.imageUrl).toBeNull();
  });
});

describe('useProfileValidation', () => {
  it('should initialize with no errors', () => {
    const { result } = renderHook(() => useProfileValidation());

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(false);
  });

  it('should validate form with errors', () => {
    const { result } = renderHook(() => useProfileValidation());

    const data = {
      firstName: '',
      lastName: 'Doe',
      email: 'invalid-email',
      phone: '+2348012345678',
      dateOfBirth: '1990-05-15',
      address: '123 Main Street',
      state: 'Lagos',
      lga: 'Eti-Osa',
      ward: 'Ward 1',
      pollingUnit: 'PU 001',
      nin: '12345678901',
      preferences: {
        notifications: true,
        emailUpdates: true,
        smsUpdates: false,
        language: 'en',
        theme: 'light' as const
      }
    };

    const rules = {
      firstName: { required: true, label: 'First Name' },
      email: { 
        required: true, 
        pattern: /\S+@\S+\.\S+/, 
        label: 'Email' 
      }
    };

    act(() => {
      result.current.validateForm(data, rules);
    });

    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors.firstName).toBe('First Name is required');
  });

  it('should validate form without errors', () => {
    const { result } = renderHook(() => useProfileValidation());

    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+2348012345678',
      dateOfBirth: '1990-05-15',
      address: '123 Main Street',
      state: 'Lagos',
      lga: 'Eti-Osa',
      ward: 'Ward 1',
      pollingUnit: 'PU 001',
      nin: '12345678901',
      preferences: {
        notifications: true,
        emailUpdates: true,
        smsUpdates: false,
        language: 'en',
        theme: 'light' as const
      }
    };

    const rules = {
      firstName: { required: true, label: 'First Name' },
      email: { 
        required: true, 
        pattern: /\S+@\S+\.\S+/, 
        label: 'Email' 
      }
    };

    act(() => {
      result.current.validateForm(data, rules);
    });

    expect(Object.keys(result.current.errors)).toHaveLength(0);
    expect(result.current.isValid).toBe(true);
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useProfileValidation());

    // Set some errors
    act(() => {
      result.current.validateForm({ firstName: '' }, { firstName: { required: true } });
    });

    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(false);
  });

  it('should clear field error', () => {
    const { result } = renderHook(() => useProfileValidation());

    // Set some errors
    act(() => {
      result.current.validateForm({ firstName: '', lastName: '' }, { 
        firstName: { required: true },
        lastName: { required: true }
      });
    });

    expect(result.current.errors.firstName).toBeTruthy();
    expect(result.current.errors.lastName).toBeTruthy();

    act(() => {
      result.current.clearFieldError('firstName');
    });

    expect(result.current.errors.firstName).toBeUndefined();
    expect(result.current.errors.lastName).toBeTruthy();
  });
});

describe('useProfilePreferences', () => {
  it('should initialize with default preferences', () => {
    const { result } = renderHook(() => useProfilePreferences('1'));

    expect(result.current.preferences).toEqual({
      notifications: true,
      emailUpdates: true,
      smsUpdates: false,
      language: 'en',
      theme: 'light'
    });
    expect(result.current.isUpdating).toBe(false);
  });

  it('should update single preference', async () => {
    const { result } = renderHook(() => useProfilePreferences('1'));

    await act(async () => {
      await result.current.updatePreference('notifications', false);
    });

    expect(result.current.preferences.notifications).toBe(false);
    expect(result.current.preferences.emailUpdates).toBe(true); // Unchanged
  });

  it('should update multiple preferences', async () => {
    const { result } = renderHook(() => useProfilePreferences('1'));

    const newPreferences = {
      notifications: false,
      emailUpdates: false,
      smsUpdates: true,
      language: 'yo',
      theme: 'dark' as const
    };

    await act(async () => {
      await result.current.updatePreferences(newPreferences);
    });

    expect(result.current.preferences).toEqual(newPreferences);
  });

  it('should handle update errors', async () => {
    const { result } = renderHook(() => useProfilePreferences('1'));

    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock updatePreference to throw error
    const originalUpdate = result.current.updatePreference;
    result.current.updatePreference = jest.fn().mockRejectedValue(new Error('Update failed'));

    await act(async () => {
      try {
        await result.current.updatePreference('notifications', false);
      } catch (error) {
        // Expected error
      }
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update preference:', expect.any(Error));
    expect(result.current.isUpdating).toBe(false);

    consoleSpy.mockRestore();
  });
});
