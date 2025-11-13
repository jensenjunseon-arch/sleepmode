# 🔒 Sleep Mode Alarm App

A web-based alarm app that **freezes your phone** until the alarm goes off. Perfect for preventing late-night phone use and ensuring you wake up on time!

## Features

- 🔒 **Sleep Mode Only** - All alarms automatically lock your phone
- ⏰ **Set Multiple Alarms** - Create as many sleep alarms as you need
- 🏷️ **Custom Labels** - Add labels to your alarms (e.g., "Wake up", "Morning")
- 🔔 **Audio Notifications** - Alarms play a beeping sound when triggered
- 🧮 **Math Challenge Required** - Must solve a math problem to dismiss the alarm
- 📱 **Browser Notifications** - Get desktop notifications when alarms go off
- ✅ **Toggle On/Off** - Enable or disable alarms without deleting them
- 🗑️ **Delete Alarms** - Remove alarms you no longer need
- 💾 **Persistent Storage** - Your alarms are saved in browser localStorage
- 📱 **Responsive Design** - Works on desktop and mobile devices

## How to Use

1. **Open the App**
   - Simply open `index.html` in your web browser
   - No installation or build process required!

2. **Set a Sleep Alarm**
   - Select a wake up time using the time picker
   - Optionally add a label (e.g., "Morning Wake Up")
   - Click "Set Sleep Alarm" or press Enter
   - **Your phone will be locked immediately!**

3. **Sleep Lock (Key Feature!)**
   - When you set an alarm, your phone is **locked/frozen** immediately
   - A dark overlay covers the screen showing a countdown to the alarm
   - You cannot interact with the app or use your phone until the alarm goes off
   - Perfect for preventing late-night phone use before sleep!
   - The lock persists even if you refresh the page

4. **Manage Alarms**
   - **Toggle**: Click the "ON/OFF" button to enable or disable an alarm
   - **Delete**: Click the "Delete" button to remove an alarm permanently
   - All alarms are sleep mode alarms (marked with 🔒)

5. **When Alarm Goes Off**
   - The sleep lock is automatically removed
   - A modal will appear with the alarm message
   - An audio beep will play repeatedly
   - **You must solve a math problem to dismiss the alarm**
   - A browser notification will appear (if permissions are granted)
   - Enter the correct answer and click "Dismiss" to stop the alarm

## Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript to be enabled
- For best experience, allow browser notifications when prompted

## Technical Details

- **Pure HTML/CSS/JavaScript** - No frameworks or dependencies
- **LocalStorage** - Alarms are saved in your browser's local storage
- **Web Audio API** - Used for alarm sounds
- **Notifications API** - For desktop notifications

## Customization

Feel free to customize the app by modifying:
- `styles.css` - Change colors, fonts, and layout
- `script.js` - Modify alarm behavior, sounds, or add new features
- `index.html` - Adjust the structure or add new elements

Enjoy your alarm clock! 🎉

