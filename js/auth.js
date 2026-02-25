import { state } from './state.js';

const DM_PASSWORD = '1234';

export function initAuth() {
    const btnLoginDM = document.getElementById('btn-login-dm');
    const dmPasswordInput = document.getElementById('dm-password');
    const btnLogout = document.getElementById('btn-logout');

    // DM Login
    btnLoginDM.addEventListener('click', () => {
        const password = dmPasswordInput.value;
        if (password === DM_PASSWORD) {
            document.getElementById('dm-error').style.display = 'none';
            state.update({ session: { role: 'DM', playerId: null } });
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
