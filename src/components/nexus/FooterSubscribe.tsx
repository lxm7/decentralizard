'use client';

import { useState } from 'react';

import { Button } from '@/base/button';
import { Input } from '@/base/input';

type Status = 'idle' | 'loading' | 'success' | 'error';

/** Footer newsletter capture — posts to the same endpoint as the first-visit popup. */
export function FooterSubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      setStatus('success');
      setMessage(data.message || 'Please check your email to confirm your subscription.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <p className="font-body text-sm text-brand-teal" role="status">
        {message}
      </p>
    );
  }

  return (
    <form className="flex max-w-sm flex-col gap-sm" onSubmit={handleSubmit}>
      <div className="flex gap-sm">
        <Input
          type="email"
          required
          aria-label="Email address"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          className="bg-background/60"
        />
        <Button
          type="submit"
          disabled={status === 'loading'}
          className="bg-accent-indigo text-white hover:bg-accent-indigo-strong"
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
      {status === 'error' ? (
        <p className="font-body text-xs text-error" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
