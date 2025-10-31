'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const sponsorTerms = [
  {
    title: 'Eligibility',
    items: [
      'Have at least 1,000 followers or subscribers on a verified platform (YouTube, Twitch, TikTok, or equivalent).',
      'Create gaming or esports content, ideally covering OptiPlay supported games.',
      'Publish at least one 10-minute or longer video each week.',
      'Be 18+ or have parent/guardian consent.',
      'Follow OptiPlay brand guidelines and community standards.',
    ],
  },
  {
    title: 'Sponsorship Expectations',
    items: [
      'Promote OptiPlay honestly and positively.',
      'Include provided OptiPlay mention, overlay, or link in sponsored content.',
      'Avoid content containing hate speech, exploits, or false advertising.',
      'Allow OptiPlay to use your name/logo/content snippets for promotion with credit.',
    ],
  },
  {
    title: 'Compensation & Rewards',
    items: [
      'Benefits may include payments, affiliate earnings, features, or shared ad revenue.',
      'Payouts are monthly via your preferred verified method (PayPal, Venmo, etc.).',
      'Submit valid tax information when required.',
    ],
  },
  {
    title: 'Termination',
    items: [
      'OptiPlay may pause or end sponsorships if terms are violated.',
      'Partnerships can be revoked for misleading claims, inactivity, or breaches.',
      'Repeat or fraudulent offenses may be denied reapplication.',
    ],
  },
  {
    title: 'Ownership & Legal',
    items: [
      'OptiPlay retains ownership of brand assets.',
      'Creators keep ownership of their original content.',
      'This agreement is not employment and can be ended by either party.',
    ],
  },
  {
    title: 'Contact',
    items: ['Questions? Email support@optiplay.space'],
  },
];

export default function SponsorApplicationCard() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const [platformStatus, setPlatformStatus] = useState('yes');
  const [platformDetails, setPlatformDetails] = useState('');
  const [postsLongVideos, setPostsLongVideos] = useState(false);
  const [contentRelevant, setContentRelevant] = useState(false);
  const [sponsorshipType, setSponsorshipType] = useState('individual');
  const [contactEmail, setContactEmail] = useState('');
  const [proof, setProof] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!termsAgreed) {
      setError('You must accept the sponsor terms to continue.');
      return;
    }

    if (!postsLongVideos || !contentRelevant) {
      setError('Please confirm that you meet the eligibility requirements.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/sponsors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformStatus,
          platformDetails: platformStatus === 'other' ? platformDetails : null,
          postsLongVideos,
          contentRelevant,
          sponsorshipType,
          contactEmail,
          proof,
          termsAgreed,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Unable to submit application.');
      }
      router.push('/sponsor/thanks');
    } catch (err) {
      setError(err.message || 'Unable to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const collapsedMessage =
    status === 'authenticated'
      ? 'Share your creator stats with the OptiPlay team.'
      : status === 'loading'
      ? 'Loading sponsorship status...'
      : 'Sign in to submit your channel or team for sponsorship review.';

  let expandedContent = null;
  if (status === 'loading') {
    expandedContent = <p className="text-sm text-gray-400">Loading...</p>;
  } else if (!session) {
    expandedContent = (
      <div className="space-y-3 text-sm text-gray-300">
        <p>Sign in to tell us about your channel or team. We review sponsorship requests daily.</p>
        <a
          href="/auth/signin?callbackUrl=%2F"
          className="inline-flex items-center justify-center rounded-lg bg-purple-700 hover:bg-purple-600 px-3 py-1 text-sm"
        >
          Sign in to Apply
        </a>
      </div>
    );
  } else {
    expandedContent = (
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-semibold text-gray-200">
            Do you have 1k+ followers/subscribers?
          </label>
          <div className="mt-2 flex gap-4 text-sm text-gray-300">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="platformStatus"
                value="yes"
                checked={platformStatus === 'yes'}
                onChange={() => setPlatformStatus('yes')}
              />
              Yes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="platformStatus"
                value="other"
                checked={platformStatus === 'other'}
                onChange={() => setPlatformStatus('other')}
              />
              Other platform
            </label>
          </div>
          {platformStatus === 'other' ? (
            <input
              className="mt-2 w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-gray-200"
              placeholder="Link to your other channel or social profile"
              value={platformDetails}
              onChange={(event) => setPlatformDetails(event.target.value)}
              required
            />
          ) : null}
        </div>

        <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={postsLongVideos}
            onChange={(event) => setPostsLongVideos(event.target.checked)}
          />
          I regularly publish 10-minute or longer videos.
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={contentRelevant}
            onChange={(event) => setContentRelevant(event.target.checked)}
          />
          My content covers OptiPlay supported games or esports topics.
        </label>

        <div>
          <label className="text-sm font-semibold text-gray-200">
            Individual or team sponsorship?
          </label>
          <div className="mt-2 flex gap-4 text-sm text-gray-300">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sponsorshipType"
                value="individual"
                checked={sponsorshipType === 'individual'}
                onChange={() => setSponsorshipType('individual')}
              />
              Individual
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sponsorshipType"
                value="team"
                checked={sponsorshipType === 'team'}
                onChange={() => setSponsorshipType('team')}
              />
              Team/Org
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-200">Contact email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-gray-200"
            placeholder="you@example.com"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-200">
            Attach or link proof of following/sub count
          </label>
          <textarea
            className="mt-1 w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-gray-200"
            placeholder="Share a link to public analytics, screenshots, or portfolio."
            value={proof}
            onChange={(event) => setProof(event.target.value)}
            required
            rows={3}
          />
        </div>

        <details className="rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2 text-sm text-gray-200">
          <summary className="cursor-pointer font-semibold text-purple-200">
            Review OptiPlay Sponsor Terms
          </summary>
          <div className="mt-2 space-y-3 text-xs text-gray-300">
            {sponsorTerms.map((section, index) => (
              <div key={index}>
                <div className="font-semibold text-gray-100">{index + 1}. {section.title}</div>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {section.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>

        <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(event) => setTermsAgreed(event.target.checked)}
          />
          I agree to OptiPlay's sponsor terms.
        </label>

        {error ? (
          <div className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-purple-700 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit sponsorship application'}
        </button>
      </form>
    );
  }

  const buttonLabel = expanded
    ? 'Hide'
    : status === 'authenticated'
    ? 'Apply'
    : 'View';
  const disableToggle = status === 'loading' || submitting;

  return (
    <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">Want to be a Paid Sponsor?</h3>
        <button
          type="button"
          className="rounded-md border border-white/10 px-2 py-1 text-xs text-purple-200 hover:bg-purple-600/20 disabled:opacity-50"
          onClick={() => setExpanded((value) => !value)}
          disabled={disableToggle}
        >
          {disableToggle ? 'Loading' : buttonLabel}
        </button>
      </div>
      {!expanded ? (
        <p className="text-xs text-gray-400">{collapsedMessage}</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Share your creator info and we will reach out if you&apos;re a fit. Each account can submit once per day.
          </p>
          {expandedContent}
        </div>
      )}
    </div>
  );
}
