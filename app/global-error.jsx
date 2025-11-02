'use client';

// Top-level error boundary. Catches errors outside nested layouts/pages.
export default function GlobalError({ error, reset }) {
  // Avoid leaking stack to users; it will be present in logs.
  const message = error?.message || 'Unexpected application error.';

  return (
    <html>
      <body>
        <div style={{maxWidth:'48rem',margin:'2rem auto',padding:'1.25rem',borderRadius:'0.5rem',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.3)',color:'#e5e7eb',fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'}}>
          <h1 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'0.5rem'}}>Application error</h1>
          <p style={{fontSize:'0.9rem',marginBottom:'0.75rem'}}>{message}</p>
          <div style={{display:'flex',gap:'0.75rem'}}>
            <button onClick={() => reset()} style={{padding:'0.4rem 0.75rem',borderRadius:'0.5rem',background:'#1f2937',border:'1px solid rgba(255,255,255,0.1)',color:'#e5e7eb'}}>Try again</button>
            <a href="/api/health" style={{fontSize:'0.9rem',textDecoration:'underline',color:'#cbd5e1'}}>Check service health</a>
          </div>
        </div>
      </body>
    </html>
  );
}

