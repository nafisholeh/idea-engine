#!/bin/bash

# Start the Python Flask server
echo "Starting Python Flask server..."
python3 app.py &
PYTHON_PID=$!

# Start the Node.js Express server
echo "Starting Node.js Express server..."
node server.js &
NODE_PID=$!

# Start the React frontend
echo "Starting React frontend..."
cd frontend && npm start &
REACT_PID=$!

# Function to handle script termination
cleanup() {
  echo "Shutting down servers..."
  kill $PYTHON_PID
  kill $NODE_PID
  kill $REACT_PID
  exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Keep the script running
echo "All servers are running. Press Ctrl+C to stop."
wait 