// VibeCircles Integration - Main System
class VibeCirclesIntegration {
    constructor() {
        this.systems = {
            dataManager: null,
            contentReplacer: null,
            database: null,
            autoReplacer: null,
            supabase: null
        };
        this.isInitialized = false;
        this.supabaseEnabled = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing VibeCircles Dynamic Data System...');
            
            // Initialize all systems
            await this.initializeSystems();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            this.isInitialized = true;
            console.log('✅ VibeCircles Dynamic Data System initialized successfully!');
            
            // Show success message
            this.showNotification('Dynamic data system loaded successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Failed to initialize VibeCircles system:', error);
            this.showNotification('Failed to load dynamic data system', 'error');
        }
    }

    async initializeSystems() {
        // Initialize Supabase client first
        if (window.VibeCirclesSupabase) {
            this.systems.supabase = window.VibeCirclesSupabase;
            this.supabaseEnabled = true;
            console.log('🔗 Supabase integration enabled');
        }

        // Initialize database first
        if (window.vibeCirclesDB) {
            this.systems.database = window.vibeCirclesDB;
        }

        // Initialize data manager
        if (window.vibeCirclesData) {
            this.systems.dataManager = window.vibeCirclesData;
        }

        // Initialize content replacer
        if (window.contentReplacer) {
            this.systems.contentReplacer = window.contentReplacer;
        }

        // Initialize auto replacer
        if (window.autoReplacer) {
            this.systems.autoReplacer = window.autoReplacer;
        }

        // Wait for all systems to be ready
        await this.waitForSystems();
    }

    async waitForSystems() {
        const maxWaitTime = 10000; // 10 seconds
        const checkInterval = 100; // 100ms
        let elapsed = 0;

        while (elapsed < maxWaitTime) {
            if (this.systems.autoReplacer) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }

        throw new Error('Systems failed to initialize within timeout period');
    }

    setupEventListeners() {
        // Listen for page navigation
        window.addEventListener('popstate', () => {
            setTimeout(() => this.refreshAllSystems(), 500);
        });

        // Listen for dynamic content loading
        const observer = new MutationObserver((mutations) => {
            let shouldRefresh = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldRefresh = true;
                }
            });
            
            if (shouldRefresh) {
                setTimeout(() => this.refreshAllSystems(), 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Add refresh button to page
        this.addRefreshButton();
    }

    addRefreshButton() {
        // Create a floating refresh button
        const refreshButton = document.createElement('div');
        refreshButton.innerHTML = `
            <div id="vibecircles-refresh-btn" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                transition: all 0.3s ease;
            " title="Refresh Dynamic Data">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
            </div>
        `;
        
        document.body.appendChild(refreshButton);

        // Add click event
        document.getElementById('vibecircles-refresh-btn').addEventListener('click', () => {
            this.refreshAllSystems();
            this.showNotification('Dynamic data refreshed!', 'success');
        });
    }

    refreshAllSystems() {
        if (this.systems.autoReplacer) {
            this.systems.autoReplacer.refresh();
        }
        
        if (this.systems.dataManager) {
            this.systems.dataManager.updateAllContent();
        }
        
        if (this.systems.contentReplacer) {
            this.systems.contentReplacer.replaceAllStaticContent();
        }
    }

    startRealTimeUpdates() {
        // Start Supabase real-time subscriptions if available
        if (this.supabaseEnabled && this.systems.supabase) {
            this.startSupabaseRealtime();
        }

        // Update content every 2 minutes
        setInterval(() => {
            if (this.isInitialized) {
                this.refreshAllSystems();
            }
        }, 120000);

        // Update statistics every 30 seconds
        setInterval(() => {
            if (this.isInitialized && this.systems.dataManager) {
                this.systems.dataManager.updateStatistics();
            }
        }, 30000);
    }

    async startSupabaseRealtime() {
        try {
            // Subscribe to all channels for real-time updates
            await this.systems.supabase.subscribeToAllChannels((payload) => {
                console.log('🔄 Real-time update received:', payload);
                this.handleRealtimeUpdate(payload);
            });

            console.log('✅ Supabase real-time subscriptions started');
        } catch (error) {
            console.error('❌ Failed to start Supabase real-time:', error);
        }
    }

    handleRealtimeUpdate(payload) {
        const { table, eventType, new: newRecord, old: oldRecord } = payload;

        switch (table) {
            case 'users':
                this.handleUserUpdate(eventType, newRecord, oldRecord);
                break;
            case 'activities':
                this.handleActivityUpdate(eventType, newRecord, oldRecord);
                break;
            case 'messages':
                this.handleMessageUpdate(eventType, newRecord, oldRecord);
                break;
            case 'notifications':
                this.handleNotificationUpdate(eventType, newRecord, oldRecord);
                break;
            case 'posts':
                this.handlePostUpdate(eventType, newRecord, oldRecord);
                break;
            default:
                console.log(`Unhandled real-time update for table: ${table}`);
        }
    }

    handleUserUpdate(eventType, newRecord, oldRecord) {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
            // Update user data in local systems
            if (this.systems.dataManager) {
                this.systems.dataManager.updateUserData(newRecord);
            }
        }
    }

    handleActivityUpdate(eventType, newRecord, oldRecord) {
        if (eventType === 'INSERT') {
            // Add new activity to feed
            if (this.systems.dataManager) {
                this.systems.dataManager.addActivity(newRecord);
            }
        }
    }

    handleMessageUpdate(eventType, newRecord, oldRecord) {
        if (eventType === 'INSERT') {
            // Show new message notification
            this.showNotification(`New message from ${newRecord.sender?.full_name || 'Someone'}`, 'info');
        }
    }

    handleNotificationUpdate(eventType, newRecord, oldRecord) {
        if (eventType === 'INSERT') {
            // Show new notification
            this.showNotification(newRecord.title, 'info');
        }
    }

    handlePostUpdate(eventType, newRecord, oldRecord) {
        if (eventType === 'INSERT') {
            // Add new post to feed
            if (this.systems.dataManager) {
                this.systems.dataManager.addPost(newRecord);
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div id="vibecircles-notification" style="
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-family: Arial, sans-serif;
                font-size: 14px;
                z-index: 10001;
                max-width: 300px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                ${type === 'success' ? 'background: linear-gradient(45deg, #4CAF50, #45a049);' : ''}
                ${type === 'error' ? 'background: linear-gradient(45deg, #f44336, #da190b);' : ''}
                ${type === 'info' ? 'background: linear-gradient(45deg, #2196F3, #0b7dda);' : ''}
            ">
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            const notif = document.getElementById('vibecircles-notification');
            if (notif) {
                notif.style.transform = 'translateX(0)';
            }
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            const notif = document.getElementById('vibecircles-notification');
            if (notif) {
                notif.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notif.parentNode) {
                        notif.parentNode.removeChild(notif);
                    }
                }, 300);
            }
        }, 3000);
    }

    // Public API methods
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            supabaseEnabled: this.supabaseEnabled,
            systems: {
                dataManager: !!this.systems.dataManager,
                contentReplacer: !!this.systems.contentReplacer,
                database: !!this.systems.database,
                autoReplacer: !!this.systems.autoReplacer,
                supabase: !!this.systems.supabase
            }
        };
    }

    async syncWithSupabase() {
        if (!this.supabaseEnabled || !this.systems.supabase) {
            throw new Error('Supabase is not available');
        }

        try {
            console.log('🔄 Syncing with Supabase...');
            const data = await this.systems.supabase.syncDataFromSupabase();
            
            // Update local systems with Supabase data
            if (this.systems.dataManager) {
                this.systems.dataManager.updateDataFromSupabase(data);
            }
            
            this.showNotification('Data synced with Supabase successfully!', 'success');
            return data;
        } catch (error) {
            console.error('❌ Failed to sync with Supabase:', error);
            this.showNotification('Failed to sync with Supabase', 'error');
            throw error;
        }
    }

    forceRefresh() {
        this.refreshAllSystems();
        this.showNotification('Forced refresh completed!', 'success');
    }

    getStatistics() {
        if (this.systems.database) {
            return this.systems.database.getStatistics();
        }
        return null;
    }
}

// Initialize the integration system
document.addEventListener('DOMContentLoaded', () => {
    // Load all required scripts
    const scripts = [
        'js/supabase-client.js',
        'js/dynamic-data.js',
        'js/content-replacer.js',
        'js/database-config.js',
        'js/auto-replacer.js'
    ];

    let loadedScripts = 0;
    const totalScripts = scripts.length;

    scripts.forEach(script => {
        const scriptElement = document.createElement('script');
        scriptElement.src = script;
        scriptElement.onload = () => {
            loadedScripts++;
            if (loadedScripts === totalScripts) {
                // All scripts loaded, initialize integration
                window.vibeCirclesIntegration = new VibeCirclesIntegration();
            }
        };
        scriptElement.onerror = () => {
            console.error(`Failed to load script: ${script}`);
            loadedScripts++;
            if (loadedScripts === totalScripts) {
                // Initialize with available systems
                window.vibeCirclesIntegration = new VibeCirclesIntegration();
            }
        };
        document.head.appendChild(scriptElement);
    });
});

// Global access
window.VibeCirclesIntegration = VibeCirclesIntegration;
