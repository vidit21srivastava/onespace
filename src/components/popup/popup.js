

document.addEventListener('DOMContentLoaded', function () {

    const explainPageBtn = document.getElementById('explain-page-btn');
    const voiceCommandBtn = document.getElementById('voice-command-btn');
    const historyBtn = document.getElementById('history-btn');
    const tooltipToggle = document.getElementById('tooltip-toggle');

    // Mark body as loaded immediately to prevent flash
    document.body.classList.add('loaded');

    // Check for first-time install and unlock status
    checkWelcomeAndUnlockStatus();

    // Load tooltip state without flicker
    chrome.storage.local.get(['tooltipEnabled'], (result) => {
        const isEnabled = result.tooltipEnabled !== false;

        if (!isEnabled) {
            tooltipToggle.checked = false;
        }

        document.querySelector('.feature-toggle').classList.add('loaded');
    });

    // Handle tooltip toggle
    tooltipToggle.addEventListener('change', function () {
        const isEnabled = this.checked;

        chrome.storage.local.set({ tooltipEnabled: isEnabled });

        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'toggleTooltip',
                    enabled: isEnabled
                }).catch(() => { });
            });
        });
    });

    // Explain Page button
    explainPageBtn.addEventListener('click', async function () {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const bodyText = document.body.innerText;
                    return bodyText.substring(0, 5000);
                }
            });

            const pageText = results[0].result;

            await chrome.sidePanel.open({ tabId: tab.id });

            await new Promise(resolve => setTimeout(resolve, 200));

            await chrome.tabs.sendMessage(tab.id, {
                action: 'explainPage',
                text: pageText
            });

            window.close();

        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    // Voice command button
    voiceCommandBtn.addEventListener('click', async function () {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Open sidebar (must be during user gesture)
            await chrome.sidePanel.open({ tabId: tab.id });

            await new Promise(resolve => setTimeout(resolve, 100));

            window.close();

            await chrome.tabs.sendMessage(tab.id, {
                action: 'startVoiceCapture'
            });

        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    // History button
    historyBtn.addEventListener('click', async function () {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Set flag to open history tab
            await chrome.storage.session.set({ openTab: 'history' });

            // Open sidebar
            await chrome.sidePanel.open({ tabId: tab.id });

            window.close();
        } catch (error) {
            // Silent fail
        }
    });

    // Settings Modal Logic
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    const geminiStatus = document.getElementById('gemini-status');

    // Open settings
    settingsBtn.addEventListener('click', async function () {
        settingsModal.classList.remove('hidden');
        await checkGeminiStatus();
    });

    // Close settings
    closeSettingsBtn.addEventListener('click', function () {
        settingsModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    settingsModal.addEventListener('click', function (e) {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    // Save settings (simplified - no API keys to manage)
    saveSettingsBtn.addEventListener('click', async function () {
        // Show success message
        saveSettingsBtn.textContent = '✓ Saved!';
        setTimeout(() => {
            saveSettingsBtn.textContent = 'Save Settings';
            settingsModal.classList.add('hidden');
        }, 1000);
    });

    // Update AI status badge with appropriate icon and text
    async function updateAIStatusBadge() {
        const statusIcon = document.querySelector('.status-indicator img');
        const statusText = document.getElementById('ai-status-text');
        const statusLabel = document.getElementById('ai-status-label');

        // Check Gemini availability
        let geminiAvailable = false;
        try {
            if (typeof LanguageModel !== 'undefined') {
                const availability = await LanguageModel.availability();
                geminiAvailable = (availability === 'readily' || availability === 'available');
            }
        } catch (e) {
            // Gemini check failed
        }

        if (geminiAvailable) {
            statusIcon.src = '../../assets/icons8-galaxy-64.svg';
            statusIcon.alt = 'Gemini';
            statusText.textContent = 'Powered by Gemini Nano';
            statusLabel.textContent = 'ON-DEVICE';
            statusLabel.style.background = '#e6f4ea';
            statusLabel.style.color = '#34a853';
        } else {
            // Gemini not available
            statusIcon.src = '../../assets/icons8-galaxy-64.svg';
            statusIcon.alt = 'Demo';
            statusText.textContent = 'Demo Mode';
            statusLabel.textContent = 'DEMO';
            statusLabel.style.background = '#e3f2fd';
            statusLabel.style.color = 'inherit';
            statusLabel.style.display = 'block';
        }
    }

    // Check Gemini Nano status
    async function checkGeminiStatus() {
        try {
            if (typeof LanguageModel !== 'undefined') {
                const availability = await LanguageModel.availability();

                if (availability === 'readily' || availability === 'available') {
                    geminiStatus.textContent = '✓ Gemini Nano is available!';
                    geminiStatus.style.color = '#0f9d58';
                } else {
                    geminiStatus.textContent = `⚠️ Gemini Nano status: ${availability}`;
                    geminiStatus.style.color = '#f29900';
                }
            } else {
                geminiStatus.textContent = '❌ Gemini Nano not available';
                geminiStatus.style.color = '#d93025';
            }

            // Update the badge based on settings
            await updateAIStatusBadge();
        } catch (error) {
            geminiStatus.textContent = '❌ Error checking status';
            geminiStatus.style.color = '#d93025';
        }
    }

    // Check status on load
    checkGeminiStatus();

    // Make status badge clickable to open settings (helpful for first-time setup)
    const statusBadge = document.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.style.cursor = 'pointer';
        statusBadge.addEventListener('click', async function () {
            settingsModal.classList.remove('hidden');
            await checkGeminiStatus();
        });
    }

});

// Check for first-time welcome 
async function checkWelcomeAndUnlockStatus() {
    const welcomeMessage = document.getElementById('welcome-message');
    const welcomeSetupBtn = document.getElementById('welcome-setup-btn');

    // Check if this is first time opening the extension
    chrome.storage.local.get(['hasSeenWelcome'], async (result) => {
        const hasSeenWelcome = result.hasSeenWelcome || false;

        // Show welcome message if first time
        if (!hasSeenWelcome) {
            // Ensure welcome overlay is visible immediately to avoid flash
            welcomeMessage.classList.remove('hidden');

            // Mark as seen after showing
            chrome.storage.local.set({ hasSeenWelcome: true });
        } else {
            // Not first time — hide welcome overlay and show popup UI
            const welcomeMessageEl = document.getElementById('welcome-message');
            if (welcomeMessageEl) {
                welcomeMessageEl.classList.add('hidden');
            }
            document.body.classList.add('ready');
        }
    });

    // Welcome setup button - opens settings
    if (welcomeSetupBtn) {
        welcomeSetupBtn.addEventListener('click', function () {
            // Hide welcome overlay
            welcomeMessage.classList.add('hidden');

            // Open settings modal
            const settingsModal = document.getElementById('settings-modal');
            if (settingsModal) {
                settingsModal.classList.remove('hidden');
                if (typeof checkGeminiStatus === 'function') {
                    checkGeminiStatus();
                }
            }
        });
    }

}
