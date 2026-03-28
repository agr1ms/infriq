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

export interface Column {
  name: string;
  type: string;
  constraints: string[];
  defaultValue?: string;
}

export interface Table {
  name: string;
  purpose: string;
  columns: Column[];
}

export interface Relationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: "one-to-one" | "one-to-many" | "many-to-many";
}

export interface GeneratedSchema {
  tables: Table[];
  relationships: Relationship[];
}
