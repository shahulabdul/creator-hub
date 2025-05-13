---
trigger: always_on
---

# Development Rules & Guidelines - Content Creator Workflow App

### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Use clear, consistent imports** following the established patterns for React/React Native and Node.js/Express or Django/FastAPI.
- **Create reusable components** for UI elements that appear in multiple places.

### 🖼️ Frontend Development
- **Follow React best practices** with functional components and hooks.
- **Use component-based architecture** with clear separation of concerns.
- **Implement responsive design** using mobile-first approach.
- **Style consistently** using the agreed styling solution (CSS modules, styled-components, or Tailwind).
- **Manage state appropriately** - use React Context, Redux, or similar for global state; component state for local UI state.
- **Ensure accessibility (a11y)** through proper HTML semantics, ARIA labels, and keyboard navigation.

### ⚙️ Backend Development
- **Follow RESTful API principles** or GraphQL schema design based on the chosen approach.
- **Implement proper error handling** with appropriate HTTP status codes and error messages.
- **Validate all inputs** using the chosen validation method for your stack.
- **Use proper authentication** with OAuth for Google/Instagram.
- **Structure database queries efficiently** following the selected database best practices (PostgreSQL or MongoDB).
- **Follow the selected framework's conventions** for routes, controllers, models, and services.

### 🧪 Testing & Reliability
- **Write unit tests for all components and functions** using the appropriate testing framework:
  - React: Jest + React Testing Library
  - Backend: Jest, Mocha, or Pytest (if using Python)
- **Tests should cover:**
  - Basic functionality (happy path)
  - Edge cases
  - Error handling
- **Implement integration tests** for critical flows and API endpoints.
- **Consider E2E testing** for critical user journeys using Cypress or similar tools.

### 📱 Mobile Development
- **Ensure consistent experience** between web and mobile platforms.
- **Follow platform-specific design guidelines** while maintaining app identity.
- **Optimize for performance** by minimizing bundle size and re-renders.
- **Test on multiple devices** with different screen sizes and OS versions.

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- **Add new sub-tasks or TODOs** discovered during development to `TASK.md` under the "Discovered During Work" section.
- **Document any deviations** from the planned implementation and the reasoning behind them.

### 📎 Style & Conventions
- **Frontend:**
  - Use consistent naming for files and components (PascalCase for components, camelCase for functions/variables).
  - Follow the project's linting rules (ESLint/Prettier).
  - Organize imports logically (3rd party libraries first, then internal modules).
- **Backend:**
  - Follow consistent naming conventions for endpoints, services, and database entities.
  - Use appropriate HTTP methods (GET, POST, PUT, DELETE) for CRUD operations.
  - Structure API responses consistently.
- **Documentation:**
  - Document all components, functions, and API endpoints with JSDoc or appropriate syntax:
  ```javascript
  /**
   * Brief description of function or component
   * @param {type} paramName - Description of parameter
   * @returns {type} Description of return value
   */
  ```

### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- **Add inline comments for complex logic** explaining the why, not just the what.
- **Include setup instructions** for new dependencies or environment requirements.

### 🛡️ Security & Performance
- **Never store sensitive information** (API keys, secrets) in code or version control.
- **Implement proper authentication and authorization** for all protected resources.
- **Sanitize all user inputs** to prevent injection attacks.
- **Optimize asset loading** for images and media files.
- **Consider performance implications** of dependencies and API calls.

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages for the chosen tech stack.
- **Always confirm file paths and module names** exist before referencing them in code.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.
- **Keep going until the job is completely solved before ending your turn.
- **If you're unsure about code or files, open them do not hallucinate. 
- **Plan thoroughly before every tool call and reflect on the outcome after. 