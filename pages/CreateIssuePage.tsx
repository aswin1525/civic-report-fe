import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IssueStatus } from '../types';
import * as api from '../services/api';
import { Button, Input, Label, Textarea, Card } from '../components/ui';
import { CameraIcon, MapPinIcon } from '../constants';

const CreateIssuePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (err) => {
                console.error("Geolocation error:", err);
                setError('Could not get location. Please enable location services.');
            }
        );
    }, []);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !image || !location || !user) {
            setError('All fields including image and location are required.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        // Simulate image upload
        const imageUrl = imagePreview || `https://picsum.photos/seed/${new Date().getTime()}/800/600`;

        try {
            await api.createIssue({
                title,
                description,
                tags: tags.split(',').map(t => `#${t.trim()}`).filter(t => t !== '#'),
                imageUrl,
                location,
                status: IssueStatus.Pending,
                authorId: user.id,
                authorUsername: user.username,
                authorAvatar: user.avatarUrl,
            });
            navigate('/');
        } catch (err) {
            setError('Failed to submit issue. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-center text-dark-200">Report a New Issue</h2>
                    
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Broken Streetlight" required />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details about the issue" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., pothole, safety" />
                    </div>
                    
                    <div>
                        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
                            <CameraIcon className="w-5 h-5 mr-2" />
                            {imagePreview ? 'Change Photo' : 'Take or Upload Photo'}
                        </Button>
                        {imagePreview && <img src={imagePreview} alt="Issue preview" className="mt-4 rounded-lg w-full max-h-64 object-cover" />}
                    </div>

                    {location && (
                        <div className="flex items-center p-3 bg-dark-800 border border-dark-700 rounded-md text-sm text-dark-200">
                            <MapPinIcon className="w-5 h-5 mr-2 text-primary" />
                            <span>Location Captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button type="submit" disabled={isSubmitting || !location} className="w-full">
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default CreateIssuePage;