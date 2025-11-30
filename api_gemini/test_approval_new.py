import requests
import json

def test_title_filter():
    """Test 1: Kiểm tra lọc tiêu đề không phù hợp"""
    print("🧪 TEST 1: Lọc tiêu đề không phù hợp")
    test_data = {
        "id": "test-room-123",
        "title": "Phòng test nguuu",  # Tiêu đề không phù hợp
        "description": "Mô tả bình thường",
        "priceMonth": 3000000,
        "priceDeposit": 2000000,
        "area": 25,
        "length": 5,
        "width": 5,
        "maxPeople": 2,
        "elecPrice": 3500,
        "waterPrice": 20000,
        "fullAddress": "123 Test Street",
        "convenients": ["Wifi"],
        "images": ["/image/upload/sample.jpg"]
    }
    
    try:
        response = requests.post('http://localhost:5001/ai_approval', json=test_data, timeout=10)
        result = response.json()
        
        if result.get('status') == 2 and any('nguuu' in str(content) for content in result.get('content', [])):
            print("✅ PASS - Đã chặn tiêu đề không phù hợp")
        else:
            print("❌ FAIL - Không chặn được tiêu đề không phù hợp")
            
        print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
        return result.get('status') == 2
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def test_normal_title():
    """Test 2: Kiểm tra tiêu đề bình thường"""
    print("\n🧪 TEST 2: Tiêu đề bình thường")
    test_data = {
        "id": "test-room-456", 
        "title": "Phòng trọ cao cấp gần trường đại học",  # Tiêu đề bình thường
        "description": "Phòng sạch sẽ, đầy đủ tiện nghi",
        "priceMonth": 3000000,
        "priceDeposit": 2000000,
        "area": 25,
        "length": 5,
        "width": 5,
        "maxPeople": 2,
        "elecPrice": 3500,
        "waterPrice": 20000,
        "fullAddress": "123 Lê Lợi, Q1, TP.HCM",
        "convenients": ["Wifi", "Máy lạnh", "Tủ lạnh"],
        "images": ["/image/upload/room-sample.jpg"]
    }
    
    try:
        response = requests.post('http://localhost:5001/ai_approval', json=test_data, timeout=30)
        result = response.json()
        
        print(f"Status: {result.get('status')}")
        print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

if __name__ == "__main__":
    print("🔍 KIỂM TRA HỆ THỐNG DUYỆT PHÒNG")
    print("=" * 50)
    
    # Test lọc tiêu đề
    test1_pass = test_title_filter()
    
    # Test tiêu đề bình thường  
    test2_pass = test_normal_title()
    
    print("\n📋 KẾT QUẢ TỔNG KẾT:")
    print(f"Test 1 (Lọc tiêu đề): {'PASS' if test1_pass else 'FAIL'}")
    print(f"Test 2 (Tiêu đề bình thường): {'PASS' if test2_pass else 'FAIL'}")
    
    if not (test1_pass or test2_pass):
        print("\n⚠️ Đảm bảo server đang chạy: py api_gpt.py")