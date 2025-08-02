// SecureLink App - Main JavaScript File

class SecureLinkApp {
    constructor() {
        this.currentPage = 'encryption';
        this.settings = {
            autoRedirect: true,
            redirectDelay: 3,
            showPasswordStrength: true
        };
        this.encryptedData = null;
        this.attemptCount = 0;
        this.redirectTimer = null;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.bindEvents();
        this.checkUrlParams();
        this.updateUI();
    }

    // Encryption Functions
    generateSalt() {
        return CryptoJS.lib.WordArray.random(128/8);
    }

    generateIV() {
        return CryptoJS.lib.WordArray.random(128/8);
    }

    deriveKey(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256/32,
            iterations: 10000
        });
    }

    encryptUrl(url, password) {
        try {
            const salt = this.generateSalt();
            const iv = this.generateIV();
            const key = this.deriveKey(password, salt);
            
            const encrypted = CryptoJS.AES.encrypt(url, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            const combined = {
                salt: salt.toString(),
                iv: iv.toString(),
                encrypted: encrypted.toString()
            };

            return btoa(JSON.stringify(combined));
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    decryptUrl(encryptedData, password) {
        try {
            const combined = JSON.parse(atob(encryptedData));
            const salt = CryptoJS.enc.Hex.parse(combined.salt);
            const iv = CryptoJS.enc.Hex.parse(combined.iv);
            const key = this.deriveKey(password, salt);

            const decrypted = CryptoJS.AES.decrypt(combined.encrypted, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    // URL Validation
    validateUrl(url) {
        if (!url) return { valid: false, message: 'URL is required' };
        
        try {
            // Add https:// if no protocol is specified
            if (!url.match(/^https?:\/\//)) {
                url = 'https://' + url;
            }
            
            new URL(url);
            return { valid: true, url: url, message: 'Valid URL' };
        } catch {
            return { valid: false, message: 'Invalid URL format' };
        }
    }

    // Password Strength
    checkPasswordStrength(password) {
        if (!password) return { strength: 'none', score: 0 };
        
        let score = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;

        if (score <= 2) return { strength: 'weak', score };
        if (score === 3) return { strength: 'fair', score };
        if (score === 4) return { strength: 'good', score };
        return { strength: 'strong', score };
    }

    // Password Generator
    generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        // Ensure at least one of each type
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
        
        // Fill the rest
        for (let i = 4; i < 16; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    // Clipboard Functions
    async readClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            return this.extractUrls(text);
        } catch (error) {
            this.showToast('Unable to read clipboard. Please paste URLs manually.', 'error');
            return [];
        }
    }

    async writeClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Clipboard write failed:', error);
            return false;
        }
    }

    extractUrls(text) {
        const urlRegex = /https?:\/\/[^\s<>"]+/gi;
        const matches = text.match(urlRegex) || [];
        
        // Also check for URLs without protocol
        const domainRegex = /(?:^|\s)((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?:\s|$)/gi;
        let domainMatch;
        while ((domainMatch = domainRegex.exec(text)) !== null) {
            const domain = domainMatch[1];
            if (!matches.some(url => url.includes(domain))) {
                matches.push('https://' + domain);
            }
        }
        
        return [...new Set(matches)]; // Remove duplicates
    }

    // UI Functions
    showPage(pageName) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(`${pageName}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    updatePasswordStrength(inputId, strengthId) {
        const input = document.getElementById(inputId);
        const strengthEl = document.getElementById(strengthId);
        
        if (!input || !strengthEl) return;
        
        if (!this.settings.showPasswordStrength) {
            strengthEl.style.display = 'none';
            return;
        }

        const password = input.value;
        const result = this.checkPasswordStrength(password);
        
        if (!password) {
            strengthEl.innerHTML = '';
            return;
        }

        strengthEl.innerHTML = `
            <div class="strength-bar strength-${result.strength}">
                <div class="strength-fill"></div>
            </div>
            <span class="strength-text">${result.strength.charAt(0).toUpperCase() + result.strength.slice(1)}</span>
        `;
        strengthEl.style.display = 'flex';
    }

    updateUrlValidation(inputId, validationId) {
        const input = document.getElementById(inputId);
        const validationEl = document.getElementById(validationId);
        
        if (!input || !validationEl) return;
        
        const url = input.value.trim();
        
        if (!url) {
            validationEl.innerHTML = '';
            return;
        }

        const result = this.validateUrl(url);
        validationEl.className = `url-validation ${result.valid ? 'valid' : 'invalid'}`;
        validationEl.textContent = result.message;
        
        if (result.valid && result.url !== url) {
            input.value = result.url;
        }
    }

    updateBulkUrlCount() {
        const textarea = document.getElementById('bulkUrls');
        const countEl = document.getElementById('bulkUrlCount');
        
        if (!textarea || !countEl) return;
        
        const urls = textarea.value.split('\n').filter(line => line.trim());
        const validUrls = urls.filter(url => this.validateUrl(url.trim()).valid);
        
        countEl.textContent = `${validUrls.length} valid URLs detected (${urls.length} total)`;
    }

    // Event Binding
    bindEvents() {
        // Navigation
        const settingsBtn = document.getElementById('settingsBtn');
        const helpBtn = document.getElementById('helpBtn');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = document.getElementById('settingsModal');
                if (modal) {
                    modal.classList.add('active');
                }
            });
        }

        if (helpBtn) {
            helpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = document.getElementById('helpModal');
                if (modal) {
                    modal.classList.add('active');
                }
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = closeBtn.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    const modal = overlay.closest('.modal');
                    if (modal) {
                        modal.classList.remove('active');
                    }
                }
            });
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = btn.dataset.mode;
                this.switchMode(mode);
            });
        });

        // Password toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const input = toggle.previousElementSibling;
                if (input) {
                    const type = input.type === 'password' ? 'text' : 'password';
                    input.type = type;
                    toggle.textContent = type === 'password' ? '👁️' : '🙈';
                }
            });
        });

        // Form inputs
        const singleUrl = document.getElementById('singleUrl');
        if (singleUrl) {
            singleUrl.addEventListener('input', () => {
                this.updateUrlValidation('singleUrl', 'singleUrlValidation');
            });
        }

        const singlePassword = document.getElementById('singlePassword');
        if (singlePassword) {
            singlePassword.addEventListener('input', () => {
                this.updatePasswordStrength('singlePassword', 'singlePasswordStrength');
            });
        }

        const bulkUrls = document.getElementById('bulkUrls');
        if (bulkUrls) {
            bulkUrls.addEventListener('input', () => {
                this.updateBulkUrlCount();
            });
        }

        const bulkPassword = document.getElementById('bulkPassword');
        if (bulkPassword) {
            bulkPassword.addEventListener('input', () => {
                this.updatePasswordStrength('bulkPassword', 'bulkPasswordStrength');
            });
        }

        const clipboardPassword = document.getElementById('clipboardPassword');
        if (clipboardPassword) {
            clipboardPassword.addEventListener('input', () => {
                this.updatePasswordStrength('clipboardPassword', 'clipboardPasswordStrength');
            });
        }

        // Encryption buttons
        const encryptSingleBtn = document.getElementById('encryptSingleBtn');
        if (encryptSingleBtn) {
            encryptSingleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.encryptSingle();
            });
        }

        const encryptBulkBtn = document.getElementById('encryptBulkBtn');
        if (encryptBulkBtn) {
            encryptBulkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.encryptBulk();
            });
        }

        const encryptClipboardBtn = document.getElementById('encryptClipboardBtn');
        if (encryptClipboardBtn) {
            encryptClipboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.encryptClipboard();
            });
        }

        // Password generators
        const generatePasswordBtn = document.getElementById('generatePasswordBtn');
        if (generatePasswordBtn) {
            generatePasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const password = this.generatePassword();
                const input = document.getElementById('singlePassword');
                if (input) {
                    input.value = password;
                    this.updatePasswordStrength('singlePassword', 'singlePasswordStrength');
                }
            });
        }

        const generateBulkPasswordBtn = document.getElementById('generateBulkPasswordBtn');
        if (generateBulkPasswordBtn) {
            generateBulkPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const password = this.generatePassword();
                const input = document.getElementById('bulkPassword');
                if (input) {
                    input.value = password;
                    this.updatePasswordStrength('bulkPassword', 'bulkPasswordStrength');
                }
            });
        }

        const generateClipboardPasswordBtn = document.getElementById('generateClipboardPasswordBtn');
        if (generateClipboardPasswordBtn) {
            generateClipboardPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const password = this.generatePassword();
                const input = document.getElementById('clipboardPassword');
                if (input) {
                    input.value = password;
                    this.updatePasswordStrength('clipboardPassword', 'clipboardPasswordStrength');
                }
            });
        }

        // Clipboard reading
        const readClipboardBtn = document.getElementById('readClipboardBtn');
        if (readClipboardBtn) {
            readClipboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleClipboardRead();
            });
        }

        // Result actions - bookmark functionality removed

        const newEncryptionBtn = document.getElementById('newEncryptionBtn');
        if (newEncryptionBtn) {
            newEncryptionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetEncryption();
            });
        }

        // Decryption
        const decryptBtn = document.getElementById('decryptBtn');
        if (decryptBtn) {
            decryptBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.decryptAndRedirect();
            });
        }

        const decryptOnlyBtn = document.getElementById('decryptOnlyBtn');
        if (decryptOnlyBtn) {
            decryptOnlyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.decryptOnly();
            });
        }

        // Error handling
        const tryAgainBtn = document.getElementById('tryAgainBtn');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDecryptionForm();
            });
        }

        const encryptNewBtn = document.getElementById('encryptNewBtn');
        if (encryptNewBtn) {
            encryptNewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('encryption');
            });
        }

        const contactHelpBtn = document.getElementById('contactHelpBtn');
        if (contactHelpBtn) {
            contactHelpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = document.getElementById('helpModal');
                if (modal) {
                    modal.classList.add('active');
                }
            });
        }

        // Success actions
        const goNowBtn = document.getElementById('goNowBtn');
        if (goNowBtn) {
            goNowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectNow();
            });
        }

        const cancelRedirectBtn = document.getElementById('cancelRedirectBtn');
        if (cancelRedirectBtn) {
            cancelRedirectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.cancelRedirect();
            });
        }

        // Settings
        const autoRedirect = document.getElementById('autoRedirect');
        if (autoRedirect) {
            autoRedirect.addEventListener('change', (e) => {
                this.settings.autoRedirect = e.target.checked;
                this.saveSettings();
            });
        }

        const redirectDelay = document.getElementById('redirectDelay');
        if (redirectDelay) {
            redirectDelay.addEventListener('change', (e) => {
                this.settings.redirectDelay = parseInt(e.target.value);
                this.saveSettings();
            });
        }

        const showPasswordStrength = document.getElementById('showPasswordStrength');
        if (showPasswordStrength) {
            showPasswordStrength.addEventListener('change', (e) => {
                this.settings.showPasswordStrength = e.target.checked;
                this.saveSettings();
            });
        }
    }

    // Mode Switching
    switchMode(mode) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Hide all mode content
        document.querySelectorAll('.mode-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show selected mode content
        const targetMode = document.getElementById(`${mode}Mode`);
        if (targetMode) {
            targetMode.classList.add('active');
        }
    }

    // Encryption Operations
    async encryptSingle() {
        const urlInput = document.getElementById('singleUrl');
        const passwordInput = document.getElementById('singlePassword');
        const btn = document.getElementById('encryptSingleBtn');
        
        if (!urlInput || !passwordInput || !btn) return;
        
        const url = urlInput.value.trim();
        const password = passwordInput.value;

        if (!url || !password) {
            this.showToast('Please enter both URL and password', 'error');
            return;
        }

        const urlValidation = this.validateUrl(url);
        if (!urlValidation.valid) {
            this.showToast('Please enter a valid URL', 'error');
            return;
        }

        btn.classList.add('loading');
        btn.disabled = true;
        
        setTimeout(() => {
            const encrypted = this.encryptUrl(urlValidation.url, password);
            if (encrypted) {
                this.showResults([{
                    original: urlValidation.url,
                    encrypted: encrypted,
                    decryptUrl: `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(encrypted)}`
                }]);
                this.showToast('URL encrypted successfully!', 'success');
            } else {
                this.showToast('Encryption failed', 'error');
            }
            btn.classList.remove('loading');
            btn.disabled = false;
        }, 500);
    }

    async encryptBulk() {
        const urlsInput = document.getElementById('bulkUrls');
        const passwordInput = document.getElementById('bulkPassword');
        const btn = document.getElementById('encryptBulkBtn');
        
        if (!urlsInput || !passwordInput || !btn) return;
        
        const urlsText = urlsInput.value.trim();
        const password = passwordInput.value;

        if (!urlsText || !password) {
            this.showToast('Please enter URLs and password', 'error');
            return;
        }

        const urls = urlsText.split('\n').filter(line => line.trim());
        const validUrls = [];

        for (const url of urls) {
            const validation = this.validateUrl(url.trim());
            if (validation.valid) {
                validUrls.push(validation.url);
            }
        }

        if (validUrls.length === 0) {
            this.showToast('No valid URLs found', 'error');
            return;
        }

        btn.classList.add('loading');
        btn.disabled = true;
        
        setTimeout(() => {
            const results = validUrls.map(url => {
                const encrypted = this.encryptUrl(url, password);
                return {
                    original: url,
                    encrypted: encrypted,
                    decryptUrl: `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(encrypted)}`
                };
            }).filter(result => result.encrypted);

            if (results.length > 0) {
                this.showResults(results);
                this.showToast(`${results.length} URLs encrypted successfully!`, 'success');
            } else {
                this.showToast('Encryption failed', 'error');
            }
            btn.classList.remove('loading');
            btn.disabled = false;
        }, 1000);
    }

    async encryptClipboard() {
        const passwordInput = document.getElementById('clipboardPassword');
        const btn = document.getElementById('encryptClipboardBtn');
        
        if (!passwordInput || !btn) return;
        
        const password = passwordInput.value;

        if (!password) {
            this.showToast('Please enter a password', 'error');
            return;
        }

        const selectedUrls = [];
        document.querySelectorAll('#detectedUrls input[type="checkbox"]:checked').forEach(checkbox => {
            selectedUrls.push(checkbox.value);
        });

        if (selectedUrls.length === 0) {
            this.showToast('Please select URLs to encrypt', 'error');
            return;
        }

        btn.classList.add('loading');
        btn.disabled = true;
        
        setTimeout(() => {
            const results = selectedUrls.map(url => {
                const encrypted = this.encryptUrl(url, password);
                return {
                    original: url,
                    encrypted: encrypted,
                    decryptUrl: `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(encrypted)}`
                };
            }).filter(result => result.encrypted);

            if (results.length > 0) {
                this.showResults(results);
                this.showToast(`${results.length} URLs encrypted successfully!`, 'success');
            } else {
                this.showToast('Encryption failed', 'error');
            }
            btn.classList.remove('loading');
            btn.disabled = false;
        }, 800);
    }

    // Clipboard Handling
    async handleClipboardRead() {
        const btn = document.getElementById('readClipboardBtn');
        if (!btn) return;
        
        btn.classList.add('loading');
        btn.disabled = true;
        
        const urls = await this.readClipboard();
        
        if (urls.length > 0) {
            this.displayDetectedUrls(urls);
            const resultsEl = document.getElementById('clipboardResults');
            if (resultsEl) {
                resultsEl.style.display = 'block';
            }
            this.showToast(`Found ${urls.length} URLs in clipboard`, 'success');
        } else {
            this.showToast('No URLs found in clipboard', 'error');
        }
        
        btn.classList.remove('loading');
        btn.disabled = false;
    }

    displayDetectedUrls(urls) {
        const container = document.getElementById('detectedUrls');
        if (!container) return;
        
        container.innerHTML = urls.map((url, index) => `
            <div class="detected-url">
                <input type="checkbox" id="url${index}" value="${url}" checked>
                <label for="url${index}" class="detected-url-text">${url}</label>
            </div>
        `).join('');
    }

    // Results Display
    showResults(results) {
        const container = document.getElementById('encryptionResults');
        const section = document.getElementById('resultsSection');
        
        if (!container || !section) return;
        
        container.innerHTML = results.map((result, index) => `
            <div class="result-item">
                <div class="result-original">Original: ${result.original}</div>
                <div class="result-encrypted">
                    <span class="result-url">${result.decryptUrl}</span>
                    <button class="copy-btn" onclick="app.copyToClipboard('${result.decryptUrl}', this)">Copy</button>
                </div>
            </div>
        `).join('');
        
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
    }

    async copyToClipboard(text, button) {
        const success = await this.writeClipboard(text);
        if (success) {
            button.textContent = 'Copied!';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = 'Copy';
                button.classList.remove('copied');
            }, 2000);
            this.showToast('Copied to clipboard', 'success');
        } else {
            this.showToast('Failed to copy', 'error');
        }
    }

    // Decryption Operations
    decryptAndRedirect() {
        const passwordInput = document.getElementById('decryptPassword');
        if (!passwordInput) return;
        
        const password = passwordInput.value;
        if (!password) {
            this.showToast('Please enter the password', 'error');
            return;
        }

        const decryptedUrl = this.decryptUrl(this.encryptedData, password);
        if (decryptedUrl) {
            this.showDecryptionSuccess(decryptedUrl);
        } else {
            this.showDecryptionError();
        }
    }

    decryptOnly() {
        const passwordInput = document.getElementById('decryptPassword');
        if (!passwordInput) return;
        
        const password = passwordInput.value;
        if (!password) {
            this.showToast('Please enter the password', 'error');
            return;
        }

        const decryptedUrl = this.decryptUrl(this.encryptedData, password);
        if (decryptedUrl) {
            const decryptedUrlEl = document.getElementById('decryptedUrl');
            const successEl = document.getElementById('decryptionSuccess');
            const formEl = document.querySelector('.decryption-section .glass-card');
            const errorEl = document.getElementById('decryptionError');
            
            if (decryptedUrlEl) decryptedUrlEl.textContent = decryptedUrl;
            if (successEl) successEl.style.display = 'block';
            if (formEl) formEl.style.display = 'none';
            if (errorEl) errorEl.style.display = 'none';
        } else {
            this.showDecryptionError();
        }
    }

    showDecryptionError() {
        this.attemptCount++;
        const attemptsEl = document.getElementById('decryptionAttempts');
        const errorEl = document.getElementById('decryptionError');
        
        if (attemptsEl) {
            attemptsEl.textContent = `Incorrect password (${this.attemptCount} attempt${this.attemptCount > 1 ? 's' : ''})`;
        }
        if (errorEl) {
            errorEl.style.display = 'block';
        }
    }

    showDecryptionSuccess(url) {
        const decryptedUrlEl = document.getElementById('decryptedUrl');
        const successEl = document.getElementById('decryptionSuccess');
        const formEl = document.querySelector('.decryption-section .glass-card');
        const errorEl = document.getElementById('decryptionError');
        
        if (decryptedUrlEl) decryptedUrlEl.textContent = url;
        if (successEl) successEl.style.display = 'block';
        if (formEl) formEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';

        if (this.settings.autoRedirect) {
            this.startRedirectCountdown(url);
        }
    }

    showDecryptionForm() {
        const formEl = document.querySelector('.decryption-section .glass-card');
        const errorEl = document.getElementById('decryptionError');
        const successEl = document.getElementById('decryptionSuccess');
        const passwordInput = document.getElementById('decryptPassword');
        
        if (formEl) formEl.style.display = 'block';
        if (errorEl) errorEl.style.display = 'none';
        if (successEl) successEl.style.display = 'none';
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    startRedirectCountdown(url) {
        let timeLeft = this.settings.redirectDelay;
        const countdownEl = document.getElementById('redirectCountdown');
        
        const updateCountdown = () => {
            if (countdownEl) {
                countdownEl.textContent = `Redirecting in ${timeLeft} seconds...`;
            }
            timeLeft--;
            
            if (timeLeft < 0) {
                window.location.href = url;
            }
        };
        
        updateCountdown();
        this.redirectTimer = setInterval(updateCountdown, 1000);
    }

    redirectNow() {
        const decryptedUrlEl = document.getElementById('decryptedUrl');
        if (decryptedUrlEl) {
            const url = decryptedUrlEl.textContent;
            window.location.href = url;
        }
    }

    cancelRedirect() {
        if (this.redirectTimer) {
            clearInterval(this.redirectTimer);
            this.redirectTimer = null;
        }
        const countdownEl = document.getElementById('redirectCountdown');
        if (countdownEl) {
            countdownEl.textContent = 'Redirect cancelled';
        }
    }



    // Utility Functions
    resetEncryption() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
        
        // Clear form inputs
        const inputs = [
            'singleUrl', 'singlePassword', 'bulkUrls', 
            'bulkPassword', 'clipboardPassword'
        ];
        
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        const clipboardResults = document.getElementById('clipboardResults');
        if (clipboardResults) {
            clipboardResults.style.display = 'none';
        }
        
        // Clear validation displays
        document.querySelectorAll('.url-validation, .password-strength').forEach(el => {
            el.innerHTML = '';
        });
        
        this.switchMode('single');
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const encryptedData = urlParams.get('data');
        
        if (encryptedData) {
            this.encryptedData = decodeURIComponent(encryptedData);
            this.showPage('decryption');
            setTimeout(() => {
                const passwordInput = document.getElementById('decryptPassword');
                if (passwordInput) {
                    passwordInput.focus();
                }
            }, 100);
        }
    }

    updateUI() {
        // Update settings UI
        const autoRedirect = document.getElementById('autoRedirect');
        const redirectDelay = document.getElementById('redirectDelay');
        const showPasswordStrength = document.getElementById('showPasswordStrength');
        
        if (autoRedirect) autoRedirect.checked = this.settings.autoRedirect;
        if (redirectDelay) redirectDelay.value = this.settings.redirectDelay;
        if (showPasswordStrength) showPasswordStrength.checked = this.settings.showPasswordStrength;
    }

    // Settings Management
    loadSettings() {
        // Note: localStorage is not available in sandbox, using defaults
        console.log('Using default settings (localStorage not available in sandbox)');
    }

    saveSettings() {
        // Note: localStorage is not available in sandbox
        console.log('Settings would be saved (localStorage not available in sandbox)');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new SecureLinkApp();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.app) {
            window.app = new SecureLinkApp();
        }
    });
} else {
    window.app = new SecureLinkApp();
}