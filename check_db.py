import sqlite3

try:
    # Connect to the database
    conn = sqlite3.connect('reddit_insights.db')
    cursor = conn.cursor()
    
    # Check if the reddit_topics table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='reddit_topics'")
    if cursor.fetchone():
        # Count the number of topics
        cursor.execute('SELECT COUNT(*) FROM reddit_topics')
        count = cursor.fetchone()[0]
        print(f'Number of topics: {count}')
        
        # Get sample topics
        if count > 0:
            cursor.execute('SELECT id, name, category FROM reddit_topics LIMIT 5')
            rows = cursor.fetchall()
            print('\nSample topics:')
            for row in rows:
                print(row)
    else:
        print("The 'reddit_topics' table does not exist.")
    
    # Close the connection
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
