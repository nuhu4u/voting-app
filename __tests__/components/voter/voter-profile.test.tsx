/**
 * Voter Profile Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { 
  VoterProfileSection, 
  ProfileHeader, 
  ProfileForm, 
  ProfileStats 
} from '@/components/voter/voter-profile';

// Mock profile data
const mockProfile = {
  id: '1',
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
  profileImage: null,
  isVerified: true,
  verificationStatus: 'verified' as const,
  lastUpdated: new Date().toISOString(),
  createdAt: '2023-01-01T00:00:00Z',
  roles: ['voter'],
  permissions: ['vote', 'view_elections'],
  preferences: {
    notifications: true,
    emailUpdates: true,
    smsUpdates: false,
    language: 'en',
    theme: 'light' as const
  }
};

const mockStats = {
  totalVotes: 15,
  electionsParticipated: 8,
  accountAge: 365,
  lastLogin: new Date().toISOString()
};

describe('ProfileHeader', () => {
  it('should render profile header with user info', () => {
    const onEdit = jest.fn();
    const onImageUpload = jest.fn();

    const { getByText } = render(
      React.createElement(ProfileHeader, {
        profile: mockProfile,
        onEdit,
        onImageUpload,
        isEditing: false
      })
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john.doe@example.com')).toBeTruthy();
    expect(getByText('Verified')).toBeTruthy();
    expect(getByText('Voter ID: VOT123456789')).toBeTruthy();
  });

  it('should show edit button when not editing', () => {
    const onEdit = jest.fn();
    const onImageUpload = jest.fn();

    const { getByText } = render(
      React.createElement(ProfileHeader, {
        profile: mockProfile,
        onEdit,
        onImageUpload,
        isEditing: false
      })
    );

    expect(getByText('Edit Profile')).toBeTruthy();
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    const onImageUpload = jest.fn();

    const { getByText } = render(
      React.createElement(ProfileHeader, {
        profile: mockProfile,
        onEdit,
        onImageUpload,
        isEditing: false
      })
    );

    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);

    expect(onEdit).toHaveBeenCalled();
  });

  it('should handle image upload', async () => {
    const onEdit = jest.fn();
    const onImageUpload = jest.fn().mockResolvedValue('new-image-url');

    const { container } = render(
      React.createElement(ProfileHeader, {
        profile: mockProfile,
        onEdit,
        onImageUpload,
        isEditing: false
      })
    );

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();

    // Simulate file selection
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput!);

    await waitFor(() => {
      expect(onImageUpload).toHaveBeenCalledWith(file);
    });
  });
});

describe('ProfileForm', () => {
  it('should render profile form with initial values', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { getByDisplayValue } = render(
      React.createElement(ProfileForm, {
        profile: mockProfile,
        onSave,
        onCancel,
        isLoading: false
      })
    );

    expect(getByDisplayValue('John')).toBeTruthy();
    expect(getByDisplayValue('Doe')).toBeTruthy();
    expect(getByDisplayValue('john.doe@example.com')).toBeTruthy();
    expect(getByDisplayValue('+234 801 234 5678')).toBeTruthy();
  });

  it('should handle form input changes', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { getByDisplayValue } = render(
      React.createElement(ProfileForm, {
        profile: mockProfile,
        onSave,
        onCancel,
        isLoading: false
      })
    );

    const firstNameInput = getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    expect(firstNameInput.value).toBe('Jane');
  });

  it('should validate required fields', async () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { getByText, getByDisplayValue } = render(
      React.createElement(ProfileForm, {
        profile: mockProfile,
        onSave,
        onCancel,
        isLoading: false
      })
    );

    const firstNameInput = getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: '' } });

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('First name is required')).toBeTruthy();
    });
  });

  it('should call onSave when form is submitted', async () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      React.createElement(ProfileForm, {
        profile: mockProfile,
        onSave,
        onCancel,
        isLoading: false
      })
    );

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      React.createElement(ProfileForm, {
        profile: mockProfile,
        onSave,
        onCancel,
        isLoading: false
      })
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should show loading state when saving', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      React.createElement(ProfileForm, {
        profile: mockProfile,
        onSave,
        onCancel,
        isLoading: true
      })
    );

    expect(getByText('Saving...')).toBeTruthy();
  });
});

describe('ProfileStats', () => {
  it('should render profile statistics', () => {
    const { getByText } = render(
      React.createElement(ProfileStats, {
        profile: mockProfile,
        stats: mockStats
      })
    );

    expect(getByText('Profile Statistics')).toBeTruthy();
    expect(getByText('15')).toBeTruthy(); // totalVotes
    expect(getByText('Total Votes')).toBeTruthy();
    expect(getByText('8')).toBeTruthy(); // electionsParticipated
    expect(getByText('Elections Participated')).toBeTruthy();
    expect(getByText('365 days')).toBeTruthy(); // accountAge
    expect(getByText('Account Age')).toBeTruthy();
  });
});

describe('VoterProfileSection', () => {
  it('should render profile section', () => {
    const onUpdate = jest.fn();
    const onImageUpload = jest.fn();
    const onDownloadProfile = jest.fn();

    const { getByText } = render(
      React.createElement(VoterProfileSection, {
        profile: mockProfile,
        onUpdate,
        onImageUpload,
        onDownloadProfile
      })
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john.doe@example.com')).toBeTruthy();
  });

  it('should switch to edit mode when edit is clicked', () => {
    const onUpdate = jest.fn();
    const onImageUpload = jest.fn();
    const onDownloadProfile = jest.fn();

    const { getByText, queryByText } = render(
      React.createElement(VoterProfileSection, {
        profile: mockProfile,
        onUpdate,
        onImageUpload,
        onDownloadProfile
      })
    );

    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);

    expect(queryByText('Personal Information')).toBeTruthy();
    expect(queryByText('Save Changes')).toBeTruthy();
  });

  it('should handle profile update', async () => {
    const onUpdate = jest.fn().mockResolvedValue(undefined);
    const onImageUpload = jest.fn();
    const onDownloadProfile = jest.fn();

    const { getByText, getByDisplayValue } = render(
      React.createElement(VoterProfileSection, {
        profile: mockProfile,
        onUpdate,
        onImageUpload,
        onDownloadProfile
      })
    );

    // Enter edit mode
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);

    // Change first name
    const firstNameInput = getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    // Save changes
    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('should handle image upload', async () => {
    const onUpdate = jest.fn();
    const onImageUpload = jest.fn().mockResolvedValue('new-image-url');
    const onDownloadProfile = jest.fn();

    const { container } = render(
      React.createElement(VoterProfileSection, {
        profile: mockProfile,
        onUpdate,
        onImageUpload,
        onDownloadProfile
      })
    );

    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput!);

    await waitFor(() => {
      expect(onImageUpload).toHaveBeenCalledWith(file);
    });
  });

  it('should handle profile download', () => {
    const onUpdate = jest.fn();
    const onImageUpload = jest.fn();
    const onDownloadProfile = jest.fn();

    const { getByText } = render(
      React.createElement(VoterProfileSection, {
        profile: mockProfile,
        onUpdate,
        onImageUpload,
        onDownloadProfile
      })
    );

    const downloadButton = getByText('Download Profile');
    fireEvent.press(downloadButton);

    expect(onDownloadProfile).toHaveBeenCalled();
  });
});
