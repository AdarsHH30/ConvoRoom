#!/bin/bash

# Start backend
cd backend
source venv/bin/activate  # Activate virtual environment
python manage.py runserver &  # Run backend in the background
cd ..

# Start frontend
cd frontend
npm run dev  # Run frontend in the background
cd ..

# Keep script running
wait
