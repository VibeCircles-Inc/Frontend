// VibeCircles Dynamic Data Management System
class VibeCirclesDataManager {
    constructor() {
        this.users = [];
        this.activities = [];
        this.messages = [];
        this.statistics = {};
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadMockData();
        this.setupEventListeners();
        this.updateAllContent();
        this.startRealTimeUpdates();
    }

    // User Management System
    loadMockData() {
        // Real user data to replace static names
        this.users = [
            {
                id: 1,
                name: "Alex Johnson",
                username: "alexj",
                avatar: "assets/images/user-sm/1.jpg",
                status: "online",
                mutualFriends: 3,
                lastSeen: new Date(),
                bio: "Digital nomad and coffee enthusiast ☕"
            },
            {
                id: 2,
                name: "Sarah Chen",
                username: "sarahc",
                avatar: "assets/images/user-sm/2.jpg",
                status: "offline",
                mutualFriends: 5,
                lastSeen: new Date(Date.now() - 3600000),
                bio: "Photographer capturing life's moments 📸"
            },
            {
                id: 3,
                name: "Marcus Rodriguez",
                username: "marcusr",
                avatar: "assets/images/user-sm/3.jpg",
                status: "online",
                mutualFriends: 2,
                lastSeen: new Date(),
                bio: "Fitness trainer and wellness advocate 💪"
            },
            {
                id: 4,
                name: "Emma Thompson",
                username: "emmat",
                avatar: "assets/images/user-sm/4.jpg",
                status: "away",
                mutualFriends: 7,
                lastSeen: new Date(Date.now() - 1800000),
                bio: "Book lover and travel blogger ✈️"
            },
            {
                id: 5,
                name: "David Kim",
                username: "davidk",
                avatar: "assets/images/user-sm/5.jpg",
                status: "online",
                mutualFriends: 4,
                lastSeen: new Date(),
                bio: "Tech enthusiast and startup founder 🚀"
            },
            {
                id: 6,
                name: "Lisa Wang",
                username: "lisaw",
                avatar: "assets/images/user-sm/6.jpg",
                status: "offline",
                mutualFriends: 1,
                lastSeen: new Date(Date.now() - 7200000),
                bio: "Artist and creative soul 🎨"
            },
            {
                id: 7,
                name: "James Wilson",
                username: "jamesw",
                avatar: "assets/images/user-sm/7.jpg",
                status: "online",
                mutualFriends: 6,
                lastSeen: new Date(),
                bio: "Music producer and DJ 🎵"
            },
            {
                id: 8,
                name: "Maria Garcia",
                username: "mariag",
                avatar: "assets/images/user-sm/8.jpg",
                status: "away",
                mutualFriends: 3,
                lastSeen: new Date(Date.now() - 900000),
                bio: "Chef and food blogger 👩‍🍳"
            }
        ];

        // Current user
        this.currentUser = {
            id: 0,
            name: "You",
            username: "currentuser",
            avatar: "assets/images/user-sm/1.jpg",
            status: "online",
            posts: 0,
            friends: 0
        };

        // Dynamic statistics
        this.statistics = {
            totalPosts: Math.floor(Math.random() * 500) + 200,
            totalFriends: Math.floor(Math.random() * 3000) + 2000,
            totalMessages: Math.floor(Math.random() * 50) + 10,
            totalNotifications: Math.floor(Math.random() * 10) + 2
        };

        // Activity feed data
        this.activities = [
            {
                id: 1,
                type: "friend_request",
                user: this.users[0],
                timestamp: new Date(Date.now() - 300000),
                message: "sent you a friend request"
            },
            {
                id: 2,
                type: "story_added",
                user: this.users[1],
                timestamp: new Date(Date.now() - 1800000),
                message: "added their stories"
            },
            {
                id: 3,
                type: "birthday",
                user: this.users[2],
                timestamp: new Date(),
                message: "has birthday today"
            },
            {
                id: 4,
                type: "photo_added",
                user: this.users[3],
                timestamp: new Date(Date.now() - 900000),
                message: "added a new photo"
            },
            {
                id: 5,
                type: "liked_photo",
                user: this.users[4],
                target: this.users[0],
                timestamp: new Date(Date.now() - 600000),
                message: "liked"
            },
            {
                id: 6,
                type: "commented",
                user: this.users[5],
                target: this.users[1],
                timestamp: new Date(Date.now() - 450000),
                message: "commented on"
            }
        ];

        // Messages data
        this.messages = [
            {
                id: 1,
                user: this.users[0],
                content: "Hey! How's your day going?",
                timestamp: new Date(Date.now() - 300000),
                unread: true
            },
            {
                id: 2,
                user: this.users[1],
                content: "Did you see the new update?",
                timestamp: new Date(Date.now() - 600000),
                unread: false
            },
            {
                id: 3,
                user: this.users[2],
                content: "Thanks for the recommendation!",
                timestamp: new Date(Date.now() - 900000),
                unread: true
            },
            {
                id: 4,
                user: this.users[3],
                content: "Let's catch up soon!",
                timestamp: new Date(Date.now() - 1200000),
                unread: false
            }
        ];
    }

