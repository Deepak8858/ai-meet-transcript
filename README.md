# AI-Powered Meeting Notes Summarizer

A production-ready web application that uses AI to generate intelligent summaries from meeting transcripts and notes. Built with Next.js frontend, Node.js/Express backend, and powered by Groq AI with Gemini fallback.

## ✨ Features

- **📄 File Upload**: Drag-and-drop support for text files (.txt, .md, .json, .csv)
- **🎯 Custom Prompts**: Tailor summaries with specific instructions
- **🤖 AI Summarization**: Powered by Groq (with Gemini fallback)
- **✏️ Editable Results**: Modify generated summaries before sharing
- **📧 Email Sharing**: Send summaries to multiple recipients
- **📱 Responsive Design**: Works on all devices
- **🔄 Session Management**: Track and manage your summaries
- **⬇️ Download Option**: Save summaries as text files
- **⚡ Real-time Processing**: Fast AI-powered summarization

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Groq API key (get from [console.groq.com](https://console.groq.com/keys))
- Gmail account with app password (see setup below)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd meet-with-ai

# Install dependencies for both frontend and backend
npm install

# Navigate to backend and install dependencies
cd backend
npm install

# Navigate to frontend and install dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Configuration

1. Copy the environment template:
```bash
cd backend
cp .env.example .env
```

2. Edit `.env` with your configuration:
```bash
# Required: Get from https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# Required: Gmail SMTP setup (see Gmail setup below)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here

# Optional: Gemini API key as fallback
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Gmail SMTP Setup

1. Enable 2-factor authentication on your Google account
2. Generate an app password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification
   - Go to "App passwords"
   - Generate password for "Mail" → "Other" → "AI Meeting Summarizer"
   - Copy the 16-character password to `GMAIL_APP_PASSWORD`

### 3. Local Development

#### Start the Backend
```bash
cd backend
npm run dev
# Backend will run on http://localhost:5000
```

#### Start the Frontend
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:3000
```

#### Test the Application
1. Open http://localhost:3000
2. Upload a meeting transcript file
3. Enter a custom prompt (e.g., "Summarize in bullet points for executives")
4. Generate and share your summary!

## 🏗️ Project Structure

```
meet-with-ai/
├── frontend/                 # Next.js frontend
│   ├── app/                 # App directory (Next.js 13+)
│   ├── components/          # React components
│   ├── lib/                # Utility functions
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── .env.example       # Frontend environment template
├── backend/                 # Node.js/Express backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Backend environment template
└── README.md              # This file
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy frontend**:
```bash
cd frontend
vercel --prod
```

3. **Set environment variables in Vercel**:
   - `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., https://your-backend.railway.app)

### Backend Deployment (Railway)

1. **Install Railway CLI**:
```bash
npm i -g @railway/cli
```

2. **Deploy backend**:
```bash
cd backend
railway login
railway init
railway up --prod
```

3. **Set environment variables in Railway**:
   ```bash
   railway variables set GROQ_API_KEY=your_key
   railway variables set GMAIL_USER=your_email@gmail.com
   railway variables set GMAIL_APP_PASSWORD=your_password
   ```

### Environment Variables for Production

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

#### Backend (.env)
```bash
PORT=5000
NODE_ENV=production
GROQ_API_KEY=your_production_key
GMAIL_USER=your_production_email@gmail.com
GMAIL_APP_PASSWORD=your_production_password
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## 📋 API Endpoints

### Backend API (Base: `/api`)

- **POST /upload** - Upload file for processing
- **POST /summarize** - Generate AI summary
- **POST /share** - Send summary via email
- **GET /health** - Health check endpoint

### Example API Usage

#### Upload File
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@meeting_notes.txt"
```

#### Generate Summary
```bash
curl -X POST http://localhost:5000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your meeting transcript here...",
    "prompt": "Summarize key decisions and action items"
  }'
```

#### Share via Email
```bash
curl -X POST http://localhost:5000/api/share \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["user1@example.com", "user2@example.com"],
    "subject": "Weekly Team Meeting Summary",
    "summary": "Generated summary content..."
  }'
```

## 🎯 Usage Examples

### Sample Prompts

- **Executive Summary**: "Create a concise executive summary focusing on key decisions and action items"
- **Action Items**: "Extract only action items with assigned owners and deadlines"
- **Bullet Points**: "Summarize in bullet points suitable for executives"
- **Technical Notes**: "Generate technical summary for development team"
- **Timeline**: "Create a timeline of key events and decisions"

### File Format Support

- **.txt** - Plain text files
- **.md** - Markdown files
- **.json** - JSON format meeting notes
- **.csv** - CSV format meeting data

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev      # Development mode with nodemon
npm start        # Production mode
npm test         # Run tests (if implemented)
```

#### Frontend
```bash
npm run dev      # Development mode
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Adding New Features

1. **New AI Provider**: Add to `backend/services/aiService.js`
2. **New Email Templates**: Add to `backend/services/emailService.js`
3. **New File Types**: Update `backend/utils/validation.js`
4. **New UI Components**: Add to `frontend/components/`

## 🐛 Troubleshooting

### Common Issues

#### "Email sending failed"
- Verify Gmail app password is correct
- Check if 2FA is enabled on Gmail account
- Ensure Gmail account allows less secure apps (if using regular password)

#### "AI API errors"
- Verify Groq API key is valid
- Check API rate limits
- Ensure API key has sufficient credits

#### "File upload fails"
- Check file size (max 10MB)
- Verify file type (.txt, .md, .json, .csv)
- Ensure backend is running

#### "CORS errors"
- Check ALLOWED_ORIGINS in backend .env
- Ensure frontend URL matches backend configuration

### Debug Mode

Enable debug logging:
```bash
# Backend
DEBUG=* npm run dev

# Frontend (browser console)
localStorage.setItem('debug', '*')
```

## 🔒 Security

- Input sanitization for all user inputs
- Rate limiting on all endpoints
- CORS configuration for production
- Secure email configuration
- File type validation
- Size limits on uploads

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Open an issue on GitHub
- Contact: your-email@example.com

---

**Built with ❤️ using Next.js, Node.js, and AI technology**