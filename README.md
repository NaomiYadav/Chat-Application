# Real-Time Chat Application

A modern, responsive real-time chat application built with Node.js, Socket.IO, HTML, CSS, and JavaScript. This project demonstrates real-time communication, user authentication, and modern web development practices suitable for BTech 3rd year internship projects.

## 🚀 Features

### Core Functionality
- **Real-time messaging** using WebSockets (Socket.IO)
- **User authentication** with registration and login
- **Multiple chat rooms** with different topics
- **Responsive design** for all screen sizes
- **Typing indicators** to show when users are typing
- **User presence** showing who's online in each room
- **Message history** displayed in real-time

### Technical Features
- **JWT-based authentication** for secure user sessions
- **Password hashing** using bcryptjs
- **RESTful API** endpoints for user management
- **File-based data storage** (easily upgradeable to database)
- **CORS enabled** for cross-origin requests
- **Error handling** with user-friendly messages
- **Modern ES6+ JavaScript** with class-based architecture

## 🛠️ Technology Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox/grid
- **Vanilla JavaScript** - No framework dependencies
- **Socket.IO Client** - Real-time communication
- **Font Awesome** - Icons

## 📋 Prerequisites

Before running this application, make sure you have:
- **Node.js** (v14 or higher) installed
- **npm** (Node Package Manager)
- A modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation & Setup

1. **Clone or download** this repository
2. **Navigate** to the project directory:
   ```bash
   cd Chat-Application
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the server**:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open your browser and go to `http://localhost:3000`

## 📁 Project Structure

```
Chat-Application/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styling
│   └── script.js          # Frontend JavaScript
├── data/                  # Data storage
│   ├── users.json         # User data
│   └── rooms.json         # Chat rooms data
├── server.js              # Main server file
├── package.json           # Project dependencies
├── .env                   # Environment variables
└── README.md              # Project documentation
```

## 🎯 How to Use

### 1. Registration/Login
- Open the application in your browser
- **New users**: Click "Sign up" and create an account
- **Existing users**: Sign in with your email and password

### 2. Joining Rooms
- Once logged in, you'll see available chat rooms in the sidebar
- Click on any room to join and start chatting
- Default rooms include:
  - **General** - General discussions
  - **Technology** - Tech-related conversations
  - **Random** - Casual conversations

### 3. Chatting
- Type your message in the input field at the bottom
- Press **Enter** or click the send button to send
- See real-time messages from other users
- Notice typing indicators when others are typing

### 4. Features to Explore
- **User presence**: See who's online in the current room
- **Real-time updates**: Messages appear instantly
- **Responsive design**: Try on different screen sizes
- **Multiple rooms**: Switch between different chat rooms

## 🔧 Configuration

### Environment Variables (.env)
```env
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
```

### Default Chat Rooms
The application comes with three default rooms:
- General (ID: general)
- Technology (ID: tech)
- Random (ID: random)

You can modify these in `server.js` or add new ones to the `data/rooms.json` file.

## 🚀 Deployment

### Local Development
- Use `npm run dev` for development with auto-restart
- Access at `http://localhost:3000`

### Production Deployment
This application is optimized for deployment on **Render** (recommended for Socket.IO apps):

1. **Push to GitHub**
2. **Connect to Render** ([render.com](https://render.com))
3. **Deploy as Web Service**
4. **See detailed guide**: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

**Live Demo**: Once deployed, you'll get a URL like `https://your-app-name.onrender.com`

### Why Render over Vercel?
- ✅ **Full WebSocket Support**: Perfect for Socket.IO
- ✅ **Persistent Connections**: Real-time apps work flawlessly  
- ✅ **Free Tier**: Great for portfolios and demos
- ✅ **Auto-Deploy**: Updates on every git push

## 🔒 Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Input Sanitization**: HTML content is escaped to prevent XSS
- **CORS Protection**: Configurable cross-origin requests
- **Environment Variables**: Sensitive data stored in .env file

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop** computers (1200px+)
- **Tablets** (768px - 1199px)
- **Mobile** phones (up to 767px)

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Gradient Backgrounds**: Eye-catching visual appeal
- **Smooth Animations**: CSS transitions and animations
- **Intuitive Navigation**: Easy-to-use interface
- **Visual Feedback**: Loading states, error messages, success indicators

## 🔄 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Chat
- `GET /api/rooms` - Get available chat rooms
- Socket events for real-time communication

## 🧪 Testing the Application

### Manual Testing Scenarios
1. **User Registration**: Create multiple accounts
2. **Multiple Browsers**: Open in different browsers/tabs
3. **Real-time Messaging**: Send messages between users
4. **Room Switching**: Join different rooms
5. **Responsive Testing**: Test on mobile devices
6. **Network Issues**: Test disconnect/reconnect scenarios

## 🚀 Future Enhancements

### Potential Improvements
- **Database Integration** (MongoDB, PostgreSQL)
- **File/Image Sharing** capabilities
- **Private Messaging** between users
- **Message History** persistence
- **User Profiles** with avatars
- **Admin Panel** for room management
- **Push Notifications** for new messages
- **Message Search** functionality
- **Emoji Support** in messages
- **Dark/Light Theme** toggle

## 🐛 Troubleshooting

### Common Issues
1. **Port already in use**: Change PORT in .env file
2. **Cannot connect**: Check if server is running
3. **Authentication errors**: Clear browser local storage
4. **Real-time issues**: Refresh the page

### Debug Mode
Set `NODE_ENV=development` in .env for detailed logging.

## 📚 Learning Outcomes

This project demonstrates:
- **Real-time web applications** using WebSockets
- **User authentication** and authorization
- **RESTful API** design and implementation
- **Responsive web design** principles
- **JavaScript** event handling and DOM manipulation
- **Node.js** server-side development
- **Modern CSS** layout techniques
- **Project structure** and organization

## 🤝 Contributing

This is an educational project. Feel free to:
- Fork the repository
- Add new features
- Fix bugs
- Improve documentation
- Share feedback

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created as a BTech 3rd year internship project demonstrating full-stack web development skills.

## 🙏 Acknowledgments

- Socket.IO team for excellent real-time communication library
- Express.js community for the robust web framework
- Font Awesome for beautiful icons
- MDN Web Docs for comprehensive documentation

---

**Happy Chatting! 💬**

