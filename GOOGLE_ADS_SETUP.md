# 💰 Google Ads Integration Guide

OptiPlay is now ready to display Google AdSense ads in the Featured section on the homepage.

## 🎯 Quick Setup (5 minutes)

### Step 1: Get Google AdSense Account

1. Go to https://www.google.com/adsense
2. Sign up with your Google account
3. Complete site verification
4. Wait for approval (usually 1-3 days)

### Step 2: Create Ad Unit

1. In AdSense dashboard, go to **Ads** → **By ad unit**
2. Click **Display ads**
3. Name it: `OptiPlay Featured Ad`
4. Choose **Responsive** ad size
5. Click **Create**
6. Copy the **Client ID** (looks like `ca-pub-XXXXXXXXXXXXXXXX`)
7. Copy the **Ad Slot ID** (looks like `1234567890`)

### Step 3: Configure Environment Variables

Add to your `.env.local`:

```bash
# Enable Google Ads
NEXT_PUBLIC_GOOGLE_ADS_ENABLED="true"

# Your AdSense Publisher ID
NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID="ca-pub-XXXXXXXXXXXXXXXX"

# Your Ad Unit Slot ID
NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID="1234567890"
```

### Step 4: Deploy

```bash
# Test locally first
npm run dev

# Visit http://localhost:3000
# You should see "Ad Placeholder" if not yet approved
# Or real ads if approved

# Deploy to production
git add .
git commit -m "Enable Google Ads"
git push origin main
```

### Step 5: Add to Vercel (Production)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the three variables:
   - `NEXT_PUBLIC_GOOGLE_ADS_ENABLED` = `true`
   - `NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID` = `ca-pub-XXXXXXXXXXXXXXXX`
   - `NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID` = `1234567890`
3. Redeploy the site

## 📍 Where Ads Appear

### Homepage Right Sidebar
```
┌─────────────────────────┐
│ Featured                │
├─────────────────────────┤
│                         │
│   [GOOGLE AD HERE]      │
│                         │
├─────────────────────────┤
│ Sponsored content       │
└─────────────────────────┘
```

The ad appears in the `FeaturedCard` component, which is displayed:
- On the homepage (`/`)
- In the right sidebar
- Above the news widget
- Responsive and auto-sizing

## 🎨 Implementation Details

### Files Modified

**`app/layout.jsx`**
- Added Next.js `Script` component
- Loads Google AdSense script conditionally
- Only loads when `NEXT_PUBLIC_GOOGLE_ADS_ENABLED=true`

**`app/components/FeaturedCard.jsx`**
- Client component with `useEffect` for ad initialization
- Responsive ad unit with `data-full-width-responsive="true"`
- Fallback placeholder when ads disabled
- Auto-formats to container size

### Ad Unit Configuration

```jsx
<ins
  className="adsbygoogle"
  style={{ display: 'block' }}
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
  data-ad-slot="1234567890"
  data-ad-format="auto"
  data-full-width-responsive="true"
/>
```

**Properties:**
- `data-ad-format="auto"` - Responsive sizing
- `data-full-width-responsive="true"` - Adapts to container
- `className="adsbygoogle"` - Required Google class
- `style={{ display: 'block' }}` - Proper rendering

## 🔧 Troubleshooting

### Ads Not Showing

**1. Check Environment Variables**
```bash
# In terminal:
echo $NEXT_PUBLIC_GOOGLE_ADS_ENABLED
echo $NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID
echo $NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID
```

**2. Verify AdSense Script Loads**
- Open browser DevTools → Network tab
- Look for `adsbygoogle.js` loading
- Should see: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js`

**3. Console Errors**
- Open browser DevTools → Console
- Look for AdSense errors
- Common: "AdSense account not approved yet"

**4. AdSense Account Status**
- Check https://www.google.com/adsense
- Status should be "Active"
- May take 24-48 hours after approval

### Blank Ad Space

**Normal during development:**
- AdSense may not serve ads on `localhost`
- Test on deployed Vercel URL instead
- Some regions have limited ad inventory

**Fix:**
- Ensure site is public and accessible
- Add `ads.txt` file (see below)
- Wait 24-48 hours after first deployment

### Policy Violations

If ads disappear:
1. Check AdSense dashboard for violations
2. Common issues:
   - Insufficient content
   - Content policy violations
   - Click manipulation
3. Fix issues and request review

## 📄 ads.txt File (Important!)

Create `public/ads.txt`:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Replace `pub-XXXXXXXXXXXXXXXX` with your actual Publisher ID.

Then deploy:
```bash
git add public/ads.txt
git commit -m "Add ads.txt for AdSense verification"
git push origin main
```

Verify at: `https://optiplay.space/ads.txt`

