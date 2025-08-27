// Content Replacement System for VibeCircles
class ContentReplacer {
    constructor() {
        this.staticData = {
            users: [
                'Paige Turner', 'Bob Frapples', 'Josephin water', 'Petey Cruiser',
                'Bill Yerds', 'Anna Sthesia', 'Paul Molive', 'Anna Mull', 'sufiya eliza'
            ],
            numbers: ['326', '2456', '2'],
            timestamps: ['8 hour ago', 'sun at 5.55 AM', 'sun at 5.40 AM', '2.40 PM'],
            messages: ['Are you there ?', 'hello ! how are you ?'],
            activities: [
                'send you a friend request',
                'add their stories',
                'have birthday today',
                'added a new photo',
                'liked',
                'commented on'
            ]
        };
        
        this.dynamicData = {
            users: [
                'Alex Johnson', 'Sarah Chen', 'Marcus Rodriguez', 'Emma Thompson',
                'David Kim', 'Lisa Wang', 'James Wilson', 'Maria Garcia',
                'Ryan Park', 'Sophie Martin', 'Carlos Silva', 'Aisha Patel'
            ],
            messages: [
                "Hey! How's it going?",
                "What's new with you?",
                "Did you see the latest post?",
                "How was your weekend?",
                "Great to hear from you!",
                "What are you up to?",
                "Thanks for sharing!",
                "That's awesome!",
                "Can't wait to catch up!",
                "Have a great day!",
                "That's interesting!",
                "Love this!",
                "Amazing work!",
                "Keep it up!",
                "So cool!"
            ]
        };
        
        this.init();
    }

    init() {
        this.replaceAllStaticContent();
        this.setupRealTimeUpdates();
    }

    replaceAllStaticContent() {
        this.replaceUserNames();
        this.replaceNumbers();
        this.replaceTimestamps();
        this.replaceMessages();
        this.replaceActivities();
        this.replaceMutualFriends();
    }

    replaceUserNames() {
        this.staticData.users.forEach(staticName => {
            const elements = document.querySelectorAll('*');
            elements.forEach(element => {
                if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
                    // Text node
                    if (element.textContent.includes(staticName)) {
                        const randomUser = this.getRandomUser();
                        element.textContent = element.textContent.replace(staticName, randomUser);
                    }
                } else {
                    // Element with children
                    this.replaceTextInElement(element, staticName);
                }
            });
        });
    }

    replaceTextInElement(element, searchText) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            if (textNode.textContent.includes(searchText)) {
                const randomUser = this.getRandomUser();
                textNode.textContent = textNode.textContent.replace(searchText, randomUser);
            }
        });
    }

    replaceNumbers() {
        // Replace static post count
        const postElements = document.querySelectorAll('h3');
        postElements.forEach(element => {
            if (element.textContent === '326') {
                element.textContent = this.getRandomNumber(200, 500);
            }
        });

        // Replace static friend count
        const friendElements = document.querySelectorAll('h3');
        friendElements.forEach(element => {
            if (element.textContent === '2456') {
                element.textContent = this.getRandomNumber(2000, 3000);
            }
        });

        // Replace notification counts
        const notificationElements = document.querySelectorAll('.count');
        notificationElements.forEach(element => {
            if (element.textContent === '2') {
                element.textContent = this.getRandomNumber(1, 5);
            }
        });
    }

    replaceTimestamps() {
        this.staticData.timestamps.forEach(staticTime => {
            const elements = document.querySelectorAll('*');
            elements.forEach(element => {
                if (element.textContent.includes(staticTime)) {
                    const dynamicTime = this.getRandomTimestamp();
                    element.textContent = element.textContent.replace(staticTime, dynamicTime);
                }
            });
        });
    }

    replaceMessages() {
        this.staticData.messages.forEach(staticMessage => {
            const elements = document.querySelectorAll('*');
            elements.forEach(element => {
                if (element.textContent.includes(staticMessage)) {
                    const dynamicMessage = this.getRandomMessage();
                    element.textContent = element.textContent.replace(staticMessage, dynamicMessage);
                }
            });
        });
    }

    replaceActivities() {
        this.staticData.activities.forEach(staticActivity => {
            const elements = document.querySelectorAll('*');
            elements.forEach(element => {
                if (element.textContent.includes(staticActivity)) {
                    const dynamicActivity = this.getRandomActivity();
                    element.textContent = element.textContent.replace(staticActivity, dynamicActivity);
                }
            });
        });
    }

    replaceMutualFriends() {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            if (element.textContent.includes('1 mutual friend')) {
                const count = this.getRandomNumber(1, 8);
                const text = count === 1 ? '1 mutual friend' : `${count} mutual friends`;
                element.textContent = element.textContent.replace('1 mutual friend', text);
            }
        });
    }

    // Utility functions
    getRandomUser() {
        return this.dynamicData.users[Math.floor(Math.random() * this.dynamicData.users.length)];
    }

    getRandomMessage() {
        return this.dynamicData.messages[Math.floor(Math.random() * this.dynamicData.messages.length)];
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRandomTimestamp() {
        const now = new Date();
        const timeOptions = [
            'just now',
            `${this.getRandomNumber(1, 59)}m ago`,
            `${this.getRandomNumber(1, 23)}h ago`,
            `${this.getRandomNumber(1, 7)}d ago`,
            'yesterday',
            '2 days ago'
        ];
        return timeOptions[Math.floor(Math.random() * timeOptions.length)];
    }

    getRandomActivity() {
        const activities = [
            'sent you a friend request',
            'added their stories',
            'has birthday today',
            'added a new photo',
            'liked your post',
            'commented on your photo',
            'shared a memory',
            'joined a group',
            'started a live stream',
            'created an event'
        ];
        return activities[Math.floor(Math.random() * activities.length)];
    }

    setupRealTimeUpdates() {
        // Update content every 5 minutes
        setInterval(() => {
            this.replaceAllStaticContent();
        }, 300000);
    }
}

// Initialize content replacement
document.addEventListener('DOMContentLoaded', () => {
    window.contentReplacer = new ContentReplacer();
});
