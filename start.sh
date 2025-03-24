#!/bin/bash

cd backend
source venv/bin/activate
python3 manage.py runserver&
cd ..

cd frontend
pnpm dev&
cd ..

wait
