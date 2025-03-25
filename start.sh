#!/bin/bash

cd backend
source venv/bin/activate
python3 manage.py runserver 9999&
cd ..

cd frontend
pnpm dev&
cd ..

wait
