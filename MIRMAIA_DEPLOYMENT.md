# Mirmaia Firebase Deployment Guide

## ✅ Complete Independence from Old Project

This project is now **100% independent** from the old `sham-coffee` Firebase project.

- **Hosting**: `mirmaia-33acc.web.app`
- **Database**: `mirmaia-33acc` Firebase project
- **Auth**: `mirmaia-33acc` Firebase project
- **Storage**: `mirmaia-33acc` Firebase project

---

## 📋 Files Changed

### Environment Configuration Files
1. **`admin-next/.env.production`** - Created with mirmaia-33acc config
2. **`admin-next/.env.local`** - Updated with mirmaia-33acc config
3. **`admin-next/.env.example`** - Updated template

### Firebase Configuration Files
4. **`admin-next/lib/firebase/config.ts`**
   - Changed `projectId` default: `"sham-coffee"` → `"mirmaia-33acc"`
   - Changed `authDomain` default: `"sham-coffee.firebaseapp.com"` → `"mirmaia-33acc.firebaseapp.com"`
   - Changed `databaseURL` default: `"https://sham-coffee-default-rtdb.firebaseio.com"` → `"https://mirmaia-33acc-default-rtdb.firebaseio.com"`
   - Changed `storageBucket` default: `"sham-coffee.firebasestorage.app"` → `"mirmaia-33acc.firebasestorage.app"`
   - Changed `RESTAURANT_ID` default: `'sham-coffee-1'` → `'mirmaia-1'`

5. **`js/firebase-config.js`**
   - Updated all Firebase config values to use mirmaia-33acc
   - Changed to use environment variables with mirmaia-33acc defaults

6. **`js/firebase-config-secure.js`**
   - Updated all Firebase config values to use mirmaia-33acc
   - Changed to use environment variables with mirmaia-33acc defaults

### Authentication & Restaurant ID
7. **`js/auth.js`**
   - Changed default `restaurantId`: `'sham-coffee-1'` → `'mirmaia-1'` (3 occurrences)

8. **`admin-next/lib/auth.ts`**
   - Changed auth salt: `'sham-coffee-salt'` → `'mirmaia-salt'`

### HTML Files with Firebase Config
9. **`index.html`**
   - Changed `RESTAURANT_ID`: `'sham-coffee-1'` → `'mirmaia-1'` (2 occurrences)
   - Updated site reference: `sham-coffee` → `mirmaia`
   - Updated URL: `https://sham-coffee.web.app` → `https://mirmaia-33acc.web.app`

10. **`menu.html`**
    - Updated Firebase config: all `sham-coffee` → `mirmaia-33acc`
    - Changed `RID`: `'sham-coffee-1'` → `'mirmaia-1'`

11. **`menu-staff.html`**
    - Updated Firebase config: all `sham-coffee` → `mirmaia-33acc`
    - Changed `RID`: `'sham-coffee-1'` → `'mirmaia-1'`

12. **`reports.html`**
    - Updated Firebase config: all `sham-coffee` → `mirmaia-33acc`
    - Changed default `restaurant_id`: `'sham-coffee-1'` → `'mirmaia-1'`

13. **`rooms.html`**
    - Updated Firebase config: all `sham-coffee` → `mirmaia-33acc`
    - Changed default `restaurantId`: `'sham-coffee-1'` → `'mirmaia-1'`

14. **`worker-app.html`**
    - Updated Firebase config: all `sham-coffee` → `mirmaia-33acc`
    - Changed default `RID`: `'sham-coffee-1'` → `'mirmaia-1'`

15. **`cashier.html`**
    - Changed `RESTAURANT_ID`: `'sham-coffee-1'` → `'mirmaia-1'`
    - Updated closing path: `sham-coffee-1` → `mirmaia-1`

16. **`admin-workers.html`**
    - Changed `RESTAURANT_ID`: `'sham-coffee-1'` → `'mirmaia-1'`

17. **`admin-menu.html`**
    - Changed `RESTAURANT_ID`: `'sham-coffee-1'` → `'mirmaia-1'`

18. **`all-orders.html`**
    - Changed `RESTAURANT_ID`: `'sham-coffee-1'` → `'mirmaia-1'`

19. **`tables.html`**
    - Changed `RESTAURANT_ID`: `'sham-coffee-1'` → `'mirmaia-1'`

20. **`login-worker.html`**
    - Changed `RESTAURANT_ID`: `'sham-coffee-1'` → `'mirmaia-1'`

21. **`login-admin.html`**
    - Changed `restaurantId`: `'sham-coffee-1'` → `'mirmaia-1'`

22. **`inventory.html`**
    - Changed default fallback: `'sham-coffee-1'` → `'mirmaia-1'`

23. **`add-worker.html`**
    - Changed `RESTAURANT_ID`: `'sham-coffee-1'` → `'mirmaia-1'`

### JavaScript Files
24. **`js/cashier-offline.js`**
    - Changed default `restaurantId`: `'sham-coffee-1'` → `'mirmaia-1'` (4 occurrences)

25. **`js/init-sample-data.js`**
    - Changed `RESTAURANT_ID`: `'sham-coffee-1'` → `'mirmaia-1'`

26. **`init-database.js`**
    - Changed `RESTAURANT_ID`: `'sham-coffee-1'` → `'mirmaia-1'`

