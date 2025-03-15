import sqlite3
import json

def check_database():
    conn = sqlite3.connect('./data/ideaengine.db')
    cursor = conn.cursor()
    
    # Check table structure
    cursor.execute("PRAGMA table_info(reddit_topics)")
    columns = cursor.fetchall()
    print("\nTable structure:")
    for col in columns:
        print(f"Column: {col[1]}, Type: {col[2]}")
    
    # Check sample data
    cursor.execute("SELECT * FROM reddit_topics LIMIT 1")
    row = cursor.fetchone()
    if row:
        print("\nSample row:")
        for col, val in zip([c[1] for c in columns], row):
            print(f"{col}: {val}")
    
    # Count records
    cursor.execute("SELECT COUNT(*) FROM reddit_topics")
    count = cursor.fetchone()[0]
    print(f"\nTotal records: {count}")
    
    conn.close()

if __name__ == "__main__":
    check_database() 