import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Issue, IssueStatus } from '../types';
import * as api from '../services/api';
import IssueCard from '../components/IssueCard';
import { Input, Card } from '../components/ui';

const PopularTags: React.FC<{ issues: Issue[], onTagClick: (tag: string) => void }> = ({ issues, onTagClick }) => {
    const popularTags = useMemo(() => {
        const tagCount: { [key: string]: number } = {};
        issues.forEach(issue => {
            issue.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 7);
    }, [issues]);

    return (
        <Card>
            <h2 className="text-lg font-bold text-white mb-4">Popular Tags</h2>
            <div className="flex flex-wrap gap-2">
                {popularTags.map(([tag]) => (
                    <button 
                        key={tag} 
                        onClick={() => onTagClick(tag)}
                        className="bg-dark-700 text-dark-200 text-sm font-medium px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </Card>
    );
};


const SearchPage: React.FC = () => {
    const [allIssues, setAllIssues] = useState<Issue[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<IssueStatus | 'All'>('All');
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                // Scrolling down
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchIssues = async () => {
            setLoading(true);
            const issues = await api.getIssues();
            setAllIssues(issues);
            setLoading(false);
        };
        fetchIssues();
    }, []);

    const filteredIssues = useMemo(() => {
        return allIssues.filter(issue => {
            const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
            const lowercasedSearch = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                issue.title.toLowerCase().includes(lowercasedSearch) ||
                issue.description.toLowerCase().includes(lowercasedSearch) ||
                issue.tags.some(tag => tag.toLowerCase().includes(lowercasedSearch));
            return matchesStatus && matchesSearch;
        });
    }, [allIssues, searchTerm, statusFilter]);
    
    const handleTagClick = (tag: string) => {
        setSearchTerm(tag);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
            <div className="lg:col-span-2">
                <Card className={`mb-6 p-4 md:sticky top-8 bg-dark-800/80 backdrop-blur-sm z-10 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-[150%]'}`}>
                    <Input 
                        type="search"
                        placeholder="Search by title, description, or tag..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                    />
                    <div className="flex flex-wrap gap-2 justify-center">
                        {(['All', ...Object.values(IssueStatus)] as const).map(status => (
                            <button 
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${statusFilter === status ? 'bg-primary text-white' : 'bg-dark-700 text-dark-200 hover:bg-dark-700/50'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </Card>

                {loading ? (
                     <div className="text-center p-8 text-dark-400">Loading issues...</div>
                ) : filteredIssues.length > 0 ? (
                    <div className="pt-4">
                        {filteredIssues.map(issue => <IssueCard key={issue.id} issue={issue} />)}
                    </div>
                ) : (
                    <Card>
                        <p className="text-center text-dark-400 py-8">No issues found matching your criteria.</p>
                    </Card>
                )}
            </div>
            <div className="hidden lg:block lg:col-span-1 sticky top-8">
               {!loading && <PopularTags issues={allIssues} onTagClick={handleTagClick} />}
            </div>
        </div>
    );
};

export default SearchPage;