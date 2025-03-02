# RedditRadar

RedditRadar is a web application that analyzes Reddit discussions to identify trending topics, pain points, and potential SaaS opportunities.

## Features

- **Dashboard**: View key statistics and trending topics at a glance
- **Topic Explorer**: Browse and filter topics by category, growth rate, and more
- **Topic Detail**: Analyze specific topics with detailed insights
- **Market Analysis**: Visualize market trends, category distribution, and pain points
- **Opportunity Finder**: Discover potential SaaS opportunities based on Reddit discussions
- **Idea Submission**: Submit your own SaaS ideas for analysis

## Tech Stack

### Frontend
- React
- TypeScript
- Material-UI
- Chart.js

### Backend
- Node.js
- Express
- SQLite

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+ (for data collection)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/reddit-radar.git
   cd reddit-radar
   ```

2. Install dependencies
   ```
   npm run setup
   ```
   This will install both Node.js and Python dependencies.

3. Start the development server
   ```
   npm run dev
   ```
   This will start both the backend and frontend in development mode.

4. Open your browser and navigate to http://localhost:3000

## Project Structure

```
reddit-radar/
├── data/                  # SQLite database and data files
├── frontend/              # React frontend
│   ├── public/            # Static files
│   └── src/               # React components and logic
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── types/         # TypeScript type definitions
├── DataCrawler.py         # Python script for collecting Reddit data
├── server.js              # Express backend server
└── requirements.txt       # Python dependencies
```

## API Endpoints

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/topics/trending` - Get trending topics
- `GET /api/categories` - Get available categories
- `GET /api/market-analysis` - Get market analysis data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 