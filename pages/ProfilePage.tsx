import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Issue, IssueStatus, UserType, User } from '../types';
import * as api from '../services/api';
import IssueCard from '../components/IssueCard';
import { Card } from '../components/ui';

const ProfileHeader: React.FC<{ user: User }> = ({ user }) => (
    <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-center">
            <img src={user.avatar_url} alt={user.username} className="w-24 h-24 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-primary" />
            <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                <p className="text-dark-400">{user.id}</p> {/* Email is sensitive, might not be on public profile */}
                <p className="text-sm text-dark-200 mt-2 max-w-lg">{user.bio || 'No bio provided.'}</p>
                 <span className={`mt-2 text-xs font-semibold inline-block py-1 px-3 uppercase rounded-full text-primary-foreground bg-primary/80`}>
                    {user.type}
                </span>
            </div>
        </div>
    </Card>
);

const ProfileStats: React.FC<{ user: User, issues: Issue[] }> = ({ user, issues }) => {
    const stats = useMemo(() => {
        const issueCount = issues.length;
        const resolvedCount = issues.filter(i => i.status === IssueStatus.Resolved).length;
        const inProgressCount = issues.filter(i => i.status === IssueStatus.InProgress).length;
        const pendingCount = issues.filter(i => i.status === IssueStatus.Pending).length;
        const totalUpvotes = issues.reduce((acc, issue) => acc + issue.upvotes, 0);

        return { issueCount, resolvedCount, inProgressCount, pendingCount, totalUpvotes };
    }, [issues]);

    return (
    <Card>
        <h3 className="text-lg font-bold text-white mb-4">Stats</h3>
        <div className="space-y-4">
            {user.type === UserType.Citizen && (
                <div className="flex justify-between items-center">
                    <span className="text-dark-200 font-medium">Total Upvotes Received</span>
                    <span className="font-bold text-primary text-lg">{stats.totalUpvotes}</span>
                </div>
            )}
            <div className="flex justify-between items-center">
                <span className="text-dark-200 font-medium">{user.type === UserType.Citizen ? 'Total Reports' : 'Total Managed'}</span>
                <span className="font-bold text-white text-lg">{stats.issueCount}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-dark-200 font-medium">Resolved</span>
                <span className="font-bold text-resolved text-lg">{stats.resolvedCount}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-dark-200 font-medium">In Progress</span>
                <span className="font-bold text-inprogress text-lg">{stats.inProgressCount}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-dark-200 font-medium">Pending</span>
                <span className="font-bold text-pending text-lg">{stats.pendingCount}</span>
            </div>
            {user.created_at && (
                 <div className="pt-2 border-t border-dark-700 text-center">
                    <span className="text-xs text-dark-400">Joined on {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
            )}
        </div>
    </Card>
    )
};

const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId?: string }>();
    const { user: loggedInUser } = useAuth();
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!loggedInUser) return;
            try {
                setLoading(true);
                const idToFetch = userId || loggedInUser.id;
                const userToFetch = await api.getUserById(idToFetch);

                if (userToFetch) {
                    setProfileUser(userToFetch);
                    const userIssues = userToFetch.type === UserType.Citizen
                        ? await api.getIssuesByAuthor(userToFetch.id)
                        : await api.getIssuesByAuthority(userToFetch.id);
                    setIssues(userIssues);
                } else {
                    console.error("User not found");
                }
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [userId, loggedInUser]);

    if (loading) {
        return <div className="text-center p-8 text-dark-400">Loading profile...</div>;
    }

    if (!profileUser) {
        return <div className="text-center p-8 text-dark-400">User not found.</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
            <div className="lg:col-span-2">
                <ProfileHeader user={profileUser} />
                
                <h3 className="text-xl font-semibold mb-4 text-white">
                    {profileUser.id === loggedInUser?.id 
                      ? (profileUser.type === UserType.Citizen ? 'Your Reported Issues' : 'Issues You Manage')
                      : `${profileUser.username}'s Activity`
                    }
                </h3>
                
                {issues.length > 0 ? (
                    issues.map(issue => <IssueCard key={issue.id} issue={issue} />)
                ) : (
                    <Card>
                        <p className="text-center text-dark-400 py-8">No issues to display.</p>
                    </Card>
                )}
            </div>
            <div className="hidden lg:block lg:col-span-1 sticky top-8">
                <ProfileStats user={profileUser} issues={issues} />
            </div>
        </div>
    );
};

export default ProfilePage;
