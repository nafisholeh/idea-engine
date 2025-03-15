#!/bin/bash

# Check if the data directory exists
if [ ! -d "data" ]; then
  echo "Data directory not found. Creating it..."
  mkdir -p data
fi

# Check if the old database file exists
if [ -f "data/redditradar.db" ]; then
  echo "Renaming database from redditradar.db to ideaengine.db..."
  mv data/redditradar.db data/ideaengine.db
  echo "Database renamed successfully!"
else
  echo "Old database file not found. No need to rename."
fi

echo "Database setup complete." 