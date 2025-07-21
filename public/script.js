class ChatApp {
    constructor() {
        this.socket = null;
        this.currentUser = null;
        this.currentRoom = null;
        this.typingTimer = null;
        this.isTyping = false;
        
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    initializeEventListeners() {
        // Authentication event listeners
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Chat event listeners
        document.getElementById('message-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        const messageInput = document.getElementById('message-input');
        messageInput.addEventListener('input', () => {
            this.handleTyping();
        });

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Modal close event
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal();
            });
        });

        // Click outside modal to close
        document.getElementById('error-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal();
            }
        });
    }

    checkAuthStatus() {
        const token = localStorage.getItem('chatToken');
        const user = localStorage.getItem('chatUser');
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            this.initializeChat(token);
        } else {
            this.showAuthContainer();
        }
    }

    showAuthContainer() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('chat-app').classList.add('hidden');
    }

    showChatApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('chat-app').classList.remove('hidden');
        document.getElementById('username-display').textContent = this.currentUser.username;
    }

    showRegisterForm() {
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('register-form').classList.add('active');
    }

    showLoginForm() {
        document.getElementById('register-form').classList.remove('active');
        document.getElementById('login-form').classList.add('active');
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-modal').classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('error-modal').classList.add('hidden');
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        this.showLoading();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('chatToken', data.token);
                localStorage.setItem('chatUser', JSON.stringify(data.user));
                this.currentUser = data.user;
                this.initializeChat(data.token);
            } else {
                this.showError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        if (!username || !email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }

        this.showLoading();

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('chatToken', data.token);
                localStorage.setItem('chatUser', JSON.stringify(data.user));
                this.currentUser = data.user;
                this.initializeChat(data.token);
            } else {
                this.showError(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    handleLogout() {
        localStorage.removeItem('chatToken');
        localStorage.removeItem('chatUser');
        
        if (this.socket) {
            this.socket.disconnect();
        }
        
        this.currentUser = null;
        this.currentRoom = null;
        this.showAuthContainer();
        
        // Reset forms
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        this.showLoginForm();
    }

    initializeChat(token) {
        this.showLoading();
        
        // Initialize Socket.IO connection
        this.socket = io();
        
        // Socket event listeners
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.socket.emit('join', { token });
        });

        this.socket.on('rooms', (rooms) => {
            this.displayRooms(rooms);
            this.hideLoading();
            this.showChatApp();
        });

        this.socket.on('roomUsers', (users) => {
            this.displayRoomUsers(users);
        });

        this.socket.on('newMessage', (message) => {
            this.displayMessage(message);
        });

        this.socket.on('userJoined', (data) => {
            this.displayNotification(`${data.username} joined the room`);
        });

        this.socket.on('userLeft', (data) => {
            this.displayNotification(`${data.username} left the room`);
        });

        this.socket.on('userTyping', (data) => {
            this.showTypingIndicator(`${data.username} is typing...`);
        });

        this.socket.on('userStoppedTyping', () => {
            this.hideTypingIndicator();
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.showError(error);
            this.hideLoading();
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.showError('Connection lost. Please refresh the page.');
        });
    }

    displayRooms(rooms) {
        const roomsList = document.getElementById('rooms-list');
        roomsList.innerHTML = '';

        rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-item';
            roomElement.dataset.roomId = room.id;
            
            roomElement.innerHTML = `
                <div class="room-name">
                    <i class="fas fa-hashtag"></i>
                    ${room.name}
                </div>
                <div class="room-description">${room.description}</div>
            `;

            roomElement.addEventListener('click', () => {
                this.joinRoom(room.id, room.name);
            });

            roomsList.appendChild(roomElement);
        });
    }

    joinRoom(roomId, roomName) {
        // Update UI
        document.querySelectorAll('.room-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-room-id="${roomId}"]`).classList.add('active');

        // Clear messages
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML = '';

        // Update room header
        document.getElementById('current-room-name').textContent = roomName;

        // Enable message input
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.placeholder = `Type a message in ${roomName}...`;

        // Join room via socket
        this.currentRoom = roomId;
        this.socket.emit('joinRoom', roomId);
    }

    displayRoomUsers(users) {
        const usersList = document.getElementById('users-list');
        const userCount = document.getElementById('room-user-count');
        
        usersList.innerHTML = '';
        userCount.textContent = `${users.length} user${users.length !== 1 ? 's' : ''}`;

        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <div class="user-status"></div>
                <span>${user.username}</span>
            `;
            usersList.appendChild(userElement);
        });
    }

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        const text = messageInput.value.trim();

        if (!text || !this.currentRoom) return;

        this.socket.emit('sendMessage', { text });
        messageInput.value = '';
        
        // Stop typing indicator
        if (this.isTyping) {
            this.socket.emit('stopTyping');
            this.isTyping = false;
        }
    }

    displayMessage(message) {
        const messagesContainer = document.getElementById('messages-container');
        const messageElement = document.createElement('div');
        messageElement.className = 'message';

        const isOwnMessage = message.username === this.currentUser.username;
        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageElement.innerHTML = `
            <div class="message-avatar">
                ${message.username.charAt(0).toUpperCase()}
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-username">${message.username}${isOwnMessage ? ' (You)' : ''}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">${this.escapeHtml(message.text)}</div>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    displayNotification(text) {
        const messagesContainer = document.getElementById('messages-container');
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification';
        notificationElement.textContent = text;

        messagesContainer.appendChild(notificationElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.socket.emit('typing');
        }

        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
            this.isTyping = false;
            this.socket.emit('stopTyping');
        }, 1000);
    }

    showTypingIndicator(text) {
        const typingIndicator = document.getElementById('typing-indicator');
        const typingText = document.getElementById('typing-text');
        typingText.textContent = text;
        typingIndicator.classList.remove('hidden');
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        typingIndicator.classList.add('hidden');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
