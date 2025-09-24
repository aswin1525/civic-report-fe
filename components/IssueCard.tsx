import React from 'react';
import { Link } from 'react-router-dom';
import { Issue } from '../types';
import { Card } from './ui';
import StatusBar from './StatusBar';
import { MapPinIcon, ThumbsUpIcon, RepeatIcon } from '../constants';
import * as api from '../services/api';

const IssueCard: React.FC<{ issue: Issue }> = ({ issue }) => {
    const [upvotes, setUpvotes] = React.useState(issue.upvotes);
    const [reposts, setReposts] = React.useState(issue.reposts);
    const [isInteracting, setIsInteracting] = React.useState(false);

    const handleInteraction = async (action: 'upvote' | 'repost', e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInteracting) return;

        setIsInteracting(true);
        if (action === 'upvote') {
            await api.upvoteIssue(issue.id);
            setUpvotes(prev => prev + 1);
        } else {
            await api.repostIssue(issue.id);
            setReposts(prev => prev + 1);
        }
        setIsInteracting(false);
    };
    
    if (!issue.profiles) {
      // Handle case where author data might not be loaded yet
      return null;
    }

    return (
        <Link to={`/issue/${issue.id}`} className="block mb-6">
            <Card className="overflow-hidden hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                    <Link to={`/profile/${issue.author_id}`} onClick={(e) => e.stopPropagation()} className="flex items-center hover:opacity-80 transition-opacity">
                      <img src={issue.profiles.avatar_url || 'https://i.pravatar.cc/150'} alt={issue.profiles.username} className="w-11 h-11 rounded-full mr-4" />
                      <div>
                          <p className="font-semibold text-dark-200">{issue.profiles.username}</p>
                          <p className="text-xs text-dark-400">{new Date(issue.created_at).toLocaleDateString()}</p>
                      </div>
                    </Link>
                </div>
                
                <p className="text-dark-400 text-sm mb-4">{issue.description}</p>
                
                {issue.image_url && (
                    <div className="mb-4">
                        <img src={issue.image_url} alt={issue.title} className="w-full max-h-[350px] object-cover rounded-lg" />
                    </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                    {issue.tags.map(tag => (
                        <span key={tag} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
                
                <div className="mb-4">
                    <StatusBar status={issue.status} />
                </div>
                
                <div className="border-t border-dark-700 mt-4 pt-3 flex justify-around text-dark-400">
                    <button onClick={(e) => handleInteraction('upvote', e)} disabled={isInteracting} className="flex items-center space-x-2 hover:text-primary transition-colors p-2 rounded-md">
                        <ThumbsUpIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{upvotes}</span>
                    </button>
                    <button onClick={(e) => handleInteraction('repost', e)} disabled={isInteracting} className="flex items-center space-x-2 hover:text-primary transition-colors p-2 rounded-md">
                        <RepeatIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{reposts}</span>
                    </button>
                     <div className="flex items-center space-x-2 p-2 rounded-md">
                        <MapPinIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Location</span>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default IssueCard;