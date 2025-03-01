# Reddit Radar

Reddit Radar is a data analysis tool for identifying SaaS opportunities by analyzing Reddit discussions. It collects and analyzes data from Reddit to identify trending topics, pain points, and potential business opportunities.

## Features

- **Topic Analysis**: Identify trending topics and their growth over time
- **Pain Point Detection**: Discover user pain points and problems
- **Opportunity Scoring**: Score potential business opportunities based on various metrics
- **Interactive Dashboard**: Visualize data and insights through an interactive web interface

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- SQLite

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/reddit-radar.git
   cd reddit-radar
   ```

2. Install dependencies:
   ```
   npm run setup
   ```
   
   This will install both Node.js and Python dependencies.

3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

#### For Windows Users

We've created a PowerShell script to make it easier to start both the backend and frontend servers:

1. Run the PowerShell script:
   ```
   .\start-dev.ps1
   ```

This will open two PowerShell windows:
- One running the backend server at http://localhost:3000
- One running the frontend development server at http://localhost:3000

#### Alternative Method

You can also start the servers individually:

1. Start the backend server:
   ```
   npm run start:server
   ```

2. In a separate terminal, start the frontend server:
   ```
   cd frontend
   npm start
   ```

### Data Collection

To collect fresh data from Reddit:

```
npm run start:collector
```

## Project Structure

- `server.js` - Express backend server
- `DataCrawler.py` - Python script for collecting and analyzing Reddit data
- `reddit_insights.db` - SQLite database storing the collected data
- `frontend/` - React frontend application
- `public/` - Static assets

## API Endpoints

- `/api/topics` - Get all topics
- `/api/trending` - Get trending topics
- `/api/stats` - Get statistics about the dataset
- `/api/topics/:category` - Get topics by category
- `/api/opportunities` - Get top opportunities
- `/api/market-analysis` - Get market analysis by category
- `/api/competitor-analysis/:topic` - Get competitor analysis for a specific topic

## Troubleshooting

### Database Issues

If you encounter database issues, you can try running the fix script:

```
python fix_database.py
```

This will check the database structure and populate it with sample data if needed.

### PowerShell Command Limitations

Windows PowerShell doesn't support the `&&` operator for chaining commands like in bash. Use the provided PowerShell script (`start-dev.ps1`) or run commands in separate terminals.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 