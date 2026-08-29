// Data Model TypeScript Definitions for TechCorp ATS

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'WORKING_STUDENT' | 'CONTRACT' | 'INTERNSHIP';
export type JobPostingStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ApplicationStatus = 'RECEIVED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
export type UserRole = 'ADMIN' | 'RECRUITER' | 'CANDIDATE';
export type DocumentFileType = 'CV' | 'COVER_LETTER' | 'CERTIFICATE' | 'OTHER';

export interface CandidateRegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}


export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department_id?: number;
  is_active: boolean;
  created_at: string;
}

export interface UserCreatePayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department_id?: number;
  is_active?: boolean;
}

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  department_id?: number;
  is_active?: boolean;
  password?: string;
}

export interface JobPosting {
  id: number;
  title: string;
  slug: string;
  department_id: number;
  department?: Department;
  location: string;
  employment_type: EmploymentType;
  description: string;
  requirements: string;
  benefits?: string;
  status: JobPostingStatus;
  created_by_user_id: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  job_posting_id: number;
  job_posting_title?: string;
  job_posting?: JobPosting;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  expected_salary?: number;
  earliest_starting_date?: string;
  notice_period?: string;
  github_url?: string;
  linkedin_url?: string;
  cover_letter_text?: string;
  status: ApplicationStatus;
  dsgvo_consent: boolean;
  dsgvo_consent_at: string;
  is_anonymized: boolean;
  anonymized_at?: string;
  retention_until: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  expected_salary?: number;
  earliest_starting_date?: string;
  notice_period?: string;
  github_url?: string;
  linkedin_url?: string;
  cover_letter_text?: string;
}

export interface ApplicationDocument {
  id: number;
  application_id: number;
  file_type: DocumentFileType;
  original_filename: string;
  stored_filepath?: string;
  file_size_bytes: number;
  mime_type: string;
  is_deleted?: boolean;
  uploaded_at: string;
}

export interface ApplicationStatusHistory {
  id: number;
  application_id: number;
  changed_by_user_id?: number;
  changed_by_user_name?: string;
  old_status: ApplicationStatus;
  new_status: ApplicationStatus;
  reason?: string;
  created_at: string;
}

export interface ApplicationNote {
  id: number;
  application_id: number;
  user_id: number;
  author_name?: string;
  rating?: number;
  content: string;
  agg_disclaimer_confirmed: boolean;
  created_at: string;
  updated_at?: string;
  author?: User;
}

export interface ApplicationDetail extends Application {
  documents: ApplicationDocument[];
  notes: ApplicationNote[];
  status_history: ApplicationStatusHistory[];
}

export interface HealthCheckResponse {
  status: string;
  database: string;
  version: string;
}

