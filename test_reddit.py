import praw
import configparser
import requests
import urllib3
from requests.adapters import HTTPAdapter
import socks
import socket
import ssl
import certifi
from urllib3.contrib.socks import SOCKSProxyManager

# Disable SSL warnings
urllib3.disable_warnings()

def main():
    # Configure SOCKS proxy (Tor)
    socks.set_default_proxy(socks.SOCKS5, "127.0.0.1", 9150)
    socket.socket = socks.socksocket

    # Load configuration
    config = configparser.ConfigParser()
    config.read('config.ini')
    
    # Create a proxy manager with custom SSL context
    proxy_url = 'socks5h://127.0.0.1:9150'
    proxy_manager = SOCKSProxyManager(
        proxy_url,
        cert_reqs='CERT_NONE',
        ca_certs=certifi.where()
    )
    
    # Create a session with the proxy manager
    session = requests.Session()
    session.verify = False  # Disable SSL verification for testing
    session.proxies = {
        'http': proxy_url,
        'https': proxy_url
    }
    
    # Initialize the Reddit API client
    reddit = praw.Reddit(
        client_id=config['REDDIT']['client_id'],
        client_secret=config['REDDIT']['client_secret'],
        user_agent=config['REDDIT']['user_agent'],
        requestor_kwargs={'session': session}
    )
    
    print("Attempting to connect to Reddit API through Tor...")
    
    try:
        # Try to get the top post from r/python
        subreddit = reddit.subreddit("python")
        for submission in subreddit.hot(limit=1):
            print(f"\nSuccessfully connected! Here's the top post from r/python:")
            print(f"Title: {submission.title}")
            print(f"Score: {submission.score}")
            print(f"URL: {submission.url}")
            break
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main() 