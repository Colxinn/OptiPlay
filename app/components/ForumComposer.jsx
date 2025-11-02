'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { sanitizeImageData } from '@/lib/imageValidation';

const MAX_IMAGE_BYTES = 400_000; // matches server validation
const MAX_DIMENSION = 1280;
const MIN_QUALITY = 0.45;
const QUALITY_STEP = 0.1;

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

async function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unsupported image format.'));
    image.src = dataUrl;
  });
}

async function compressImageFile(file) {
  const originalDataUrl = await fileToDataUrl(file);
  const image = await loadImageFromDataUrl(originalDataUrl);

  const canvas = document.createElement('canvas');
  let { width, height } = image;
  const scale = Math.min(1, MAX_DIMENSION / width, MAX_DIMENSION / height);
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to process image.');
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  let quality = 0.8;
  let dataUrl = canvas.toDataURL('image/webp', quality);
  while (dataUrl.length > MAX_IMAGE_BYTES * 1.4 && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
    dataUrl = canvas.toDataURL('image/webp', quality);
  }

  if (dataUrl.length > MAX_IMAGE_BYTES * 1.4) {
    throw new Error('Image is still too large after compression. Please choose a smaller file.');
  }

  return dataUrl;
}

export default function ForumComposer() {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageData, setImageData] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flaggedReview, setFlaggedReview] = useState(null);

  const isMuted = session?.user?.isMuted;
  const muteExpiresAt = session?.user?.muteExpiresAt;
  const isOwner = session?.user?.isOwner;

  const resetForm = useCallback(() => {
    setTitle('');
    setContent('');
    setImageData('');
    setImagePreview('');
    setImageError('');
    setFlaggedReview(null);
  }, []);

  const handleImageSelection = useCallback(async (event) => {
    setImageError('');
    const file = event.target.files?.[0];
    if (!file) {
      setImageData('');
      setImagePreview('');
      return;
    }
    if (!/^image\//i.test(file.type)) {
      setImageError('Only image files are supported.');
      return;
    }
    try {
      const compressed = await compressImageFile(file);
      const sanitized = sanitizeImageData(compressed);
      if (!sanitized) {
        throw new Error('Image must be smaller than 400KB.');
      }
      setImageData(sanitized);
      setImagePreview(sanitized);
    } catch (err) {
      setImageError(err.message || 'Unable to use this image.');
      setImageData('');
      setImagePreview('');
    }
  }, []);

  const submit = useCallback(async (override = false) => {
    setError('');
    setFlaggedReview(null);

    if (isMuted) {
      setError('You are muted and cannot post new threads.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError('Please provide a title and content.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, override, imageData }),
      });
      const payload = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setFlaggedReview(payload);
        setError(payload.message || 'Content flagged for review. Owners may override.');
        return;
      }
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to create thread.');
      }

      resetForm();
      router.refresh();
    } catch (err) {
      setError(err.message || 'Unexpected error while posting.');
    } finally {
      setLoading(false);
    }
  }, [content, imageData, isMuted, resetForm, router, title]);

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900 p-4">
      <h2 className="text-lg font-semibold mb-2">Start a thread</h2>
      {error ? <div className="text-sm text-red-400 mb-2">{error}</div> : null}
      <input
        className="w-full mb-2 p-2 bg-neutral-800 rounded-md border border-white/10"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full mb-3 p-2 bg-neutral-800 rounded-md border border-white/10 min-h-[120px]"
        placeholder="Write your post..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="mb-3 space-y-2">
        <label className="block text-sm text-purple-100">Attachment (optional)</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageSelection}
          className="text-xs text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-purple-600 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white hover:file:bg-purple-500"
        />
        <p className="text-xs text-gray-400">Compressed to under 400KB. Supported formats: PNG, JPEG, WebP.</p>
        {imageError ? <p className="text-xs text-red-400">{imageError}</p> : null}
        {imagePreview ? (
          <div className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Attachment preview" className="w-full max-h-56 object-contain" />
            <button
              type="button"
              onClick={() => {
                setImageData('');
                setImagePreview('');
                setImageError('');
              }}
              className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
            >
              Remove
            </button>
          </div>
        ) : null}
      </div>

      <button
        onClick={() => submit(false)}
        disabled={loading || isMuted}
        className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
      <span className="ml-2 text-xs text-gray-400">Sign in required</span>

      {isMuted ? (
        <p className="mt-2 text-xs text-amber-300">
          Muted users can still read the forum but cannot create new threads.
          {muteExpiresAt
            ? ` Mute ends ${new Date(muteExpiresAt).toLocaleString()}.`
            : ' Mute is currently indefinite.'}
        </p>
      ) : null}

      {flaggedReview?.flagged ? (
        <div className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-100">
          <p className="font-semibold text-amber-200">Content flagged for review.</p>
          {flaggedReview.message ? <p className="mt-1">{flaggedReview.message}</p> : null}
          {typeof flaggedReview.score === 'number' ? (
            <p className="mt-1 text-amber-200/80">Toxicity score: {flaggedReview.score.toFixed(2)}</p>
          ) : null}
          {isOwner ? (
            <button
              onClick={() => submit(true)}
              disabled={loading}
              className="mt-2 inline-flex items-center rounded-md border border-amber-300/40 bg-amber-500/20 px-3 py-1 text-amber-50 hover:bg-amber-500/30 disabled:opacity-60"
            >
              {loading ? 'Posting...' : 'Override & Post'}
            </button>
          ) : (
            <p className="mt-2 text-amber-200/70">
              Contact an owner if you believe this was flagged incorrectly.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
