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
        const fetchedIssue = await api.getIssueById(id);
        setIssue(fetchedIssue);
        setNewStatus(fetchedIssue?.status);
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchIssue();
    }, [fetchIssue]);

    const handleStatusUpdate = async () => {
        if (!id || !user || !newStatus || !updateText) return;
        await api.updateIssueStatus(id, newStatus, updateText, user.id);
        setUpdateText('');
        fetchIssue();
    };

    if (loading) return <div className="text-center p-8 text-dark-400">Loading issue details...</div>;
    if (!issue) return <div className="text-center p-8 text-dark-400">Issue not found.</div>;
    
    const selectClasses = "w-full h-10 rounded-md border border-dark-700 bg-dark-800 px-3 text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900";

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <div className="flex items-start mb-4">
                     <Link to={`/profile/${issue.authorId}`} className="flex-shrink-0">
                        <img src={issue.authorAvatar} alt={issue.authorUsername} className="w-12 h-12 rounded-full mr-4 border-2 border-dark-700 hover:border-primary transition-colors" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{issue.title}</h1>
                        <p className="text-sm text-dark-400">
                            Reported by <Link to={`/profile/${issue.authorId}`} className="font-medium hover:text-primary transition-colors">{issue.authorUsername}</Link> on {new Date(issue.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                
                <img src={issue.imageUrl} alt={issue.title} className="w-full max-h-[450px] object-cover rounded-lg mb-4" />
                
                <p className="text-dark-200 mb-4">{issue.description}</p>
                
                <div className="flex items-center text-sm text-dark-400 mb-4">
                    <MapPinIcon className="w-4 h-4 mr-2 text-primary"/>
                    <span>{issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}</span>
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
                            {issue.updates.map((update, index) => (
                                <div key={index} className="text-sm">
                                    <p className="font-medium text-dark-200">{update.updateText}</p>
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