# 🎯 Referral System API

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![Make.com](https://img.shields.io/badge/Make.com-6366f1?style=for-the-badge&logo=integromat&logoColor=white)](https://make.com/)

> 🚀 A powerful, production-ready referral system API built with Node.js, Express, and Firebase Firestore. Seamlessly integrates with Make.com for automated workflows and business process automation.

## ✨ Features

### 🎮 Core Functionality
- 🏆 **Points Management** - Add, track, and manage user reward points
- 🔗 **Referral Links** - Generate unique referral codes and tracking links  
- 📊 **Analytics** - Built-in referral statistics and performance metrics
- 🔄 **Atomic Operations** - Transaction-safe point updates

### 🛠️ Technical Features  
- ⚡ **Lightning Fast** - Optimized Express.js server with minimal latency
- 🔥 **Firebase Integration** - Real-time Firestore database with auto-scaling
- 🌐 **RESTful API** - Clean, well-documented endpoints
- 🔒 **Production Ready** - Comprehensive error handling and validation
- 📈 **Scalable** - Built to handle high-traffic applications

### 🤖 Automation Ready
- 🔌 **Make.com Integration** - Pre-built webhook endpoints for automation
- 🎯 **Event-Driven** - React to user actions in real-time
- 📱 **Multi-Platform** - Works with websites, mobile apps, and SaaS platforms

## 🚀 Quick Start

### Prerequisites
- 📦 Node.js (v16 or higher)
- 🔥 Firebase project with Firestore enabled
- 🎯 Make.com account (optional, for automation)

### Installation

```bash
# Clone the repository
git clone https://github.com/MohamedZidane11/nodejs-referral-system-api.git
cd nodejs-referral-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Start the server
npm run dev
```

### 🔥 Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Generate a service account key
4. Save as `serviceAccountKey.json` in project root

## 📚 API Endpoints

### 🏆 Points Management

#### Get User Points
```http
GET /api/users/:id/points
```

#### Add Points
```http
POST /api/users/:id/add-points
Content-Type: application/json
```

#### Create Referral Link
```http
POST /api/referrals/create
Content-Type: application/json
```

#### Get Referral Stats
```http
GET /api/referrals/:code/stats
```

### 🔌 Webhook Integration

#### Make.com Webhook Endpoint
```http
POST /api/webhook-test
Content-Type: application/json
```

## 🤖 Make.com Integration

### 🔧 Setup Guide
1. Create webhook in Make.com scenario
2. Use webhook URL in your application
3. Configure HTTP modules to call API endpoints

[📖 **Detailed Make.com Integration Guide**](docs/make-integration.md)

## 🛠️ Development

### Run in Development Mode
```bash
npm run dev
```

### Environment Variables
```bash
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
BASE_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
```

## 🔐 Security Features

- 🛡️ **Input Validation** - All endpoints validate request data
- 🔒 **Firebase Security Rules** - Database-level access control
- 🚨 **Error Handling** - Comprehensive error responses
- 📝 **Audit Logging** - All webhook activities logged
- 🌐 **CORS Support** - Configurable cross-origin requests

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes  
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🐛 Issues
Found a bug? Please [open an issue](https://github.com/yourusername/referral-system-api/issues) with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- System information

<div align="center">

**⭐ Star this repository if you found it helpful!**

</div>
