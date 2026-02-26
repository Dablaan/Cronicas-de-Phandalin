import { storageAdapter } from './storageAdapter.js';

const defaultState = {
    session: { role: null, playerId: null }, // role: 'DM' | 'Player'
    // Player Array: { id, name, playerName, race, class, background, alignment, level, xp, hpCurrent, hpMax, hitDice, ac, speed, initiative, passivePerception, inspiration, stats, saves, skills, deathSaves, traits, attacks: [], spells: [], spellSlots, equipment: { equipped: "", backpack: "" } }
    players: [],
    notes: {},   // Object: { [playerId]: "personal notes text" }
    npcs: [],    // Array of: { id, name, description, isVisible, secrets: [{ id, text, isVisible }] }
    maps: [],    // Array of: { id, name, url, isVisible, secrets: [{ id, text, isVisible }] }
    chronicles: {}, // Object: { "playerId_entityId": "player's shared notes about an npc/map" }
    recursos: [] // Array of { id, nombre, portadaUrl, enlaceUrl }
};

let currentState = { ...defaultState };
const listeners = [];

export const state = {
    /**
     * Gets the current application state
     * @returns {Object} Read-only view of current state
     */
    get() {
        return currentState;
    },

    /**
     * Initializes the state from Supabase if available,
     * and sets up the cross-tab/realtime sync listener.
     */
    async init() {
        const saved = await storageAdapter.load();
        if (saved) {
            // Merge remote state but preserve current UI session
            const currentSession = currentState.session;
            currentState = { ...defaultState, ...saved, session: currentSession };
        } else {
            // Initial save: Do not save session to cloud
            const dataToSave = { ...currentState };
            delete dataToSave.session;
            await storageAdapter.save(dataToSave);
        }

        // Listen to remote changes and update local state
        storageAdapter.subscribe((newData) => {
            if (newData) {
                // PROTECTION: Ignore remote updates if user is actively editing their sheet
                if (window.isSheetEditMode) {
                    console.log("Remote update ignored: User is currently in Edit Mode.");
                    return;
                }

                // CRITICAL: Preserve local UI session state, do not overwrite with remote state
                const currentSession = currentState.session;
                currentState = { ...newData, session: currentSession };

                this.notify();
            }
        });
    },

    /**
     * Updates the state with a partial object, saves it, and notifies listeners.
     * @param {Object} partial - Object containing keys to update in state
     */
    async update(partial) {
        currentState = { ...currentState, ...partial };

        // CRITICAL DECOUPLING: Never save the UI session state to the cloud
        const dataToSave = { ...currentState };
        delete dataToSave.session;

        await storageAdapter.save(dataToSave);
        this.notify();
    },

    /**
     * Subscribe to state changes (from the current tab or other tabs)
     * @param {Function} callback - Function to call on state change
     */
    subscribe(callback) {
        listeners.push(callback);
    },

    /**
     * Triggers all subscribed listeners with the current state.
     * Useful for initial rendering and state updates.
     */
    notify() {
        listeners.forEach(cb => cb(currentState));
    }
};
