// Database Configuration for VibeCircles
class VibeCirclesDatabase {
    constructor() {
        this.dbName = 'vibecircles_db';
        this.version = 1;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            this.db = await this.openDatabase();
            await this.createTables();
            await this.seedData();
            console.log('VibeCircles Database initialized successfully');
        } catch (error) {
            console.error('Database initialization failed:', error);
        }
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createTables(db);
            };
        });
    }

    createTables(db = this.db) {
        // Users table
        if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            userStore.createIndex('username', 'username', { unique: true });
            userStore.createIndex('status', 'status', { unique: false });
        }

        // Posts table
        if (!db.objectStoreNames.contains('posts')) {
            const postStore = db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
            postStore.createIndex('userId', 'userId', { unique: false });
            postStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Messages table
        if (!db.objectStoreNames.contains('messages')) {
            const messageStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
            messageStore.createIndex('senderId', 'senderId', { unique: false });
            messageStore.createIndex('receiverId', 'receiverId', { unique: false });
            messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Activities table
        if (!db.objectStoreNames.contains('activities')) {
            const activityStore = db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
            activityStore.createIndex('userId', 'userId', { unique: false });
            activityStore.createIndex('type', 'type', { unique: false });
            activityStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Friendships table
        if (!db.objectStoreNames.contains('friendships')) {
            const friendshipStore = db.createObjectStore('friendships', { keyPath: 'id', autoIncrement: true });
            friendshipStore.createIndex('user1Id', 'user1Id', { unique: false });
            friendshipStore.createIndex('user2Id', 'user2Id', { unique: false });
            friendshipStore.createIndex('status', 'status', { unique: false });
        }
    }

    async seedData() {
        // Seed users
        const users = [
            {
                id: 1,
                username: 'alexj',
                name: 'Alex Johnson',
                email: 'alex@example.com',
                avatar: 'assets/images/user-sm/1.jpg',
                status: 'online',
                bio: 'Digital nomad and coffee enthusiast ☕',
                lastSeen: new Date(),
                postsCount: 45,
                friendsCount: 234,
                mutualFriends: 3
            },
            {
                id: 2,
                username: 'sarahc',
                name: 'Sarah Chen',
                email: 'sarah@example.com',
                avatar: 'assets/images/user-sm/2.jpg',
                status: 'offline',
                bio: 'Photographer capturing life\'s moments 📸',
                lastSeen: new Date(Date.now() - 3600000),
                postsCount: 67,
                friendsCount: 189,
                mutualFriends: 5
            },
            {
                id: 3,
                username: 'marcusr',
                name: 'Marcus Rodriguez',
                email: 'marcus@example.com',
                avatar: 'assets/images/user-sm/3.jpg',
                status: 'online',
                bio: 'Fitness trainer and wellness advocate 💪',
                lastSeen: new Date(),
                postsCount: 23,
                friendsCount: 456,
                mutualFriends: 2
            },
            {
                id: 4,
                username: 'emmat',
                name: 'Emma Thompson',
                email: 'emma@example.com',
                avatar: 'assets/images/user-sm/4.jpg',
                status: 'away',
                bio: 'Book lover and travel blogger ✈️',
                lastSeen: new Date(Date.now() - 1800000),
                postsCount: 89,
                friendsCount: 321,
                mutualFriends: 7
            },
            {
                id: 5,
                username: 'davidk',
                name: 'David Kim',
                email: 'david@example.com',
                avatar: 'assets/images/user-sm/5.jpg',
                status: 'online',
                bio: 'Tech enthusiast and startup founder 🚀',
                lastSeen: new Date(),
                postsCount: 34,
                friendsCount: 567,
                mutualFriends: 4
            }
        ];

        for (const user of users) {
            await this.addUser(user);
        }

        // Seed posts
        const posts = [
            {
                userId: 1,
                content: 'Just finished an amazing coffee! ☕',
                image: 'assets/images/post/1.jpg',
                likes: 23,
                comments: 5,
                timestamp: new Date(Date.now() - 3600000)
            },
            {
                userId: 2,
                content: 'Captured this beautiful sunset today 🌅',
                image: 'assets/images/post/2.jpg',
                likes: 45,
                comments: 12,
                timestamp: new Date(Date.now() - 7200000)
            },
            {
                userId: 3,
                content: 'Great workout session today! 💪',
                image: 'assets/images/post/3.jpg',
                likes: 67,
                comments: 8,
                timestamp: new Date(Date.now() - 10800000)
            }
        ];

        for (const post of posts) {
            await this.addPost(post);
        }

        // Seed messages
        const messages = [
            {
                senderId: 1,
                receiverId: 0,
                content: 'Hey! How\'s your day going?',
                unread: true,
                timestamp: new Date(Date.now() - 300000)
            },
            {
                senderId: 2,
                receiverId: 0,
                content: 'Did you see the new update?',
                unread: false,
                timestamp: new Date(Date.now() - 600000)
            },
            {
                senderId: 3,
                receiverId: 0,
                content: 'Thanks for the recommendation!',
                unread: true,
                timestamp: new Date(Date.now() - 900000)
            }
        ];

        for (const message of messages) {
            await this.addMessage(message);
        }

        // Seed activities
        const activities = [
            {
                userId: 1,
                type: 'friend_request',
                content: 'sent you a friend request',
                timestamp: new Date(Date.now() - 300000)
            },
            {
                userId: 2,
                type: 'story_added',
                content: 'added their stories',
                timestamp: new Date(Date.now() - 1800000)
            },
            {
                userId: 3,
                type: 'birthday',
                content: 'has birthday today',
                timestamp: new Date()
            }
        ];

        for (const activity of activities) {
            await this.addActivity(activity);
        }
    }

    // User operations
    async addUser(user) {
        return this.performTransaction('users', 'readwrite', store => {
            return store.add(user);
        });
    }

    async getUser(id) {
        return this.performTransaction('users', 'readonly', store => {
            return store.get(id);
        });
    }

    async getAllUsers() {
        return this.performTransaction('users', 'readonly', store => {
            return store.getAll();
        });
    }

    async updateUser(id, updates) {
        return this.performTransaction('users', 'readwrite', store => {
            return store.put({ ...updates, id });
        });
    }

    // Post operations
    async addPost(post) {
        return this.performTransaction('posts', 'readwrite', store => {
            return store.add(post);
        });
    }

    async getPosts(limit = 10) {
        return this.performTransaction('posts', 'readonly', store => {
            return store.getAll();
        });
    }

    // Message operations
    async addMessage(message) {
        return this.performTransaction('messages', 'readwrite', store => {
            return store.add(message);
        });
    }

    async getMessages(userId) {
        return this.performTransaction('messages', 'readonly', store => {
            const index = store.index('receiverId');
            return index.getAll(userId);
        });
    }

    async markMessageAsRead(messageId) {
        return this.performTransaction('messages', 'readwrite', store => {
            return store.get(messageId).then(message => {
                if (message) {
                    message.unread = false;
                    return store.put(message);
                }
            });
        });
    }

    // Activity operations
    async addActivity(activity) {
        return this.performTransaction('activities', 'readwrite', store => {
            return store.add(activity);
        });
    }

    async getActivities(limit = 10) {
        return this.performTransaction('activities', 'readonly', store => {
            return store.getAll();
        });
    }

    // Friendship operations
    async addFriendship(friendship) {
        return this.performTransaction('friendships', 'readwrite', store => {
            return store.add(friendship);
        });
    }

    async getFriendships(userId) {
        return this.performTransaction('friendships', 'readonly', store => {
            const index1 = store.index('user1Id');
            const index2 = store.index('user2Id');
            
            return Promise.all([
                index1.getAll(userId),
                index2.getAll(userId)
            ]).then(([friendships1, friendships2]) => {
                return [...friendships1, ...friendships2];
            });
        });
    }

    // Generic transaction helper
    performTransaction(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);

            try {
                const result = operation(store);
                if (result && result.then) {
                    result.then(resolve).catch(reject);
                } else {
                    resolve(result);
                }
            } catch (error) {
                reject(error);
            }

            transaction.oncomplete = () => {
                // Transaction completed successfully
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    }

    // Statistics
    async getStatistics() {
        const [users, posts, messages, activities] = await Promise.all([
            this.getAllUsers(),
            this.getPosts(),
            this.getMessages(0),
            this.getActivities()
        ]);

        return {
            totalUsers: users.length,
            totalPosts: posts.length,
            totalMessages: messages.length,
            totalActivities: activities.length,
            onlineUsers: users.filter(user => user.status === 'online').length
        };
    }

    // Real-time updates
    subscribeToUpdates(callback) {
        // Simulate real-time updates
        setInterval(async () => {
            const stats = await this.getStatistics();
            callback(stats);
        }, 30000);
    }
}

// Initialize database
document.addEventListener('DOMContentLoaded', async () => {
    window.vibeCirclesDB = new VibeCirclesDatabase();
});
