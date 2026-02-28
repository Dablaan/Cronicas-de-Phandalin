import { storageAdapter } from './storageAdapter.js';

const defaultState = {
    session: { role: null, playerId: null }, // role: 'DM' | 'Player'
    // Player Array: { id, name, playerName, race, class, background, alignment, level, xp, hpCurrent, hpMax, hitDice, ac, speed, initiative, passivePerception, inspiration, stats, saves, skills, deathSaves, traits, attacks: [], spells: [], spellSlots, equipment: { equipped: "", backpack: "" } }
    players: [],
    notes: {},   // Object: { [playerId]: "personal notes text" }
    npcs: [],    // Array of: { id, name, description, isVisible, secrets: [{ id, text, isVisible }], notes: [{ playerId, text }] }
    maps: [],    // Array of: { id, name, url, isVisible, secrets: [{ id, text, isVisible }], notes: [{ playerId, text }] }
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
     * @param {boolean} skipNotify - If true, skips notifying local listeners to prevent re-renders
     */
    async update(partial, skipNotify = false) {
        currentState = { ...currentState, ...partial };

        // CRITICAL DECOUPLING: Never save the UI session state to the cloud
        const localSession = currentState.session;
        if (!skipNotify) {
            this.notify();
        }

        // 1. Fetch latest remote state to prevent overwriting other users' data
        const remoteState = await storageAdapter.load();

        let dataToSave;
        if (remoteState) {
            dataToSave = { ...remoteState };

            // Check if this is a regular sheet update by an active Player
            const isRegularPlayerUpdate = localSession &&
                localSession.role === 'Player' &&
                !partial.session &&
                partial.players;

            if (isRegularPlayerUpdate) {
                // Strict merge: only update THIS player's data in the remote array
                const myPlayerId = localSession.playerId;
                const myUpdatedPlayer = partial.players.find(p => p.id === myPlayerId);

                if (myUpdatedPlayer) {
                    const remotePlayers = dataToSave.players || [];
                    const playerExists = remotePlayers.some(p => p.id === myPlayerId);
                    if (playerExists) {
                        dataToSave.players = remotePlayers.map(p => p.id === myPlayerId ? myUpdatedPlayer : p);
                    } else {
                        dataToSave.players = [...remotePlayers, myUpdatedPlayer];
                    }
                }
            } else {
                // DM updates, Player creation/deletion, or Login events
                Object.keys(partial).forEach(k => {
                    if (k !== 'session') {
                        dataToSave[k] = partial[k];
                    }
                });
            }
        } else {
            dataToSave = { ...currentState };
        }

        // Ensure session is never saved
        delete dataToSave.session;

        await storageAdapter.save(dataToSave);
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
