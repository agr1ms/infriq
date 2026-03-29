export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt?: string;
}

export interface ProjectDetail extends Project {
  prdText?: string | null;
  generatedSchema?: unknown;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
}

export interface ProjectsResponse {
  success?: boolean;
  projects: Project[];
}

export interface ProjectDetailResponse {
  success: boolean;
  project: ProjectDetail;
}

export interface CreateProjectResponse {
  success: boolean;
  project: Project;
}

export interface GenerateSchemaResponse {
  success: boolean;
  message: string;
  schema: unknown;
}

export interface AuthResponse {
  token: string;
  user: User;
}
