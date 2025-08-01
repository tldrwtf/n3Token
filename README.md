# Twitch Token & Proxy Manager - Deployment Guide

This guide explains how to deploy the Twitch Token & Proxy Manager application on various hosting platforms.

## Overview

This is a full-stack web application for managing Twitch authentication tokens and proxy servers. It includes:
- User registration and login system
- Token validation and management
- Proxy testing and organization
- Bulk operations for tokens and proxies
- Real-time progress tracking

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Twitch API credentials (optional, but recommended for full functionality)

## Environment Variables

Copy `.env.example` to `.env` and configure the following:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/twitchmanager

# Session Configuration (Change in production!)
SESSION_SECRET=your-secure-session-secret-change-this-in-production

# Twitch API Configuration (Optional)
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-client-secret

# Application Configuration
NODE_ENV=production
PORT=5000
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Run with Docker Compose:

```bash
docker-compose up -d
```

This will start both the application and PostgreSQL database.

### Option 2: Manual Deployment

1. **Install dependencies:**
```bash
npm install
```

2. **Set up PostgreSQL database:**
```bash
# Create database
createdb twitchmanager

# Set DATABASE_URL in .env
```

3. **Build the application:**
```bash
npm run build
```

4. **Push database schema:**
```bash
npm run db:push
```

5. **Start the application:**
```bash
npm start
```

### Option 3: Platform-Specific Deployments

#### Heroku

1. Install Heroku CLI
2. Create a new Heroku app:
```bash
heroku create your-app-name
```

3. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:mini
```

4. Set environment variables:
```bash
heroku config:set SESSION_SECRET=your-secure-secret
heroku config:set TWITCH_CLIENT_ID=your-client-id
heroku config:set TWITCH_CLIENT_SECRET=your-client-secret
```

5. Deploy:
```bash
git push heroku main
```

#### Railway

1. Connect your GitHub repository to Railway
2. Add PostgreSQL service
3. Set environment variables in Railway dashboard
4. Deploy automatically on push

#### DigitalOcean App Platform

1. Create new app from GitHub repository
2. Add managed PostgreSQL database
3. Configure environment variables
4. Deploy

## Database Setup

The application will automatically create the necessary database tables when it starts. If you need to manually set up the database schema:

```bash
npm run db:push
```

## Creating the First User

1. Navigate to your deployed application
2. Click "Register" (or visit `/register`)
3. Create your admin account
4. Login and start managing tokens and proxies

## Configuration

### Twitch API Setup

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console)
2. Create a new application
3. Copy the Client ID and Client Secret
4. Set them in your environment variables

### Security Considerations

- **Change the SESSION_SECRET** in production
- Use HTTPS in production
- Keep your Twitch API credentials secure
- Regular database backups
- Monitor for unauthorized access

### File Uploads

The application supports bulk import via file uploads:
- CSV files for proxy lists
- TXT files for token lists
- Files are temporarily stored in the `uploads/` directory

## Monitoring

### Health Check

The application provides a health check endpoint at `/health` for monitoring.

### Logs

Application logs include:
- API request logs
- Authentication events
- Error handling
- Database operations

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **Session Issues**
   - Check SESSION_SECRET is set
   - Verify session store configuration

3. **Twitch API Errors**
   - Verify API credentials
   - Check rate limiting
   - Ensure proxy configuration

### Getting Help

Check the application logs for detailed error messages. Most issues are related to environment configuration or database connectivity.

## Updating

To update the application:

1. Pull the latest changes
2. Rebuild the application
3. Push any database schema changes
4. Restart the application

```bash
git pull origin main
npm run build
npm run db:push
npm start
```

## Backup and Recovery

### Database Backup

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Database Restore

```bash
psql $DATABASE_URL < backup.sql
```

## Scaling

For high-traffic deployments:
- Use connection pooling for PostgreSQL
- Add Redis for session storage
- Use a CDN for static assets
- Implement horizontal scaling with load balancer