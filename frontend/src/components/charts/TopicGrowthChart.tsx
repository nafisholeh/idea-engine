import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendData {
  month: string;
  count: number;
}

interface Topic {
  id: number;
  name: string;
  trendData: TrendData[];
}

interface TopicGrowthChartProps {
  topics: Topic[];
  title?: string;
  loading?: boolean;
}

const TopicGrowthChart: React.FC<TopicGrowthChartProps> = ({ 
  topics, 
  title = 'Topic Growth Over Time',
  loading = false
}) => {
  // Extract all unique months from all topics
  const allMonths = new Set<string>();
  topics.forEach(topic => {
    if (topic.trendData) {
      topic.trendData.forEach(data => {
        allMonths.add(data.month);
      });
    }
  });

  // Sort months chronologically
  const sortedMonths = Array.from(allMonths).sort();

  // Prepare data for the chart
  const chartData = {
    labels: sortedMonths,
    datasets: topics.map((topic, index) => {
      // Generate a color based on index
      const hue = (index * 137) % 360; // Use golden ratio to spread colors
      const color = `hsl(${hue}, 70%, 60%)`;
      
      // Create a map of month to count for easy lookup
      const monthCountMap = new Map<string, number>();
      if (topic.trendData) {
        topic.trendData.forEach(data => {
          monthCountMap.set(data.month, data.count);
        });
      }
      
      // Generate data points for all months (use 0 if no data for a month)
      const dataPoints = sortedMonths.map(month => monthCountMap.get(month) || 0);
      
      return {
        label: topic.name,
        data: dataPoints,
        borderColor: color,
        backgroundColor: `${color}33`, // Add transparency
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      };
    }),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Mentions',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: 300, position: 'relative' }}>
          {loading ? (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1
              }}
            >
              <CircularProgress />
            </Box>
          ) : null}
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopicGrowthChart; 