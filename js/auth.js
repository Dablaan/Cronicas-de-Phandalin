import { state } from './state.js';

const DM_PASSWORD = '1234';

export function initAuth() {
    const btnLoginDM = document.getElementById('btn-login-dm');
    const dmPasswordInput = document.getElementById('dm-password');
    const btnLogout = document.getElementById('btn-logout');

    const btnEnterLanding = document.getElementById('btn-enter-landing');
    const landingScreen = document.getElementById('landing-screen');
    const selectionScreen = document.getElementById('selection-screen');

    // Landing to Selection Transition
    if (btnEnterLanding) {
        btnEnterLanding.addEventListener('click', () => {
            landingScreen.style.opacity = '0';
            setTimeout(() => {
                landingScreen.style.display = 'none';
                selectionScreen.style.display = 'block';
                // Trigger reflow to apply opacity transition smoothly
                void selectionScreen.offsetWidth;
                selectionScreen.style.transition = 'opacity 0.8s ease-in-out';
                selectionScreen.style.opacity = '1';
            }, 800);
        });
    }

    // DM Login
    btnLoginDM.addEventListener('click', () => {
        const password = dmPasswordInput.value;
        if (password === DM_PASSWORD) {
            document.getElementById('dm-error').style.display = 'none';
            state.update({ session: { role: 'DM', playerId: null } }).then(() => {
                if (window.switchTab) window.switchTab('tab-sheet');
            });
            dmPasswordInput.value = '';
        } else {
            document.getElementById('dm-error').style.display = 'block';
        }
    });

    // Enter key support for DM login
    dmPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnLoginDM.click();
        }
    });

    // Logout
    btnLogout.addEventListener('click', () => {
        state.update({ session: { role: null, playerId: null } });
    });
}
