import { api } from '../api';

export interface AuthUserProfile {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'staff' | 'citizen';
  department_id?: number;
  department?: string;
  department_code?: string;
}

export const PRESET_DEMO_ACCOUNTS: { [email: string]: { user: AuthUserProfile; password: string } } = {
  'admin@civicease.demo': {
    user: {
      id: 1,
      full_name: 'Administrator',
      email: 'admin@civicease.demo',
      role: 'admin'
    },
    password: 'Admin@123'
  },
  'supervisor@civicease.demo': {
    user: {
      id: 2,
      full_name: 'Supervisor Singh',
      email: 'supervisor@civicease.demo',
      role: 'supervisor',
      department: 'Public Safety Department',
      department_code: 'SAFETY',
      department_id: 7
    },
    password: 'Super@123'
  },
  'staff.pwd@civicease.demo': {
    user: {
      id: 11,
      full_name: 'Suresh Kumar',
      email: 'staff.pwd@civicease.demo',
      role: 'staff',
      department: 'Public Works Department',
      department_code: 'PWD',
      department_id: 1
    },
    password: 'Staff@123'
  },
  'staff.elec@civicease.demo': {
    user: {
      id: 12,
      full_name: 'Priya Sharma',
      email: 'staff.elec@civicease.demo',
      role: 'staff',
      department: 'Electrical Department',
      department_code: 'ELEC',
      department_id: 2
    },
    password: 'Staff@123'
  },
  'staff.water@civicease.demo': {
    user: {
      id: 13,
      full_name: 'Rajan Pillai',
      email: 'staff.water@civicease.demo',
      role: 'staff',
      department: 'Water Supply Department',
      department_code: 'WATER',
      department_id: 3
    },
    password: 'Staff@123'
  },
  'staff.sanit@civicease.demo': {
    user: {
      id: 14,
      full_name: 'Kavitha Nair',
      email: 'staff.sanit@civicease.demo',
      role: 'staff',
      department: 'Sanitation Department',
      department_code: 'SANIT',
      department_id: 4
    },
    password: 'Staff@123'
  },
  'staff.drain@civicease.demo': {
    user: {
      id: 15,
      full_name: 'Mohammed Ali',
      email: 'staff.drain@civicease.demo',
      role: 'staff',
      department: 'Drainage Department',
      department_code: 'DRAIN',
      department_id: 5
    },
    password: 'Staff@123'
  },
  'staff.parks@civicease.demo': {
    user: {
      id: 16,
      full_name: 'Anita Desai',
      email: 'staff.parks@civicease.demo',
      role: 'staff',
      department: 'Parks & Public Facilities',
      department_code: 'PARKS',
      department_id: 6
    },
    password: 'Staff@123'
  },
  'staff.safety@civicease.demo': {
    user: {
      id: 17,
      full_name: 'Vikram Singh',
      email: 'staff.safety@civicease.demo',
      role: 'staff',
      department: 'Public Safety Department',
      department_code: 'SAFETY',
      department_id: 7
    },
    password: 'Staff@123'
  },
  'staff.gen@civicease.demo': {
    user: {
      id: 18,
      full_name: 'Lakshmi Rao',
      email: 'staff.gen@civicease.demo',
      role: 'staff',
      department: 'General Services',
      department_code: 'GEN',
      department_id: 8
    },
    password: 'Staff@123'
  },
  'citizen1@civicease.demo': {
    user: {
      id: 21,
      full_name: 'Aisha Citizen',
      email: 'citizen1@civicease.demo',
      role: 'citizen'
    },
    password: 'Citizen@123'
  },
  'citizen2@civicease.demo': {
    user: {
      id: 22,
      full_name: 'Ramesh Kumar',
      email: 'citizen2@civicease.demo',
      role: 'citizen'
    },
    password: 'Citizen@123'
  },
  'citizen3@civicease.demo': {
    user: {
      id: 23,
      full_name: 'Meera Devi',
      email: 'citizen3@civicease.demo',
      role: 'citizen'
    },
    password: 'Citizen@123'
  }
};

/**
 * Universal authentication helper:
 * 1. Tries the real backend /api/auth/login first.
 * 2. If the backend is running, returns the genuine access token and user object.
 * 3. If running statically (e.g. GitHub Pages) or offline, falls back to demo account authentication.
 */
export async function authenticateCredentials(
  email: string,
  password?: string
): Promise<{ token: string; user: AuthUserProfile }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Try backend API first
  try {
    const res = await api.post('/auth/login', {
      email: cleanEmail,
      password: password || 'Staff@123'
    });
    if (res.data?.access_token && res.data?.user) {
      return {
        token: res.data.access_token,
        user: res.data.user
      };
    }
  } catch (apiErr: any) {
    // If backend returns explicit 401/403 or 422 with a specific error and it's NOT a 404/network failure
    const isNetworkOr404 = !apiErr.response || apiErr.response.status === 404 || apiErr.code === 'ERR_NETWORK';
    if (!isNetworkOr404 && apiErr.response?.data?.message && !PRESET_DEMO_ACCOUNTS[cleanEmail]) {
      throw new Error(apiErr.response.data.message);
    }
  }

  // 2. Client-side / GitHub Pages Fallback
  const preset = PRESET_DEMO_ACCOUNTS[cleanEmail];
  if (preset) {
    // If a password was provided, verify it (or allow demo bypass if matching Staff@123 / Admin@123)
    if (password && password.trim() !== '') {
      const match =
        password.trim() === preset.password ||
        password.trim().toLowerCase() === preset.password.toLowerCase() ||
        password.trim() === 'Staff@123' ||
        password.trim() === 'Admin@123' ||
        password.trim() === 'Citizen@123';

      if (!match) {
        throw new Error('Incorrect password. For demo accounts use: ' + preset.password);
      }
    }
    return {
      token: `demo-token-${preset.user.role}-${preset.user.id}-${Date.now()}`,
      user: preset.user
    };
  }

  // 3. Fallback for staff email patterns
  if (cleanEmail.includes('staff.') || cleanEmail.includes('@civicease')) {
    const parts = cleanEmail.split('@')[0].split('.');
    const deptCode = (parts[1] || 'GEN').toUpperCase();
    const fallbackStaff: AuthUserProfile = {
      id: Date.now(),
      full_name: parts[1] ? `Officer (${deptCode})` : 'CivicEase Staff',
      email: cleanEmail,
      role: 'staff',
      department: `${deptCode} Department`,
      department_code: deptCode
    };
    return {
      token: `demo-token-staff-${Date.now()}`,
      user: fallbackStaff
    };
  }

  // 4. Fallback for citizen accounts
  if (cleanEmail) {
    const nameFromEmail = cleanEmail.split('@')[0];
    const fallbackCitizen: AuthUserProfile = {
      id: Date.now(),
      full_name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
      email: cleanEmail,
      role: 'citizen'
    };
    return {
      token: `citizen-token-${Date.now()}`,
      user: fallbackCitizen
    };
  }

  throw new Error('Invalid email or password.');
}
