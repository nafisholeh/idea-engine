// filters.js - Handles filtering and searching of topics

// Global variables to store the current state
let allTopics = [];
let filteredTopics = [];
let currentFilters = {
    timeframe: '30days',
    category: 'all',
    minScore: 70,
    search: ''
};

// DOM elements
const searchInput = document.querySelector('input[type="text"]');
const searchButton = document.querySelector('button');
const timeframeSelect = document.getElementById('timeframe');
const categorySelect = document.getElementById('category');
const minScoreSelect = document.getElementById('minScore');
const topicsContainer = document.querySelector('.dashboard-grid');
const loadingIndicator = document.createElement('div');

// Set up loading indicator
loadingIndicator.className = 'loading-indicator';
loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading topics...</p>';
loadingIndicator.style.display = 'none';
document.querySelector('.container').appendChild(loadingIndicator);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    timeframeSelect.addEventListener('change', handleTimeframeChange);
    categorySelect.addEventListener('change', handleCategoryChange);
    minScoreSelect.addEventListener('change', handleMinScoreChange);
    
    // Load initial data
    fetchTopics();
});

// Event handlers
function handleSearch() {
    currentFilters.search = searchInput.value.trim();
    applyFilters();
}

function handleTimeframeChange() {
    currentFilters.timeframe = timeframeSelect.value;
    fetchTopics();
}

function handleCategoryChange() {
    currentFilters.category = categorySelect.value;
    applyFilters();
}

function handleMinScoreChange() {
    currentFilters.minScore = parseInt(minScoreSelect.value);
    applyFilters();
}

// Data fetching
async function fetchTopics() {
    showLoading();
    
    try {
        const response = await fetch(`/api/topics?timeframe=${currentFilters.timeframe}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        allTopics = await response.json();
        
        // Apply any existing filters to the new data
        applyFilters();
    } catch (error) {
        console.error('Error fetching topics:', error);
        showError('Failed to load topics. Please try again later.');
    } finally {
        hideLoading();
    }
}

// Filter application
function applyFilters() {
    // Start with all topics
    filteredTopics = [...allTopics];
    
    // Apply category filter
    if (currentFilters.category !== 'all') {
        filteredTopics = filteredTopics.filter(topic => 
            topic.category.toLowerCase() === currentFilters.category.toLowerCase()
        );
    }
    
    // Apply minimum score filter
    filteredTopics = filteredTopics.filter(topic => {
        if (topic.opportunity_scores && topic.opportunity_scores.total_score) {
            return topic.opportunity_scores.total_score >= currentFilters.minScore;
        }
        // If no opportunity score, use growth percentage as a fallback
        return topic.growth_percentage >= currentFilters.minScore;
    });
    
    // Apply search filter
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredTopics = filteredTopics.filter(topic => {
            // Search in topic name
            if (topic.name.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search in pain points
            const hasPainPoint = topic.pain_points.some(point => 
                point.text.toLowerCase().includes(searchTerm)
            );
            if (hasPainPoint) return true;
            
            // Search in solution requests
            const hasSolution = topic.solution_requests.some(solution => 
                solution.text.toLowerCase().includes(searchTerm)
            );
            if (hasSolution) return true;
            
            // Search in app ideas
            const hasAppIdea = topic.app_ideas.some(idea => 
                idea.text.toLowerCase().includes(searchTerm)
            );
            if (hasAppIdea) return true;
            
            return false;
        });
    }
    
    // Update the UI with filtered topics
    renderTopics();
}

// UI rendering
function renderTopics() {
    // Clear existing topics
    topicsContainer.innerHTML = '';
    
    if (filteredTopics.length === 0) {
        topicsContainer.innerHTML = '<div class="no-results">No topics found matching your filters. Try adjusting your search criteria.</div>';
        return;
    }
    
    // Render each topic
    filteredTopics.forEach(topic => {
        const topicCard = createTopicCard(topic);
        topicsContainer.appendChild(topicCard);
    });
}

function createTopicCard(topic) {
    const card = document.createElement('div');
    card.className = 'topic-card';
    
    // Calculate opportunity score
    let opportunityScore = 'N/A';
    if (topic.opportunity_scores && topic.opportunity_scores.total_score) {
        opportunityScore = topic.opportunity_scores.total_score;
    }
    
    // Format growth percentage
    const growthPrefix = topic.growth_percentage > 0 ? '↑' : '↓';
    const growthDisplay = `${growthPrefix} ${Math.abs(topic.growth_percentage)}%`;
    
    card.innerHTML = `
        <div class="topic-header">
            <div class="topic-title">${topic.name}</div>
            <div class="topic-metrics">
                <div class="metric">
                    <span>${growthDisplay}</span>
                </div>
                <div class="metric">
                    <span>${topic.mention_count.toLocaleString()} mentions</span>
                </div>
            </div>
        </div>
        
        <div class="section-title">Common Pain Points</div>
        <div class="tags-container">
            ${renderTags(topic.pain_points.slice(0, 3), 'pain-point')}
        </div>
        <div class="item-list">
            ${renderItems(topic.pain_points.slice(0, 1))}
        </div>
        
        <div class="section-title">Solution Requests</div>
        <div class="tags-container">
            ${renderTags(topic.solution_requests.slice(0, 3), 'solution')}
        </div>
        
        <div class="section-title">App Ideas</div>
        <div class="tags-container">
            ${renderTags(topic.app_ideas.slice(0, 3), 'app-idea')}
        </div>
        
        <div class="section-title">Topic Trend</div>
        <div class="trend-chart">
            ${renderTrendChart(topic.trend_data)}
        </div>
    `;
    
    return card;
}

function renderTags(items, tagClass) {
    return items.map(item => `
        <span class="tag ${tagClass}">${item.text}</span>
    `).join('');
}

function renderItems(items) {
    return items.map(item => `
        <div class="item">
            <div class="item-header">
                <div class="item-title">${item.text}</div>
                <div class="item-mentions">${item.mentions} mentions</div>
            </div>
            <div class="item-text">"${item.examples[0] || ''}"</div>
        </div>
    `).join('');
}

function renderTrendChart(trendData) {
    // Sort trend data by date
    const sortedData = [...trendData].sort((a, b) => {
        return new Date(a.month) - new Date(b.month);
    });
    
    // Get the last 6 months of data or all if less than 6
    const displayData = sortedData.slice(-6);
    
    // Find the maximum count for scaling
    const maxCount = Math.max(...displayData.map(item => item.count));
    
    return displayData.map(item => {
        const heightPercentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        const month = new Date(item.month).toLocaleString('default', { month: 'short' });
        
        return `
            <div class="trend-bar" style="height: ${heightPercentage}%;">
                <div class="trend-date">${month}</div>
            </div>
        `;
    }).join('');
}

// UI helpers
function showLoading() {
    loadingIndicator.style.display = 'flex';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    document.querySelector('.container').insertBefore(errorDiv, topicsContainer);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
} 