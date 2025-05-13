# Content Creator Workflow App

A comprehensive workflow management platform for YouTube and Instagram content creators to plan, manage, shoot, record, and organize all aspects of their creative workflow in one place.

## Project Overview

This application centralizes the creator workflow across planning, asset management, shooting, editing, publishing, analytics, and lifestyle organization. It reduces tool fragmentation by integrating features typically spread across multiple platforms and creates a seamless experience between ideation, creation, publication, and analysis.

### Target Users
- YouTube content creators (from beginners to established channels)
- Instagram influencers and content creators
- Cross-platform creators managing multiple social media accounts
- Content teams collaborating on creative projects

## Core Features

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

## Project Structure

```
contentCreator/
├── contentcreator-app/     # Main application code
│   ├── prisma/             # Database schema and migrations
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   │   ├── api/        # API routes
│   │   │   ├── auth/       # Authentication pages
│   │   │   └── ...         # Page components
│   │   ├── components/     # React components
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── ...                 # Configuration files
├── PLANNING.md             # Project planning documentation
├── TASK.md                 # Task tracking and progress
└── tests/                  # Test files and documentation
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database
- AWS S3 bucket
- Google OAuth credentials

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/contentCreator.git
cd contentCreator/contentcreator-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the contentcreator-app directory with the following variables:
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

4. Initialize the database
```bash
npx prisma db push
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Workflow

1. Check `TASK.md` for current and upcoming tasks
2. Create feature branches from `main`
3. Make changes and test locally
4. Submit pull requests for review
5. Merge to `main` after approval

## API Documentation

The application provides the following API endpoints:

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js authentication endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/[id]` - Get a specific project
- `PUT /api/projects/[id]` - Update a project
- `DELETE /api/projects/[id]` - Delete a project

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get a specific task
- `PUT /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Upload a new asset
- `GET /api/assets/[id]` - Get a specific asset
- `PUT /api/assets/[id]` - Update asset metadata
- `DELETE /api/assets/[id]` - Delete an asset

### Calendar
- `GET /api/calendar` - List all calendar events
- `POST /api/calendar` - Create a new calendar event
- `GET /api/calendar/[id]` - Get a specific calendar event
- `PUT /api/calendar/[id]` - Update a calendar event
- `DELETE /api/calendar/[id]` - Delete a calendar event

## Testing

The project uses Jest and React Testing Library for testing. Run tests with:

```bash
npm test
```

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker (Planned)
Docker configuration is planned for containerized deployment.

## Roadmap

See `TASK.md` for upcoming features and enhancements.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
