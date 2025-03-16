#!/bin/bash

# Start backend
cd backend
source venv/bin/activate  # Activate virtual environment
python3 manage.py runserver &  # Run backend in the background
cd ..

# Start frontend
cd frontend
pnpm dev # Run frontend in the background
cd ..

# Keep script running
wait
