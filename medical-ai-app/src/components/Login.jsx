import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification,
  signOut
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Database, Lock, Mail, User, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showResend, setShowResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setShowResend(false);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });
        await sendEmailVerification(user);

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          fullName: fullName,
          email: email,
          role: "Engineer",
          isVerified: false,
          createdAt: serverTimestamp()
        });

        setMessage({ type: 'success', text: 'Account created! Please check your email for the verification link.' });
        setIsRegistering(false);
        await signOut(auth); 
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          setMessage({ type: 'error', text: 'Email not verified. Please check your inbox or click resend below.' });
          setShowResend(true);
          await signOut(auth);
          return;
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (e) => {
    e.preventDefault(); // Stop any form bubbling
    setLoading(true);
    try {
      // Re-authenticate to get a fresh user object for sending verification
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      setMessage({ type: 'success', text: 'A fresh verification link has been sent to your email!' });
      setShowResend(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Resend failed: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-blue-200">
            <Database size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Medical Brain</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Engineer Access</p>
        </div>

        {/* Status Messages */}
        {message.text && (
          <div className={`mb-6 p-5 rounded-2xl text-sm font-bold animate-in fade-in zoom-in duration-300 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div className="relative">
              <User className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="text" placeholder="Full Name" required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="email" placeholder="Email Address" required
              value={email}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="password" placeholder="Password" required
              value={password}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : (isRegistering ? 'Register Account' : 'Sign In')}
          </button>
        </form>

        {/* Resend Button - Explicitly outside the main form handling */}
        {showResend && (
          <button 
            type="button" 
            onClick={resendVerification}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-4 rounded-2xl hover:bg-slate-200 transition-all font-bold border border-slate-200"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Send Fresh Verification Link
          </button>
        )}

        <button 
          type="button"
          onClick={() => { setIsRegistering(!isRegistering); setMessage({type:'', text:''}); setShowResend(false); }}
          className="w-full mt-8 text-sm font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-[0.15em]"
        >
          {isRegistering ? '← Back to Login' : 'Need a new account? Register'}
        </button>
      </div>
    </div>
  );
};

export default Login;