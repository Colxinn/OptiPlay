'use client';

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    // Track visitor on component mount
    trackVisitor();
  }, []);

  async function trackVisitor() {
    try {
      const response = await fetch('/api/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Optionally store in sessionStorage to avoid tracking same session multiple times
        if (!data.returning) {
          console.log('🎉 New unique visitor tracked!');
        } else {
          console.log(`👋 Welcome back! Visit #${data.visitCount}`);
        }
      }
    } catch (error) {
      console.error('Failed to track visitor:', error);
    }
  }

  // This component doesn't render anything
  return null;
}
