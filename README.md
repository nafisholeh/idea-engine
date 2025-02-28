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

## Setup

1. Install Python dependencies:
```bash
python -m venv venv
source venv/Scripts/activate  # On Windows
pip install -r requirements.txt
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Configure Reddit API credentials:
- Create a copy of `config.ini.example` as `config.ini`
- Fill in your Reddit API credentials

4. Start the data collection:
```bash
python DataCrawler.py --collect --time-period day
```

5. Start the web server:
```bash
node server.js
```

6. Access the dashboard at `http://localhost:3000`

## Project Structure

- `DataCrawler.py`: Reddit data collection and analysis
- `server.js`: Express.js backend server
- `index.html`: Frontend dashboard
- `requirements.txt`: Python dependencies
- `package.json`: Node.js dependencies

## Configuration

Create a `config.ini` file with your Reddit API credentials:
```ini
[REDDIT]
client_id = your_client_id
client_secret = your_client_secret
user_agent = your_user_agent
username = your_username
password = your_password
```

## License

This project is private and confidential. All rights reserved. 