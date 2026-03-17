// Shared types for API and Web
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Project {
  id: string;
  name: string;
  userId: string;
}
