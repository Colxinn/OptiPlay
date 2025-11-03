'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import icon from '@/app/icon.svg';

const allowedDomains = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'ymail.com',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'comcast.net',
  'zoho.com',
]);

function domainOf(email) {
  const at = email.lastIndexOf('@');
  return at === -1 ? '' : email.slice(at + 1).toLowerCase();
}

function passwordFeedback(password) {
  if (password.length < 8) {
    return {
      level: 'weak',
      message: 'Too short — minimum 8 characters.',
      className: 'text-red-400',
    };
  }
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  if (!hasNumber && !hasSpecial) {
    return {
      level: 'fair',
      message: 'Add a number or special character for extra strength.',
      className: 'text-yellow-400',
    };
  }
  if (password.length >= 12 && hasUpper && (hasNumber || hasSpecial)) {
    return {
      level: 'strong',
      message: 'Perfect! This password is tough to crack.',
      className: 'text-green-400 font-semibold',
    };
  }
  return {
    level: 'good',
    message: 'Looks good. Longer is always better.',
    className: 'text-yellow-300',
  };
}

export default function SignInPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mode, setMode] = useState('register');
  const [loginMethod, setLoginMethod] = useState('password');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingPassword, setPendingPassword] = useState(''); // Store password for auto-login after verification

  useEffect(() => {
    if (session?.user) {
      router.replace('/profile');
    }
  }, [session, router]);

  useEffect(() => {
    setStatus('');
    setError('');
    setLoginPassword('');
    setShowVerification(false);
    setVerificationCode('');
  }, [mode]);

  useEffect(() => {
    setStatus('');
    setError('');
    setLoginPassword('');
  }, [loginMethod]);

  const passwordInfo = useMemo(() => passwordFeedback(registerPassword), [registerPassword]);
  const canRegister =
    email &&
    username.length >= 3 &&
    username.length <= 16 &&
    allowedDomains.has(domainOf(email)) &&
    passwordInfo.level !== 'weak';

  async function handleRegister(e) {
    e.preventDefault();
    if (!canRegister) return;
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password: registerPassword }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || 'Unable to start verification');
      }
      setStatus('Verification code sent! Check your email and enter the code below.');
      setShowVerification(true);
      setPendingPassword(registerPassword); // Save password for auto-login
      setRegisterPassword('');
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) return;
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || 'Invalid verification code');
      }
      setStatus('Email verified! Signing you in...');
      // Now sign in with credentials
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password: pendingPassword,
        callbackUrl: '/profile',
      });
      if (signInResult?.error) {
        setStatus('Email verified! Please sign in with your password.');
        setShowVerification(false);
        setMode('login');
        setLoginMethod('password');
      } else {
        router.replace('/profile');
        router.refresh();
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
      setPendingPassword(''); // Clear password from memory
    }
  }

  async function handleMagicLogin(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setStatus('');
    try {
      if (!allowedDomains.has(domainOf(email))) {
        throw new Error(
          'Please use a primary email provider (Gmail, Outlook/Hotmail, Yahoo, iCloud, Proton, Zoho, AOL).'
        );
      }
      const signInResult = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/',
      });
      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }
      setStatus('Magic link sent! Check your email to finish signing in.');
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordLogin(e) {
    e.preventDefault();
    if (!email || !loginPassword) return;
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password: loginPassword,
        callbackUrl: '/profile',
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      const destination = result?.url || '/profile';
      setLoginPassword('');
      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={icon}
          alt=""
          fill
          priority
          className="scale-110 blur-2xl object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-black/70 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-600/25 text-2xl font-bold text-purple-200">
            OP
          </div>
          <h1 className="text-3xl font-bold text-white">
            {mode === 'register' ? 'Create your OptiPlay account' : 'Sign in to OptiPlay'}
          </h1>
          <p className="text-sm text-purple-100/70">
            {mode === 'register'
              ? 'Pick a username, set a password, and we\'ll verify your email.'
              : loginMethod === 'password'
                ? 'Enter your email and password to get started.'
                : 'Enter your email to get a fresh magic link.'}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-purple-200/80">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-full px-4 py-1 transition ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginMethod('password');
            }}
            className={`rounded-full px-4 py-1 transition ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Sign in
          </button>
        </div>

        {mode === 'register' ? (
          <>
            {!showVerification ? (
              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm text-purple-100">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder-purple-100/40 shadow-inner focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-purple-100">
                    Username <span className="text-xs text-purple-200/70">(3-16 characters)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="OptiChampion"
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder-purple-100/40 shadow-inner focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-purple-100">Password</label>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Choose something strong"
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder-purple-100/40 shadow-inner focus:border-purple-400 focus:outline-none"
                  />
                  {registerPassword ? (
                    <p className={`text-xs ${passwordInfo.className}`}>{passwordInfo.message}</p>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Include numbers and symbols to boost your strength meter.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canRegister || loading}
                  className="w-full rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
                <div className="rounded-lg border border-purple-400/30 bg-purple-600/10 p-4">
                  <p className="text-sm text-purple-100">
                    We sent a <strong>6-digit code</strong> to:
                  </p>
                  <p className="mt-1 font-semibold text-purple-200">{email}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-purple-100">Verification Code</label>
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-center text-2xl font-bold tracking-widest text-white placeholder-purple-100/40 shadow-inner focus:border-purple-400 focus:outline-none"
                  />
                  <p className="text-xs text-gray-400">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={verificationCode.length !== 6 || loading}
                  className="w-full rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                >
                  {loading ? 'Verifying...' : 'Verify email'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowVerification(false);
                    setVerificationCode('');
                    setError('');
                    setStatus('');
                  }}
                  className="w-full text-sm text-purple-300 underline hover:text-purple-200"
                >
                  ← Back to registration
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-center gap-3 text-xs text-purple-200/80">
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                className={`rounded-full px-3 py-1 transition ${
                  loginMethod === 'password' ? 'bg-purple-600 text-white shadow' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                Password login
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('magic')}
                className={`rounded-full px-3 py-1 transition ${
                  loginMethod === 'magic' ? 'bg-purple-600 text-white shadow' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                Magic link
              </button>
            </div>

            {loginMethod === 'password' ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm text-purple-100">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder-purple-100/40 shadow-inner focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-purple-100">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder-purple-100/40 shadow-inner focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!email || !loginPassword || loading}
                  className="w-full rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleMagicLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm text-purple-100">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder-purple-100/40 shadow-inner focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!email || loading}
                  className="w-full rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                >
                  {loading ? 'Sending link...' : 'Send magic link'}
                </button>
              </form>
            )}
          </div>
        )}

        {status ? <p className="mt-4 text-sm text-green-400">{status}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing you agree to OptiPlay&apos;s Terms and acknowledge our Privacy Policy.
        </p>
      </div>
    </div>
  );
}



