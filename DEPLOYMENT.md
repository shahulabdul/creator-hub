# Content Creator Workflow App - Deployment Guide

This document outlines the deployment process for the Content Creator Workflow App, including development, staging, and production environments.

## Prerequisites

- Node.js 18.x or higher
- Docker and Docker Compose
- AWS account with S3 bucket configured
- Google OAuth credentials
- PostgreSQL database (or use the Docker Compose setup)

## Environment Configuration

Create a `.env` file in the `contentcreator-app` directory with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/contentcreator"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

## Development Environment

### Local Setup

1. Clone the repository
```bash
git clone https://github.com/your-username/contentCreator.git
cd contentCreator/contentcreator-app
```

2. Install dependencies
```bash
npm install
```

3. Initialize the database
```bash
npx prisma db push
```

4. Run the development server
```bash
npm run dev
```

5. Access the application at http://localhost:3000

## Docker Development Environment

1. Build and start the Docker containers
```bash
cd contentcreator-app
docker-compose up -d
```

2. Initialize the database (first time only)
```bash
docker-compose exec app npx prisma db push
```

3. Access the application at http://localhost:3000

## Staging Environment

The staging environment is designed to mirror the production environment for testing purposes.

### Setup with Docker

1. Create a `.env.staging` file with appropriate configuration
2. Deploy using Docker Compose:
```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

### Setup on Cloud Provider

1. Create a new instance/service on your cloud provider
2. Set up environment variables
3. Deploy using the CI/CD pipeline:
```bash
git push origin staging
```

## Production Deployment

### Option 1: Docker Deployment

1. Create a `.env.production` file with production configuration
2. Deploy using Docker Compose:
```bash
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

### Option 2: Cloud Provider Deployment

#### AWS Elastic Beanstalk

1. Install the EB CLI
```bash
pip install awsebcli
```

2. Initialize EB application
```bash
cd contentcreator-app
eb init
```

3. Create an environment
```bash
eb create production-environment
```

4. Deploy the application
```bash
eb deploy
```

#### Vercel Deployment

1. Install the Vercel CLI
```bash
npm install -g vercel
```

2. Deploy to Vercel
```bash
cd contentcreator-app
vercel --prod
```

## CI/CD Pipeline

The application uses GitHub Actions for continuous integration and deployment:

1. **Lint**: Runs ESLint to check code quality
2. **Test**: Runs unit and integration tests
3. **Build**: Builds the Next.js application
4. **E2E Tests**: Runs end-to-end tests with Cypress
5. **Deploy**: Deploys to the appropriate environment based on the branch

### Workflow Files

- `.github/workflows/ci.yml`: CI pipeline for testing and building
- `.github/workflows/deploy-staging.yml`: Deploys to staging environment
- `.github/workflows/deploy-production.yml`: Deploys to production environment

## Monitoring and Logging

### Application Logging

The application uses structured logging with the following components:

- Winston for log formatting and transport
- Log rotation for managing log files
- Error tracking with Sentry

### Infrastructure Monitoring

- AWS CloudWatch for infrastructure monitoring
- Prometheus and Grafana for metrics visualization
- Uptime monitoring with Pingdom or UptimeRobot

## Backup and Recovery

### Database Backups

1. Automated daily backups of PostgreSQL database
2. Backup retention policy: 7 daily, 4 weekly, 3 monthly
3. Backup verification process

### Recovery Procedures

1. Database restoration from backup
2. Application rollback procedures
3. Disaster recovery plan

## Security Considerations

- All environment variables are stored securely
- HTTPS is enforced for all environments
- Regular security audits and dependency updates
- Authentication with OAuth and proper authorization checks
- Data encryption in transit and at rest

## Scaling Strategy

- Horizontal scaling with multiple application instances
- Database connection pooling
- Content delivery network (CDN) for static assets
- Caching strategy for API responses

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check DATABASE_URL environment variable
   - Verify network connectivity to database
   - Check database credentials

2. **OAuth Authentication Failures**
   - Verify Google OAuth credentials
   - Check NEXTAUTH_URL and NEXTAUTH_SECRET
   - Ensure redirect URIs are properly configured

3. **S3 Storage Issues**
   - Verify AWS credentials
   - Check bucket permissions
   - Ensure proper CORS configuration