    // Activity Feed System
    updateActivityFeed() {
        const activityElements = document.querySelectorAll('[data-activity-type]');
        activityElements.forEach((element, index) => {
            const activity = this.activities[index % this.activities.length];
            if (activity) {
                this.renderActivity(element, activity);
            }
        });
    }

    renderActivity(element, activity) {
        const timeAgo = this.getTimeAgo(activity.timestamp);
        const user = activity.user;
        
        element.innerHTML = `
            <div class="media">
                <img src="${user.avatar}" alt="${user.name}">
                <div class="media-body">
                    <div>
                        <h5 class="mt-0"><span>${user.name}</span> ${activity.message}</h5>
                        <h6>${timeAgo}</h6>
                    </div>
                </div>
            </div>
        `;
    }

    // Statistics Dashboard
    updateStatistics() {
        // Update total posts
        const postElements = document.querySelectorAll('h3:contains("326"), span:contains("total posts")');
        postElements.forEach(element => {
            if (element.textContent.includes('326')) {
                element.textContent = this.statistics.totalPosts;
            }
        });

        // Update total friends
        const friendElements = document.querySelectorAll('h3:contains("2456"), span:contains("total friends")');
        friendElements.forEach(element => {
            if (element.textContent.includes('2456')) {
                element.textContent = this.statistics.totalFriends;
            }
        });

        // Update notification counts
        const notificationElements = document.querySelectorAll('.count');
        notificationElements.forEach(element => {
            if (element.textContent === '2') {
                element.textContent = this.statistics.totalNotifications;
            }
        });
    }

    // Messaging System
    updateMessages() {
        const messageElements = document.querySelectorAll('[data-message-type]');
        messageElements.forEach((element, index) => {
            const message = this.messages[index % this.messages.length];
            if (message) {
                this.renderMessage(element, message);
            }
        });
    }

    renderMessage(element, message) {
        const timeAgo = this.getTimeAgo(message.timestamp);
        const user = message.user;
        
        element.innerHTML = `
            <div class="media">
                <img src="${user.avatar}" alt="${user.name}">
                <div class="media-body">
                    <div>
                        <h5 class="mt-0">${user.name}</h5>
                        <h6>${message.content}</h6>
                    </div>
                </div>
            </div>
            ${message.unread ? '<div class="active-status"><span class="active"></span></div>' : ''}
        `;
    }

    // User List Management
    updateUserLists() {
        const userElements = document.querySelectorAll('[data-user-type]');
        userElements.forEach((element, index) => {
            const user = this.users[index % this.users.length];
            if (user) {
                this.renderUser(element, user);
            }
        });
    }

    renderUser(element, user) {
        const mutualText = user.mutualFriends > 1 ? 
            `${user.mutualFriends} mutual friends` : 
            `${user.mutualFriends} mutual friend`;
        
        element.innerHTML = `
            <div class="media">
                <img src="${user.avatar}" alt="${user.name}">
                <div class="media-body">
                    <div>
                        <h5 class="mt-0">${user.name}</h5>
                        <h6>${mutualText}</h6>
                    </div>
                </div>
            </div>
        `;
    }

