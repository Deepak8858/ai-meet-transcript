# Environment Variables Setup Guide

This guide explains how to configure environment variables for the AI Meeting Notes Summarizer project using the latest Groq API and Nodemailer documentation.

## Quick Start

1. **Copy template files:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env.local
   ```

2. **Fill in your actual values** following the instructions below.

## Backend Environment Variables (.env)

### Groq API Configuration

**GROQ_API_KEY** (Required)
- **Description**: Your Groq API key for AI text summarization
- **How to get**: 
  1. Go to [Groq Console](https://console.groq.com/keys)
  2. Sign in or create an account
  3. Navigate to API Keys section
  4. Click "Create API Key"
  5. Copy the key and paste it here
- **Example**: `GROQ_API_KEY=gpk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**GEMINI_API_KEY** (Optional - Fallback)
- **Description**: Google Gemini API key as fallback
- **How to get**: 
  1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Create a new API key
- **Example**: `GEMINI_API_KEY=AIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Nodemailer Gmail SMTP Configuration

**GMAIL_USER** (Required for email functionality)
- **Description**: Your Gmail address for sending summary emails
- **Example**: `GMAIL_USER=yourname@gmail.com`

**GMAIL_APP_PASSWORD** (Required for email functionality)
- **Description**: Gmail App Password (NOT your regular password)
- **How to get**:
  1. Enable 2-Factor Authentication on your Google account
  2. Go to [Google Account Security](https://myaccount.google.com/security)
  3. Click "2-Step Verification"
  4. Scroll down to "App passwords"
  5. Generate a new app password for "Mail"
  6. Copy the 16-character password
- **Example**: `GMAIL_APP_PASSWORD=abcd efgh ijkl mnop`

### Server Configuration

**PORT** (Optional)
- **Default**: 5000
- **Description**: Backend server port
- **Example**: `PORT=5000`

**NODE_ENV** (Optional)
- **Default**: development
- **Options**: development, production, test
- **Example**: `NODE_ENV=development`

### Database Configuration (Optional)

**DATABASE_URL** (Optional - for PostgreSQL)
- **Description**: PostgreSQL connection string
- **Format**: `postgresql://username:password@host:port/database_name`
- **Example**: `DATABASE_URL=postgresql://postgres:password@localhost:5432/meeting_notes_db`

### Redis Configuration (Optional)

**REDIS_URL** (Optional - for caching)
- **Description**: Redis connection URL
- **Example**: `REDIS_URL=redis://localhost:6379`

### Security Configuration

**JWT_SECRET** (Required for production)
- **Description**: Secret key for JWT tokens
- **Generate**: Use a long random string
- **Example**: `JWT_SECRET=your-super-secret-jwt-key-here`

**SESSION_SECRET** (Required for production)
- **Description**: Secret for session management
- **Generate**: Use a long random string
- **Example**: `SESSION_SECRET=your-super-secret-session-key-here`

### AI Model Configuration

**DEFAULT_MODEL** (Optional)
- **Default**: llama3-8b-8192
- **Description**: Primary AI model for summarization
- **Options**: llama3-8b-8192, mixtral-8x7b-32768, gemma-7b-it
- **Example**: `DEFAULT_MODEL=llama3-8b-8192`

**FALLBACK_MODEL** (Optional)
- **Default**: mixtral-8x7b-32768
- **Description**: Fallback model if primary fails
- **Example**: `FALLBACK_MODEL=mixtral-8x7b-32768`

**MAX_TOKENS** (Optional)
- **Default**: 4000
- **Description**: Maximum tokens for AI responses
- **Example**: `MAX_TOKENS=4000`

**TEMPERATURE** (Optional)
- **Default**: 0.7
- **Range**: 0.0 - 2.0
- **Description**: AI creativity level (lower = more focused)
- **Example**: `TEMPERATURE=0.7`

### File Upload Configuration

**MAX_FILE_SIZE** (Optional)
- **Default**: 10485760 (10MB)
- **Description**: Maximum file upload size in bytes
- **Example**: `MAX_FILE_SIZE=10485760`

**ALLOWED_FILE_TYPES** (Optional)
- **Default**: .txt,.md,.json,.csv
- **Description**: Allowed file extensions
- **Example**: `ALLOWED_FILE_TYPES=.txt,.md,.json,.csv`

## Frontend Environment Variables (.env.local)

### API Configuration

**NEXT_PUBLIC_API_URL** (Required)
- **Description**: Backend API URL
- **Development**: `NEXT_PUBLIC_API_URL=http://localhost:5000`
- **Production**: `NEXT_PUBLIC_API_URL=https://your-backend-domain.com`

### Security Warning

