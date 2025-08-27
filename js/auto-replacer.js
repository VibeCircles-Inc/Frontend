// Automatic Content Replacer for VibeCircles
class AutoReplacer {
    constructor() {
        this.replacements = {
            // User names
            'Paige Turner': ['Alex Johnson', 'Sarah Chen', 'Marcus Rodriguez', 'Emma Thompson', 'David Kim'],
            'Bob Frapples': ['Lisa Wang', 'James Wilson', 'Maria Garcia', 'Ryan Park', 'Sophie Martin'],
            'Josephin water': ['Carlos Silva', 'Aisha Patel', 'Michael Brown', 'Jennifer Lee', 'Robert Taylor'],
            'Petey Cruiser': ['Amanda White', 'Christopher Davis', 'Jessica Miller', 'Daniel Anderson', 'Ashley Wilson'],
            'Bill Yerds': ['Matthew Johnson', 'Nicole Garcia', 'Kevin Martinez', 'Rachel Rodriguez', 'Steven Lee'],
            'Anna Sthesia': ['Michelle Brown', 'Andrew Davis', 'Stephanie Wilson', 'Joshua Taylor', 'Brittany Anderson'],
            'Paul Molive': ['Brandon Thomas', 'Melissa Jackson', 'Jonathan White', 'Lauren Harris', 'Ryan Clark'],
            'Anna Mull': ['Katherine Lewis', 'Nicholas Hall', 'Amber Young', 'Tyler King', 'Samantha Wright'],
            'sufiya eliza': ['Victoria Green', 'Jordan Baker', 'Hannah Adams', 'Zachary Nelson', 'Madison Carter'],

            // Numbers
            '326': () => Math.floor(Math.random() * 500) + 200,
            '2456': () => Math.floor(Math.random() * 3000) + 2000,
            '2': () => Math.floor(Math.random() * 10) + 1,

            // Timestamps
            '8 hour ago': () => this.getRandomTimeAgo(),
            'sun at 5.55 AM': () => this.getRandomTimeAgo(),
            'sun at 5.40 AM': () => this.getRandomTimeAgo(),
            '2.40 PM': () => this.getRandomTimeAgo(),

            // Messages
            'Are you there ?': [
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
            ],
            'hello ! how are you ?': [
                "Hi there! How are you doing?",
                "Hey! How's everything?",
                "Hello! How's your day?",
                "Hi! How are things?",
                "Hey there! How's it going?",
                "Hello! How are you feeling?",
                "Hi! How's life treating you?",
                "Hey! How's your week?",
                "Hello! How are you holding up?",
                "Hi! How's everything going?"
            ],

            // Activities
            'send you a friend request': [
                'sent you a friend request',
                'wants to be your friend',
                'requested to connect',
                'sent a connection request',
                'wants to add you as a friend'
            ],
            'add their stories': [
                'added their stories',
                'posted a new story',
                'shared a story',
                'created a new story',
                'uploaded a story'
            ],
            'have birthday today': [
                'has birthday today',
                'is celebrating their birthday',
                'turns another year older today',
                'has a birthday today',
                'is having their birthday'
            ],
            'added a new photo': [
                'added a new photo',
                'posted a new picture',
                'shared a photo',
                'uploaded a new image',
                'posted a photo'
            ],
            'liked': [
                'liked',
                'loved',
                'reacted to',
                'gave a thumbs up to',
                'enjoyed'
            ],
            'commented on': [
                'commented on',
                'left a comment on',
                'wrote on',
                'said something about',
                'shared thoughts on'
            ],

            // Mutual friends
            '1 mutual friend': () => {
                const count = Math.floor(Math.random() * 8) + 1;
                return count === 1 ? '1 mutual friend' : `${count} mutual friends`;
            }
        };

        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.replaceAll());
        } else {
            this.replaceAll();
        }

        // Also run after a short delay to catch any dynamically loaded content
        setTimeout(() => this.replaceAll(), 1000);
        setTimeout(() => this.replaceAll(), 3000);
    }

    replaceAll() {
        this.replaceTextNodes();
        this.replaceAttributes();
        this.replacePlaceholders();
    }

    replaceTextNodes() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip script and style tags
                    const parent = node.parentElement;
                    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            let text = textNode.textContent;
            let modified = false;

            Object.keys(this.replacements).forEach(key => {
                if (text.includes(key)) {
                    const replacement = this.replacements[key];
                    let newValue;

                    if (typeof replacement === 'function') {
                        newValue = replacement();
                    } else if (Array.isArray(replacement)) {
                        newValue = replacement[Math.floor(Math.random() * replacement.length)];
                    } else {
                        newValue = replacement;
                    }

                    text = text.replace(new RegExp(this.escapeRegExp(key), 'g'), newValue);
                    modified = true;
                }
            });

            if (modified) {
                textNode.textContent = text;
            }
        });
    }

    replaceAttributes() {
        // Replace in data attributes, placeholders, etc.
        const elements = document.querySelectorAll('[data-name], [placeholder], [title], [alt]');
        elements.forEach(element => {
            Object.keys(this.replacements).forEach(key => {
                const replacement = this.replacements[key];
                let newValue;

                if (typeof replacement === 'function') {
                    newValue = replacement();
                } else if (Array.isArray(replacement)) {
                    newValue = replacement[Math.floor(Math.random() * replacement.length)];
                } else {
                    newValue = replacement;
                }

                // Replace in various attributes
                ['data-name', 'placeholder', 'title', 'alt'].forEach(attr => {
                    if (element.hasAttribute(attr)) {
                        const attrValue = element.getAttribute(attr);
                        if (attrValue && attrValue.includes(key)) {
                            element.setAttribute(attr, attrValue.replace(new RegExp(this.escapeRegExp(key), 'g'), newValue));
                        }
                    }
                });
            });
        });
    }

    replacePlaceholders() {
        // Replace in option values
        const options = document.querySelectorAll('option');
        options.forEach(option => {
            Object.keys(this.replacements).forEach(key => {
                if (option.value && option.value.includes(key)) {
                    const replacement = this.replacements[key];
                    let newValue;

                    if (typeof replacement === 'function') {
                        newValue = replacement();
                    } else if (Array.isArray(replacement)) {
                        newValue = replacement[Math.floor(Math.random() * replacement.length)];
                    } else {
                        newValue = replacement;
                    }

                    option.value = option.value.replace(new RegExp(this.escapeRegExp(key), 'g'), newValue);
                    option.textContent = option.textContent.replace(new RegExp(this.escapeRegExp(key), 'g'), newValue);
                }
            });
        });
    }

    getRandomTimeAgo() {
        const timeOptions = [
            'just now',
            `${Math.floor(Math.random() * 59) + 1}m ago`,
            `${Math.floor(Math.random() * 23) + 1}h ago`,
            `${Math.floor(Math.random() * 7) + 1}d ago`,
            'yesterday',
            '2 days ago',
            '3 days ago',
            'last week'
        ];
        return timeOptions[Math.floor(Math.random() * timeOptions.length)];
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Method to manually trigger replacement
    refresh() {
        this.replaceAll();
    }
}

// Initialize the auto replacer
window.autoReplacer = new AutoReplacer();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoReplacer;
}
