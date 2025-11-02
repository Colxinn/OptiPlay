# 🚀 Enable Google Ads - Quick Guide

Your AdSense client ID (`ca-pub-2863890623382272`) is already hardcoded in the app!

## ✅ What's Already Done

- ✅ AdSense script added to layout
- ✅ Client ID hardcoded: `ca-pub-2863890623382272`
- ✅ `ads.txt` file ready with your Publisher ID
- ✅ Ad components created and ready

## 🎯 To Enable Ads (2 Steps)

### Step 1: Create Ad Units in AdSense

1. Go to https://www.google.com/adsense
2. Go to **Ads** → **By ad unit**
3. Click **Display ads**
4. Create these ad units:

   **Featured Ad (Homepage)**
   - Name: `OptiPlay Featured`
   - Type: Display ad
   - Size: Responsive
   - Copy the **Slot ID** (looks like: `1234567890`)

   **In-Article Ad (Optional)**
   - Name: `OptiPlay In-Article`
   - Type: In-article ad
   - Copy the **Slot ID**

### Step 2: Add to .env.local

Create/edit `.env.local`:

```bash
# Enable ads
NEXT_PUBLIC_GOOGLE_ADS_ENABLED="true"

# Paste your slot IDs from AdSense
NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID="1234567890"
NEXT_PUBLIC_GOOGLE_ADS_IN_ARTICLE_SLOT_ID="9876543210"
```

### Step 3: Deploy

```bash
git add .
git commit -m "Enable Google Ads"
git push origin main
```

### Step 4: Add to Vercel

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_GOOGLE_ADS_ENABLED` = `true`
   - `NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID` = `1234567890`
   - `NEXT_PUBLIC_GOOGLE_ADS_IN_ARTICLE_SLOT_ID` = `9876543210`
3. Redeploy

## 📍 Where Ads Will Appear

### Homepage
- ✅ Right sidebar (Featured section) - **Already implemented**

### Future Placements (Optional)
You can add ads to any page using:

```jsx
import InArticleAd from '@/app/components/InArticleAd';

<InArticleAd />  // In blog posts
```

Or:

```jsx
import DisplayAd from '@/app/components/DisplayAd';

<DisplayAd slot="YOUR_SLOT_ID" format="auto" />
```

## ✅ Verification

After deployment:
- Visit https://optiplay.space/ads.txt
- Should show: `google.com, pub-2863890623382272, DIRECT, f08c47fec0942fa0`

## 🎉 That's It!

No need to configure the client ID - it's already in the code!
Just add your slot IDs and toggle `NEXT_PUBLIC_GOOGLE_ADS_ENABLED="true"` to start showing ads.
