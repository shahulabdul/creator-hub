# Content Creator Workflow App

A comprehensive workflow management platform for YouTube and Instagram content creators to plan, manage, shoot, record, and organize all aspects of their creative workflow and lifestyle in one place.

## Features

- **Content Calendar & Project Planner**: Schedule and organize your content creation pipeline
- **Task Management**: Track to-do items with deadlines and priorities
- **Asset Library**: Upload, tag, and organize files such as scripts, footage, music, and graphics
- **Shooting/Recording Checklists**: Create and manage production checklists
- **Collaboration Tools**: Comments and team assignments
- **YouTube/Instagram Integration**: Connect with your social media accounts
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js (React)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Cloud Storage**: AWS S3
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL database
- AWS S3 bucket
- Google OAuth credentials

## Getting Started

### Environment Setup

Create a `.env` file in the root directory with the following variables:

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

### Database Setup

Initialize the database with Prisma:

```bash
npx prisma db push
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API routes
│   │   ├── auth/        # Authentication pages
│   │   └── ...          # Page components
│   ├── components/      # React components
│   │   ├── assets/      # Asset management components
│   │   ├── calendar/    # Calendar components
│   │   ├── dashboard/   # Dashboard layout components
│   │   ├── projects/    # Project management components
│   │   ├── tasks/       # Task management components
│   │   └── ui/          # Shared UI components
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript type definitions
└── ...                  # Configuration files
```

## API Routes

- **Authentication**: `/api/auth/[...nextauth]`
- **Projects**: `/api/projects` and `/api/projects/[id]`
- **Tasks**: `/api/tasks` and `/api/tasks/[id]`
- **Assets**: `/api/assets` and `/api/assets/[id]`
- **Calendar**: `/api/calendar` and `/api/calendar/[id]`

## Development Workflow

1. Create feature branches from `main`
2. Make changes and test locally
3. Submit pull requests for review
4. Merge to `main` after approval

## Deployment

The application can be deployed to Vercel or any other platform that supports Next.js:

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

