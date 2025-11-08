import requests

# Test login and get token
login_data = {"username": "dasprabir485@gmail.com", "password": "admin123"}

print("🔑 Testing login...")
login_response = requests.post(
    "http://127.0.0.1:8000/api/auth/login",
    data=login_data,
    headers={"Content-Type": "application/x-www-form-urlencoded"},
)

if login_response.status_code == 200:
    token_data = login_response.json()
    access_token = token_data["access_token"]
    print(f"✅ Login successful! Token: {access_token[:50]}...")

    # Test reservations endpoint with token
    print("\n📋 Testing reservations endpoint...")
    headers = {"Authorization": f"Bearer {access_token}"}

    reservations_response = requests.get(
        "http://127.0.0.1:8000/api/reservations", headers=headers
    )

    print(f"Reservations response status: {reservations_response.status_code}")
    if reservations_response.status_code == 200:
        print("✅ Reservations endpoint working!")
        print(f"Response: {reservations_response.json()}")
    else:
        print(f"❌ Reservations failed: {reservations_response.text}")

else:
    print(f"❌ Login failed: {login_response.text}")
