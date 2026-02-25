import { storageAdapter } from './storageAdapter.js';

const defaultState = {
    session: { role: null, playerId: null }, // role: 'DM' | 'Player'
    // Player Array: { id, name, playerName, race, class, background, alignment, level, xp, hpCurrent, hpMax, hitDice, ac, speed, initiative, passivePerception, inspiration, stats, saves, skills, deathSaves, traits, attacks: [], spells: [], spellSlots, equipment: { equipped: "", backpack: "" } }
    players: [],
    notes: {},   // Object: { [playerId]: "personal notes text" }
    npcs: [],    // Array of: { id, name, description, isVisible, secrets: [{ id, text, isVisible }] }
    maps: [],    // Array of: { id, name, url, isVisible, secrets: [{ id, text, isVisible }] }
    chronicles: {} // Object: { "playerId_entityId": "player's shared notes about an npc/map" }
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
     * Initializes the state from localStorage if available,
     * and sets up the cross-tab sync listener.
     */
    init() {
        const saved = storageAdapter.load();
        if (saved) {
            // Merge in case we added new default keys later
            currentState = { ...defaultState, ...saved };
        } else {
            storageAdapter.save(currentState);
        }

        // Listen to cross-tab changes and update local state
        storageAdapter.subscribe((newData) => {
            if (newData) {
                currentState = newData;
                this.notify();
            }
        });
    },

    /**
     * Updates the state with a partial object, saves it, and notifies listeners.
     * @param {Object} partial - Object containing keys to update in state
     */
    update(partial) {
        currentState = { ...currentState, ...partial };
        storageAdapter.save(currentState);
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
