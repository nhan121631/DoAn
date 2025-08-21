import requests

# Thay bằng API Key của bạn
API_KEY = "YOUR_HERE_API_KEY"

def get_coordinates(address):
    url = "https://geocode.search.hereapi.com/v1/geocode"
    params = {
        "q": address,
        "apiKey": API_KEY
    }
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print("Lỗi khi gọi API:", response.status_code)
        return None
    
    data = response.json()
    
    if "items" in data and len(data["items"]) > 0:
        position = data["items"][0]["position"]
        lat = position["lat"]
        lng = position["lng"]
        label = data["items"][0].get("title", "")
        return lat, lng, label
    else:
        print("Không tìm thấy địa chỉ.")
        return None

if __name__ == "__main__":
    address = input("Nhập địa chỉ: ")
    result = get_coordinates(address)
    if result:
        lat, lng, label = result
        print(f"Địa chỉ: {label}")
        print(f"Latitude: {lat}")
        print(f"Longitude: {lng}")
