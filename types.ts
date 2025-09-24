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
  id: string;
  username: string;
  email: string;
  mobile: string;
  aadhaar: string;
  type: UserType;
  verified: boolean;
  avatarUrl?: string;
  bio?: string;
  joinedDate?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
  };
  status: IssueStatus;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  createdAt: string;
  upvotes: number;
  reposts: number;
  updates?: IssueUpdate[];
  resolvedImageUrl?: string;
}

export interface IssueUpdate {
  updatedBy: string; // authorityId
  timestamp: string;
  updateText: string;
}