'use client'
import { useState } from 'react';

export default function CreatePost(){
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  async function submit(e){
    e.preventDefault();
    if (process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true') {
      const dev = localStorage.getItem('dev_user');
      if (!dev) return alert('Dev auth required. Click Dev Login in header.');
    }
    const dev = localStorage.getItem('dev_user');
    const headers = dev ? { 'x-dev-user': dev } : {};
    const res = await fetch('/api/posts', { method:'POST', headers:{'Content-Type':'application/json', ...headers}, body: JSON.stringify({ title, content }) });
    if (res.ok) {
      const data = await res.json();
      window.location.href = `/forum/${data.id}`;
    } else {
      alert('Failed to create');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl mb-4">Create Post</h1>
      <form onSubmit={submit} className="space-y-4">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-3 bg-[#0b0b10] rounded" required/>
        <textarea value={content} onChange={e=>setContent(e.target.value)} rows={8} placeholder="Write your post..." className="w-full p-3 bg-[#0b0b10] rounded" required/>
        <button className="bg-optiPurple-500 px-4 py-2 rounded">Publish</button>
      </form>
    </div>
  )
}
