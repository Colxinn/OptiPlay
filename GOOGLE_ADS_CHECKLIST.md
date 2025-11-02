# 🚀 Google Ads Quick Start Checklist

## ✅ Ready to Enable Ads

Your site is now **100% ready** for Google AdSense integration!

### What's Already Done

- ✅ `FeaturedCard.jsx` updated with AdSense code
- ✅ Google AdSense script added to layout
- ✅ Environment variable support configured
- ✅ Responsive ad unit setup
- ✅ Fallback placeholder for disabled state
- ✅ `ads.txt` template created
- ✅ `.env.example` updated with ad variables

### To Enable Ads (3 Steps)

#### 1️⃣ Get AdSense Account (if you don't have one)
```
→ Go to https://www.google.com/adsense
→ Sign up and verify your site
→ Wait for approval (1-3 days)
```

#### 2️⃣ Get Your Credentials
```
→ AdSense Dashboard → Ads → By ad unit
→ Create new Display Ad (Responsive)
→ Copy Client ID: ca-pub-XXXXXXXXXXXXXXXX
→ Copy Slot ID: 1234567890
```

#### 3️⃣ Add to .env.local
```bash
NEXT_PUBLIC_GOOGLE_ADS_ENABLED="true"
NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID="ca-pub-XXXXXXXXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID="1234567890"
```

#### 4️⃣ Update ads.txt
```bash
# Edit public/ads.txt
# Replace pub-XXXXXXXXXXXXXXXX with your real Publisher ID
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

#### 5️⃣ Deploy
```bash
npm run dev  # Test locally
git add .
git commit -m "Enable Google Ads"
git push origin main
```

#### 6️⃣ Add to Vercel
```
Vercel Dashboard → Settings → Environment Variables
→ Add NEXT_PUBLIC_GOOGLE_ADS_ENABLED = "true"
→ Add NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID = "ca-pub-..."
→ Add NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID = "1234567890"
→ Redeploy
```

### Current State: Disabled

Ads are currently **disabled** because:
```bash
NEXT_PUBLIC_GOOGLE_ADS_ENABLED="false"  # or not set
```

When disabled, users see:
```
┌─────────────────────┐
│ Featured            │
├─────────────────────┤
│                     │
│  Ad / Spotlight     │
│                     │
├─────────────────────┤
│ Sponsor or highlight│
└─────────────────────┘
```

### When Enabled

After you add credentials, users will see:
```
┌─────────────────────┐
│ Featured            │
├─────────────────────┤
│                     │
│  [GOOGLE AD]        │
│                     │
├─────────────────────┤
│ Sponsored content   │
└─────────────────────┘
```

## 📍 Where to Find Everything

- **Implementation**: `app/components/FeaturedCard.jsx`
- **Layout Script**: `app/layout.jsx`
- **Documentation**: `GOOGLE_ADS_SETUP.md`
- **ads.txt**: `public/ads.txt`
- **Environment Example**: `.env.example`

## 🎯 Testing

### Before Going Live
- [ ] AdSense account approved
- [ ] Test on localhost (may show blank)
- [ ] Deploy to Vercel staging
- [ ] Check production URL
- [ ] Verify ads.txt is accessible
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Doesn't break layout

### Check ads.txt
```bash
# Should be accessible at:
https://optiplay.space/ads.txt

# Should contain:
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

## 💰 Expected Timeline

| Day | Action | Result |
|-----|--------|--------|
| 0 | Apply for AdSense | Pending review |
| 1-3 | Wait for approval | Email notification |
| 3 | Add credentials & deploy | Ads may show placeholders |
| 4-5 | Google crawls ads.txt | Full verification |
| 7+ | First earnings appear | Revenue tracking starts |
| 30+ | First payment threshold | Min $100 to cash out |

## 🔧 Quick Disable

To turn off ads anytime:

```bash
# In .env.local or Vercel:
NEXT_PUBLIC_GOOGLE_ADS_ENABLED="false"
```

Redeploy, and the placeholder returns.

## 📞 Need Help?

- **Implementation issues**: Check `app/components/FeaturedCard.jsx`
- **AdSense setup**: Read `GOOGLE_ADS_SETUP.md`
- **Account issues**: https://support.google.com/adsense

---

**Status**: ✅ Ready to enable whenever you get AdSense approval!

Just add your credentials to `.env.local` and you're live! 🚀
