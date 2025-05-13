# Content Creator Workflow App - Testing Documentation

This document outlines the testing strategy and provides instructions for running tests for the Content Creator Workflow App.

## Testing Strategy

Our testing approach follows a comprehensive strategy that includes:

1. **Unit Tests**: Testing individual components and functions in isolation
2. **Integration Tests**: Testing interactions between multiple components and API endpoints
3. **API Tests**: Testing the backend API endpoints directly

### Test Coverage

The tests cover the following core modules of the application:

- **API Endpoints**:
  - Projects API (`/api/projects`)
  - Tasks API (`/api/tasks`)
  - Assets API (`/api/assets`)
  - Calendar API (`/api/calendar`)
  - Authentication API (`/api/auth`)

- **UI Components**:
  - Project components (ProjectCard, ProjectList, ProjectForm)
  - Task components (TaskItem, TaskList, TaskForm)
  - Asset components (AssetCard, AssetGrid, AssetUploadForm)
  - Calendar components (CalendarEvent, CalendarView)
  - Authentication components (SignIn, SignOut)

- **Integration Flows**:
  - Project workflow (creating projects, adding tasks, viewing details)
  - Asset upload and management
  - Authentication flow (sign in, sign out, session management)

## Running Tests

### Prerequisites

Make sure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn

### Installation

If you haven't already installed the dependencies, run:

```bash
npm install
# or
yarn install
```

### Running All Tests

To run all tests:

```bash
npm test
# or
yarn test
```

### Running Tests with Watch Mode

For development, you can run tests in watch mode, which will automatically rerun tests when files change:

```bash
npm run test:watch
# or
yarn test:watch
```

### Running Tests with Coverage

To generate a test coverage report:

```bash
npm run test:coverage
# or
yarn test:coverage
```

The coverage report will be generated in the `coverage` directory.

## Test Structure

Tests are organized following the Next.js convention:

- Unit tests for components are located alongside the components with a `.test.tsx` or `.test.ts` extension
- API tests are located in the `__tests__/api` directory
- Integration tests are located in the `__tests__/integration` directory

## Mocking Strategy

We use the following mocking strategies:

- **Jest Mocks**: For mocking dependencies and functions
- **MSW (Mock Service Worker)**: For mocking API requests
- **Next Auth Mocks**: For mocking authentication and sessions

## Continuous Integration

Tests are automatically run as part of the CI/CD pipeline on every pull request and push to the main branch.

## Adding New Tests

When adding new features, follow these guidelines for adding tests:

1. Create unit tests for new components and functions
2. Update or add integration tests for new workflows
3. Ensure API endpoints have corresponding tests
4. Aim for at least 80% code coverage for new code

## Troubleshooting

If you encounter issues running tests:

1. Make sure all dependencies are installed
2. Check that the test environment is properly configured
3. Verify that mocks are set up correctly
4. Check for any conflicting test configurations
