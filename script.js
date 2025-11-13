// Alarm App JavaScript

class AlarmApp {
    constructor() {
        this.alarms = this.loadAlarms();
        this.currentAlarmSound = null;
        this.sleepLockActive = this.loadSleepLockState();
        this.currentChallenge = null;
        this.currentAphorism = null;
        this.currentAlarmAphorism = null;
        this.currentTriggeringAlarm = null;
        this.snoozeDuration = 5; // minutes
        this.userPersonalityType = this.loadPersonalityType();
        this.bigFiveScores = this.loadBigFiveScores();
        this.developerKeySequence = [];
        this.deactivationCount = this.loadDeactivationCount();
        this.snoozeCount = this.loadSnoozeCount();
        this.totalAlarmsSet = this.loadTotalAlarmsSet();
        this.alarmsCompleted = this.loadAlarmsCompleted();
        
        // Personality-based aphorisms mapped to Big Five traits
        this.aphorismsByType = {
            'extraversion': [
                "You miss 100% of the shots you don't take.",
                "The way to get started is to quit talking and begin doing.",
                "Success is the sum of small efforts repeated day in and day out.",
                "Don't watch the clock; do what it does. Keep going.",
                "The best time to plant a tree was 20 years ago. The second best time is now.",
                "Great things never come from comfort zones."
            ],
            'conscientiousness': [
                "Success is the sum of small efforts repeated day in and day out.",
                "The only way to do great work is to love what you do.",
                "Don't watch the clock; do what it does. Keep going.",
                "The way to get started is to quit talking and begin doing.",
                "Early to bed and early to rise makes a man healthy, wealthy, and wise.",
                "The best time to plant a tree was 20 years ago. The second best time is now."
            ],
            'agreeableness': [
                "The journey of a thousand miles begins with a single step.",
                "In the middle of difficulty lies opportunity.",
                "It is during our darkest moments that we must focus to see the light.",
                "Life is what happens to you while you're busy making other plans.",
                "The two most important days in your life are the day you are born and the day you find out why.",
                "The only person you are destined to become is the person you decide to be."
            ],
            'neuroticism': [
                "It is during our darkest moments that we must focus to see the light.",
                "In the middle of difficulty lies opportunity.",
                "The journey of a thousand miles begins with a single step.",
                "Believe you can and you're halfway there.",
                "The only person you are destined to become is the person you decide to be.",
                "Life is what happens to you while you're busy making other plans."
            ],
            'openness': [
                "The future belongs to those who believe in the beauty of their dreams.",
                "Go confidently in the direction of your dreams. Live the life you have imagined.",
                "Believe you can and you're halfway there.",
                "The only impossible journey is the one you never begin.",
                "Your limitation—it's only your imagination.",
                "Innovation distinguishes between a leader and a follower.",
                "Great things never come from comfort zones."
            ]
        };
        
        this.init();
    }

    init() {
        // Always set up event listeners
        this.setupEventListeners();

        // Check if test is completed
        if (!this.userPersonalityType) {
            this.showTest();
            return;
        }

        // Initialize app functionality
        this.initializeApp();
    }

