const STORAGE_KEY = 'phandalin_data';

export const storageAdapter = {
    /**
     * Saves data to localStorage
     * @param {Object} data - The state data to save
     */
    save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Error saving to localStorage", e);
        }
    },

    /**
     * Loads data from localStorage
     * @returns {Object|null} The parsed state data, or null if nothing is saved
     */
    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Error loading from localStorage", e);
            return null;
        }
    },

    /**
     * Subscribes to the window storage event to detect cross-tab changes
     * @param {Function} callback - Function to call when storage changes in another window
     */
    subscribe(callback) {
        window.addEventListener('storage', (event) => {
            if (event.key === STORAGE_KEY && event.newValue) {
                try {
                    callback(JSON.parse(event.newValue));
                } catch (e) {
                    console.error("Error parsing storage event payload", e);
                }
            }
        });
    }
};
