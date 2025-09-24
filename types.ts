// Fix: Removed incorrect import of 'IssueUpdate' as it is defined in this file.

export enum UserType {
  Citizen = 'citizen',
  Authority = 'authority',
}

export enum IssueStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
}

export interface User {
  id: string; // uuid from auth.users
  username: string;
  email: string;
  mobile: string;
  aadhaar: string;
  type: UserType;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image_url: string;
  lat: number;
  lng: number;
  status: IssueStatus;
  author_id: string;
  created_at: string;
  upvotes: number;
  reposts: number;
  resolved_image_url?: string;
  // Joined data from 'profiles' table, renamed from 'author' for consistency
  profiles?: User; 
  // Joined data from 'issue_updates' table
  updates?: IssueUpdate[];
}

export interface IssueUpdate {
  id: string;
  issue_id: string;
  updated_by: string; // authorityId (uuid)
  timestamp: string;
  update_text: string;
}
