import axios from 'axios';
import type {
  HealthCheckResponse,
  User,
  JobPosting,
  Department,
  EmploymentType,
  JobPostingStatus,
  Application,
  ApplicationDetail,
  ApplicationNote
} from '../types';

// Axios client configured to talk to backend via Vite proxy
const API = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure token on startup if present in localStorage
const initialToken = localStorage.getItem('techcorp_token');
if (initialToken) {
  API.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface JobFilterParams {
  search?: string;
  department_id?: number;
  employment_type?: EmploymentType;
  location?: string;
  status?: JobPostingStatus;
  page?: number;
  page_size?: number;
}

export interface JobCreatePayload {
  title: string;
  department_id: number;
  location: string;
  employment_type: EmploymentType;
  description: string;
  requirements: string;
  benefits?: string;
  status: JobPostingStatus;
}

export interface JobUpdatePayload {
  title?: string;
  department_id?: number;
  location?: string;
  employment_type?: EmploymentType;
  description?: string;
  requirements?: string;
  benefits?: string;
  status?: JobPostingStatus;
}

export interface DepartmentCreatePayload {
  name: string;
  code?: string;
  description?: string;
}

// Health Check
export const checkBackendHealth = async (): Promise<HealthCheckResponse> => {
  try {
    const response = await API.get<HealthCheckResponse>('/health');
    return response.data;
  } catch (error) {
    console.error('Backend healthcheck error:', error);
    return {
      status: 'error',
      database: 'disconnected',
      version: 'offline',
    };
  }
};

// Auth Services
export const loginApi = async (email: string, password: string): Promise<{ access_token: string; token_type: string }> => {
  const response = await API.post<{ access_token: string; token_type: string }>('/auth/login/json', {
    email,
    password,
  });
  return response.data;
};

export const registerCandidateApi = async (payload: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<User> => {
  const response = await API.post<User>('/auth/register-candidate', payload);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await API.get<User>('/auth/me');
  return response.data;
};


// Department Services
export const getDepartments = async (): Promise<Department[]> => {
  const response = await API.get<Department[]>('/departments');
  return response.data;
};

export const createDepartment = async (payload: DepartmentCreatePayload): Promise<Department> => {
  const response = await API.post<Department>('/departments', payload);
  return response.data;
};

// Job Posting Services
export const getJobs = async (params?: JobFilterParams): Promise<PaginatedResponse<JobPosting>> => {
  const response = await API.get<PaginatedResponse<JobPosting>>('/jobs', { params });
  return response.data;
};

export const getJobByIdOrSlug = async (idOrSlug: string | number): Promise<JobPosting> => {
  const response = await API.get<JobPosting>(`/jobs/${idOrSlug}`);
  return response.data;
};

export const createJob = async (payload: JobCreatePayload): Promise<JobPosting> => {
  const response = await API.post<JobPosting>('/jobs', payload);
  return response.data;
};

export const updateJob = async (id: number, payload: JobUpdatePayload): Promise<JobPosting> => {
  const response = await API.put<JobPosting>(`/jobs/${id}`, payload);
  return response.data;
};

export const deleteOrArchiveJob = async (id: number): Promise<void> => {
  await API.delete(`/jobs/${id}`);
};

export interface ApplicationFilterParams {
  job_posting_id?: number;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface NoteCreatePayload {
  content: string;
  rating?: number;
  agg_disclaimer_confirmed: boolean;
}

// Application Services
export const submitApplicationApi = async (formData: FormData): Promise<Application> => {
  const response = await API.post<Application>('/applications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMyApplicationsApi = async (): Promise<Application[]> => {
  const response = await API.get<Application[]>('/applications/my');
  return response.data;
};

export const getApplicationsApi = async (params?: ApplicationFilterParams): Promise<PaginatedResponse<Application>> => {
  const response = await API.get<PaginatedResponse<Application>>('/applications', { params });
  return response.data;
};

export const getApplicationDetailApi = async (id: number): Promise<ApplicationDetail> => {
  const response = await API.get<ApplicationDetail>(`/applications/${id}`);
  return response.data;
};

export const updateApplicationStatusApi = async (
  id: number,
  status: string,
  reason?: string
): Promise<ApplicationDetail> => {
  const response = await API.patch<ApplicationDetail>(`/applications/${id}/status`, {
    status,
    reason,
  });
  return response.data;
};

export const updateApplicationApi = async (
  id: number,
  payload: import('../types').ApplicationUpdatePayload
): Promise<Application> => {
  const response = await API.put<Application>(`/applications/${id}`, payload);
  return response.data;
};

export const withdrawApplicationApi = async (id: number): Promise<Application> => {
  const response = await API.post<Application>(`/applications/${id}/withdraw`);
  return response.data;
};

export const fetchDocumentBlob = async (applicationId: number, docId: number): Promise<Blob> => {
  const response = await API.get(`/applications/${applicationId}/documents/${docId}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const uploadApplicationDocumentApi = async (
  applicationId: number,
  file: File,
  fileType: string = 'OTHER'
): Promise<import('../types').ApplicationDocument> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('file_type', fileType);

  const response = await API.post<import('../types').ApplicationDocument>(
    `/applications/${applicationId}/documents`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const deleteApplicationDocumentApi = async (
  applicationId: number,
  docId: number
): Promise<void> => {
  await API.delete(`/applications/${applicationId}/documents/${docId}`);
};

// Application Notes & Evaluation Services
export const getApplicationNotesApi = async (applicationId: number): Promise<ApplicationNote[]> => {
  const response = await API.get<ApplicationNote[]>(`/applications/${applicationId}/notes`);
  return response.data;
};

export const createApplicationNoteApi = async (
  applicationId: number,
  payload: NoteCreatePayload
): Promise<ApplicationNote> => {
  const response = await API.post<ApplicationNote>(`/applications/${applicationId}/notes`, payload);
  return response.data;
};

export const deleteApplicationNoteApi = async (
  applicationId: number,
  noteId: number
): Promise<void> => {
  await API.delete(`/applications/${applicationId}/notes/${noteId}`);
};

// User Management Services (Admin Only)
export interface UserFilterParams {
  role?: import('../types').UserRole;
  page?: number;
  page_size?: number;
}

export const getUsersApi = async (params?: UserFilterParams): Promise<PaginatedResponse<User>> => {
  const response = await API.get<PaginatedResponse<User>>('/users', { params });
  return response.data;
};

export const createUserApi = async (payload: import('../types').UserCreatePayload): Promise<User> => {
  const response = await API.post<User>('/users', payload);
  return response.data;
};

export const updateUserApi = async (id: number, payload: import('../types').UserUpdatePayload): Promise<User> => {
  const response = await API.patch<User>(`/users/${id}`, payload);
  return response.data;
};

export const deleteUserApi = async (id: number): Promise<void> => {
  await API.delete(`/users/${id}`);
};

// Compliance & Cleanup Services
export const runCleanupJobApi = async (): Promise<{ message: string; anonymized_count: number }> => {
  const response = await API.post<{ message: string; anonymized_count: number }>('/compliance/run-cleanup-job');
  return response.data;
};

export const anonymizeApplicationApi = async (id: number): Promise<ApplicationDetail> => {
  const response = await API.post<ApplicationDetail>(`/compliance/applications/${id}/anonymize`);
  return response.data;
};

export default API;


