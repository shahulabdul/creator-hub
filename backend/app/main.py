from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Content Creator Workflow API",
    description="API for the Content Creator Workflow application",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Content Creator Workflow API"}

# Import and include routers
# This will be uncommented as we implement the endpoints
# from app.api.endpoints import users, content, assets, tasks, calendar, auth

# app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# app.include_router(users.router, prefix="/users", tags=["Users"])
# app.include_router(content.router, prefix="/content", tags=["Content"])
# app.include_router(assets.router, prefix="/assets", tags=["Assets"])
# app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
# app.include_router(calendar.router, prefix="/calendar", tags=["Calendar"])
