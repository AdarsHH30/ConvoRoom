#!/bin/bash

pip install -r requirements.txt

pip install --no-deps langchain==0.3.21
pip install --no-deps langchain-community==0.0.38
pip install --no-deps langchain-core==0.3.48
pip install --no-deps google-ai-generativelanguage==0.6.17
pip install --no-deps google-generativeai==0.8.4
pip install --no-deps langchain-google-genai==2.1.1

pip install --no-deps langchain-text-splitters==0.3.7
