<div align="center">
  <img src="/Frontend/public/newlogo.svg" alt="Nexora AI Logo" width="150" height="150" />
  <h1>✨ Nexora AI ✨</h1>
  <p><strong>Next-Generation AI Chat Assistant with a Stunning 3D UI</strong></p>
  
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vitejs.dev/)
  [![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://www.mongodb.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

<br />

## 🌟 Overview

**Nexora AI** is a highly interactive, beautifully designed AI chat application built on the MERN stack. It features a fluid, responsive UI with **Framer Motion** animations and **3D ambient background glows** that react to your mouse movements. It seamlessly connects to the OpenAI API (via a robust Express/Node backend) to deliver intelligent, context-aware conversational capabilities.

---

## 🚀 Features

- 💬 **Intelligent Chat Interface**: Communicate seamlessly with advanced AI models.
- 🎨 **Immersive UI/UX**: Features an animated "blob" background, 3D ambient mouse-tracking glow, and smooth component transitions using Framer Motion.
- 📱 **Fully Responsive**: Flawless experience on both desktop and mobile devices with an interactive sidebar.
- 🗄️ **Persistent Chat History**: Previous conversations are saved securely using MongoDB and Mongoose.
- 📝 **Markdown Support**: Renders code blocks and formatted text beautifully using `react-markdown` and `rehype-highlight`.
- ⚡ **Lightning Fast**: Powered by Vite and React 19 on the frontend for instant HMR and optimized builds.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4, Styled-Components
- **Animations**: Framer Motion
- **Graphics/UI**: Three.js, React Three Fiber
- **Icons**: Lucide React
- **Markdown**: React-Markdown, Remark-GFM

### **Backend**
- **Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: OpenAI API SDK
- **Utilities**: CORS, Dotenv, UUID

---

## 📦 Getting Started

### Prerequisites

Make sure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or MongoDB Atlas)
- An [OpenAI API Key](https://platform.openai.com/api-keys)

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd "Nexora AI"
   ```

2. **Setup Backend:**
   ```bash
   cd Backend
   npm install
   ```

3. **Setup Frontend:**
   ```bash
   cd ../Frontend
   npm install
   ```

---

## ⚙️ Environment Variables

Create a `.env` file in the **Backend** directory and add the following variables:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```
*(Note: If you are using NVIDIA NIM or a different endpoint as commented in the code, add the respective keys, e.g., `NVAPI_KEY`)*

---

## ▶️ Running the App Locally

You will need two terminal windows/tabs to run the client and server concurrently.

**1. Start the Backend Server**
```bash
cd Backend
npm run dev
# The server will start on http://localhost:8080 and connect to MongoDB.
```
*(If `npm run dev` is not defined in backend, just run `node server.js` or `npx nodemon server.js`)*

**2. Start the Frontend Development Server**
```bash
cd Frontend
npm run dev
# The Vite app will typically start on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser to experience **Nexora AI**!

---

## 📂 Project Structure

```text
Nexora AI/
├── Backend/                 # Express.js Server
│   ├── models/              # Mongoose DB Models
│   ├── routes/              # API Endpoints (e.g., chat.js)
│   ├── utils/               # Helper functions (e.g., openai.js)
│   ├── .env                 # Backend Secrets (ignored in git)
│   ├── server.js            # Entry point for backend
│   └── package.json         # Backend dependencies
│
└── Frontend/                # React + Vite Client
    ├── public/              # Static assets
    ├── src/                 # React Components, Context, CSS
    │   ├── components/      # Reusable UI elements (e.g., ChatInput)
    │   ├── App.jsx          # Main Layout & Background Animations
    │   ├── Sidebar.jsx      # Navigation & Chat History
    │   ├── ChatWindow.jsx   # Core Chat Interface
    │   └── index.css        # Tailwind directives and global styles
    ├── vite.config.js       # Vite configuration
    └── package.json         # Frontend dependencies
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is licensed under the MIT License.
