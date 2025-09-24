import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Issue, IssueStatus, UserType } from '../types';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Textarea } from '../components/ui';
import StatusBar from '../components/StatusBar';
import { MapPinIcon } from '../constants';


const IssueDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [updateText, setUpdateText] = useState('');
    const [newStatus, setNewStatus] = useState<IssueStatus | undefined>();

    const fetchIssue = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const fetchedIssue = await api.getIssueById(id);
            setIssue(fetchedIssue);
            setNewStatus(fetchedIssue?.status);
        } catch (error) {
            console.error("Failed to fetch issue:", error);
            setIssue(null); // Clear out old data on error
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        let unsubscribe: (() => Promise<any>) | null = null;
        
        const setupSubscription = () => {
            if (!id) return;
            unsubscribe = api.subscribeToIssueUpdates(id, () => {
                console.log("Real-time update received, refetching issue...");
                fetchIssue();
            });
        };

        fetchIssue().then(setupSubscription);

        // Cleanup function to unsubscribe when the component unmounts or the ID changes
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [id, fetchIssue]);

    const handleStatusUpdate = async () => {
        if (!id || !user || !newStatus || !updateText) return;
        try {
            await api.updateIssueStatus(id, newStatus, updateText, user.id);
            setUpdateText('');
            // No need to call fetchIssue() here, the real-time subscription will handle it
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    if (loading) return <div className="text-center p-8 text-dark-400">Loading issue details...</div>;
    if (!issue || !issue.profiles) return <div className="text-center p-8 text-dark-400">Issue not found.</div>;
    
    const selectClasses = "w-full h-10 rounded-md border border-dark-700 bg-dark-800 px-3 text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900";

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <div className="flex items-start mb-4">
                     <Link to={`/profile/${issue.author_id}`} className="flex-shrink-0">
                        <img src={issue.profiles.avatar_url} alt={issue.profiles.username} className="w-12 h-12 rounded-full mr-4 border-2 border-dark-700 hover:border-primary transition-colors" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{issue.title}</h1>
                        <p className="text-sm text-dark-400">
                            Reported by <Link to={`/profile/${issue.author_id}`} className="font-medium hover:text-primary transition-colors">{issue.profiles.username}</Link> on {new Date(issue.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                
                <img src={issue.image_url} alt={issue.title} className="w-full max-h-[450px] object-cover rounded-lg mb-4" />
                
                <p className="text-dark-200 mb-4">{issue.description}</p>
                
                <div className="flex items-center text-sm text-dark-400 mb-4">
                    <MapPinIcon className="w-4 h-4 mr-2 text-primary"/>
                    <span>{issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                    {issue.tags.map(tag => (
                        <span key={tag} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                </div>

                <div className="mb-6">
                     <StatusBar status={issue.status} />
                </div>

                {issue.updates && issue.updates.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-white mb-3">Update History</h3>
                        <div className="space-y-4 border-l-2 border-dark-700 pl-4">
                            {issue.updates.map((update) => (
                                <div key={update.id} className="text-sm">
                                    <p className="font-medium text-dark-200">{update.update_text}</p>
                                    <p className="text-xs text-dark-400">by Authority on {new Date(update.timestamp).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
               
                {user?.type === UserType.Authority && issue.status !== IssueStatus.Resolved && (
                    <div className="bg-dark-900/50 border border-dark-700 p-4 rounded-lg mt-6">
                        <h3 className="font-semibold text-white mb-3">Update Status</h3>
                        <div className="space-y-4">
                            <select 
                                value={newStatus} 
                                onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                                className={selectClasses}>
                                {Object.values(IssueStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Textarea 
                                placeholder="Add an update comment..."
                                value={updateText}
                                onChange={(e) => setUpdateText(e.target.value)}
                            />
                            <Button onClick={handleStatusUpdate} className="w-full" disabled={!updateText.trim()}>Submit Update</Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default IssueDetailPage;