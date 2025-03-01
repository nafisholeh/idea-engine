# RedditRadar

A data analytics tool that crawls Reddit to identify trending topics, pain points, and potential SaaS opportunities in the tech industry.

## Features

- **Data Collection**: Automated crawling of tech-related subreddits
- **Trend Analysis**: Identification of trending topics and growth patterns
- **Insight Generation**: Analysis of:
  - User Pain Points
  - Solution Requests
  - App Ideas
- **Interactive Dashboard**: Real-time visualization of insights
- **Advanced Metrics**:
  - Opportunity Score (0-100)
  - Revenue Potential Estimation
  - Market Size Indicators
  - Competition Analysis
  - User Engagement Metrics
  - Implementation Complexity Score

## Quick Start

1. Clone the repository
2. Run setup:
   ```bash
   npm run setup
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Access the dashboard at `http://localhost:3000`

## Available Commands

### Setup Commands

```bash
# Install all dependencies (Node.js and Python)
npm run setup

# Install only Node.js dependencies
npm run setup:node

# Install only Python dependencies and language models
npm run setup:python
```

### Run Commands

```bash
# Start both server and data collector (production mode)
npm start

# Start with auto-reload on code changes (development mode)
npm run dev

# Start only the data collector
npm run start:collector

# Start only the web server
npm run start:server
```

### Command Details

- `npm run setup`: 
  - Installs all Node.js packages (express, cors, sqlite3)
  - Installs all Python packages (praw, spacy, nltk, etc.)
  - Downloads required language models for text analysis
  - Sets up the database and initial configuration

- `npm start`:
  - Runs the Reddit data collector in the background
  - Starts the web server on port 3000
  - Enables real-time data collection and analysis
  - Serves the dashboard interface

- `npm run dev`:
  - Same as `npm start` but with auto-reload functionality
  - Uses nodemon to watch for server changes
  - Automatically restarts on code modifications
  - Ideal for development work

- `npm run start:collector`:
  - Only runs the Python data collection script
  - Crawls Reddit for new data
  - Performs analysis and updates database
  - Can be run independently for data updates

- `npm run start:server`:
  - Only starts the web server
  - Serves the dashboard interface
  - Connects to existing database
  - Useful when data collection is not needed

## Project Structure

- `DataCrawler.py`: Reddit data collection and analysis
- `server.js`: Express.js backend server
- `index.html`: Frontend dashboard
- `requirements.txt`: Python dependencies
- `package.json`: Node.js dependencies and scripts
- `config.ini`: Configuration settings (needs to be created)

## Configuration

1. Create a `config.ini` file with your Reddit API credentials:
```ini
[REDDIT]
client_id = your_client_id
client_secret = your_client_secret
user_agent = your_user_agent
username = your_username
password = your_password
```

2. Required Python packages (installed via setup):
```
praw==7.8.1
pandas==2.2.3
nltk==3.9.1
spacy==3.8.0
textblob==0.17.1
scikit-learn==1.6.1
schedule==1.2.2
configparser==6.0.0
SQLAlchemy==2.0.38
requests==2.32.3
certifi==2024.2.2
urllib3==2.3.0
PySocks==1.7.1
```

3. Required Node.js packages (installed via setup):
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "sqlite3": "^5.1.7"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "nodemon": "^3.0.3"
  }
}
```

## Troubleshooting

### Common Issues

1. **Python Dependencies**
   - If you see `ModuleNotFoundError`, run `npm run setup:python`
   - For spaCy issues, run `python -m spacy download en_core_web_sm`

2. **Node.js Dependencies**
   - If modules are missing, run `npm run setup:node`
   - For permission issues, run PowerShell as administrator

3. **Database Issues**
   - Ensure SQLite is properly installed
   - Check file permissions in the project directory

4. **Reddit API**
   - Verify your credentials in `config.ini`
   - Check API rate limits and quotas

### Error Messages

- `No module named 'spacy'`: Run `npm run setup:python`
- `Cannot find module 'express'`: Run `npm run setup:node`
- `Database locked`: Ensure no other process is using the database
- `API rate limit exceeded`: Wait and try again later

## License

This project is private and confidential. All rights reserved. 