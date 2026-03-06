import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Mail, Lock, User, Globe, ArrowRight,
  WifiOff, Phone, Briefcase, AtSign, GraduationCap, ChevronRight
} from 'lucide-react';

type Mode = 'login' | 'register';
type LoginType = 'parent' | 'student';
type RegisterStep = 1 | 2;

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [loginType, setLoginType] = useState<LoginType>('parent');
  const [step, setStep] = useState<RegisterStep>(1);
  const [loading, setLoading] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', region: '', occupation: '', username: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address';
    return null;
  };

  const validateStep2 = () => {
    if (!form.password) return 'Password is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleNextStep = () => {
    const err = validateStep1();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg('');
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (mode === 'register') {
        const err = validateStep2();
        if (err) { setErrorMsg(err); setLoading(false); return; }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name, email: form.email, password: form.password,
            phone: form.phone, region: form.region, occupation: form.occupation,
          }),
        });
        const data = await res.json();
        if (!data.success) { setErrorMsg(data.message || 'Registration failed'); return; }
        setPendingEmail(form.email);
        setOtpMode(true);

      } else {
        const body = loginType === 'parent'
          ? { email: form.email, password: form.password }
          : { username: form.username, password: form.password };

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!data.success) { setErrorMsg(data.message || 'Login failed'); return; }
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        navigate(data.data.user.role === 'parent' ? '/parent-dashboard' : '/dashboard');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) { setErrorMsg('Enter 6-digit code'); return; }
    setOtpLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp: otpCode }),
      });
      const data = await res.json();
      if (!data.success) { setErrorMsg(data.message || 'Invalid code'); return; }
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      navigate('/parent-dashboard');
    } catch {
      setErrorMsg('Network error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    try {
      await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail }),
      });
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
      }, 1000);
    } catch {}
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-amber)] transition-colors text-sm";
  const labelClass = "text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider mb-1.5 block";

  return (
    <>
    {otpMode && (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-[#8892B0] text-sm">We sent a 6-digit code to</p>
            <p className="text-[#F5A623] font-semibold mt-1">{pendingEmail}</p>
          </div>

          <div className="bg-[#112240] rounded-2xl p-8 border border-white/10 shadow-2xl">
            {errorMsg && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            <div className="mb-6">
              <label className="text-xs text-[#8892B0] font-semibold uppercase tracking-wider mb-3 block">
                Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '')); setErrorMsg(''); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white text-center text-3xl font-bold tracking-[1rem] placeholder:text-white/20 focus:outline-none focus:border-[#F5A623] transition-colors"
              />
              <p className="text-[#8892B0] text-xs mt-2 text-center">Enter the 6-digit code from your email</p>
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={otpLoading || otpCode.length !== 6}
              className="w-full bg-[#F5A623] hover:bg-[#FF5733] disabled:opacity-40 text-[#0A1628] font-bold py-3.5 rounded-xl transition-colors mb-4"
            >
              {otpLoading ? 'Verifying...' : 'Verify Email ✓'}
            </button>

            <div className="text-center">
              <p className="text-[#8892B0] text-sm mb-2">Didn't receive the code?</p>
              <button
                onClick={handleResendOTP}
                disabled={resendCooldown > 0}
                className="text-[#F5A623] hover:text-[#FF5733] font-semibold text-sm disabled:opacity-40 transition-colors"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>

            <button
              onClick={() => { setOtpMode(false); setOtpCode(''); setErrorMsg(''); }}
              className="w-full mt-4 text-[#8892B0] hover:text-white text-sm transition-colors"
            >
              ← Back to register
            </button>
          </div>
        </div>
      </div>
    )}
    {!otpMode && (
    <div className="min-h-screen bg-[var(--color-navy)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-[var(--color-amber)]/5 -top-20 -left-20 blur-3xl" />
        <div className="absolute w-64 h-64 rounded-full bg-[var(--color-coral)]/5 bottom-0 right-0 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <a href="/" className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="text-[var(--color-amber)]" size={28} />
            <span className="font-serif text-2xl font-bold text-white">Crisis Classroom</span>
          </a>
          <p className="text-[var(--color-muted)] text-sm">Learning that never stops</p>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[var(--color-navy-light)] rounded-2xl border border-white/5 p-8 shadow-2xl">

          {/* Mode toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setErrorMsg(''); setStep(1); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? 'bg-[var(--color-amber)] text-[var(--color-navy)]' : 'text-[var(--color-muted)] hover:text-white'
                }`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── LOGIN ── */}
            {mode === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* Login type */}
                <div className="grid grid-cols-2 gap-3">
                  {(['parent', 'student'] as LoginType[]).map((t) => (
                    <button key={t} onClick={() => { setLoginType(t); setErrorMsg(''); }}
                      className={`py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        loginType === t
                          ? 'border-[var(--color-amber)] bg-[var(--color-amber)]/10 text-[var(--color-amber)]'
                          : 'border-white/10 text-[var(--color-muted)] hover:border-white/30'
                      }`}>
                      {t === 'parent' ? <User size={15} /> : <GraduationCap size={15} />}
                      {t === 'parent' ? 'Parent' : 'Student'}
                    </button>
                  ))}
                </div>

                {loginType === 'parent' ? (
                  <div>
                    <label className={labelClass}>Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                      <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>Username</label>
                    <div className="relative">
                      <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                      <input name="username" type="text" placeholder="your_username" value={form.username} onChange={handleChange} className={inputClass} />
                    </div>
                    <p className="text-xs text-[var(--color-muted)] mt-1.5">Your username was created by your parent</p>
                  </div>
                )}

                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input name="password" type="password" placeholder="Enter password" value={form.password} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                {errorMsg && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{errorMsg}</motion.div>
                )}

                <button onClick={handleSubmit} disabled={loading}
                  className="w-full bg-[var(--color-amber)] hover:bg-[var(--color-coral)] disabled:opacity-50 text-[var(--color-navy)] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {loading
                    ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-5 h-5 border-2 border-[var(--color-navy)] border-t-transparent rounded-full" />
                    : <> Sign In <ArrowRight size={18} /> </>}
                </button>
              </motion.div>
            )}

            {/* ── REGISTER STEP 1 ── */}
            {mode === 'register' && step === 1 && (
              <motion.div key="reg1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Steps */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-amber)] font-semibold">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-amber)] text-[var(--color-navy)] flex items-center justify-center font-bold text-xs">1</div>
                    Basic Info
                  </div>
                  <div className="flex-1 h-px bg-white/10" />
                  <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs">2</div>
                    Security
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Phone <span className="text-white/20 normal-case font-normal">(optional)</span></label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input name="phone" type="tel" placeholder="+998 90 000 00 00" value={form.phone} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Region</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                      <input name="region" type="text" placeholder="Tashkent" value={form.region} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Occupation</label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                      <input name="occupation" type="text" placeholder="Engineer" value={form.occupation} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{errorMsg}</motion.div>
                )}

                <button onClick={handleNextStep}
                  className="w-full bg-[var(--color-amber)] hover:bg-[var(--color-coral)] text-[var(--color-navy)] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  Continue <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {/* ── REGISTER STEP 2 ── */}
            {mode === 'register' && step === 2 && (
              <motion.div key="reg2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Steps */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 flex items-center justify-center text-xs">✓</div>
                    Basic Info
                  </div>
                  <div className="flex-1 h-px bg-[var(--color-amber)]/50" />
                  <div className="flex items-center gap-2 text-xs text-[var(--color-amber)] font-semibold">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-amber)] text-[var(--color-navy)] flex items-center justify-center font-bold text-xs">2</div>
                    Security
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Creating account for</p>
                  <p className="text-white font-semibold">{form.name}</p>
                  <p className="text-[var(--color-amber)] text-sm">{form.email}</p>
                </div>

                <div>
                  <label className={labelClass}>Create Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input name="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} className={inputClass} />
                  </div>
                  {form.password && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                          form.password.length >= i * 3
                            ? i <= 2 ? 'bg-[var(--color-coral)]' : i === 3 ? 'bg-yellow-400' : 'bg-green-400'
                            : 'bg-white/10'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input name="confirmPassword" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} className={inputClass} />
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                {errorMsg && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{errorMsg}</motion.div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => { setStep(1); setErrorMsg(''); }}
                    className="px-5 py-3.5 rounded-xl border border-white/10 text-[var(--color-muted)] hover:text-white hover:border-white/30 transition-colors text-sm font-semibold">
                    ← Back
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 bg-[var(--color-amber)] hover:bg-[var(--color-coral)] disabled:opacity-50 text-[var(--color-navy)] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {loading
                      ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-5 h-5 border-2 border-[var(--color-navy)] border-t-transparent rounded-full" />
                      : <> Create Account <ArrowRight size={18} /> </>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 mt-6 text-[var(--color-muted)] text-xs">
          <WifiOff size={12} />
          <span>Works offline after first login</span>
        </motion.div>
      </div>
    </div>
    )}
    </>
  );
}