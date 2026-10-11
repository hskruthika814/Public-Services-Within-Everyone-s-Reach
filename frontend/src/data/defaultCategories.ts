export interface ServiceCategory {
  id: number;
  code: string;
  name: string;
  name_kn?: string;
  description: string;
  icon: string;
  default_priority: string;
  department_name?: string;
}

export const DEFAULT_CATEGORIES: ServiceCategory[] = [
  {
    id: 1,
    code: 'ROADS',
    name: 'Roads and Potholes',
    name_kn: 'ರಸ್ತೆ ಮತ್ತು ಗುಂಡಿಗಳು',
    description: 'Road damage, potholes, and pavement issues',
    icon: 'Road',
    default_priority: 'high',
    department_name: 'Public Works Department (PWD)',
  },
  {
    id: 2,
    code: 'LIGHTS',
    name: 'Streetlights & Electrical',
    name_kn: 'ಬೀದಿದೀಪಗಳು ಮತ್ತು ವಿದ್ಯುತ್',
    description: 'Streetlight failures and electrical infrastructure',
    icon: 'Zap',
    default_priority: 'high',
    department_name: 'Electrical Department',
  },
  {
    id: 3,
    code: 'WATER',
    name: 'Water Supply & Leakage',
    name_kn: 'ನೀರು ಸರಬರಾಜು ಮತ್ತು ಸೋರಿಕೆ',
    description: 'Water supply disruptions and pipeline leakage',
    icon: 'Droplets',
    default_priority: 'medium',
    department_name: 'Water Supply Department',
  },
  {
    id: 4,
    code: 'GARBAGE',
    name: 'Garbage & Sanitation',
    name_kn: 'ಕಸ ಮತ್ತು ನೈರ್ಮಲ್ಯ',
    description: 'Garbage collection and sanitation issues',
    icon: 'Trash2',
    default_priority: 'medium',
    department_name: 'Sanitation Department',
  },
  {
    id: 5,
    code: 'DRAINAGE',
    name: 'Drainage & Sewage',
    name_kn: 'ಒಳಚರಂಡಿ ಮತ್ತು ಮಲಿನನೀರು',
    description: 'Drainage blockages and sewage overflow',
    icon: 'Waves',
    default_priority: 'medium',
    department_name: 'Drainage Department',
  },
  {
    id: 6,
    code: 'PARKS',
    name: 'Public Parks & Facilities',
    name_kn: 'ಸಾರ್ವಜನಿಕ ಉದ್ಯಾನಗಳು ಮತ್ತು ಸೌಕರ್ಯಗಳು',
    description: 'Parks, playgrounds, and public facilities',
    icon: 'Trees',
    default_priority: 'low',
    department_name: 'Parks & Public Facilities',
  },
  {
    id: 7,
    code: 'SAFETY',
    name: 'Public Safety Hazards',
    name_kn: 'ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತಾ ಅಪಾಯಗಳು',
    description: 'Dangerous conditions and public safety risks',
    icon: 'AlertTriangle',
    default_priority: 'critical',
    department_name: 'Public Safety Department',
  },
  {
    id: 8,
    code: 'OTHER',
    name: 'Other Public Services',
    name_kn: 'ಇತರ ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು',
    description: 'Other civic service requests not listed above',
    icon: 'FileText',
    default_priority: 'medium',
    department_name: 'General Services',
  },
];