    // Content Management
    updateContent() {
        // Replace static user names in various contexts
        this.replaceStaticNames();
        this.updateTimestamps();
        this.updateMessageContent();
    }

    replaceStaticNames() {
        const staticNames = [
            'Paige Turner', 'Bob Frapples', 'Josephin water', 'Petey Cruiser',
            'Bill Yerds', 'Anna Sthesia', 'Paul Molive', 'Anna Mull', 'sufiya eliza'
        ];

        staticNames.forEach(staticName => {
            const elements = document.querySelectorAll(`*:contains("${staticName}")`);
            elements.forEach(element => {
                const randomUser = this.users[Math.floor(Math.random() * this.users.length)];
                if (randomUser) {
                    element.innerHTML = element.innerHTML.replace(staticName, randomUser.name);
                }
            });
        });
    }

    updateTimestamps() {
        // Replace static timestamps
        const timePatterns = [
            { pattern: '8 hour ago', replacement: this.getTimeAgo(new Date(Date.now() - 28800000)) },
            { pattern: 'sun at 5.55 AM', replacement: this.getTimeAgo(new Date(Date.now() - 3600000)) },
            { pattern: 'sun at 5.40 AM', replacement: this.getTimeAgo(new Date(Date.now() - 3900000)) },
            { pattern: '2.40 PM', replacement: this.getTimeAgo(new Date(Date.now() - 1800000)) }
        ];

        timePatterns.forEach(({ pattern, replacement }) => {
            const elements = document.querySelectorAll(`*:contains("${pattern}")`);
            elements.forEach(element => {
                element.innerHTML = element.innerHTML.replace(pattern, replacement);
            });
        });
    }

    updateMessageContent() {
        const staticMessages = [
            'Are you there ?',
            'hello ! how are you ?'
        ];

        const dynamicMessages = [
            "Hey! How's it going?",
            "What's new with you?",
            "Did you see the latest post?",
            "How was your weekend?",
            "Great to hear from you!",
            "What are you up to?",
            "Thanks for sharing!",
            "That's awesome!",
            "Can't wait to catch up!",
            "Have a great day!"
        ];

        staticMessages.forEach(staticMsg => {
            const elements = document.querySelectorAll(`*:contains("${staticMsg}")`);
            elements.forEach(element => {
                const randomMsg = dynamicMessages[Math.floor(Math.random() * dynamicMessages.length)];
                element.innerHTML = element.innerHTML.replace(staticMsg, randomMsg);
            });
        });
    }

    // Utility Functions
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    // Real-time Updates
    startRealTimeUpdates() {
        setInterval(() => {
            this.updateStatistics();
            this.updateActivityFeed();
            this.updateMessages();
        }, 30000); // Update every 30 seconds
    }

    // Event Listeners
    setupEventListeners() {
        // Handle friend requests
        document.addEventListener('click', (e) => {
            if (e.target.textContent === 'confirm') {
                this.handleFriendRequest(e.target, 'accept');
            } else if (e.target.textContent === 'delete') {
                this.handleFriendRequest(e.target, 'reject');
            }
        });

        // Handle message interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.message-btn')) {
                this.updateMessageCount();
            }
        });
    }

    handleFriendRequest(button, action) {
        const listItem = button.closest('li');
        if (action === 'accept') {
            this.statistics.totalFriends++;
            listItem.style.display = 'none';
        } else {
            listItem.style.display = 'none';
        }
        this.updateStatistics();
    }

    updateMessageCount() {
        this.statistics.totalMessages = Math.max(0, this.statistics.totalMessages - 1);
        this.updateStatistics();
    }

    // Main update function
    updateAllContent() {
        this.updateStatistics();
        this.updateActivityFeed();
        this.updateMessages();
        this.updateUserLists();
        this.updateContent();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vibeCirclesData = new VibeCirclesDataManager();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibeCirclesDataManager;
}
