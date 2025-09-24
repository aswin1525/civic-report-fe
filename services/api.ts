import { DUMMY_ISSUES, DUMMY_USERS, DUMMY_AADHAAR_DB } from '../constants';
import { Issue, IssueStatus, User } from '../types';

let issues: Issue[] = [...DUMMY_ISSUES];
let users: User[] = [...DUMMY_USERS];

const simulateDelay = <T,>(data: T, delay = 500): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(data), delay));

// --- Auth ---

// Endpoint: GET /api/auth/check-username?username={username}
// Method: GET
// Response: { unique: boolean }
export const checkUsername = (username: string): Promise<{ unique: boolean }> => 
    simulateDelay({ unique: !users.some(u => u.username === username) });

// Endpoint: GET /api/auth/check-email?email={email}
// Method: GET
// Response: { unique: boolean }
export const checkEmail = (email: string): Promise<{ unique: boolean }> => 
    simulateDelay({ unique: !users.some(u => u.email === email) });

// Endpoint: POST /api/auth/register
// Method: POST
// Body: Omit<User, 'id' | 'verified' | 'joinedDate' | 'bio'>
// Response: User
export const registerUser = (userData: Omit<User, 'id' | 'verified'>): Promise<User> => {
    const newUser: User = {
        ...userData,
        id: `u${users.length + 1}`,
        verified: false,
        joinedDate: new Date().toISOString(),
    };
    users.push(newUser);
    return simulateDelay(newUser);
};

// Endpoint: POST /api/auth/verify-otp
// Method: POST
// Body: { otp: string, type: 'email' | 'mobile', userId: string }
// Response: { success: boolean }
export const verifyOtp = (otp: string, type: 'email' | 'mobile'): Promise<{ success: boolean }> => {
    // A real implementation would use the userId from the request body to match the OTP
    const correctOtp = type === 'email' ? '123456' : '999999';
    return simulateDelay({ success: otp === correctOtp });
};

// Endpoint: POST /api/auth/verify-aadhaar
// Method: POST
// Body: { aadhaar: string, userId: string }
// Response: { success: boolean }
export const verifyAadhaar = (aadhaar: string): Promise<{ success: boolean }> => {
    // A real implementation would use the userId from the request body
    return simulateDelay({ success: DUMMY_AADHAAR_DB.has(aadhaar) });
};

// Endpoint: POST /api/auth/finalize-verification
// Method: POST
// Body: { userId: string }
// Response: User | null
export const finalizeVerification = (userId: string): Promise<User | null> => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        users[userIndex].verified = true;
        return simulateDelay(users[userIndex]);
    }
    return simulateDelay(null);
};

// Endpoint: POST /api/auth/login
// Method: POST
// Body: { email: string, password: string }
// Response: User | null
export const login = (email: string, password?: string): Promise<User | null> => {
    // Mock login ignores password, but it's part of the real API contract.
    // A real implementation would validate the password.
    const user = users.find(u => u.email === email && u.verified);
    return simulateDelay(user || null);
};

// --- Issues ---

// Endpoint: GET /api/issues
// Method: GET
// Query Params: authorId?: string, managedBy?: string
// Response: Issue[]
export const getIssues = (): Promise<Issue[]> => {
    // This mock returns all issues. The backend should filter based on query params.
    return simulateDelay([...issues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
};

// Endpoint: GET /api/issues/{id}
// Method: GET
// Response: Issue | null
export const getIssueById = (id: string): Promise<Issue | null> => {
    const issue = issues.find(i => i.id === id);
    return simulateDelay(issue || null);
};

// Endpoint: POST /api/issues
// Method: POST
// Body: FormData (multipart/form-data) with issue fields and an image file.
// Fields: title, description, tags (comma-separated string), location (JSON string), authorId, authorUsername, authorAvatar, status, image (file)
// Response: Issue
export const createIssue = (issueData: Omit<Issue, 'id' | 'createdAt' | 'upvotes' | 'reposts'>): Promise<Issue> => {
    // A real implementation would handle file upload from FormData and return the stored image URL.
    const newIssue: Issue = {
        ...issueData,
        id: `i${issues.length + 1}`,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        reposts: 0,
    };
    issues.unshift(newIssue);
    return simulateDelay(newIssue);
};

// Endpoint: PATCH /api/issues/{id}/status
// Method: PATCH
// Body: { status: IssueStatus, updateText: string, authorityId: string }
// Response: Issue | null
export const updateIssueStatus = (id: string, status: Issue['status'], updateText: string, authorityId: string): Promise<Issue | null> => {
    const issueIndex = issues.findIndex(i => i.id === id);
    if (issueIndex > -1) {
        issues[issueIndex].status = status;
        const newUpdate = { updatedBy: authorityId, timestamp: new Date().toISOString(), updateText };
        issues[issueIndex].updates = [...(issues[issueIndex].updates || []), newUpdate];
        return simulateDelay(issues[issueIndex]);
    }
    return simulateDelay(null);
};

// Endpoint: POST /api/issues/{id}/upvote
// Method: POST
// Response: { upvotes: number } | null
export const upvoteIssue = (id: string): Promise<{ upvotes: number } | null> => {
    // A real implementation would use an auth token to prevent multiple upvotes from the same user.
    const issueIndex = issues.findIndex(i => i.id === id);
    if (issueIndex > -1) {
        issues[issueIndex].upvotes += 1;
        return simulateDelay({ upvotes: issues[issueIndex].upvotes });
    }
    return simulateDelay(null);
};

// Endpoint: POST /api/issues/{id}/repost
// Method: POST
// Response: { reposts: number } | null
export const repostIssue = (id: string): Promise<{ reposts: number } | null> => {
    // A real implementation would use an auth token.
    const issueIndex = issues.findIndex(i => i.id === id);
    if (issueIndex > -1) {
        issues[issueIndex].reposts += 1;
        return simulateDelay({ reposts: issues[issueIndex].reposts });
    }
    return simulateDelay(null);
};

// --- Profile / Users ---

// Endpoint: GET /api/users/{id}
// Method: GET
// Response: User | null
export const getUserById = (userId: string): Promise<User | null> => {
    const user = users.find(u => u.id === userId);
    return simulateDelay(user || null);
};

// Endpoint: GET /api/issues?authorId={authorId}
// Method: GET
// Response: Issue[]
export const getIssuesByAuthor = (authorId: string): Promise<Issue[]> => {
    // This is a convenience function that should call GET /api/issues?authorId={authorId}
    const userIssues = issues.filter(i => i.authorId === authorId);
    return simulateDelay(userIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
};

// Endpoint: GET /api/issues?managedBy={authorityId}
// Method: GET
// Response: Issue[]
export const getIssuesByAuthority = (authorityId: string): Promise<Issue[]> => {
    // This is a convenience function that should call GET /api/issues?managedBy={authorityId}
    const managedIssues = issues.filter(i => i.updates?.some(u => u.updatedBy === authorityId));
    return simulateDelay(managedIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}