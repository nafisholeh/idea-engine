# RedditRadar - SaaS Opportunity Finder

RedditRadar is a tool that helps entrepreneurs and product developers identify promising SaaS opportunities by analyzing discussions on Reddit. The application scans thousands of posts and comments to identify pain points, solution requests, and emerging trends across various categories.

## Features

- **Topic Explorer**: Browse and search through hundreds of topics identified from Reddit discussions
- **Opportunity Finder**: Discover high-potential SaaS ideas based on our proprietary opportunity scoring algorithm
- **Market Analysis**: Get insights into market trends, category distribution, and growth patterns
- **Sentiment Analysis**: Understand user sentiment around specific topics and pain points
- **Idea Submission**: Submit your own SaaS ideas for analysis and validation against our dataset

## Tech Stack

### Backend
- Node.js
- Express
- SQLite with SQLAlchemy
- Python for data collection and analysis
- Natural Language Processing (NLTK, spaCy)

### Frontend
- React
- TypeScript
- Material-UI
- Chart.js for data visualization
- React Router for navigation

## Project Structure

```
RedditRadar/
├── frontend/             # React frontend application
│   ├── public/           # Static files
│   └── src/              # Source code
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       ├── styles/       # CSS styles
│       ├── types/        # TypeScript type definitions
│       └── utils/        # Utility functions and API services
├── server.js             # Express server
├── DataCrawler.py        # Python script for data collection
└── reddit_insights.db    # SQLite database
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/RedditRadar.git
   cd RedditRadar
   ```

2. Install backend dependencies:
   ```
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   cd ..
   ```

4. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the backend server:
   ```
   node server.js
   ```

2. In a separate terminal, start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Data Collection

To collect data from Reddit:

```
python DataCrawler.py
```

This script will fetch data from Reddit, process it, and store it in the SQLite database.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Reddit API for providing access to discussion data
- All the open-source libraries and tools used in this project 