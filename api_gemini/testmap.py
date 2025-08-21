import requests

def geocode_address(address, api_key):
    """
    Chuyển địa chỉ thành tọa độ (vĩ độ, kinh độ) sử dụng Goong.io API
    """
    url = "https://rsapi.goong.io/geocode"
    params = {
        'address': address,
        'api_key': api_key
    }

    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        if 'results' in data and len(data['results']) > 0:
            location = data['results'][0]['geometry']['location']
            return location['lat'], location['lng']
        else:
            print("Không tìm thấy kết quả.")
            return None
    else:
        print(f"Lỗi API: {response.status_code}")
        return None

# 👉 Thay thế bằng API Key của bạn
GOONG_API_KEY = 'Ho0Gu3oKszv6Zgu9OMqmAW6MpAVbxtUjS3RdiJLk'

# 👉 Thay thế bằng địa chỉ bạn muốn geocode
address = "2 Huỳnh Văn Nghệ, Hòa Hải Ngũ Hành Sơn, Đà Nẵng, Việt Nam"

# Gọi hàm
location = geocode_address(address, GOONG_API_KEY)

if location:
    print(f"Tọa độ của địa chỉ là: {location[0]}, {location[1]}")
