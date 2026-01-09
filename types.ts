
export enum AppView {
  MAIN = 'MAIN',
  ASSET = 'ASSET',
  WORK_ORDER = 'WORK_ORDER',
  PPM = 'PPM',
  ADMIN = 'ADMIN',
  INVENTORY = 'INVENTORY',
  AI_ANALYTICS = 'AI_ANALYTICS',
  MOBILE_APPS = 'MOBILE_APPS',
  DASHBOARD_MONITOR = 'DASHBOARD_MONITOR'
}

export interface AppSheetRecord {
  hospital: string;
  category: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  status: string;
}

export interface AnalyticsConfig {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  standard: number;
  appUrl: string;
}

export interface AnalyticsSignal {
  configId: string;
  currentValue: number;
  status: 'normal' | 'alert';
  timestamp: string;
}

export interface AnalyticsAlertHistory {
  id: string;
  configId: string;
  signalName: string;
  value: number;
  thresholdType: 'MIN' | 'MAX';
  thresholdValue: number;
  timestamp: string;
  correction?: string;
  resolvedAt?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Mechanical' | 'Electrical' | 'Plumbing' | 'Medical' | 'IT' | 'General';
  quantity: number;
  min_level: number;
  unit: string;
  location: string;
  unit_price: number;
  last_restock?: string;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  item_name: string;
  type: 'IN' | 'OUT';
  quantity: number;
  user: string;
  date: string;
  reference?: string; // e.g. Work Order No.
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  building: string;
  email?: string;
  status: 'pending' | 'approved' | 'rejected';
  password?: string;
  created_at?: string;
}

export interface Asset {
  asset_no: string;
  sub_number: string;
  asset_description: string;
  asset_class: string;
  company_code: string;
  cost_center: string;
  cost_center_name: string;
  capitalized_on: string;
  useful_life: number;
  asset_value: number;
  status: 'active' | 'inactive' | 'disposed';
  code_ref: string;
}

export interface AnnualRecord {
  id?: string;
  building: string;
  floor: string;
  area_detail: string;
  inspected_by: string;
  phone_number: string;
  signature?: string;
  created_at?: string;
}

export interface PPMTask {
  ppm_id: string;
  equipment_name: string;
  building: 'vimut' | 'vth';
  frequency: string;
  priority: 'high' | 'medium' | 'low';
  assigned_to: string;
  next_maintenance: string;
  notes: string;
  status: 'scheduled' | 'pending' | 'completed' | 'overdue';
  completed_by?: string | null;
  completed_date?: string | null;
  created_at: string;
}

export interface WorkOrder {
  id?: string;
  work_request_no: string;
  date: string;
  notification_time: string;
  building_name: string;
  main_floor: string;
  main_area: string;
  main_department: string;
  type_area: string;
  room_no: string;
  job_detail: string;
  code_emergency: string;
  period_time: string;
  priority_work: string;
  staff_notification_name: string;
  phone_number: string;
  work_progress: 'Pending' | 'On Process' | 'Complete';
  
  // Assignment fields
  helpdesk_evaluate?: string;
  helpdesk_name?: string;
  assign_technician?: string;
  technician_name?: string;
  technician_time?: string;
  
  // Completion fields
  work_date_actual?: string;
  start_time?: string;
  finish_time?: string;
  total_convert_time?: number;
  man_power?: number;
  category_work?: string;
  system_work?: string;
  separate_detail?: string;
  equipment_code?: string;
  labour_cost?: number;
  job_detail_fixed?: string;
  spare_part?: string;
  spare_part_amount?: number;
  spare_part_cost?: number;
  result?: string;
  customer_satisfy?: string;
  note?: string;
  
  created_at?: string;
}

export interface MasterData {
  floors: string[];
  mainAreas: string[];
  typeAreas: string[];
  staff: string[];
  groups: Array<{ code: string, name: string, desc: string }>;
  systems: Array<{ code: string, name: string }>;
  emergencyCodes: Array<{ code: string, desc: string, color: string }>;
  separateDetail: Array<{ code: string, name: string, desc: string }>;
}
