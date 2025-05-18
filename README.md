# ConvoRoom

## Overview

ConvoRoom is a real-time communication platform that facilitates collaborative conversations enhanced with AI assistance.

## Technologies Used

### Frontend

- React with Vite for fast development
- Tailwind CSS for styling
- WebSocket client for real-time communication

### Backend

- Django framework
- Langchain with Google Generative AI (Gemini)
- MongoDB for message storage

## Project Structure

```
ConvoRoom/
├── backend/
│   ├── api/ - API endpoints and WebSocket consumers
│   └── requirements.txt - Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/ - React components
│   │   ├── pages/ - Main application pages
│   │   └── css/ - Style sheets
│   ├── public/ - Static assets
│   └── package.json - Node.js dependencies
├── .env - Environment variables
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.x
- Node.js 16+ and npm
- MongoDB database
- Google API key for Gemini AI

### Installation

1. Clone the repository

```bash
git clone https://github.com/AdarsHH30/ConvoRoom-AI.git
cd ConvoRoom
```

2. Set up Python environment

```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
cd backend
pip install -r requirements.txt
```

3. Install Node.js dependencies

```bash
cd ../frontend
pnpm install
```

### Configuration

Create a `.env` file in the backend directory with necessary environment variables:

```
DATABASE_URL=mongodb://username:password@host:port/database
GOOGLE_API_KEY=your_google_gemini_api_key
SECRET_KEY=your_django_secret_key
```

### Frontend Configuration

Create a `.env` file in the frontend directory with these variables:

```
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

Adjust the URLs according to your production environment when deploying.

## Usage

1. Start the backend server:

```bash
cd backend
python manage.py runserver
```

2. In a separate terminal, start the frontend development server:

```bash
cd frontend
pnpm dev
```

3. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

4. Create a new room or join an existing room using its ID

## Features Overview

### Home Page

- Create a new room instantly with one click
- Join existing rooms by entering a room ID
- Access your recently visited rooms

### Chat Room

- AI assistance by addressing messages to the AI
- Code sharing with syntax highlighting
- Markdown formatting in messages
- Copy message content with a single click

## Contact

Adarsh Hegde  
LinkedIn: [https://www.linkedin.com/in/adarsh30/](https://www.linkedin.com/in/adarsh30/)  
Portfolio: [https://www.adarshhegde.tech/](https://www.adarshhegde.tech/)  
GitHub: [https://github.com/AdarsHH30](https://github.com/AdarsHH30)  
Twitter: [https://x.com/Adarsh13673751](https://x.com/Adarsh13673751)
