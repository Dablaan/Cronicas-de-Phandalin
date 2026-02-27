const STORAGE_KEY = 'phandalin_data';

// Initialize Supabase client
const supabaseUrl = 'https://gwryzkejvymurjnyfwpu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cnl6a2VqdnltdXJqbnlmd3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjg1NDgsImV4cCI6MjA4NzcwNDU0OH0.x1PU7qnWJTLA5P6DO0Og6SlnSi0vIyTh98iu3GCk3fw';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

export const storageAdapter = {
    /**
     * Saves data to Supabase kv_store
     * @param {Object} data - The state data to save
     */
    async save(data) {
        try {
            const { error } = await supabase
                .from('kv_store')
                .upsert({ key: STORAGE_KEY, value: data });

            if (error) throw error;
        } catch (e) {
            console.error("Error saving to Supabase", e);
        }
    },

    /**
     * Loads data from Supabase kv_store
     * @returns {Promise<Object|null>} The parsed state data, or null if nothing is saved
     */
    async load() {
        try {
            const { data, error } = await supabase
                .from('kv_store')
                .select('value')
                .eq('key', STORAGE_KEY)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                throw error;
            }
            return data ? data.value : null;
        } catch (e) {
            console.error("Error loading from Supabase", e);
            return null;
        }
    },

    /**
     * Subscribes to Supabase realtime changes
     * @param {Function} callback - Function to call when storage changes remotely
     */
    subscribe(callback) {
        supabase
            .channel('public:kv_store')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'kv_store',
                    filter: `key=eq.${STORAGE_KEY}`
                },
                (payload) => {
                    if (payload.new && payload.new.value) {
                        try {
                            callback(payload.new.value);
                        } catch (e) {
                            console.error("Error parsing realtime payload", e);
                        }
                    }
                }
            )
            .subscribe();
    },

    /**
     * Uploads an avatar image to Supabase Storage
     * @param {File} file - The image file to upload
     * @returns {Promise<string>} The public URL of the uploaded image
     */
    async uploadAvatar(file) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`; // root of 'avatars' bucket

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                console.error("Upload error details:", uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (e) {
            console.error("Error uploading avatar to Supabase:", e);
            throw e;
        }
    }
};
