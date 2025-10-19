import requests

def send_webhook(url: str, payload: dict):
    """Send webhook notification safely."""
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"📡 Webhook sent to {url} | Status: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Webhook failed for {url}: {e}")
