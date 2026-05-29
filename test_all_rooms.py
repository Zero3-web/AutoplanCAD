import requests
import json

url = "http://localhost:8000/optimize"

rooms = [
    {"id": "1", "name": "Pool de Trabajo", "type": "Pool de Trabajo", "width": 8.0, "height": 6.0},
    {"id": "2", "name": "Directorio", "type": "Directorio", "width": 6.0, "height": 4.5},
    {"id": "3", "name": "Sala Lounge", "type": "Sala Lounge", "width": 4.0, "height": 4.0},
    {"id": "4", "name": "Sala Reunión", "type": "Sala Reunión", "width": 4.0, "height": 3.5},
    {"id": "5", "name": "Oficina Gerencia", "type": "Oficina Gerencia", "width": 4.0, "height": 3.0},
    {"id": "6", "name": "Oficina Jefatura", "type": "Oficina Jefatura", "width": 3.5, "height": 3.0},
    {"id": "7", "name": "Lactario", "type": "Lactario", "width": 2.0, "height": 2.0},
    {"id": "8", "name": "Cuarto Limpieza", "type": "Cuarto Limpieza", "width": 1.5, "height": 2.0},
    {"id": "9", "name": "Recepción", "type": "Recepción", "width": 4.0, "height": 4.0},
    {"id": "10", "name": "Almacén", "type": "Almacén", "width": 3.0, "height": 4.0},
    {"id": "11", "name": "Cabina Reunión", "type": "Cabina Reunión", "width": 2.5, "height": 2.5}
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
        with open("C:/temp/full_test.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Success! Checked C:/temp/full_test.json")
    else:
        print("Error:", response.status_code)
except Exception as e:
    print("Failed:", e)
