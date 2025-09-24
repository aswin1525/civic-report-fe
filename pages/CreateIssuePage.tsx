import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IssueStatus } from '../types';
import * as api from '../services/api';
import { Button, Input, Label, Textarea, Card } from '../components/ui';
import { CameraIcon, MapPinIcon } from '../constants';

// Declare Leaflet's global variable to satisfy TypeScript
declare const L: any;

interface MapSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLocationSelect: (location: { lat: number; lng: number }) => void;
    initialLocation: { lat: number; lng: number } | null;
}

const MapSelectorModal: React.FC<MapSelectorModalProps> = ({ isOpen, onClose, onLocationSelect, initialLocation }) => {
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation);

    useEffect(() => {
        if (isOpen && mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current).setView(initialLocation || [20.5937, 78.9629], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                setSelectedLocation({ lat, lng });
                if (markerRef.current) {
                    markerRef.current.setLatLng(e.latlng);
                } else {
                    markerRef.current = L.marker(e.latlng).addTo(map);
                }
            });

            if (initialLocation) {
                markerRef.current = L.marker(initialLocation).addTo(map);
            }

            mapRef.current = map;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, [isOpen, initialLocation]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedLocation) {
            onLocationSelect(selectedLocation);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col p-4">
                <h3 className="text-lg font-bold text-white mb-2 text-center">Select Location on Map</h3>
                <p className="text-sm text-dark-400 mb-4 text-center">Pan, zoom, and click on the map to place a pin at the issue's location.</p>
                <div ref={mapContainerRef} className="flex-grow w-full rounded-md" style={{ zIndex: 0 }}></div>
                <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!selectedLocation}>Confirm Location</Button>
                </div>
            </div>
        </div>
    );
};


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
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const handleGetLocation = () => {
        setIsFetchingLocation(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsFetchingLocation(false);
            },
            (err) => {
                console.error("Geolocation error:", err);
                setError('Could not get location. Please enable location services or select manually.');
                setIsFetchingLocation(false);
                setLocation(null);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };
    
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

        try {
            await api.createIssue({
                title,
                description,
                tags: tags.split(',').map(t => `#${t.trim()}`).filter(t => t !== '#'),
                image,
                lat: location.lat,
                lng: location.lng,
                status: IssueStatus.Pending,
                author_id: user.id,
            });
            navigate('/');
        } catch (err) {
            setError('Failed to submit issue. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
             <MapSelectorModal 
                isOpen={isMapOpen} 
                onClose={() => setIsMapOpen(false)}
                onLocationSelect={(loc) => {
                    setLocation(loc);
                    setIsMapOpen(false);
                }}
                initialLocation={location}
            />
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
                        {/* FIX: Corrected typo in ref name from 'fileInput' to 'fileInputRef' */}
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
                            <CameraIcon className="w-5 h-5 mr-2" />
                            {imagePreview ? 'Change Photo' : 'Take or Upload Photo'}
                        </Button>
                        {imagePreview && <img src={imagePreview} alt="Issue preview" className="mt-4 rounded-lg w-full max-h-64 object-cover" />}
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        {location ? (
                            <div className="flex items-center justify-between p-3 bg-dark-900/50 border border-dark-700 rounded-md text-sm">
                                <div className="flex items-center text-dark-200">
                                    <MapPinIcon className="w-5 h-5 mr-2 text-green-500" />
                                    <span>Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                                </div>
                                <Button type="button" variant="ghost" onClick={() => setIsMapOpen(true)}>
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button type="button" variant="secondary" onClick={handleGetLocation} className="w-full" disabled={isFetchingLocation}>
                                    <MapPinIcon className="w-5 h-5 mr-2" />
                                    {isFetchingLocation ? 'Fetching...' : 'Get Current Location'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => setIsMapOpen(true)} className="w-full">
                                    <MapPinIcon className="w-5 h-5 mr-2" />
                                    Select on Map
                                </Button>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button type="submit" disabled={isSubmitting || !location || !image} className="w-full">
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default CreateIssuePage;