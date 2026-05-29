import requests
import json

url = "http://localhost:8000/optimize"

# Test with a single small room in the service band
rooms = [
    {"id": "1", "name": "Kitchenette", "type": "Kitchenette", "width": 4.0, "height": 3.0}
]

payload = {
    "buildingWidth": 20,
    "buildingHeight": 30,
    "rooms": rooms
}

try:
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print("Error:", response.status_code)
except Exception as e:
    print("Failed:", e)
