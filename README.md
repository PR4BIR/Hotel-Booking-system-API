# Hotel-Booking-system-API
A **full-stack room booking platform** built with **FastAPI**, **MySQL**, and **React (Vite)**, designed to let users search, reserve, and manage room bookings.   The project implements secure **JWT-based authentication**, **SQLAlchemy ORM** for data modeling, and a responsive frontend with **Tailwind CSS**.
---

## 🚀 Features

- 🔐 **User Authentication** – Secure login, registration, and protected routes using JWT.
- 🏨 **Room Management** – Search, filter, and reserve rooms with real-time availability checks.
- 📅 **Booking System** – Manage reservations with CRUD operations.
- 📊 **Database Integration** – MySQL with SQLAlchemy ORM for efficient data relationships.
- 📱 **Responsive UI** – Mobile-friendly design with Tailwind CSS.
- ⚡ **Fast Performance** – Async API endpoints with Pydantic validation.

---

## 🛠 Tech Stack

### **Backend**
- Python (FastAPI)
- SQLAlchemy ORM
- Pydantic
- JWT Authentication
- MySQL

### **Frontend**
- React (Vite)
- Tailwind CSS
- Axios (API calls)
- React Router

---

## ⚙️ Installation & Setup

### **Backend Setup**

# Clone the repository
git clone https://github.com/your-username/room-reservation-system.git
cd room-reservation-system/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run the backend
uvicorn app.main:app --reload
Frontend Setup

cd ../frontend

# Install dependencies
npm install

# Run the frontend
npm run dev
🖼 Screenshots


1️⃣ Homepage

2️⃣ Room Booking Page

<img width="902" height="404" alt="image" src="https://github.com/user-attachments/assets/f7fa8c07-e20f-459b-9c31-757ba5cede42" />


📌 Future Enhancements
📧 Email notifications for bookings

💳 Payment gateway integration

📊 Admin dashboard for room management

🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss the changes.