## 💡 Best Practices

### 1. Ad Placement
- ✅ Right sidebar (current)
- ✅ Between content sections
- ❌ Too many ads (Google penalizes)
- ❌ Above the fold exclusively

### 2. Performance
- Script loads with `strategy="afterInteractive"`
- Doesn't block page rendering
- Responsive and lazy-loaded

### 3. User Experience
- Clear "Sponsored content" label
- Doesn't obstruct navigation
- Matches site design
- Optional disable in settings (future)

### 4. Revenue Optimization
- Use Auto ads for more coverage
- Enable matched content
- Try different ad sizes
- Monitor performance in AdSense dashboard

## 📊 Monitoring Revenue

### AdSense Dashboard
1. Go to https://www.google.com/adsense
2. Check **Reports** for earnings
3. Monitor **Performance** metrics:
   - Page RPM (revenue per 1000 views)
   - CTR (click-through rate)
   - CPC (cost per click)

### Expected Revenue (Estimates)
- **100 daily visitors**: $1-5/month
- **1,000 daily visitors**: $20-100/month
- **10,000 daily visitors**: $200-1000/month

*Varies by niche, location, and engagement*

## 🚀 Advanced: Multiple Ad Units

To add more ad placements:

### 1. Create More Ad Units in AdSense
- Forum sidebar
- Between benchmark results
- Below news articles
- In-feed ads

### 2. Create New Components

**`app/components/ForumSidebarAd.jsx`:**
```jsx
'use client';

export default function ForumSidebarAd() {
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}
      data-ad-slot="DIFFERENT_SLOT_ID_HERE"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
```

### 3. Add Environment Variables
```bash
NEXT_PUBLIC_GOOGLE_ADS_FORUM_SLOT="9876543210"
NEXT_PUBLIC_GOOGLE_ADS_NEWS_SLOT="1357924680"
```

## 🎯 Testing Checklist

Before going live:

- [ ] AdSense account approved
- [ ] Client ID and Slot ID correct
- [ ] Environment variables set in Vercel
- [ ] ads.txt file deployed
- [ ] Ads show on production URL
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Doesn't break layout
- [ ] Analytics tracking works
- [ ] Privacy policy mentions ads (if required)

## ⚠️ Important Notes

### Privacy & Compliance

**GDPR/CCPA:**
- Google AdSense handles consent automatically
- AdSense script shows consent banners in EU
- Users can opt-out via Google settings

**Privacy Policy:**
Add to your privacy policy:
```
We use Google AdSense to display advertisements. 
Google may use cookies and web beacons to serve 
ads based on your browsing history. You can opt out 
at https://www.google.com/settings/ads
```

### Content Policies

AdSense is **not allowed** on pages with:
- ❌ Adult content
- ❌ Violence/gore
- ❌ Illegal content
- ❌ Copyrighted material
- ❌ Hacking/cheating tools

OptiPlay content is **compliant** ✅

## 🔮 Future Enhancements

- [ ] Auto ads for more coverage
- [ ] In-article ads for news pages
- [ ] Sticky sidebar ad on scroll
- [ ] A/B testing different placements
- [ ] Ad blocker detection message
- [ ] Premium ad-free membership
- [ ] Analytics integration
- [ ] Custom ad units for sponsors

## 📞 Support

**Issues with this integration:**
- Check implementation in `app/components/FeaturedCard.jsx`
- Verify env variables: `NEXT_PUBLIC_GOOGLE_ADS_*`

**AdSense account issues:**
- Visit https://support.google.com/adsense
- Use AdSense Help Community
- Email: adsense-support@google.com

**Revenue questions:**
- Check AdSense dashboard
- Wait 24-48 hours for first earnings
- Payment threshold: $100 USD

---

## 🎉 You're Ready!

Your site is now **Google Ads ready**. Just add your AdSense credentials to `.env.local` and start earning! 💰