⚠️ **IMPORTANT**: Never expose your actual API keys in frontend environment variables. The frontend variables are prefixed with `NEXT_PUBLIC_` which makes them available to the browser. Always use backend API endpoints to handle sensitive operations.

### Feature Flags

**NEXT_PUBLIC_ENABLE_ANALYTICS** (Optional)
- **Default**: false
- **Description**: Enable analytics tracking
- **Example**: `NEXT_PUBLIC_ENABLE_ANALYTICS=false`

**NEXT_PUBLIC_ENABLE_DEBUG_MODE** (Optional)
- **Default**: true
- **Description**: Enable debug mode for development
- **Example**: `NEXT_PUBLIC_ENABLE_DEBUG_MODE=true`

## Environment-Specific Files

### Test Environment (.env.test)
- Used for running tests
- Contains mock values and relaxed limits
- Located at `backend/.env.test`

### Production Environment
- Use environment variables from your hosting provider
- Examples: Vercel, Railway, Heroku, AWS

## Setup Instructions by Service

### 1. Groq API Setup

1. **Create Groq Account**:
   - Visit [Groq Console](https://console.groq.com/keys)
   - Sign up with your email
   - Verify your account

2. **Generate API Key**:
   - Click "Create API Key"
   - Give it a descriptive name (e.g., "Meeting Notes App")
   - Copy the key immediately (it won't be shown again)
   - Add to `.env`: `GROQ_API_KEY=your_actual_key`

3. **Test the API**:
   ```bash
   curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
     -H "Authorization: Bearer $GROQ_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "llama3-8b-8192",
       "messages": [{"role": "user", "content": "Hello"}]
     }'
   ```

### 2. Gmail SMTP Setup

1. **Enable 2FA**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Create App Password**:
   - In Security settings, find "App passwords"
   - Generate password for "Mail"
   - Use 16-character password in `GMAIL_APP_PASSWORD`

3. **Alternative SMTP Providers**:
   If you don't want to use Gmail, you can use:
   - **SendGrid**: Get API key from [sendgrid.com](https://sendgrid.com)
   - **Mailgun**: Get credentials from [mailgun.com](https://mailgun.com)
   - **AWS SES**: Set up in AWS Console

### 3. Database Setup (Optional)

For PostgreSQL:
```bash
# Install PostgreSQL
# Create database
createdb meeting_notes_db

# Create user
createuser -P meeting_notes_user

# Grant permissions
psql -c "GRANT ALL PRIVILEGES ON DATABASE meeting_notes_db TO meeting_notes_user;"
```

### 4. Redis Setup (Optional)

For caching:
```bash
# Install Redis
# Start Redis server
redis-server

# Test connection
redis-cli ping
```

## Testing Your Configuration

### Backend Test
```bash
cd backend
npm run dev
# Should start on port 5000 without errors
```

### Frontend Test
```bash
cd frontend
npm run dev
# Should start on port 3000 and connect to backend
```

### Email Test
```bash
# Send test email
curl -X POST http://localhost:5000/api/share/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**:
   - Verify your Groq API key is correct
   - Check for extra spaces or quotes
   - Ensure the key has proper permissions

2. **"Authentication Failed" for Email**:
   - Verify Gmail app password is correct
   - Check if 2FA is enabled
   - Try using an alternative SMTP provider

3. **"Connection Refused"**:
   - Ensure backend server is running
   - Check if ports are available
   - Verify firewall settings

4. **CORS Issues**:
   - Ensure `CORS_ORIGIN` matches your frontend URL
   - Check if backend is accessible from frontend

### Environment Validation

You can validate your environment setup by running:

```bash
# Backend validation
cd backend
node -e "require('dotenv').config(); console.log('Groq API Key:', process.env.GROQ_API_KEY ? '✓ Set' : '✗ Missing'); console.log('Gmail User:', process.env.GMAIL_USER ? '✓ Set' : '✗ Missing');"

# Frontend validation
cd frontend
node -e "console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');"
```

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use strong secrets** for JWT and session keys
3. **Rotate API keys** regularly
4. **Use environment-specific configurations**
5. **Enable HTTPS** in production
6. **Use backend proxy** for sensitive operations

## Production Deployment

When deploying to production:

1. **Use hosting provider environment variables**
2. **Set NODE_ENV=production**
3. **Use production API keys**
4. **Enable HTTPS**
5. **Configure proper CORS origins
6. **Set up monitoring and logging**

For specific hosting providers:
- **Vercel**: Use Environment Variables in Project Settings
- **Railway**: Use Variables in Service Settings
- **Heroku**: Use Config Vars
- **AWS**: Use Parameter Store or Environment Variables

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the [Groq Documentation](https://console.groq.com/docs)
3. Check [Nodemailer Documentation](https://nodemailer.com/about/)
4. Open an issue on GitHub with your error details