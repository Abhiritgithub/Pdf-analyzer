# PDF Analyzer

PDF Analyzer is a production-ready full-stack web application that accepts a public PDF URL, downloads the document securely, extracts its text, sends it to Google Gemini, and displays a structured analysis in a clean React interface.

## Features

- Public PDF URL analysis with strict URL validation
- Secure backend PDF download with timeout and SSRF-aware checks
- Text extraction with `pdf-parse`
- Gemini analysis that returns strict JSON only
- Responsive React + Vite frontend
- Copy result, download JSON, clear result, and recent URL history
- Dark mode toggle
- Toast notifications
- Loading spinner and animated cards
- Friendly error handling for invalid URLs, download failures, extraction issues, Gemini failures, and network errors

## Project Structure

```text
pdf-analyzer/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── styles/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── utils/
├── .env.example
├── package.json
└── README.md
```

## Tech Stack

Frontend:
- React
- Vite
- Axios
- CSS Modules
- React Icons

Backend:
- Node.js
- Express.js
- pdf-parse
- Axios
- dotenv
- cors

LLM:
- Google Gemini API

Deployment:
- Frontend: Vercel
- Backend: Render

## Getting Started

### Prerequisites

- Node.js 18 or newer
- A Google Gemini API key
- A publicly accessible PDF URL for testing

### Installation

From the project root:

```bash
npm install
```

This installs dependencies for both workspaces.

### Environment Variables

Copy `.env.example` to your local environment and set the values you need.

Backend variables:
- `PORT` - server port
- `BACKEND_PORT` - alternative server port variable
- `CORS_ORIGIN` - allowed frontend origin(s), comma-separated if needed
- `GEMINI_API_KEY` - Gemini API key, never expose this to the frontend
- `GEMINI_MODEL` - Gemini model name, default `gemini-2.0-flash`
- `GEMINI_TIMEOUT_MS` - Gemini request timeout
- `PDF_DOWNLOAD_TIMEOUT_MS` - timeout for downloading PDFs
- `PDF_MAX_SIZE_BYTES` - maximum PDF download size

Frontend variables:
- `VITE_API_BASE_URL` - backend base URL, for example `http://localhost:5000` in development or your Render URL in production

### Running Locally

Run both apps together from the root:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

Frontend:
- Vite dev server: `http://localhost:5173`

Backend:
- API server: `http://localhost:5000`
- Health check: `GET /health`
- Analysis endpoint: `POST /api/analyze`

### Production Build

Build the frontend:

```bash
npm run build
```

## API Documentation

### `POST /api/analyze`

Request body:

```json
{
  "url": "https://example.com/file.pdf"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "documentType": "",
    "title": "",
    "authors": [],
    "summary": "",
    "keyTakeaway": ""
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Friendly error message"
}
```

### `GET /health`

Returns a simple status payload for deployment checks.

## Deployment

### Backend on Render

1. Create a new Render Web Service.
2. Point it at the backend folder or the repository root with the backend start command.
3. Set the start command to `npm run start --workspace backend`.
4. Add environment variables:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
   - `CORS_ORIGIN` set to your Vercel URL
   - `PORT` or let Render inject `PORT`
5. Deploy.

### Frontend on Vercel

1. Create a new Vercel project.
2. Set the root directory to `frontend` if deploying only the frontend folder, or configure the build command from the workspace if deploying the monorepo.
3. Build command: `npm run build --workspace frontend`
4. Output directory: `frontend/dist`
5. Add environment variable:
   - `VITE_API_BASE_URL` set to your deployed Render backend URL
6. Deploy.

### CORS

Set `CORS_ORIGIN` on the backend to the exact Vercel origin, for example:

```bash
CORS_ORIGIN=https://your-app.vercel.app
```

## Screenshots

Add screenshots here after deployment:

- Home page
- Loading state
- Analysis result cards
- Dark mode view

## Future Improvements

- Store analysis history server-side
- Add user authentication and saved documents
- Support OCR for scanned PDFs
- Add export to markdown and PDF
- Add streaming analysis progress updates
- Add automated tests for controllers and services

## Interview Notes

The application is intentionally structured with clear separation of concerns:

- Routes only register endpoints
- Controllers handle request/response orchestration
- Services contain business logic and integrations
- Utilities handle validation and safety checks
- The frontend keeps state and UX logic in a single page with reusable components

This keeps the code easy to explain during a technical interview.
