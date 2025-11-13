# Mobile Setup Instructions

## How to Use This App on Your Phone

### Option 1: Install as PWA (Progressive Web App) - Recommended

#### For Android:
1. Open Chrome browser on your Android phone
2. Navigate to the app URL (wherever you're hosting it)
3. Tap the menu (three dots) in the top right
4. Select "Add to Home screen" or "Install app"
5. The app will be installed and appear like a native app

#### For iPhone/iPad:
1. Open Safari browser on your iPhone/iPad
2. Navigate to the app URL
3. Tap the Share button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. The app will be installed and appear like a native app

### Option 2: Access via Browser
Simply open the app URL in your mobile browser. The app is optimized for mobile use.

## Creating App Icons

The app needs icon files (`icon-192.png` and `icon-512.png`) for PWA installation.

### Quick Method:
1. Open `create-icons.html` in a browser
2. Click the buttons to generate and download the icons
3. Place the downloaded files in the same directory as `index.html`

### Manual Method:
Create two PNG images:
- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

Use any image editor to create icons with the app's purple gradient theme (#667eea to #764ba2).

## Features for Mobile:
- ✅ Touch-optimized buttons (44px minimum)
- ✅ Prevents accidental zoom on input focus
- ✅ Fullscreen support for sleep mode
- ✅ Works offline (after first load)
- ✅ Native app-like experience when installed
- ✅ Safe area support for notched devices

## Notes:
- The app works best when installed as a PWA
- Make sure to allow notifications for alarm functionality
- Sleep mode will lock the screen and prevent other app usage
- The deactivation button remains accessible during sleep mode