    setupEventListeners() {
        // Test form listener
        const quizForm = document.getElementById('quizForm');
        if (quizForm) {
            quizForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitBigFiveTest();
            });
        }

        // Alarm form listeners
        const setAlarmBtn = document.getElementById('setAlarmBtn');
        if (setAlarmBtn) {
            setAlarmBtn.addEventListener('click', () => this.setAlarm());
        }

        const dismissAlarmBtn = document.getElementById('dismissAlarmBtn');
        if (dismissAlarmBtn) {
            dismissAlarmBtn.addEventListener('click', () => this.dismissAlarm());
        }

        // Snooze button
        const snoozeBtn = document.getElementById('snoozeBtn');
        if (snoozeBtn) {
            snoozeBtn.addEventListener('click', () => this.snoozeAlarm());
        }

        // Deactivation button
        const deactivationBtn = document.getElementById('deactivationBtn');
        if (deactivationBtn) {
            deactivationBtn.addEventListener('click', () => this.handleDeactivation());
        }

        // Analytics button
        const analyticsBtn = document.getElementById('analyticsBtn');
        if (analyticsBtn) {
            analyticsBtn.addEventListener('click', () => this.showAnalytics());
        }

        // Close analytics button
        const closeAnalyticsBtn = document.getElementById('closeAnalyticsBtn');
        if (closeAnalyticsBtn) {
            closeAnalyticsBtn.addEventListener('click', () => this.closeAnalytics());
        }

        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBackToTest());
        }

        // Keyboard shortcuts
        const alarmTime = document.getElementById('alarmTime');
        if (alarmTime) {
            alarmTime.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.setAlarm();
            });
        }

        const aphorismInput = document.getElementById('aphorismInput');
        if (aphorismInput) {
            aphorismInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.setAlarm();
            });
        }

        // Challenge answer input (for alarm dismissal)
        const challengeAnswer = document.getElementById('challengeAnswer');
        if (challengeAnswer) {
            challengeAnswer.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAlarmAphorism();
                }
            });
        }

        // Developer/Admin override: Press Command+Shift+D three times to unlock
        // Use capture phase to catch before preventInteraction
        document.addEventListener('keydown', (e) => {
            if (e.metaKey && e.shiftKey && e.key === 'D') {
                e.stopPropagation(); // Prevent other handlers from interfering
                this.developerKeySequence.push(Date.now());
                // Keep only last 3 presses within 2 seconds
                this.developerKeySequence = this.developerKeySequence.filter(
                    time => Date.now() - time < 2000
                );
                
                if (this.developerKeySequence.length >= 3) {
                    this.developerUnlock();
                    this.developerKeySequence = [];
                }
            }
        }, true); // Use capture phase
    }

    handleDeactivation() {
        if (this.sleepLockActive) {
            // Increment deactivation count
            this.deactivationCount++;
            this.saveDeactivationCount();
            
            // Deactivate sleep lock
            this.deactivateSleepLock();
            
            // Clear all alarms to fully unlock
            this.alarms = [];
            this.saveAlarms();
            this.renderAlarms();
            
            alert(`Sleep mode deactivated. (Deactivation count: ${this.deactivationCount})`);
        }
    }

    updateDeactivationCountDisplay() {
        const countDisplay = document.getElementById('deactivationCount');
        if (countDisplay) {
            if (this.deactivationCount > 0) {
                countDisplay.textContent = `Deactivation used: ${this.deactivationCount} time${this.deactivationCount !== 1 ? 's' : ''}`;
            } else {
                countDisplay.textContent = '';
            }
        }
    }

    developerUnlock() {
        if (this.sleepLockActive) {
            this.deactivateSleepLock();
            // Clear all alarms to fully unlock
            this.alarms = [];
            this.saveAlarms();
            this.renderAlarms();
            alert('Developer mode: Sleep lock deactivated. All alarms cleared.');
        } else {
            alert('Developer mode: Sleep lock is not active.');
        }
    }

    initializeApp() {
        // Update current time every second
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);

        // Check alarms every second
        setInterval(() => this.checkAlarms(), 1000);

        // Generate and display initial aphorism
        this.generateAphorism();

        // Show alarm form
        document.getElementById('alarmForm').style.display = 'block';

        // Render existing alarms
        this.renderAlarms();

        // Check and activate sleep lock if needed
        if (this.sleepLockActive) {
            this.activateSleepLock();
        }

        // Update sleep countdown
        setInterval(() => this.updateSleepCountdown(), 1000);
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('currentTime').textContent = timeString;
    }

    showTest() {
        const testModal = document.getElementById('testModal');
        testModal.classList.add('show');
    }

    submitBigFiveTest() {
        const form = document.getElementById('quizForm');
        const selectedPersonality = form['personality'].value;

        if (!selectedPersonality) {
            alert('Please select a statement that best describes you.');
            return;
        }

        // Save personality type
        this.userPersonalityType = selectedPersonality;
        this.savePersonalityType();

        // Save Big Five scores (simplified - just mark selected trait as high)
        this.bigFiveScores = {
            extraversion: selectedPersonality === 'extraversion' ? 5 : 3,
            conscientiousness: selectedPersonality === 'conscientiousness' ? 5 : 3,
            agreeableness: selectedPersonality === 'agreeableness' ? 5 : 3,
            neuroticism: selectedPersonality === 'neuroticism' ? 5 : 3,
            openness: selectedPersonality === 'openness' ? 5 : 3
        };
        this.saveBigFiveScores();

        // Close test modal and show alarm form
        const testModal = document.getElementById('testModal');
        testModal.classList.remove('show');
        
        // Initialize app functionality now that test is complete
        this.initializeApp();
    }

    generateAphorism() {
        if (!this.userPersonalityType) return;
        
        // Get aphorisms for user's personality type
        const aphorisms = this.aphorismsByType[this.userPersonalityType] || this.aphorismsByType['balanced'];
        
        // Get random aphorism
        const randomIndex = Math.floor(Math.random() * aphorisms.length);
        this.currentAphorism = aphorisms[randomIndex];
        
        // Display it
        document.getElementById('aphorismDisplay').textContent = this.currentAphorism;
        
        // Clear input and error
        document.getElementById('aphorismInput').value = '';
        document.getElementById('aphorismError').textContent = '';
    }

    setAlarm() {
        const timeInput = document.getElementById('alarmTime');
        const aphorismInput = document.getElementById('aphorismInput');
        const aphorismError = document.getElementById('aphorismError');
        
        if (!timeInput.value) {
            alert('Please select a wake up time');
            return;
        }

        // Validate aphorism
        const userInput = aphorismInput.value.trim();
        if (!this.currentAphorism) {
            this.generateAphorism();
        }

        if (userInput !== this.currentAphorism) {
            aphorismError.textContent = 'The aphorism does not match. Please type it exactly as shown.';
            aphorismInput.focus();
            return;
        }

        // Clear error
        aphorismError.textContent = '';

        const alarm = {
            id: Date.now(),
            time: timeInput.value,
            label: 'Sleep Alarm',
            enabled: true,
            triggered: false,
            sleepMode: true  // Always sleep mode
        };

        this.alarms.push(alarm);
        this.totalAlarmsSet++;
        this.saveTotalAlarmsSet();
        this.saveAlarms();
        this.renderAlarms();

        // Always activate sleep lock
        this.activateSleepLock();
        this.showNotification('Sleep mode activated! Your phone is now locked.');

        // Clear inputs and generate new aphorism
        timeInput.value = '';
        aphorismInput.value = '';
        this.generateAphorism();
    }

    deleteAlarm(id) {
        const alarm = this.alarms.find(a => a.id === id);
        this.alarms = this.alarms.filter(alarm => alarm.id !== id);
        this.saveAlarms();
        this.renderAlarms();
        
        // Check if we should deactivate sleep lock
        const hasActiveSleepAlarm = this.alarms.some(a => a.enabled && !a.triggered);
        if (!hasActiveSleepAlarm && this.sleepLockActive) {
            this.deactivateSleepLock();
        }
    }

    toggleAlarm(id) {
        const alarm = this.alarms.find(a => a.id === id);
        if (alarm) {
            alarm.enabled = !alarm.enabled;
            alarm.triggered = false; // Reset triggered state when toggling
            this.saveAlarms();
            this.renderAlarms();
            
            // Update sleep lock state
            const hasActiveSleepAlarm = this.alarms.some(a => a.enabled && !a.triggered);
            if (!hasActiveSleepAlarm && this.sleepLockActive) {
                this.deactivateSleepLock();
            } else if (hasActiveSleepAlarm && !this.sleepLockActive) {
                this.activateSleepLock();
            }
        }
    }

    checkAlarms() {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        this.alarms.forEach(alarm => {
            if (alarm.enabled && !alarm.triggered && alarm.time === currentTime) {
                this.triggerAlarm(alarm);
            }
        });
    }

    triggerAlarm(alarm) {
        // Store the current triggering alarm for snooze functionality
        this.currentTriggeringAlarm = alarm;
        
        alarm.triggered = true;
        this.saveAlarms();

        // Deactivate sleep lock
        if (this.sleepLockActive) {
            this.deactivateSleepLock();
        }

        // Always generate aphorism challenge (all alarms are sleep mode)
        this.generateAlarmAphorism();

        // Show modal
        const modal = document.getElementById('alarmModal');
        const message = document.getElementById('alarmMessage');
        message.textContent = `Wake up! - ${this.formatTime(alarm.time)}`;
        
        // Always show challenge section
        const challengeSection = document.getElementById('challengeSection');
        challengeSection.style.display = 'block';
        
        // Ensure modal is clickable
        modal.style.pointerEvents = 'auto';
        modal.querySelector('.modal-content').style.pointerEvents = 'auto';
        
        document.getElementById('challengeAnswer').focus();
        
        modal.classList.add('show');

        // Play alarm sound (using Web Audio API)
        this.playAlarmSound();

        // Request notification permission and show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Alarm!', {
                body: `${alarm.label} - ${this.formatTime(alarm.time)}`,
                icon: '🔔'
            });
        }
    }

    playAlarmSound() {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);

        // Repeat the sound
        this.currentAlarmSound = setInterval(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            osc.start();
            osc.stop(audioContext.currentTime + 0.5);
        }, 500);
    }

    stopAlarmSound() {
        if (this.currentAlarmSound) {
            clearInterval(this.currentAlarmSound);
            this.currentAlarmSound = null;
        }
    }

    dismissAlarm() {
        // This is called by the button click - check if aphorism is correct
        this.checkAlarmAphorism();
    }

    snoozeAlarm() {
        if (!this.currentTriggeringAlarm) return;

        // Increment snooze count
        this.snoozeCount++;
        this.saveSnoozeCount();

        // Stop alarm sound
        this.stopAlarmSound();

        // Close modal
        const modal = document.getElementById('alarmModal');
        modal.classList.remove('show');

        // Clear challenge input
        document.getElementById('challengeAnswer').value = '';
        document.getElementById('challengeError').textContent = '';
        this.currentAlarmAphorism = null;

        // Calculate new alarm time (current time + snooze duration)
        const now = new Date();
        const snoozeTime = new Date(now.getTime() + this.snoozeDuration * 60 * 1000);
        const hours = String(snoozeTime.getHours()).padStart(2, '0');
        const minutes = String(snoozeTime.getMinutes()).padStart(2, '0');
        const newTime = `${hours}:${minutes}`;

        // Update the alarm time
        const alarm = this.alarms.find(a => a.id === this.currentTriggeringAlarm.id);
        if (alarm) {
            alarm.time = newTime;
            alarm.triggered = false; // Reset so it can trigger again
            alarm.enabled = true;
            this.saveAlarms();
            this.renderAlarms();

            // Reactivate sleep lock for snoozed alarm
            this.activateSleepLock();

            // Show notification
            this.showNotification(`Alarm snoozed for ${this.snoozeDuration} minutes. New alarm time: ${this.formatTime(newTime)}`);
        }

        // Clear current triggering alarm
        this.currentTriggeringAlarm = null;
    }

    generateAlarmAphorism() {
        if (!this.userPersonalityType) return;
        
        // Get aphorisms for user's personality type
        const aphorisms = this.aphorismsByType[this.userPersonalityType] || this.aphorismsByType['balanced'];
        
        // Get random aphorism
        const randomIndex = Math.floor(Math.random() * aphorisms.length);
        this.currentAlarmAphorism = aphorisms[randomIndex];
        
        // Display it in the alarm modal
        document.getElementById('alarmAphorismDisplay').textContent = this.currentAlarmAphorism;
    }

    checkAlarmAphorism() {
        const userInput = document.getElementById('challengeAnswer').value.trim();
        const errorMsg = document.getElementById('challengeError');
        
        if (!this.currentAlarmAphorism) {
            errorMsg.textContent = 'Error: No aphorism loaded. Please refresh the page.';
            return false;
        }
        
        if (userInput === '') {
            errorMsg.textContent = 'Please type the aphorism to dismiss';
            return false;
        }
        
        // Normalize both strings for comparison (trim and compare)
        const normalizedInput = userInput.trim();
        const normalizedAphorism = this.currentAlarmAphorism.trim();
        
        if (normalizedInput === normalizedAphorism) {
            errorMsg.textContent = '';
            // Dismiss the alarm
            const modal = document.getElementById('alarmModal');
            modal.classList.remove('show');
            this.stopAlarmSound();
            
            // Clear challenge
            document.getElementById('challengeAnswer').value = '';
            this.currentAlarmAphorism = null;
            this.currentTriggeringAlarm = null;

            // Increment completed alarms count
            this.alarmsCompleted++;
            this.saveAlarmsCompleted();

            // Reset triggered state for all alarms that were triggered
            this.alarms.forEach(alarm => {
                if (alarm.triggered) {
                    alarm.triggered = false;
                }
            });
            this.saveAlarms();
            return true;
        } else {
            errorMsg.textContent = 'The aphorism does not match. Please type it exactly as shown.';
            document.getElementById('challengeAnswer').value = '';
            document.getElementById('challengeAnswer').focus();
            // Generate new aphorism
            this.generateAlarmAphorism();
            return false;
        }
    }

    activateSleepLock() {
        this.sleepLockActive = true;
        this.saveSleepLockState();
        const sleepLock = document.getElementById('sleepLock');
        sleepLock.classList.add('active');
        
        // Prevent interaction with the app
        document.body.style.pointerEvents = 'none';
        sleepLock.style.pointerEvents = 'auto';
        
        // Update deactivation count display
        this.updateDeactivationCountDisplay();
        
        // Enter fullscreen mode to lock the screen
        this.enterFullscreen();
        
        // Prevent context menu and other interactions
        this.preventInteractionBound = this.preventInteraction.bind(this);
        this.preventMouseBound = this.preventMouseInteraction.bind(this);
        this.handleVisibilityChangeBound = this.handleVisibilityChange.bind(this);
        this.handleBlurBound = this.handleBlur.bind(this);
        
        // Block all keyboard shortcuts and interactions
        document.addEventListener('contextmenu', this.preventInteractionBound, true);
        document.addEventListener('keydown', this.preventInteractionBound, true);
        document.addEventListener('keyup', this.preventInteractionBound, true);
        document.addEventListener('mousedown', this.preventMouseBound, true);
        document.addEventListener('mouseup', this.preventMouseBound, true);
        document.addEventListener('click', this.preventMouseBound, true);
        
        // Monitor tab/window switching
        document.addEventListener('visibilitychange', this.handleVisibilityChangeBound);
        window.addEventListener('blur', this.handleBlurBound);
        
        // Prevent tab/window switching shortcuts
        this.blockBrowserShortcuts();
        
        // Keep focus on the page
        window.focus();
    }

    deactivateSleepLock() {
        this.sleepLockActive = false;
        this.saveSleepLockState();
        const sleepLock = document.getElementById('sleepLock');
        sleepLock.classList.remove('active');
        
        // Exit fullscreen mode
        this.exitFullscreen();
        
        // Re-enable interaction
        document.body.style.pointerEvents = 'auto';
        
        // Remove event listeners
        if (this.preventInteractionBound) {
            document.removeEventListener('contextmenu', this.preventInteractionBound, true);
            document.removeEventListener('keydown', this.preventInteractionBound, true);
            document.removeEventListener('keyup', this.preventInteractionBound, true);
        }
        if (this.preventMouseBound) {
            document.removeEventListener('mousedown', this.preventMouseBound, true);
            document.removeEventListener('mouseup', this.preventMouseBound, true);
            document.removeEventListener('click', this.preventMouseBound, true);
        }
        if (this.handleVisibilityChangeBound) {
            document.removeEventListener('visibilitychange', this.handleVisibilityChangeBound);
        }
        if (this.handleBlurBound) {
            window.removeEventListener('blur', this.handleBlurBound);
        }
        
        // Restore browser shortcuts
        this.restoreBrowserShortcuts();
    }

    enterFullscreen() {
        const element = document.documentElement;
        // Try different fullscreen methods for cross-browser support
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                console.log('Fullscreen request failed:', err);
            });
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.webkitEnterFullscreen) {
            element.webkitEnterFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
        
        // For mobile, also try to lock screen orientation
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('portrait').catch(err => {
                console.log('Orientation lock failed:', err);
            });
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    preventInteraction(e) {
        // Allow developer unlock keys (Command+Shift+D)
        if (e.metaKey && e.shiftKey && e.key === 'D') {
            return true; // Don't block developer unlock
        }
        
        const target = e.target;
        
        // Allow deactivation button clicks
        if (target.id === 'deactivationBtn' || target.closest('#deactivationBtn')) {
            return true;
        }
        
        // Allow all interactions when alarm modal is shown
        const modal = document.getElementById('alarmModal');
        if (modal && modal.classList.contains('show')) {
            // Allow all interactions with the alarm modal (input, buttons, etc.)
            if (modal.contains(target) || target.closest('#alarmModal')) {
                return true;
            }
        }
        
        // Block all keyboard shortcuts that could switch tabs/windows
        const blockedShortcuts = [
            'Tab', 'Meta', 'Alt', 'Control', 'Shift',
            'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
        ];
        
        // Block Cmd/Ctrl combinations
        if (e.metaKey || e.ctrlKey) {
            // Allow only specific combinations
            if (!(e.metaKey && e.shiftKey && e.key === 'D')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
        
        // Block Alt combinations (Alt+Tab, etc.)
        if (e.altKey) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Block function keys
        if (blockedShortcuts.includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Allow interaction with challenge input when alarm modal is shown
        if (modal && modal.classList.contains('show') && target.id === 'challengeAnswer') {
            return true; // Allow all text input for aphorism typing
        }
        
        // Block all other keys during sleep lock
        if (this.sleepLockActive) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Allow only specific keys for other inputs when not in sleep lock
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
        const isNumber = /^[0-9]$/.test(e.key);
        
        if (!isNumber && !allowedKeys.includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    preventMouseInteraction(e) {
        const target = e.target;
        
        // Allow deactivation button clicks
        if (target.id === 'deactivationBtn' || target.closest('#deactivationBtn')) {
            return true;
        }
        
        // Allow all interactions when alarm modal is shown
        const modal = document.getElementById('alarmModal');
        if (modal && modal.classList.contains('show')) {
            if (modal.contains(target) || target.closest('#alarmModal')) {
                return true;
            }
        }
        
        // Block all other mouse interactions during sleep lock
        if (this.sleepLockActive) {
            const sleepLock = document.getElementById('sleepLock');
            if (!sleepLock.contains(target) && !target.closest('#sleepLock')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    }

    handleVisibilityChange() {
        if (this.sleepLockActive) {
            // If user switched tabs, bring focus back
            if (document.hidden) {
                // Try to bring focus back
                setTimeout(() => {
                    window.focus();
                    this.enterFullscreen();
                }, 100);
            }
        }
    }

    handleBlur() {
        if (this.sleepLockActive) {
            // Bring focus back to the window
            setTimeout(() => {
                window.focus();
            }, 100);
        }
    }

    blockBrowserShortcuts() {
        // Additional blocking for common browser shortcuts
        this.blockBrowserShortcutsBound = (e) => {
            if (!this.sleepLockActive) return;
            
            // Block Cmd/Ctrl + W (close tab)
            if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            // Block Cmd/Ctrl + T (new tab)
            if ((e.metaKey || e.ctrlKey) && e.key === 't') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            // Block Cmd/Ctrl + N (new window)
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            // Block Cmd/Ctrl + Tab (switch tabs)
            if ((e.metaKey || e.ctrlKey) && e.key === 'Tab') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        
        document.addEventListener('keydown', this.blockBrowserShortcutsBound, true);
    }

    restoreBrowserShortcuts() {
        if (this.blockBrowserShortcutsBound) {
            document.removeEventListener('keydown', this.blockBrowserShortcutsBound, true);
            this.blockBrowserShortcutsBound = null;
        }
    }

    updateSleepCountdown() {
        if (!this.sleepLockActive) return;
        
        // Find the next enabled alarm (all are sleep mode)
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const activeAlarms = this.alarms.filter(a => a.enabled && !a.triggered);
        
        if (activeAlarms.length === 0) {
            this.deactivateSleepLock();
            return;
        }
        
        // Find the next alarm time
        let nextAlarm = null;
        let minDiff = Infinity;
        
        activeAlarms.forEach(alarm => {
            const [alarmHours, alarmMinutes] = alarm.time.split(':').map(Number);
            const alarmTime = new Date();
            alarmTime.setHours(alarmHours, alarmMinutes, 0, 0);
            
            // If alarm time has passed today, set it for tomorrow
            if (alarmTime < now) {
                alarmTime.setDate(alarmTime.getDate() + 1);
            }
            
            const diff = alarmTime - now;
            if (diff < minDiff) {
                minDiff = diff;
                nextAlarm = alarmTime;
            }
        });
        
        if (nextAlarm) {
            const hours = Math.floor(minDiff / (1000 * 60 * 60));
            const minutes = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((minDiff % (1000 * 60)) / 1000);
            
            document.getElementById('sleepCountdown').textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    renderAlarms() {
        const alarmsList = document.getElementById('alarmsList');
        
        if (this.alarms.length === 0) {
            alarmsList.innerHTML = '<p class="no-alarms">No alarms set. Add one above!</p>';
            return;
        }

        alarmsList.innerHTML = this.alarms.map(alarm => `
            <div class="alarm-item ${alarm.enabled ? '' : 'disabled'}">
                <div class="alarm-info">
                    <div class="alarm-time">${this.formatTime(alarm.time)} 🔒</div>
                </div>
                <div class="alarm-actions">
                    <button class="btn btn-toggle ${alarm.enabled ? '' : 'off'}" 
                            onclick="alarmApp.toggleAlarm(${alarm.id})">
                        ${alarm.enabled ? 'ON' : 'OFF'}
                    </button>
                    <button class="btn btn-danger" 
                            onclick="alarmApp.deleteAlarm(${alarm.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    showNotification(message) {
        // Simple notification (could be enhanced with a toast library)
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    saveAlarms() {
        localStorage.setItem('alarms', JSON.stringify(this.alarms));
    }

    loadAlarms() {
        const saved = localStorage.getItem('alarms');
        return saved ? JSON.parse(saved) : [];
    }

    saveSleepLockState() {
        localStorage.setItem('sleepLockActive', JSON.stringify(this.sleepLockActive));
    }

    loadSleepLockState() {
        const saved = localStorage.getItem('sleepLockActive');
        return saved ? JSON.parse(saved) : false;
    }

    savePersonalityType() {
        localStorage.setItem('personalityType', this.userPersonalityType);
    }

    loadPersonalityType() {
        return localStorage.getItem('personalityType') || null;
    }

    saveBigFiveScores() {
        localStorage.setItem('bigFiveScores', JSON.stringify(this.bigFiveScores));
    }

    loadBigFiveScores() {
        const saved = localStorage.getItem('bigFiveScores');
        return saved ? JSON.parse(saved) : null;
    }

    saveDeactivationCount() {
        localStorage.setItem('deactivationCount', this.deactivationCount.toString());
    }

    loadDeactivationCount() {
        const saved = localStorage.getItem('deactivationCount');
        return saved ? parseInt(saved) : 0;
    }

    saveSnoozeCount() {
        localStorage.setItem('snoozeCount', this.snoozeCount.toString());
    }

    loadSnoozeCount() {
        const saved = localStorage.getItem('snoozeCount');
        return saved ? parseInt(saved) : 0;
    }

    saveTotalAlarmsSet() {
        localStorage.setItem('totalAlarmsSet', this.totalAlarmsSet.toString());
    }

    loadTotalAlarmsSet() {
        const saved = localStorage.getItem('totalAlarmsSet');
        return saved ? parseInt(saved) : 0;
    }

    saveAlarmsCompleted() {
        localStorage.setItem('alarmsCompleted', this.alarmsCompleted.toString());
    }

    loadAlarmsCompleted() {
        const saved = localStorage.getItem('alarmsCompleted');
        return saved ? parseInt(saved) : 0;
    }

    showAnalytics() {
        const modal = document.getElementById('analyticsModal');
        modal.classList.add('show');
        this.updateAnalytics();
    }

    closeAnalytics() {
        const modal = document.getElementById('analyticsModal');
        modal.classList.remove('show');
    }

    goBackToTest() {
        // Clear personality type to force test to show again
        this.userPersonalityType = null;
        localStorage.removeItem('personalityType');
        
        // Hide alarm form
        document.getElementById('alarmForm').style.display = 'none';
        
        // Clear alarms list
        document.getElementById('alarmsList').innerHTML = '<p class="no-alarms">No alarms set. Add one above!</p>';
        
        // Show test modal
        this.showTest();
    }

    updateAnalytics() {
        // Update statistics
        document.getElementById('totalAlarmsSet').textContent = this.totalAlarmsSet;
        document.getElementById('alarmsCompleted').textContent = this.alarmsCompleted;
        document.getElementById('deactivationCountStat').textContent = `${this.deactivationCount} time${this.deactivationCount !== 1 ? 's' : ''}`;
        document.getElementById('snoozeCountStat').textContent = `${this.snoozeCount} time${this.snoozeCount !== 1 ? 's' : ''}`;

        // Calculate success rate
        let successRate = 0;
        if (this.totalAlarmsSet > 0) {
            successRate = Math.round((this.alarmsCompleted / this.totalAlarmsSet) * 100);
        }
        document.getElementById('successRate').textContent = `${successRate}%`;

        // Generate insights
        this.generateInsights(successRate);
    }

    generateInsights(successRate) {
        const insightsDiv = document.getElementById('analyticsInsights');
        let insights = [];

        // Success rate insights
        if (successRate >= 80) {
            insights.push('Excellent! You have great discipline in following through with your alarms.');
        } else if (successRate >= 60) {
            insights.push('Good job! You\'re doing well, but there\'s room for improvement.');
        } else if (successRate >= 40) {
            insights.push('Keep trying! Building good habits takes time and consistency.');
        } else {
            insights.push('Every journey begins with a single step. Keep setting alarms and working towards your goals.');
        }

        // Deactivation insights
        if (this.deactivationCount === 0) {
            insights.push('You\'ve never used deactivation - great self-control!');
        } else if (this.deactivationCount <= 3) {
            insights.push(`You've used deactivation ${this.deactivationCount} time${this.deactivationCount !== 1 ? 's' : ''}. Consider setting alarms you're more committed to.`);
        } else {
            insights.push(`You've used deactivation ${this.deactivationCount} times. Try setting alarms at times you're more likely to follow through.`);
        }

        // Snooze insights
        if (this.snoozeCount === 0) {
            insights.push('No snoozes used - you wake up on time!');
        } else if (this.snoozeCount <= 5) {
            insights.push(`You've snoozed ${this.snoozeCount} time${this.snoozeCount !== 1 ? 's' : ''}. A few extra minutes of sleep is okay sometimes.`);
        } else {
            insights.push(`You've snoozed ${this.snoozeCount} times. Consider going to bed earlier or setting alarms you're more ready to wake up for.`);
        }

        // Overall assessment
        const totalInterruptions = this.deactivationCount + this.snoozeCount;
        if (totalInterruptions === 0 && successRate >= 80) {
            insights.push('Outstanding! You\'re a model user of the sleep alarm system.');
        }

        insightsDiv.innerHTML = insights.map(insight => `<p>${insight}</p>`).join('');
    }
}

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful:', registration.scope);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Prevent zoom on double tap (mobile)
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Initialize the app
const alarmApp = new AlarmApp();

