import { state } from './state.js';
import { initAuth } from './auth.js';
import { initUI, renderApp } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize State
    state.init();

    // 2. Setup UI and Auth Listeners
    initAuth();
    initUI();

    // 3. Subscribe UI to State changes
    state.subscribe((currentState) => {
        renderApp(currentState);
    });

    // 4. Initial Render
    renderApp(state.get());

    // Fallback log for MVP start
    console.log("Crónicas de Phandalin initialized.", state.get());

    // Temporarily hide the loading screen manually until UI is built
    document.getElementById('loading-screen').classList.remove('active');
});