### Admin Next.js Files
27. **`admin-next/app/admin/staff-menu/page.tsx`**
    - Changed `restaurantId`: `'sham-coffee-1'` → `'mirmaia-1'`

### Firebase Project Config
28. **`.firebaserc`**
    - Changed default project: `"sham-coffee"` → `"mirmaia-33acc"`

---

## 🔑 Getting Firebase Credentials

**IMPORTANT**: You need to get the actual Firebase credentials for `mirmaia-33acc` project.

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/project/mirmaia-33acc/settings/general)
2. Click on **Project Settings** (gear icon)
3. Scroll to **Your apps** section
4. If no web app exists, click **Add app** → **Web** (</> icon)
5. Copy the following values:
   - `apiKey`
   - `authDomain` (should be `mirmaia-33acc.firebaseapp.com`)
   - `databaseURL` (should be `https://mirmaia-33acc-default-rtdb.firebaseio.com`)
   - `projectId` (should be `mirmaia-33acc`)
   - `storageBucket` (should be `mirmaia-33acc.firebasestorage.app`)
   - `messagingSenderId`
   - `appId`

### Update Files:
1. **`admin-next/.env.local`** - Add your actual credentials
2. **`admin-next/.env.production`** - Add your actual credentials (for production builds)
3. **HTML files** - Update the `apiKey`, `messagingSenderId`, and `appId` in:
   - `menu.html`
   - `menu-staff.html`
   - `reports.html`
   - `rooms.html`
   - `worker-app.html`

---

## 🚀 Deployment Commands

### Prerequisites:
```powershell
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Or use npx
npx firebase-tools --version
```

### Step 1: Login to Firebase
```powershell
cd c:\Users\HP\Desktop\mer\sham-coffee
npx firebase-tools login
```
This opens your browser for authentication.

### Step 2: Switch to Mirmaia Project
```powershell
npx firebase-tools use mirmaia-33acc
```

### Step 3: Update Environment Variables
**Before building**, update `admin-next/.env.local` with actual Firebase credentials from step above.

### Step 4: Build Next.js App
```powershell
cd admin-next
npm install
npm run build
cd ..
```

### Step 5: Deploy to Firebase Hosting
```powershell
npx firebase-tools deploy --only hosting
```

---

## ✅ Verification Steps

### 1. Check Hosting URL
- Visit: `https://mirmaia-33acc.web.app`
- Site should load without errors

### 2. Test Database Connection
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for Firebase connection messages
4. Should see: `🟢 متصل بـ Firebase` or similar success message

### 3. Create Test Order
1. Login to the app
2. Create a test order
3. Go to [Firebase Console - Realtime Database](https://console.firebase.google.com/project/mirmaia-33acc/database)
4. Navigate to: `restaurant-system/restaurants/mirmaia-1/orders`
5. **Verify**: The test order appears **ONLY** in `mirmaia-33acc` project
6. **Verify**: The order does **NOT** appear in the old `sham-coffee` project

### 4. Test Authentication
1. Create a test user
2. Check [Firebase Console - Authentication](https://console.firebase.google.com/project/mirmaia-33acc/authentication)
3. **Verify**: User appears **ONLY** in `mirmaia-33acc` project

### 5. Test Storage (if used)
1. Upload a file through the app
2. Check [Firebase Console - Storage](https://console.firebase.google.com/project/mirmaia-33acc/storage)
3. **Verify**: File appears **ONLY** in `mirmaia-33acc` project

---

## 🔒 Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **API Keys are safe** - Firebase API keys are safe to expose in client-side code
3. **Security Rules** - Make sure to set up proper Firebase Security Rules in the new project
4. **Environment Variables** - For production, use Firebase Hosting environment variables or build-time env vars

---

## 📝 Important Notes

- **Old Project Unchanged**: No changes were made to the `sham-coffee` Firebase project
- **Complete Isolation**: Mirmaia is now 100% independent
- **Restaurant ID**: Changed from `sham-coffee-1` to `mirmaia-1` throughout
- **All References Updated**: All hardcoded references to `sham-coffee` have been updated to `mirmaia-33acc` or `mirmaia-1`

---

## 🐛 Troubleshooting

### Issue: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Update the `apiKey` in your `.env.local` file and HTML files with the actual value from Firebase Console.

### Issue: "Permission denied" errors
**Solution**: Set up Firebase Security Rules in the new project. Copy rules from old project if needed, but update `restaurantId` references.

### Issue: Build fails
**Solution**: Make sure all environment variables in `.env.local` are filled with actual values (not placeholders).

### Issue: Database connection fails
**Solution**: 
1. Verify Realtime Database is enabled in `mirmaia-33acc` project
2. Check database URL matches: `https://mirmaia-33acc-default-rtdb.firebaseio.com`
3. Verify database location matches the URL format

---

## 📞 Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Check browser console for JavaScript errors
3. Verify all environment variables are set correctly
4. Ensure Firebase project `mirmaia-33acc` has all required services enabled:
   - Realtime Database
   - Authentication
   - Storage (if used)
   - Hosting

---

**Last Updated**: 2026-01-23
**Project**: Mirmaia (mirmaia-33acc)
**Status**: ✅ Ready for deployment (after adding Firebase credentials)
