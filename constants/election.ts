// Election related constants
import { ElectionType, ElectionStatus } from '@/types/election';

export const ELECTION_TYPES: Array<{ value: ElectionType; label: string }> = [
  { value: 'PRESIDENTIAL', label: 'Presidential' },
  { value: 'GUBERNATORIAL', label: 'Gubernatorial' },
  { value: 'HOUSE_OF_ASSEMBLY', label: 'House of Assembly' },
  { value: 'SENATORIAL', label: 'Senatorial' },
  { value: 'HOUSE_OF_REPS', label: 'House of Representatives' },
  { value: 'LOCAL_GOVERNMENT', label: 'Local Government' },
];

export const ELECTION_STATUSES: Array<{ value: ElectionStatus; label: string; color: string }> = [
  { value: 'UPCOMING', label: 'Upcoming', color: 'blue' },
  { value: 'ONGOING', label: 'Ongoing', color: 'green' },
  { value: 'COMPLETED', label: 'Completed', color: 'gray' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
];

export const REPORT_TYPES = [
  { value: 'INCIDENT', label: 'Incident', color: 'red' },
  { value: 'OBSERVATION', label: 'Observation', color: 'blue' },
  { value: 'VIOLATION', label: 'Violation', color: 'orange' },
  { value: 'ISSUE', label: 'Issue', color: 'yellow' },
  { value: 'OTHER', label: 'Other', color: 'gray' },
];

export const SEVERITY_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'green' },
  { value: 'MEDIUM', label: 'Medium', color: 'yellow' },
  { value: 'HIGH', label: 'High', color: 'orange' },
  { value: 'CRITICAL', label: 'Critical', color: 'red' },
];

export const VOTE_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'success', label: 'Success', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'pending_chain', label: 'Pending Chain', color: 'blue' },
];

export const ELECTION_FILTERS = {
  states: [
    'All States',
    'Lagos',
    'Kano',
    'Rivers',
    'Kaduna',
    'Oyo',
    'Edo',
    'Delta',
    'Ogun',
    'Ondo',
    'Enugu',
    'Plateau',
    'Sokoto',
    'Borno',
    'Bauchi',
    'Katsina',
    'Anambra',
    'Benue',
    'Imo',
    'Niger',
    'Bayelsa',
    'Ebonyi',
    'Ekiti',
    'Gombe',
    'Jigawa',
    'Kebbi',
    'Kwara',
    'Nasarawa',
    'Taraba',
    'Yobe',
    'Zamfara',
    'FCT',
  ],
  types: ELECTION_TYPES,
  statuses: ELECTION_STATUSES,
};
