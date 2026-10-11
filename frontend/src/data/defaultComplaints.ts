export interface StatusHistoryItem {
  status: string;
  from_status?: string | null;
  notes?: string;
  remarks?: string;
  changed_by?: string;
  created_at: string;
}

export interface ComplaintData {
  id: number;
  tracking_ref: string;
  title: string;
  description: string;
  category: string;
  category_id?: number;
  department: string;
  department_code: string;
  department_id?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  priority_reason?: string;
  status: 'submitted' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'escalated' | 'rejected';
  locality: string;
  address: string;
  landmark?: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  submitted_at: string;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  status_history: StatusHistoryItem[];
}

export const DEFAULT_COMPLAINTS: ComplaintData[] = [
  {
    id: 101,
    tracking_ref: 'CE-2026-1001',
    title: 'Large hazardous pothole on MG Road near City Bus Stop No. 14',
    description: 'There is a deep 2-foot pothole on MG Road opposite City Bus Stop 14. Vehicles swerve dangerously to avoid it at night. Two two-wheelers skidded yesterday.',
    category: 'Roads and Potholes',
    department: 'Public Works Department',
    department_code: 'PWD',
    priority: 'high',
    priority_reason: 'Major road hazard causing vehicle damage and accident risk',
    status: 'resolved',
    locality: 'MG Road',
    address: 'Opposite City Bus Stand No. 14, MG Road',
    landmark: 'City Bus Stop 14',
    submitter_name: 'Aisha Citizen',
    submitter_email: 'citizen1@civicease.demo',
    submitter_phone: '+91-98765-43210',
    submitted_at: '2026-10-06T10:15:00Z',
    created_at: '2026-10-06T10:15:00Z',
    acknowledged_at: '2026-10-06T14:30:00Z',
    resolved_at: '2026-10-09T16:00:00Z',
    resolution_notes: 'Pothole filled with cold asphalt mix, compacted and leveled. Road cleared for traffic.',
    status_history: [
      { status: 'submitted', notes: 'Complaint lodged by citizen via portal.', created_at: '2026-10-06T10:15:00Z' },
      { status: 'under_review', notes: 'Reviewed and validated by PWD triage officer.', created_at: '2026-10-06T14:30:00Z' },
      { status: 'assigned', notes: 'Assigned to Ward Engineer Suresh Kumar (PWD).', created_at: '2026-10-07T09:00:00Z' },
      { status: 'in_progress', notes: 'Repair crew dispatched with asphalt compaction roller.', created_at: '2026-10-08T11:00:00Z' },
      { status: 'resolved', notes: 'Bitumen resurfacing completed and verified by site inspection.', created_at: '2026-10-09T16:00:00Z' }
    ]
  },
  {
    id: 102,
    tracking_ref: 'CE-2026-1002',
    title: 'Live sparking wire dangling from electric pole near Rajajinagar Market',
    description: 'A live 440V overhead cable has snapped and is hanging at shoulder level near the entrance of Rajajinagar vegetable market. Immediate safety hazard for hundreds of shoppers.',
    category: 'Streetlights & Electrical',
    department: 'Electrical Department',
    department_code: 'ELEC',
    priority: 'critical',
    priority_reason: 'Mandatory Emergency: Live electrical wire in high-density pedestrian zone',
    status: 'in_progress',
    locality: 'Rajajinagar',
    address: 'Pole #E-42, Market Main Gate, 3rd Block, Rajajinagar',
    landmark: 'Opposite State Bank Branch',
    submitter_name: 'Ramesh Kumar',
    submitter_email: 'citizen2@civicease.demo',
    submitter_phone: '+91-98450-11223',
    submitted_at: '2026-10-11T14:00:00Z',
    created_at: '2026-10-11T14:00:00Z',
    acknowledged_at: '2026-10-11T14:10:00Z',
    resolution_notes: 'Substation power isolated. Emergency electrical lineman crew on-site replacing damaged insulator.',
    status_history: [
      { status: 'submitted', notes: 'Critical safety alert received.', created_at: '2026-10-11T14:00:00Z' },
      { status: 'assigned', notes: 'Emergency ticket routed to Officer Priya Sharma (ELEC).', created_at: '2026-10-11T14:10:00Z' },
      { status: 'in_progress', notes: 'Feeder switch tripped safely; lineman repairing broken junction clamp.', created_at: '2026-10-11T14:45:00Z' }
    ]
  },
  {
    id: 103,
    tracking_ref: 'CE-2026-1003',
    title: 'Severe water supply disruption for 3 days on 100 Feet Road',
    description: 'Drinking water supply has completely ceased for 48 apartments and independent houses in Indiranagar 100 Feet Road, 7th Cross. No prior maintenance notice was issued.',
    category: 'Water Supply & Leakage',
    department: 'Water Supply Department',
    department_code: 'WATER',
    priority: 'high',
    priority_reason: 'Extended complete drinking water stoppage affecting residential neighborhood',
    status: 'escalated',
    locality: 'Indiranagar',
    address: '7th Cross, 100 Feet Road, Indiranagar',
    landmark: 'Behind Community Center',
    submitter_name: 'Meera Devi',
    submitter_email: 'citizen3@civicease.demo',
    submitter_phone: '+91-99001-88776',
    submitted_at: '2026-10-08T08:30:00Z',
    created_at: '2026-10-08T08:30:00Z',
    acknowledged_at: '2026-10-08T12:00:00Z',
    resolution_notes: 'Pipeline valve rupture located. Emergency mobile water tankers dispatched; replacement pipe weld underway.',
    status_history: [
      { status: 'submitted', notes: 'Complaint submitted by resident association.', created_at: '2026-10-08T08:30:00Z' },
      { status: 'under_review', notes: 'Reviewed by Water Supply Department desk.', created_at: '2026-10-08T12:00:00Z' },
      { status: 'assigned', notes: 'Assigned to Officer Rajan Pillai (WATER).', created_at: '2026-10-09T09:30:00Z' },
      { status: 'escalated', notes: 'SLA exceeded 48 hours threshold. Escalated to Department Supervisor.', created_at: '2026-10-10T11:00:00Z' }
    ]
  },
  {
    id: 104,
    tracking_ref: 'CE-2026-1004',
    title: 'Overflowing garbage bin and stray animal menace in Sector 2',
    description: 'Community waste bins in HSR Layout Sector 2 have not been cleared by collection trucks for over 5 days. Foul stench spreading across neighborhood and stray dogs scattering debris.',
    category: 'Garbage & Sanitation',
    department: 'Sanitation Department',
    department_code: 'SANIT',
    priority: 'medium',
    priority_reason: 'Solid waste accumulation presenting public health hazard',
    status: 'assigned',
    locality: 'HSR Layout',
    address: 'Corner of 14th Main & 9th Cross, Sector 2, HSR Layout',
    landmark: 'Opposite Sector 2 Park',
    submitter_name: 'Karthik Narayanan',
    submitter_email: 'karthik.n@gmail.com',
    submitter_phone: '+91-97400-55667',
    submitted_at: '2026-10-10T09:00:00Z',
    created_at: '2026-10-10T09:00:00Z',
    acknowledged_at: '2026-10-10T11:30:00Z',
    resolution_notes: 'Sanitation supervisor Kavitha Nair scheduled special compactor truck for evening clearance shift.',
    status_history: [
      { status: 'submitted', notes: 'Citizen grievance registered.', created_at: '2026-10-10T09:00:00Z' },
      { status: 'assigned', notes: 'Assigned to Sanitation Inspector Kavitha Nair.', created_at: '2026-10-10T11:30:00Z' }
    ]
  },
  {
    id: 105,
    tracking_ref: 'CE-2026-1005',
    title: 'Stormwater drain overflowing into residential basements during rains',
    description: 'Main stormwater canal blocked by silt and construction debris near BTM 2nd Stage. Sewage water backflows onto street during downpours and entered two apartment parking lots.',
    category: 'Drainage & Sewage',
    department: 'Drainage Department',
    department_code: 'DRAIN',
    priority: 'high',
    priority_reason: 'Flooding and sewage overflow risk to basements and roadway',
    status: 'in_progress',
    locality: 'BTM Layout',
    address: '16th Main Road, 2nd Stage, BTM Layout',
    landmark: 'Near Water Tank',
    submitter_name: 'Anand Gopal',
    submitter_email: 'anand.g@yahoo.com',
    submitter_phone: '+91-98800-44332',
    submitted_at: '2026-10-09T15:20:00Z',
    created_at: '2026-10-09T15:20:00Z',
    acknowledged_at: '2026-10-10T08:00:00Z',
    resolution_notes: 'JCB excavator deployed to de-silt the 150m drain canal section. Silt removal in progress.',
    status_history: [
      { status: 'submitted', notes: 'Complaint filed with photo attachments.', created_at: '2026-10-09T15:20:00Z' },
      { status: 'assigned', notes: 'Assigned to Drainage Officer Mohammed Ali.', created_at: '2026-10-10T08:00:00Z' },
      { status: 'in_progress', notes: 'De-silting machinery clearing canal bottleneck.', created_at: '2026-10-10T14:00:00Z' }
    ]
  },
  {
    id: 106,
    tracking_ref: 'CE-2026-1006',
    title: 'Damaged children playground swings and broken bench in public park',
    description: 'In Cubbon Park neighborhood children play area, two swing chain links are broken with sharp rusted edges. Concrete bench near fountain has cracked slab.',
    category: 'Public Parks & Facilities',
    department: 'Parks & Public Facilities',
    department_code: 'PARKS',
    priority: 'low',
    priority_reason: 'Playground equipment repair and public park maintenance',
    status: 'under_review',
    locality: 'Palace Road',
    address: 'Children Play Enclosure, Palace Road Public Park',
    landmark: 'Central Fountain',
    submitter_name: 'Sunita Rao',
    submitter_email: 'sunita.rao@outlook.com',
    submitter_phone: '+91-94480-12345',
    submitted_at: '2026-10-11T11:00:00Z',
    created_at: '2026-10-11T11:00:00Z',
    acknowledged_at: '2026-10-11T12:30:00Z',
    resolution_notes: 'Officer Anita Desai inspecting playground apparatus; replacement swing chains ordered.',
    status_history: [
      { status: 'submitted', notes: 'Citizen reported broken playground items.', created_at: '2026-10-11T11:00:00Z' },
      { status: 'under_review', notes: 'Under technical review by Parks officer Anita Desai.', created_at: '2026-10-11T12:30:00Z' }
    ]
  },
  {
    id: 107,
    tracking_ref: 'CE-2026-1007',
    title: 'Missing manhole cover on unlit pedestrian footpath',
    description: 'A 3-foot deep utility chamber manhole is open with no protective barricade on the dark pedestrian walkway near Koramangala 4th Block. High risk of severe pedestrian injury.',
    category: 'Public Safety Hazards',
    department: 'Public Safety Department',
    department_code: 'SAFETY',
    priority: 'critical',
    priority_reason: 'Open manhole hazard on unlit walkway posing direct fall risk',
    status: 'in_progress',
    locality: 'Koramangala',
    address: '80 Feet Road, 4th Block, Koramangala',
    landmark: 'Near Sony World Junction',
    submitter_name: 'Deepak Varma',
    submitter_email: 'deepak.v@gmail.com',
    submitter_phone: '+91-98441-99887',
    submitted_at: '2026-10-11T16:15:00Z',
    created_at: '2026-10-11T16:15:00Z',
    acknowledged_at: '2026-10-11T16:25:00Z',
    resolution_notes: 'Safety cones and reflective caution tape placed immediately by Vikram Singh. Heavy cast iron lid replacement en route.',
    status_history: [
      { status: 'submitted', notes: 'Critical hazard flagged by citizen.', created_at: '2026-10-11T16:15:00Z' },
      { status: 'assigned', notes: 'Dispatched to Safety Officer Vikram Singh.', created_at: '2026-10-11T16:25:00Z' },
      { status: 'in_progress', notes: 'Barricaded area; new cover being installed.', created_at: '2026-10-11T17:00:00Z' }
    ]
  },
  {
    id: 108,
    tracking_ref: 'CE-2026-1008',
    title: 'Obstructed public pedestrian walkway due to unauthorized construction debris',
    description: 'Commercial renovation site has dumped gravel, broken tiles, and cement bags across 30 meters of public pavement, forcing pedestrians to walk into oncoming vehicular traffic.',
    category: 'Other Public Services',
    department: 'General Services',
    department_code: 'GEN',
    priority: 'medium',
    priority_reason: 'Encroachment of public right-of-way creating pedestrian hazard',
    status: 'submitted',
    locality: 'Jayanagar',
    address: '11th Main, 4th T Block, Jayanagar',
    landmark: 'Near Post Office',
    submitter_name: 'Pooja Hegde',
    submitter_email: 'pooja.hegde@hotmail.com',
    submitter_phone: '+91-97312-33445',
    submitted_at: '2026-10-11T17:45:00Z',
    created_at: '2026-10-11T17:45:00Z',
    resolution_notes: 'Notice being issued to property contractor for 24-hour clearance.',
    status_history: [
      { status: 'submitted', notes: 'Grievance received and awaiting initial review.', created_at: '2026-10-11T17:45:00Z' }
    ]
  }
];
