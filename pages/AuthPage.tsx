import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserType } from '../types';
import * as api from '../services/api';
import { Button, Input, Label, Card } from '../components/ui';

const AuthPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center p-4">
             <h1 className="text-3xl font-bold text-primary mb-2">Civic Resolve</h1>
             <p className="text-dark-400 mb-6">Report & Resolve Community Issues</p>
            <Card className="w-full max-w-md">
                <div className="flex border-b border-dark-700">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`w-1/2 py-3 font-semibold text-center transition-colors ${activeTab === 'login' ? 'text-primary border-b-2 border-primary' : 'text-dark-400'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`w-1/2 py-3 font-semibold text-center transition-colors ${activeTab === 'register' ? 'text-primary border-b-2 border-primary' : 'text-dark-400'}`}
                    >
                        Register
                    </button>
                </div>
                <div className="p-6">
                    {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
                </div>
            </Card>
        </div>
    );
};

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const success = await login(username, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid credentials. Please try again.');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
            </div>
            <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </Button>
        </form>
    );
};

const RegisterForm: React.FC = () => {
    // Fix: Changed state property 'userType' to 'type' to align with the User model and RegisterData type.
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        mobile: '',
        aadhaar: '',
        password: '',
        type: UserType.Citizen,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);
        try {
            await api.registerUser({ ...formData });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const selectClasses = "w-full h-10 rounded-md border border-dark-700 bg-dark-800 px-3 text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900";

    if (success) {
        return (
            <div className="space-y-4 text-center">
                <h3 className="font-semibold text-green-500">Registration Successful!</h3>
                <p className="text-sm text-dark-400">Please check your email ({formData.email}) to verify your account.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1"><Label htmlFor="username">Username</Label><Input name="username" value={formData.username} onChange={handleChange} required /></div>
            <div className="space-y-1"><Label htmlFor="email">Email</Label><Input name="email" type="email" value={formData.email} onChange={handleChange} required /></div>
            <div className="space-y-1"><Label htmlFor="mobile">Mobile Number</Label><Input name="mobile" type="tel" value={formData.mobile} onChange={handleChange} required /></div>
            <div className="space-y-1"><Label htmlFor="aadhaar">Aadhaar Number</Label><Input name="aadhaar" value={formData.aadhaar} onChange={handleChange} required /></div>
            <div className="space-y-1"><Label htmlFor="password">Password</Label><Input name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} /></div>
            {/* Fix: Updated select element's name and value to use 'type' instead of 'userType'. */}
            <div className="space-y-1"><Label>Account Type</Label><select name="type" value={formData.type} onChange={handleChange} className={selectClasses}><option value={UserType.Citizen}>Citizen</option><option value={UserType.Authority}>Authority</option></select></div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
            </Button>
        </form>
    );
};

export default AuthPage;