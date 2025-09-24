import React from 'react';
import { User, Issue, UserType, IssueStatus } from './types';

// Fix: Add missing icon component exports.
export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export const LogOutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const ThumbsUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 18.734V11.534l2.546-2.886a.5.5 0 01.679-.053l2.89 2.168L14 10zm-4-4V4a2 2 0 012-2h1a2 2 0 012 2v2" />
    </svg>
);

export const RepeatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 2l4 4-4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M7 22l-4-4 4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12H3" />
    </svg>
);

export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const DUMMY_AADHAAR_DB = new Set(['123456789012', '210987654321', '112233445566', '998877665544', '121212121212', '555666777888', '888777666555', '333444555666']);

export const DUMMY_USERS: User[] = [
  { id: 'u1', username: 'john_doe', email: 'john.doe@gmail.com', mobile: '1234567890', aadhaar: '123456789012', type: UserType.Citizen, verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=u1', bio: 'Just a citizen trying to make my neighborhood a better place. Reporting issues one pothole at a time.', joinedDate: '2023-01-15T10:00:00Z' },
  { id: 'u2', username: 'jane_smith', email: 'jane.smith@gmail.com', mobile: '0987654321', aadhaar: '210987654321', type: UserType.Citizen, verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=u2', bio: 'Passionate about urban development and community safety. Believer in the power of collective action.', joinedDate: '2023-02-20T11:30:00Z' },
  { id: 'u3', username: 'eco_warrior', email: 'eco.warrior@gmail.com', mobile: '1112223333', aadhaar: '998877665544', type: UserType.Citizen, verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=u3', bio: 'Keeping our parks clean and our city green. If you see litter, report it!', joinedDate: '2023-03-05T14:00:00Z' },
  { id: 'u4', username: 'city_watcher', email: 'city.watcher@gmail.com', mobile: '4445556666', aadhaar: '121212121212', type: UserType.Citizen, verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=u4', bio: 'My eyes are on the city\'s infrastructure. From broken signs to graffiti, nothing gets past me.', joinedDate: '2023-04-11T09:00:00Z' },
  { id: 'u5', username: 'solution_seeker', email: 'solution.seeker@gmail.com', mobile: '1231231234', aadhaar: '555666777888', type: UserType.Citizen, verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=u5', bio: 'I don\'t just see problems, I look for solutions. Let\'s work together.', joinedDate: '2023-05-22T18:00:00Z' },
  { id: 'u6', username: 'active_citizen', email: 'active.citizen@gmail.com', mobile: '4321432156', aadhaar: '888777666555', type: UserType.Citizen, verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=u6', bio: 'Actively participating in making my community safer and more efficient.', joinedDate: '2023-06-30T12:00:00Z' },
  { id: 'u7', username: 'urban_gardener', email: 'urban.gardener@gmail.com', mobile: '6543219870', aadhaar: '333444555666', type: UserType.Citizen, verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=u7', bio: 'Cultivating community gardens and reporting any issues that might harm our green spaces.', joinedDate: '2023-07-15T16:45:00Z' },
  { id: 'a1', username: 'officer_k', email: 'officer.k@gov.in', mobile: '5555555555', aadhaar: '112233445566', type: UserType.Authority, verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=a1', bio: 'Public Works Department. Committed to timely resolution of infrastructure issues.', joinedDate: '2022-11-10T08:00:00Z' },
  { id: 'a2', username: 'inspector_raj', email: 'inspector.raj@gov.in', mobile: '7778889999', aadhaar: '112233445566', type: UserType.Authority, verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=a2', bio: 'Sanitation and Parks Department. Ensuring a clean and safe environment for all citizens.', joinedDate: '2022-12-01T08:30:00Z' },
];

export const DUMMY_ISSUES: Issue[] = [
  // Existing issues...
  {
    id: 'i1',
    title: 'Large Pothole on Main Street',
    description: 'A deep and dangerous pothole has formed near the intersection of Main St and 1st Ave. It has already caused tire damage to several vehicles.',
    tags: ['#pothole', '#danger', '#road_repair'],
    imageUrl: 'https://picsum.photos/seed/i1/800/600',
    location: { lat: 34.0522, lng: -118.2437 },
    status: IssueStatus.Pending,
    authorId: 'u1',
    authorUsername: 'john_doe',
    authorAvatar: 'https://i.pravatar.cc/150?u=u1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    upvotes: 12,
    reposts: 3,
  },
  {
    id: 'i2',
    title: 'Streetlight Out on Oak Avenue',
    description: 'The streetlight at 123 Oak Avenue has been out for three nights, making the area very dark and unsafe.',
    tags: ['#streetlight', '#safety', '#darkness'],
    imageUrl: 'https://picsum.photos/seed/i2/800/600',
    location: { lat: 34.0550, lng: -118.2500 },
    status: IssueStatus.InProgress,
    authorId: 'u2',
    authorUsername: 'jane_smith',
    authorAvatar: 'https://i.pravatar.cc/150?u=u2',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    upvotes: 8,
    reposts: 1,
    updates: [
        { updatedBy: 'a1', timestamp: new Date().toISOString(), updateText: 'Team has been dispatched to assess the issue.' }
    ]
  },
  {
    id: 'i3',
    title: 'Overflowing Trash Bin at City Park',
    description: 'The main trash bin near the park entrance is overflowing, and garbage is spreading around the area. It needs to be emptied immediately.',
    tags: ['#trash', '#park', '#cleanliness'],
    imageUrl: 'https://picsum.photos/seed/i3/800/600',
    location: { lat: 34.0600, lng: -118.2450 },
    status: IssueStatus.Resolved,
    authorId: 'u3',
    authorUsername: 'eco_warrior',
    authorAvatar: 'https://i.pravatar.cc/150?u=u3',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    upvotes: 25,
    reposts: 5,
    updates: [
        { updatedBy: 'a1', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), updateText: 'Sanitation crew scheduled for pickup.' },
        { updatedBy: 'a1', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), updateText: 'The trash has been collected and the area cleaned.' }
    ],
    resolvedImageUrl: 'https://picsum.photos/seed/i3-resolved/800/600'
  },
  {
    id: 'i4',
    title: 'Broken Swing at Playground',
    description: 'One of the swings in the kids\' area at Central Park is broken and poses a safety hazard.',
    tags: ['#park', '#safety', '#playground'],
    imageUrl: 'https://picsum.photos/seed/i4/800/600',
    location: { lat: 34.0620, lng: -118.2480 },
    status: IssueStatus.Pending,
    authorId: 'u2',
    authorUsername: 'jane_smith',
    authorAvatar: 'https://i.pravatar.cc/150?u=u2',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    upvotes: 15,
    reposts: 2,
  },
  {
    id: 'i5',
    title: 'Graffiti on Library Wall',
    description: 'There is extensive graffiti on the east wall of the public library, which is very unsightly.',
    tags: ['#graffiti', '#vandalism', '#cleanliness'],
    imageUrl: 'https://picsum.photos/seed/i5/800/600',
    location: { lat: 34.0580, lng: -118.2410 },
    status: IssueStatus.InProgress,
    authorId: 'u4',
    authorUsername: 'city_watcher',
    authorAvatar: 'https://i.pravatar.cc/150?u=u4',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    upvotes: 5,
    reposts: 0,
    updates: [
      { updatedBy: 'a2', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), updateText: 'Cleanup crew has been notified and scheduled for this week.'}
    ]
  },
  {
    id: 'i6',
    title: 'Leaking Fire Hydrant',
    description: 'A fire hydrant on the corner of 5th and Elm is leaking a significant amount of water.',
    tags: ['#water_waste', '#leak', '#infrastructure'],
    imageUrl: 'https://picsum.photos/seed/i6/800/600',
    location: { lat: 34.0500, lng: -118.2550 },
    status: IssueStatus.Resolved,
    authorId: 'u1',
    authorUsername: 'john_doe',
    authorAvatar: 'https://i.pravatar.cc/150?u=u1',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    upvotes: 30,
    reposts: 7,
     updates: [
        { updatedBy: 'a2', timestamp: new Date(Date.now() - 9 * 86400000).toISOString(), updateText: 'Water department dispatched.' },
        { updatedBy: 'a2', timestamp: new Date(Date.now() - 9 * 86400000 + 3600000).toISOString(), updateText: 'The leak has been repaired.' }
    ],
    resolvedImageUrl: 'https://picsum.photos/seed/i6-resolved/800/600'
  },
  {
    id: 'i7',
    title: 'Fallen Tree Blocking Bike Path',
    description: 'A large tree branch has fallen across the Green Way bike path, making it impassable.',
    tags: ['#park', '#obstruction', '#safety'],
    imageUrl: 'https://picsum.photos/seed/i7/800/600',
    location: { lat: 34.0650, lng: -118.2520 },
    status: IssueStatus.Pending,
    authorId: 'u5',
    authorUsername: 'solution_seeker',
    authorAvatar: 'https://i.pravatar.cc/150?u=u5',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    upvotes: 18,
    reposts: 4,
  },
  {
    id: 'i8',
    title: 'Malfunctioning Pedestrian Signal',
    description: 'The crosswalk signal at the corner of Maple & 3rd is stuck on "Don\'t Walk".',
    tags: ['#traffic', '#safety', '#signal'],
    imageUrl: 'https://picsum.photos/seed/i8/800/600',
    location: { lat: 34.0510, lng: -118.2490 },
    status: IssueStatus.InProgress,
    authorId: 'u6',
    authorUsername: 'active_citizen',
    authorAvatar: 'https://i.pravatar.cc/150?u=u6',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    upvotes: 22,
    reposts: 6,
    updates: [
        { updatedBy: 'a1', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), updateText: 'Transportation department has been alerted and will investigate.' }
    ]
  },
  // Fix: Corrected typo 'new D' to 'new Date' and completed the issue object.
  {
    id: 'i9',
    title: 'Abandoned Vehicle on Side Street',
    description: 'A blue sedan has been parked and seemingly abandoned on Willow Lane for over two weeks.',
    tags: ['#vehicle', '#abandoned', '#road_repair'],
    imageUrl: 'https://picsum.photos/seed/i9/800/600',
    location: { lat: 34.0480, lng: -118.2420 },
    status: IssueStatus.Pending,
    authorId: 'u4',
    authorUsername: 'city_watcher',
    authorAvatar: 'https://i.pravatar.cc/150?u=u4',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    upvotes: 9,
    reposts: 1,
  },
];
