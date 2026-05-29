import requests
import json
import os

url = "http://localhost:8000/optimize"
payload = {
    "buildingWidth": 20,
    "buildingHeight": 30,
    "rooms": [
        {"id": "1", "name": "Recepción", "type": "Recepción", "width": 5.0, "height": 5.0},
        {"id": "2", "name": "Sala Lounge", "type": "Sala Lounge", "width": 5.0, "height": 5.0},
        {"id": "3", "name": "Pool de Trabajo", "type": "Pool de Trabajo", "width": 10.0, "height": 8.0},
        {"id": "4", "name": "Oficina Gerencia", "type": "Oficina Gerencia", "width": 5.0, "height": 5.0},
        {"id": "5", "name": "Centro de Datos", "type": "Centro de Datos", "width": 4.0, "height": 4.0}
    ]
}

try:
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        os.makedirs("C:/temp", exist_ok=True)
        with open("C:/temp/packing_result.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Success")
except Exception as e:
    print(f"Error: {e}")
