# My_Drive — Google Drive Clone

A cloud storage and file-sharing app built to learn .NET Web API development,
built as a cloud computing course project.

## Tech stack
- Backend: ASP.NET Core Web API, EF Core, PostgreSQL
- Frontend: React (Vite + TypeScript)
- Auth: Google OAuth + JWT
- Infra (planned): Docker, Redis, Azure Blob Storage, Azure deployment

## Project structure

My_Project/
├── My_Drive/ # .NET Web API backend
└── client/ # React (Vite) frontend


## Running locally

### Backend

cd My_Drive
dotnet run

Runs at http://localhost:5271 (or check the terminal output for the actual port).

### Frontend

cd client
npm install
npm run dev

Runs at http://localhost:5173 (Vite's default — check the terminal if it picked a different port).

Both need to be running at the same time during development.
