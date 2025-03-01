# RedditRadar Frontend

This is the frontend for the RedditRadar application, built with React, TypeScript, and Material-UI.

## Features

- Modern React application with TypeScript
- Material-UI components for a clean, responsive design
- React Router for navigation
- Axios for API communication
- Chart.js for data visualization
- Light/Dark theme support

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── charts/       # Chart components
│   ├── dashboard/    # Dashboard-specific components
│   └── layout/       # Layout components (Header, Sidebar, etc.)
├── pages/            # Page components
├── services/         # API services
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run deploy`

Builds the app and deploys it to the main application's public folder.

## Development Guidelines

- Use TypeScript for all new components and functions
- Follow the component structure for new features
- Use Material-UI components for consistent styling
- Add proper error handling for API calls
- Include loading states for async operations
- Ensure responsive design for all screen sizes
