// This is a Cypress end-to-end test for the project creation and management workflow
describe('Project Management Workflow', () => {
  beforeEach(() => {
    // Mock the authentication to simulate a logged-in user
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          id: 'user1',
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
    }).as('getSession');

    // Visit the dashboard
    cy.visit('/dashboard');
    cy.wait('@getSession');
  });

  it('allows users to create, view, edit, and delete a project', () => {
    // Create a new project
    cy.contains('New Project').click();
    cy.get('[data-testid="project-title-input"]').type('E2E Test Project');
    cy.get('[data-testid="project-description-input"]').type('This is a test project created in E2E tests');
    
    // Select a due date (one week from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const formattedDate = dueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    cy.get('[data-testid="project-due-date-input"]').type(formattedDate);
    
    // Select a status
    cy.get('[data-testid="project-status-select"]').select('Not Started');
    
    // Submit the form
    cy.intercept('POST', '/api/projects', {
      statusCode: 201,
      body: {
        project: {
          id: 'e2e-test-id',
          title: 'E2E Test Project',
          description: 'This is a test project created in E2E tests',
          dueDate: dueDate.toISOString(),
          status: 'not-started',
          userId: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    }).as('createProject');
    
    cy.get('[data-testid="create-project-button"]').click();
    cy.wait('@createProject');
    
    // Verify project appears in the project list
    cy.contains('E2E Test Project').should('be.visible');
    
    // View project details
    cy.intercept('GET', '/api/projects/e2e-test-id', {
      statusCode: 200,
      body: {
        project: {
          id: 'e2e-test-id',
          title: 'E2E Test Project',
          description: 'This is a test project created in E2E tests',
          dueDate: dueDate.toISOString(),
          status: 'not-started',
          userId: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    }).as('getProject');
    
    cy.contains('E2E Test Project').click();
    cy.wait('@getProject');
    
    // Verify project details page
    cy.get('[data-testid="project-title"]').should('contain', 'E2E Test Project');
    cy.get('[data-testid="project-description"]').should('contain', 'This is a test project created in E2E tests');
    cy.get('[data-testid="project-status"]').should('contain', 'Not Started');
    
    // Edit the project
    cy.get('[data-testid="edit-project-button"]').click();
    cy.get('[data-testid="project-title-input"]').clear().type('Updated E2E Test Project');
    cy.get('[data-testid="project-status-select"]').select('In Progress');
    
    cy.intercept('PUT', '/api/projects/e2e-test-id', {
      statusCode: 200,
      body: {
        project: {
          id: 'e2e-test-id',
          title: 'Updated E2E Test Project',
          description: 'This is a test project created in E2E tests',
          dueDate: dueDate.toISOString(),
          status: 'in-progress',
          userId: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    }).as('updateProject');
    
    cy.get('[data-testid="update-project-button"]').click();
    cy.wait('@updateProject');
    
    // Verify updated project details
    cy.get('[data-testid="project-title"]').should('contain', 'Updated E2E Test Project');
    cy.get('[data-testid="project-status"]').should('contain', 'In Progress');
    
    // Delete the project
    cy.intercept('DELETE', '/api/projects/e2e-test-id', {
      statusCode: 204,
    }).as('deleteProject');
    
    cy.get('[data-testid="delete-project-button"]').click();
    cy.get('[data-testid="confirm-delete-button"]').click();
    cy.wait('@deleteProject');
    
    // Verify redirect to projects list
    cy.url().should('include', '/projects');
    
    // Verify project is no longer in the list
    cy.contains('Updated E2E Test Project').should('not.exist');
  });

  it('shows validation errors when creating a project with invalid data', () => {
    // Try to create a project with invalid data
    cy.contains('New Project').click();
    
    // Leave title empty (required field)
    cy.get('[data-testid="project-description-input"]').type('Invalid project without title');
    
    // Try to submit the form
    cy.get('[data-testid="create-project-button"]').click();
    
    // Verify validation error is shown
    cy.get('[data-testid="title-error"]').should('be.visible');
    cy.get('[data-testid="title-error"]').should('contain', 'Title is required');
    
    // Form should not be submitted
    cy.url().should('include', '/projects/new');
  });

  it('allows adding tasks to a project', () => {
    // Setup project and navigate to it
    cy.intercept('GET', '/api/projects/e2e-test-id', {
      statusCode: 200,
      body: {
        project: {
          id: 'e2e-test-id',
          title: 'E2E Test Project',
          description: 'This is a test project created in E2E tests',
          dueDate: new Date().toISOString(),
          status: 'in-progress',
          userId: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    }).as('getProject');
    
    cy.visit('/projects/e2e-test-id');
    cy.wait('@getProject');
    
    // Add a task to the project
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type('E2E Test Task');
    cy.get('[data-testid="task-description-input"]').type('This is a test task');
    cy.get('[data-testid="task-priority-select"]').select('High');
    
    cy.intercept('POST', '/api/tasks', {
      statusCode: 201,
      body: {
        task: {
          id: 'task-e2e-id',
          title: 'E2E Test Task',
          description: 'This is a test task',
          priority: 'high',
          status: 'not-started',
          projectId: 'e2e-test-id',
          userId: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    }).as('createTask');
    
    cy.get('[data-testid="create-task-button"]').click();
    cy.wait('@createTask');
    
    // Verify task appears in the task list
    cy.get('[data-testid="task-list"]').should('contain', 'E2E Test Task');
    cy.get('[data-testid="task-priority-high"]').should('be.visible');
  });
});
