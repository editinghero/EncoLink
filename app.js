// SecureLinkApp - Complete Application
class SecureLinkApp {
    constructor() {
        this.currentMode = 'single';
        this.currentTimelockType = 'datetime';
        this.settings = {
            autoRedirect: true,
            redirectDelay: 3,
            showPasswordStrength: true
        };
        this.theme = 'dark';
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadTheme();
        this.setupEventListeners();
        this.checkForEncryptedData();
    }

    loadSettings() {
        const saved = localStorage.getItem('secureLinkSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applySettingsToUI();
    }

    applySettingsToUI() {
        const autoRedirect = document.getElementById('autoRedirect');
        const redirectDelay = document.getElementById('redirectDelay');
        const showPasswordStrength = document.getElementById('showPasswordStrength');
        
        if (autoRedirect) autoRedirect.checked = this.settings.autoRedirect;
        if (redirectDelay) redirectDelay.value = this.settings.redirectDelay;
        if (showPasswordStrength) showPasswordStrength.checked = this.settings.showPasswordStrength;
    }

    setupSettingsListeners() {
        const autoRedirect = document.getElementById('autoRedirect');
        const redirectDelay = document.getElementById('redirectDelay');
        const showPasswordStrength = document.getElementById('showPasswordStrength');
        
        if (autoRedirect) {
            autoRedirect.addEventListener('change', (e) => {
                this.settings.autoRedirect = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (redirectDelay) {
            redirectDelay.addEventListener('change', (e) => {
                this.settings.redirectDelay = parseInt(e.target.value);
                this.saveSettings();
            });
        }
        
        if (showPasswordStrength) {
            showPasswordStrength.addEventListener('change', (e) => {
                this.settings.showPasswordStrength = e.target.checked;
                this.saveSettings();
            });
        }
    }

    saveSettings() {
        localStorage.setItem('secureLinkSettings', JSON.stringify(this.settings));
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.theme = savedTheme;
        this.applyTheme(savedTheme);
        this.updateThemeButton();
    }

    applyTheme(theme) {
        const html = document.documentElement;
        const body = document.body;
        
        html.setAttribute('data-color-scheme', theme);
        body.setAttribute('data-color-scheme', theme);
    }

    updateThemeButton() {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            const labels = { light: 'Light', dark: 'Dark' };
            themeIcon.textContent = labels[this.theme] || 'Dark';
        }
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mode tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });

        // Timelock type tabs
        document.querySelectorAll('.timelock-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.switchTimelockType(type);
            });
        });

        // Encrypt buttons
        this.setupButton('encryptSingleBtn', () => this.encryptSingle());
        this.setupButton('encryptBulkBtn', () => this.encryptBulk());
        this.setupButton('encryptClipboardBtn', () => this.encryptClipboard());
        this.setupButton('encryptTimelockBtn', () => this.encryptTimelock());

        // Password generation
        this.setupButton('generatePasswordBtn', () => this.generatePassword('singlePassword'));
        this.setupButton('generateBulkPasswordBtn', () => this.generatePassword('bulkPassword'));
        this.setupButton('generateClipboardPasswordBtn', () => this.generatePassword('clipboardPassword'));
        this.setupButton('generateTimelockPasswordBtn', () => this.generatePassword('timelockPassword'));

        // Password toggles
        this.setupPasswordToggle('singlePasswordToggle', 'singlePassword');
        this.setupPasswordToggle('bulkPasswordToggle', 'bulkPassword');
        this.setupPasswordToggle('clipboardPasswordToggle', 'clipboardPassword');
        this.setupPasswordToggle('timelockPasswordToggle', 'timelockPassword');
        this.setupPasswordToggle('decryptPasswordToggle', 'decryptPassword');

        // Clipboard
        this.setupButton('readClipboardBtn', () => this.readClipboard());

        // Decryption
        this.setupButton('decryptBtn', () => this.decrypt(true));
        this.setupButton('decryptOnlyBtn', () => this.decrypt(false));
        this.setupButton('checkAgainBtn', () => this.checkAgain());
        this.setupButton('backToHomeBtn', () => this.backToHome());
        this.setupButton('tryAgainBtn', () => this.tryAgain());
        this.setupButton('encryptNewBtn', () => this.encryptNew());
        this.setupButton('contactHelpBtn', () => this.contactHelp());
        this.setupButton('newEncryptionBtn', () => this.newEncryption());
        this.setupButton('goNowBtn', () => this.goNow());
        this.setupButton('cancelRedirectBtn', () => this.cancelRedirect());

        // Modals
        this.setupButton('settingsBtn', () => this.openModal('settingsModal'));
        this.setupButton('helpBtn', () => this.openModal('helpModal'));
        this.setupButton('closeSettingsModal', () => this.closeModal('settingsModal'));
        this.setupButton('closeHelpModal', () => this.closeModal('helpModal'));

        // Settings inputs
        this.setupSettingsListeners();

        // URL validation
        this.setupUrlValidation('singleUrl', 'singleUrlValidation');
        this.setupUrlValidation('timelockUrl', 'timelockUrlValidation');

        // Password strength
        this.setupPasswordStrength('singlePassword', 'singlePasswordStrength');
        this.setupPasswordStrength('bulkPassword', 'bulkPasswordStrength');
        this.setupPasswordStrength('clipboardPassword', 'clipboardPasswordStrength');
        this.setupPasswordStrength('timelockPassword', 'timelockPasswordStrength');

        // Bulk URL count
        const bulkUrls = document.getElementById('bulkUrls');
        if (bulkUrls) {
            bulkUrls.addEventListener('input', () => this.updateBulkUrlCount());
        }

        // Enter key support
        this.setupEnterKey();
    }

    setupButton(id, handler) {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                handler();
            });
        }
    }

    setupPasswordToggle(toggleId, inputId) {
        const toggle = document.getElementById(toggleId);
        const input = document.getElementById(inputId);
        if (toggle && input) {
            toggle.addEventListener('click', () => {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                toggle.textContent = isPassword ? 'Hide' : 'Show';
            });
        }
    }

    setupUrlValidation(inputId, validationId) {
        const input = document.getElementById(inputId);
        const validation = document.getElementById(validationId);
        if (input && validation) {
            input.addEventListener('input', () => {
                const url = input.value.trim();
                if (!url) {
                    validation.textContent = '';
                    validation.className = 'url-validation';
                    return;
                }
                const isValid = this.isValidUrl(url);
                validation.textContent = isValid ? 'Valid URL' : 'Invalid URL format';
                validation.className = `url-validation ${isValid ? 'valid' : 'invalid'}`;
            });
        }
    }

    setupPasswordStrength(inputId, strengthId) {
        const input = document.getElementById(inputId);
        const strength = document.getElementById(strengthId);
        if (input && strength) {
            input.addEventListener('input', () => {
                const password = input.value;
                if (!password) {
                    strength.innerHTML = '';
                    return;
                }
                const score = this.calculatePasswordStrength(password);
                const labels = ['Weak', 'Fair', 'Good', 'Strong'];
                const colors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4'];
                strength.innerHTML = `
                    <div class="strength-bar">
                        <div class="strength-fill" style="width: ${(score + 1) * 25}%; background: ${colors[score]};"></div>
                    </div>
                    <span style="color: ${colors[score]};">${labels[score]}</span>
                `;
            });
        }
    }

    setupEnterKey() {
        const inputs = ['singleUrl', 'singlePassword', 'bulkPassword', 'clipboardPassword', 'timelockUrl', 'timelockPassword', 'decryptPassword'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleEnterKey(id);
                    }
                });
            }
        });
    }

    handleEnterKey(inputId) {
        const actions = {
            'singleUrl': () => this.encryptSingle(),
            'singlePassword': () => this.encryptSingle(),
            'bulkPassword': () => this.encryptBulk(),
            'clipboardPassword': () => this.encryptClipboard(),
            'timelockUrl': () => this.encryptTimelock(),
            'timelockPassword': () => this.encryptTimelock(),
            'decryptPassword': () => this.decrypt(true)
        };
        if (actions[inputId]) {
            actions[inputId]();
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme(this.theme);
        this.updateThemeButton();
    }

    switchMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        document.querySelectorAll('.mode-content').forEach(content => {
            content.classList.toggle('active', content.id === `${mode}Mode`);
        });
    }

    switchTimelockType(type) {
        this.currentTimelockType = type;
        document.querySelectorAll('.timelock-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        document.querySelectorAll('.timelock-option').forEach(option => {
            option.classList.toggle('active', option.id === `${type}Option`);
        });
    }

    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password) && /[^a-zA-Z\d]/.test(password)) score++;
        return Math.min(score, 3);
    }

    async generatePassword(inputId) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const input = document.getElementById(inputId);
        if (input) {
            input.value = password;
            input.dispatchEvent(new Event('input'));
            
            try {
                await navigator.clipboard.writeText(password);
                this.showToast('Password generated and copied!', 'success');
            } catch (error) {
                this.showToast('Password generated!', 'success');
            }
        }
    }

    updateBulkUrlCount() {
        const textarea = document.getElementById('bulkUrls');
        const counter = document.getElementById('bulkUrlCount');
        if (textarea && counter) {
            const urls = this.extractUrls(textarea.value);
            counter.textContent = `${urls.length} URL${urls.length !== 1 ? 's' : ''} detected`;
        }
    }

    extractUrls(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return (text.match(urlRegex) || []).filter(url => this.isValidUrl(url));
    }

    async encryptSingle() {
        const urlInput = document.getElementById('singleUrl');
        const passwordInput = document.getElementById('singlePassword');
        
        const url = urlInput.value.trim();
        const password = passwordInput.value;

        if (!this.isValidUrl(url)) {
            this.showToast('Please enter a valid URL', 'error');
            return;
        }

        if (!password) {
            this.showToast('Please enter a password', 'error');
            return;
        }

        this.setButtonLoading('encryptSingleBtn', true);

        try {
            const encrypted = CryptoJS.AES.encrypt(url, password).toString();
            const encodedData = encodeURIComponent(encrypted);
            const secureLink = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
            
            this.showResults([{ original: url, encrypted: secureLink }]);
            urlInput.value = '';
            passwordInput.value = '';
        } catch (error) {
            this.showToast('Encryption failed', 'error');
        } finally {
            this.setButtonLoading('encryptSingleBtn', false);
        }
    }

    async encryptBulk() {
        const textarea = document.getElementById('bulkUrls');
        const passwordInput = document.getElementById('bulkPassword');
        
        const urls = this.extractUrls(textarea.value);
        const password = passwordInput.value;

        if (urls.length === 0) {
            this.showToast('No valid URLs found', 'error');
            return;
        }

        if (!password) {
            this.showToast('Please enter a password', 'error');
            return;
        }

        this.setButtonLoading('encryptBulkBtn', true);

        try {
            const results = urls.map(url => {
                const encrypted = CryptoJS.AES.encrypt(url, password).toString();
                const encodedData = encodeURIComponent(encrypted);
                const secureLink = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
                return { original: url, encrypted: secureLink };
            });
            
            this.showResults(results);
            textarea.value = '';
            passwordInput.value = '';
        } catch (error) {
            this.showToast('Encryption failed', 'error');
        } finally {
            this.setButtonLoading('encryptBulkBtn', false);
        }
    }

    async readClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const urls = this.extractUrls(text);
            
            if (urls.length === 0) {
                this.showToast('No URLs found in clipboard', 'error');
                return;
            }

            const resultsDiv = document.getElementById('clipboardResults');
            const detectedDiv = document.getElementById('detectedUrls');
            
            detectedDiv.innerHTML = urls.map((url, i) => `
                <div style="padding: 8px; margin: 4px 0; background: var(--color-secondary); border-radius: var(--radius-lg); font-size: 13px;">
                    ${i + 1}. ${url}
                </div>
            `).join('');
            
            resultsDiv.style.display = 'block';
            this.showToast(`Found ${urls.length} URL${urls.length !== 1 ? 's' : ''}`, 'success');
        } catch (error) {
            this.showToast('Failed to read clipboard', 'error');
        }
    }

    async encryptClipboard() {
        const detectedDiv = document.getElementById('detectedUrls');
        const passwordInput = document.getElementById('clipboardPassword');
        
        const urls = Array.from(detectedDiv.querySelectorAll('div')).map(div => {
            const text = div.textContent.trim();
            return text.substring(text.indexOf(' ') + 1);
        });

        const password = passwordInput.value;

        if (!password) {
            this.showToast('Please enter a password', 'error');
            return;
        }

        this.setButtonLoading('encryptClipboardBtn', true);

        try {
            const results = urls.map(url => {
                const encrypted = CryptoJS.AES.encrypt(url, password).toString();
                const encodedData = encodeURIComponent(encrypted);
                const secureLink = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
                return { original: url, encrypted: secureLink };
            });
            
            this.showResults(results);
            document.getElementById('clipboardResults').style.display = 'none';
            passwordInput.value = '';
        } catch (error) {
            this.showToast('Encryption failed', 'error');
        } finally {
            this.setButtonLoading('encryptClipboardBtn', false);
        }
    }

    async encryptTimelock() {
        const urlInput = document.getElementById('timelockUrl');
        const passwordInput = document.getElementById('timelockPassword');
        
        const url = urlInput.value.trim();
        const password = passwordInput.value;

        if (!this.isValidUrl(url)) {
            this.showToast('Please enter a valid URL', 'error');
            return;
        }

        if (!password) {
            this.showToast('Please enter a password', 'error');
            return;
        }

        let timelockData = {};
        
        if (this.currentTimelockType === 'datetime') {
            const datetime = document.getElementById('unlockDatetime').value;
            if (!datetime) {
                this.showToast('Please select unlock date and time', 'error');
                return;
            }
            timelockData = { type: 'datetime', unlock: datetime };
        } else {
            const startTime = document.getElementById('startTime').value;
            const endTime = document.getElementById('endTime').value;
            if (!startTime || !endTime) {
                this.showToast('Please select time window', 'error');
                return;
            }
            timelockData = { type: 'daily', start: startTime, end: endTime };
        }

        this.setButtonLoading('encryptTimelockBtn', true);

        try {
            const payload = JSON.stringify({ url, timelock: timelockData });
            const encrypted = CryptoJS.AES.encrypt(payload, password).toString();
            const encodedData = encodeURIComponent(encrypted);
            const secureLink = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
            
            this.showResults([{ original: url, encrypted: secureLink, timelock: true }]);
            urlInput.value = '';
            passwordInput.value = '';
        } catch (error) {
            this.showToast('Encryption failed', 'error');
        } finally {
            this.setButtonLoading('encryptTimelockBtn', false);
        }
    }

    async decrypt(autoRedirect = false) {
        const passwordInput = document.getElementById('decryptPassword');
        const password = passwordInput.value;

        if (!password) {
            this.showToast('Please enter a password', 'error');
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const encryptedData = urlParams.get('data');

        if (!encryptedData) {
            this.showToast('No encrypted data found', 'error');
            return;
        }

        this.setButtonLoading('decryptBtn', true);

        try {
            const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(encryptedData), password).toString(CryptoJS.enc.Utf8);
            
            if (!decrypted) {
                throw new Error('Decryption failed');
            }

            let url, timelockData;
            try {
                const parsed = JSON.parse(decrypted);
                url = parsed.url;
                timelockData = parsed.timelock;
            } catch {
                url = decrypted;
            }

            if (timelockData) {
                const canAccess = this.checkTimelockAccess(timelockData);
                if (!canAccess) {
                    this.showTimelockBlocked(timelockData);
                    return;
                }
            }

            if (autoRedirect && this.settings.autoRedirect) {
                this.showSuccessAndRedirect(url);
            } else {
                this.showDecryptedUrl(url);
            }
        } catch (error) {
            this.showToast('Incorrect password', 'error');
            document.getElementById('decryptionError').style.display = 'block';
        } finally {
            this.setButtonLoading('decryptBtn', false);
        }
    }

    checkTimelockAccess(timelockData) {
        const now = new Date();
        
        if (timelockData.type === 'datetime') {
            const unlockTime = new Date(timelockData.unlock);
            return now >= unlockTime;
        } else if (timelockData.type === 'daily') {
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [startH, startM] = timelockData.start.split(':').map(Number);
            const [endH, endM] = timelockData.end.split(':').map(Number);
            const startTime = startH * 60 + startM;
            const endTime = endH * 60 + endM;
            return currentTime >= startTime && currentTime <= endTime;
        }
        
        return true;
    }

    showTimelockBlocked(timelockData) {
        const statusDiv = document.getElementById('timelockStatus');
        const titleEl = document.getElementById('timelockTitle');
        const messageEl = document.getElementById('timelockMessage');
        const countdownDiv = document.getElementById('timelockCountdown');
        
        if (timelockData.type === 'datetime') {
            const unlockTime = new Date(timelockData.unlock);
            titleEl.textContent = 'Link Time-Locked';
            messageEl.textContent = `This link will be available on ${unlockTime.toLocaleString()}`;
            
            // Calculate time remaining
            const updateCountdown = () => {
                const now = new Date();
                const diff = unlockTime - now;
                
                if (diff <= 0) {
                    countdownDiv.innerHTML = '<div style="color: var(--color-success); font-weight: 600;">Link is now available! Click Check Again.</div>';
                    return;
                }
                
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                let timeString = '';
                if (days > 0) timeString += `${days}d `;
                if (hours > 0 || days > 0) timeString += `${hours}h `;
                if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
                timeString += `${seconds}s`;
                
                countdownDiv.innerHTML = `
                    <div style="font-size: 32px; font-weight: bold; color: var(--color-primary); margin-bottom: 8px;">${timeString}</div>
                    <div style="font-size: 14px; color: var(--color-text-secondary);">Time remaining until unlock</div>
                `;
            };
            
            updateCountdown();
            this.timelockInterval = setInterval(updateCountdown, 1000);
        } else {
            titleEl.textContent = 'Outside Time Window';
            messageEl.textContent = `This link is only available between ${timelockData.start} and ${timelockData.end}`;
            
            // Calculate time until next available window
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [startH, startM] = timelockData.start.split(':').map(Number);
            const startTime = startH * 60 + startM;
            
            let minutesUntil;
            if (currentTime < startTime) {
                minutesUntil = startTime - currentTime;
            } else {
                minutesUntil = (24 * 60) - currentTime + startTime;
            }
            
            const hours = Math.floor(minutesUntil / 60);
            const minutes = minutesUntil % 60;
            
            countdownDiv.innerHTML = `
                <div style="font-size: 32px; font-weight: bold; color: var(--color-primary); margin-bottom: 8px;">${hours}h ${minutes}m</div>
                <div style="font-size: 14px; color: var(--color-text-secondary);">Until next available window</div>
            `;
        }
        
        statusDiv.style.display = 'block';
        this.showToast('Access restricted by time lock', 'error');
    }

    showSuccessAndRedirect(url) {
        const successDiv = document.getElementById('decryptionSuccess');
        const urlDiv = document.getElementById('decryptedUrl');
        const countdownDiv = document.getElementById('redirectCountdown');
        
        urlDiv.innerHTML = `<a href="${url}" target="_blank" style="color: var(--color-primary);">${url}</a>`;
        successDiv.style.display = 'block';
        
        let seconds = this.settings.redirectDelay;
        countdownDiv.textContent = `Redirecting in ${seconds} seconds...`;
        
        this.redirectInterval = setInterval(() => {
            seconds--;
            if (seconds <= 0) {
                clearInterval(this.redirectInterval);
                window.location.href = url;
            } else {
                countdownDiv.textContent = `Redirecting in ${seconds} seconds...`;
            }
        }, 1000);
        
        this.currentRedirectUrl = url;
    }

    showDecryptedUrl(url) {
        const successDiv = document.getElementById('decryptionSuccess');
        const urlDiv = document.getElementById('decryptedUrl');
        
        urlDiv.innerHTML = `<a href="${url}" target="_blank" style="color: var(--color-primary);">${url}</a>`;
        successDiv.style.display = 'block';
        this.showToast('Decryption successful!', 'success');
    }

    async showResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsDiv = document.getElementById('encryptionResults');
        
        resultsDiv.innerHTML = results.map(r => `
            <div style="margin-bottom: 20px; padding: 16px; background: var(--color-secondary); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
                <div style="margin-bottom: 8px; font-size: 12px; color: var(--color-text-secondary);">Original URL:</div>
                <div style="margin-bottom: 12px; word-break: break-all; font-size: 13px;">${r.original}</div>
                <div style="margin-bottom: 8px; font-size: 12px; color: var(--color-text-secondary);">Encrypted Link${r.timelock ? ' (Time-Locked)' : ''}:</div>
                <div style="margin-bottom: 12px; word-break: break-all; font-size: 13px; color: var(--color-primary);">${r.encrypted}</div>
                <button onclick="navigator.clipboard.writeText('${r.encrypted}').then(() => app.showToast('Copied!', 'success'))" 
                        style="padding: 8px 16px; background: var(--color-primary); color: var(--color-btn-primary-text); border: none; border-radius: var(--radius-full); cursor: pointer; font-size: 13px;">
                    Copy Link
                </button>
            </div>
        `).join('');
        
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Auto-copy first link
        if (results.length > 0) {
            try {
                await navigator.clipboard.writeText(results[0].encrypted);
                this.showToast('Link copied to clipboard!', 'success');
            } catch (error) {
                console.log('Auto-copy failed');
            }
        }
    }

    setButtonLoading(buttonId, loading) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            const textSpan = btn.querySelector('.btn-text');
            const loadingSpan = btn.querySelector('.btn-loading');
            if (textSpan && loadingSpan) {
                textSpan.style.display = loading ? 'none' : 'inline';
                loadingSpan.style.display = loading ? 'inline' : 'none';
            }
            btn.disabled = loading;
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast toast-${type} show`;
            setTimeout(() => {
                toast.className = 'toast';
            }, 3000);
        }
    }

    checkForEncryptedData() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('data')) {
            document.getElementById('encryptionPage').classList.remove('active');
            document.getElementById('decryptionPage').classList.add('active');
        }
    }

    checkAgain() {
        if (this.timelockInterval) {
            clearInterval(this.timelockInterval);
        }
        document.getElementById('timelockStatus').style.display = 'none';
        this.decrypt(true);
    }

    backToHome() {
        if (this.timelockInterval) {
            clearInterval(this.timelockInterval);
        }
        window.location.href = window.location.pathname;
    }

    tryAgain() {
        document.getElementById('decryptionError').style.display = 'none';
        document.getElementById('decryptPassword').value = '';
        document.getElementById('decryptPassword').focus();
    }

    encryptNew() {
        window.location.href = window.location.pathname;
    }

    contactHelp() {
        this.openModal('helpModal');
        document.getElementById('decryptionError').style.display = 'none';
    }

    newEncryption() {
        document.getElementById('resultsSection').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    goNow() {
        if (this.redirectInterval) {
            clearInterval(this.redirectInterval);
        }
        if (this.currentRedirectUrl) {
            window.location.href = this.currentRedirectUrl;
        }
    }

    cancelRedirect() {
        if (this.redirectInterval) {
            clearInterval(this.redirectInterval);
        }
        document.getElementById('decryptionSuccess').style.display = 'none';
        this.showToast('Redirect cancelled', 'info');
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SecureLinkApp();
});
