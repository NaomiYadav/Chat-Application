const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data storage (In production, use a proper database)
const DATA_FILE = path.join(__dirname, 'data', 'users.json');
const ROOMS_FILE = path.join(__dirname, 'data', 'rooms.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize data files if they don't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

if (!fs.existsSync(ROOMS_FILE)) {
    const defaultRooms = [
        { id: 'general', name: 'General', description: 'General discussion' },
        { id: 'tech', name: 'Technology', description: 'Tech discussions' },
        { id: 'random', name: 'Random', description: 'Random conversations' }
    ];
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(defaultRooms));
}

// Helper functions
const readUsers = () => {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (error) {
        return [];
    }
};

const writeUsers = (users) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

const readRooms = () => {
    try {
        return JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf8'));
    } catch (error) {
        return [];
    }
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Store active users and their rooms
const activeUsers = new Map();
const roomUsers = new Map();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const users = readUsers();
        
        // Check if user already exists
        const existingUser = users.find(user => user.email === email || user.username === username);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        writeUsers(users);

        // Generate JWT token
        const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const users = readUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get chat rooms
app.get('/api/rooms', (req, res) => {
    const rooms = readRooms();
    res.json(rooms);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user joining
    socket.on('join', (userData) => {
        try {
            const decoded = jwt.verify(userData.token, JWT_SECRET);
            const user = {
                id: decoded.userId,
                username: decoded.username,
                socketId: socket.id
            };
            
            activeUsers.set(socket.id, user);
            console.log(`User ${user.username} joined`);
            
            // Send available rooms
            const rooms = readRooms();
            socket.emit('rooms', rooms);
            
        } catch (error) {
            console.error('JWT verification failed:', error);
            socket.emit('error', 'Authentication failed');
        }
    });

    // Handle joining a room
    socket.on('joinRoom', (roomId) => {
        const user = activeUsers.get(socket.id);
        if (!user) return;

        // Leave previous room if any
        if (user.currentRoom) {
            socket.leave(user.currentRoom);
            const prevRoomUsers = roomUsers.get(user.currentRoom) || [];
            const updatedPrevUsers = prevRoomUsers.filter(u => u.socketId !== socket.id);
            roomUsers.set(user.currentRoom, updatedPrevUsers);
            socket.to(user.currentRoom).emit('userLeft', { username: user.username });
        }

        // Join new room
        socket.join(roomId);
        user.currentRoom = roomId;
        activeUsers.set(socket.id, user);

        // Add user to room users list
        const currentRoomUsers = roomUsers.get(roomId) || [];
        currentRoomUsers.push(user);
        roomUsers.set(roomId, currentRoomUsers);

        // Notify others in the room
        socket.to(roomId).emit('userJoined', { username: user.username });
        
        // Send current room users to the joining user
        socket.emit('roomUsers', currentRoomUsers.map(u => ({ username: u.username })));
        
        console.log(`User ${user.username} joined room ${roomId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', (messageData) => {
        const user = activeUsers.get(socket.id);
        if (!user || !user.currentRoom) return;

        const message = {
            id: Date.now().toString(),
            username: user.username,
            text: messageData.text,
            timestamp: new Date().toISOString(),
            room: user.currentRoom
        };

        // Broadcast message to all users in the room
        io.to(user.currentRoom).emit('newMessage', message);
        console.log(`Message from ${user.username} in ${user.currentRoom}: ${message.text}`);
    });

    // Handle typing indicators
    socket.on('typing', () => {
        const user = activeUsers.get(socket.id);
        if (user && user.currentRoom) {
            socket.to(user.currentRoom).emit('userTyping', { username: user.username });
        }
    });

    socket.on('stopTyping', () => {
        const user = activeUsers.get(socket.id);
        if (user && user.currentRoom) {
            socket.to(user.currentRoom).emit('userStoppedTyping', { username: user.username });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const user = activeUsers.get(socket.id);
        if (user) {
            console.log(`User ${user.username} disconnected`);
            
            // Remove from room users
            if (user.currentRoom) {
                const roomUsersList = roomUsers.get(user.currentRoom) || [];
                const updatedUsers = roomUsersList.filter(u => u.socketId !== socket.id);
                roomUsers.set(user.currentRoom, updatedUsers);
                socket.to(user.currentRoom).emit('userLeft', { username: user.username });
            }
            
            activeUsers.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the chat application`);
});
