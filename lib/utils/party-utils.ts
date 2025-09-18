/**
 * Party utilities for handling party logos and information
 */

export interface PartyInfo {
  name: string;
  code: string;
  color: string;
  logo: string;
}

// Party information mapping
export const PARTY_INFO: Record<string, PartyInfo> = {
  'APC': {
    name: 'All Progressives Congress',
    code: 'APC',
    color: '#FF0000',
    logo: 'apc-logo.png'
  },
  'PDP': {
    name: 'Peoples Democratic Party',
    code: 'PDP',
    color: '#00FF00',
    logo: 'pdp-logo.png'
  },
  'LP': {
    name: 'Labour Party',
    code: 'LP',
    color: '#0000FF',
    logo: 'lp-logo.png'
  },
  'NNPP': {
    name: 'New Nigeria Peoples Party',
    code: 'NNPP',
    color: '#800080',
    logo: 'nnpp-logo.png'
  },
  'SDP': {
    name: 'Social Democratic Party',
    code: 'SDP',
    color: '#FFA500',
    logo: 'sdp-logo.png'
  },
  'ADC': {
    name: 'African Democratic Congress',
    code: 'ADC',
    color: '#FFC0CB',
    logo: 'adc-logo.png'
  },
  'YPP': {
    name: 'Young Progressives Party',
    code: 'YPP',
    color: '#FFFF00',
    logo: 'ypp-logo.png'
  },
  'ZLP': {
    name: 'Zenith Labour Party',
    code: 'ZLP',
    color: '#00FFFF',
    logo: 'zlp-logo.png'
  }
};

/**
 * Get party information by party name or code
 */
export function getPartyInfo(partyName: string): PartyInfo | null {
  if (!partyName) return null;
  
  const upperPartyName = partyName.toUpperCase();
  
  // Direct match
  if (PARTY_INFO[upperPartyName]) {
    return PARTY_INFO[upperPartyName];
  }
  
  // Partial match
  for (const [, info] of Object.entries(PARTY_INFO)) {
    if (info.name.toLowerCase().includes(partyName.toLowerCase()) ||
        info.code.toLowerCase().includes(partyName.toLowerCase())) {
      return info;
    }
  }
  
  return null;
}

/**
 * Get party logo filename
 */
export function getPartyLogo(partyName: string): string {
  const partyInfo = getPartyInfo(partyName);
  return partyInfo?.logo || 'default-party-logo.png';
}

/**
 * Get party color
 */
export function getPartyColor(partyName: string): string {
  const partyInfo = getPartyInfo(partyName);
  return partyInfo?.color || '#6B7280';
}

/**
 * Get party display name
 */
export function getPartyDisplayName(partyName: string): string {
  const partyInfo = getPartyInfo(partyName);
  return partyInfo?.name || partyName;
}

/**
 * Get party code
 */
export function getPartyCode(partyName: string): string {
  const partyInfo = getPartyInfo(partyName);
  return partyInfo?.code || partyName;
}