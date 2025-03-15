# Idea Engine

Idea Engine is a web application that analyzes online discussions from platforms like Reddit, Hacker News, and Quora to identify trending topics, pain points, and potential SaaS opportunities.

## Features

- **Dashboard**: View key statistics and trending topics at a glance
- **Topic Explorer**: Browse and filter topics by category, growth rate, and more
- **Topic Detail**: Analyze specific topics with detailed insights
- **Market Analysis**: Visualize market trends, category distribution, and pain points
- **Opportunity Finder**: Discover potential SaaS opportunities based on online discussions
- **Text Analysis**: Analyze text from Reddit, Hacker News, Quora, or any source to identify pain points and generate app ideas
- **Idea Submission**: Submit your own SaaS ideas for analysis

## Tech Stack

### Frontend
- React
- TypeScript
- Material-UI
- Chart.js

### Backend
- Node.js (Express)
- Python (Flask)
- SQLite

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+ (for data collection and analysis)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/idea-engine.git
   cd idea-engine
   ```

2. Install dependencies
   ```
   npm run setup
   ```
   This will install both Node.js and Python dependencies.

3. Start the development server
   ```
   ./start.sh
   ```
   This will start the Node.js server, Python server, and React frontend.

4. Open your browser and navigate to http://localhost:3000

## Project Structure

```
idea-engine/
├── data/                  # SQLite database and data files
├── frontend/              # React frontend
│   ├── public/            # Static files
│   └── src/               # React components and logic
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── types/         # TypeScript type definitions
├── DataCrawler.py         # Python script for collecting data from various sources
├── app.py                 # Flask API for text analysis
├── server.js              # Express backend server
└── requirements.txt       # Python dependencies
```

## API Endpoints

### Node.js API
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/topics/trending` - Get trending topics
- `GET /api/categories` - Get available categories
- `GET /api/market-analysis` - Get market analysis data
- `GET /api/opportunities` - Get opportunity data
- `POST /api/ideas/submit` - Submit a new idea

### Python API
- `POST /api/python/analyze/sentiment` - Analyze sentiment of text
- `POST /api/python/analyze/topics` - Extract topics from text
- `POST /api/python/analyze/pain-points` - Extract pain points from text
- `POST /api/python/analyze/app-ideas` - Generate app ideas from pain points
- `POST /api/python/stats/opportunity-score` - Calculate opportunity score

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 