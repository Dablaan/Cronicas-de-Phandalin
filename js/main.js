import { state } from './state.js';
import { initAuth } from './auth.js';
import { initUI, renderApp } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Setup UI and Auth Listeners (Sync)
    initAuth();
    initUI();

    try {
        // 2. Initialize State from Supabase (Async)
        await state.init();
    } catch (e) {
        console.error("Failed to initialize state from Supabase:", e);
    }

    // 3. Subscribe UI to State changes
    state.subscribe((currentState) => {
        renderApp(currentState);
    });

    // 4. Initial Render
    renderApp(state.get());

    // Fallback log for MVP start
    console.log("Crónicas de Phandalin initialized with Supabase.", state.get());

    // Hide the loading screen
    document.getElementById('loading-screen').classList.remove('active');
});
