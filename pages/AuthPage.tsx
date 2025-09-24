import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, UserType } from '../types';
import * as api from '../services/api';
import { Button, Input, Label, Card } from '../components/ui';
import { DUMMY_AADHAAR_DB } from '../constants';

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
                    {activeTab === 'login' ? <LoginForm /> : <RegisterForm onRegisterSuccess={() => setActiveTab('login')} />}
                </div>
            </Card>
        </div>
    );
};

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const success = await login(email, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid credentials or user not verified.');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </Button>
        </form>
    );
};

const RegisterForm: React.FC<{ onRegisterSuccess: () => void }> = ({ onRegisterSuccess }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        mobile: '',
        aadhaar: '',
        password: '',
        userType: UserType.Citizen,
    });
    const [otp, setOtp] = useState('');
    const [newUser, setNewUser] = useState<User | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');

    useEffect(() => {
        if (!formData.username) { setUsernameStatus('idle'); return; }
        setUsernameStatus('checking');
        const timer = setTimeout(async () => {
            const { unique } = await api.checkUsername(formData.username);
            setUsernameStatus(unique ? 'valid' : 'invalid');
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.username]);

    useEffect(() => {
        if (!formData.email) { setEmailStatus('idle'); return; }
        setEmailStatus('checking');
        const timer = setTimeout(async () => {
            const { unique } = await api.checkEmail(formData.email);
            setEmailStatus(unique ? 'valid' : 'invalid');
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.email]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (usernameStatus !== 'valid' || emailStatus !== 'valid') {
            setError('Please use a unique username and email.');
            return;
        }
        setLoading(true);
        try {
            const user = await api.registerUser({
                username: formData.username,
                email: formData.email,
                mobile: formData.mobile,
                aadhaar: formData.aadhaar,
                type: formData.userType,
                avatarUrl: `https://i.pravatar.cc/150?u=${formData.username}`,
            });
            setNewUser(user);
            setStep(2);
        } catch (err) {
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent, type: 'email' | 'mobile') => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { success } = await api.verifyOtp(otp, type);
            if (success) {
                setOtp('');
                setStep(prev => prev + 1);
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError('Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleAadhaarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const aadhaarRes = await api.verifyAadhaar(formData.aadhaar);
            if (!aadhaarRes.success) {
                setError('Aadhaar verification failed. This number is not in our database.');
                setLoading(false);
                return;
            }
            if (newUser) {
                const finalUser = await api.finalizeVerification(newUser.id);
                if (finalUser) setStep(5);
                else setError('Final verification failed.');
            }
        } catch (err) {
            setError('Aadhaar verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const UsernameStatusIndicator = () => {
      if (usernameStatus === 'checking') return <p className="text-xs text-dark-400 mt-1">Checking...</p>;
      if (usernameStatus === 'invalid') return <p className="text-xs text-red-500 mt-1">Username is taken.</p>;
      if (usernameStatus === 'valid') return <p className="text-xs text-green-500 mt-1">Username is available!</p>;
      return null;
    }

    const EmailStatusIndicator = () => {
      if (emailStatus === 'checking') return <p className="text-xs text-dark-400 mt-1">Checking...</p>;
      if (emailStatus === 'invalid') return <p className="text-xs text-red-500 mt-1">Email is already registered.</p>;
      if (emailStatus === 'valid') return <p className="text-xs text-green-500 mt-1">Email is available!</p>;
      return null;
    }
    
    const selectClasses = "w-full h-10 rounded-md border border-dark-700 bg-dark-800 px-3 text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900";


    switch (step) {
        case 1:
            return (
                <form onSubmit={handleStep1Submit} className="space-y-3">
                    <div className="space-y-1"><Label htmlFor="username">Username</Label><Input name="username" value={formData.username} onChange={handleChange} required /><UsernameStatusIndicator /></div>
                    <div className="space-y-1"><Label htmlFor="email">Email</Label><Input name="email" type="email" value={formData.email} onChange={handleChange} required /><EmailStatusIndicator /></div>
                    <div className="space-y-1"><Label htmlFor="mobile">Mobile Number</Label><Input name="mobile" type="tel" value={formData.mobile} onChange={handleChange} required /></div>
                    <div className="space-y-1">
                        <Label htmlFor="aadhaar">Aadhaar Number</Label>
                        <Input name="aadhaar" value={formData.aadhaar} onChange={handleChange} required />
                        <p className="text-xs text-dark-400 mt-1">Hint: Use a valid test number like {Array.from(DUMMY_AADHAAR_DB)[0]}</p>
                    </div>
                    <div className="space-y-1"><Label htmlFor="password">Password</Label><Input name="password" type="password" value={formData.password} onChange={handleChange} required /></div>
                    <div className="space-y-1"><Label>Account Type</Label><select name="userType" value={formData.userType} onChange={handleChange} className={selectClasses}><option value={UserType.Citizen}>Citizen</option><option value={UserType.Authority}>Authority</option></select></div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading || usernameStatus !== 'valid' || emailStatus !== 'valid'}>{loading ? 'Proceeding...' : 'Next: Verify Email'}</Button>
                </form>
            );
        case 2:
            return (
                <form onSubmit={(e) => handleOtpSubmit(e, 'email')} className="space-y-4 text-center">
                    <h3 className="font-semibold text-white">Verify Your Email</h3>
                    <p className="text-sm text-dark-400">An OTP has been sent to {formData.email}. (Dummy OTP: 123456)</p>
                    <div className="space-y-1 text-left"><Label htmlFor="otp">Email OTP</Label><Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required /></div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Verifying...' : 'Verify Email'}</Button>
                </form>
            );
        case 3:
            return (
                <form onSubmit={(e) => handleOtpSubmit(e, 'mobile')} className="space-y-4 text-center">
                    <h3 className="font-semibold text-white">Verify Your Mobile</h3>
                    <p className="text-sm text-dark-400">An OTP has been sent to {formData.mobile}. (Dummy OTP: 999999)</p>
                    <div className="space-y-1 text-left"><Label htmlFor="otp">Mobile OTP</Label><Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required /></div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Verifying...' : 'Verify Mobile'}</Button>
                </form>
            );
        case 4:
             return (
                <form onSubmit={handleAadhaarSubmit} className="space-y-4 text-center">
                    <h3 className="font-semibold text-white">Verify Aadhaar</h3>
                    <p className="text-sm text-dark-400">Final step: Please confirm to verify your Aadhaar number: <strong>{formData.aadhaar}</strong>.</p>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Verifying...' : 'Verify & Complete Registration'}</Button>
                </form>
            );
        case 5:
            return (
                <div className="space-y-4 text-center">
                    <h3 className="font-semibold text-green-500">Registration Successful!</h3>
                    <p className="text-sm text-dark-400">Your account has been created and verified. You can now log in.</p>
                    <Button onClick={onRegisterSuccess} className="w-full">Proceed to Login</Button>
                </div>
            );
        default:
            return null;
    }
};

export default AuthPage;