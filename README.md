# 🚀 MERN Stack Product Listing App (Fresher Machine Test)

## 📌 Objective

Build a full-stack **Product Listing Application** using:

* **Frontend:** React.js
* **Backend:** Node.js + Express
* **Database:** JSON file (No MongoDB / SQL)

This app allows users to **view, search, filter, sort, and manage products** with full CRUD functionality.

---

## 🛠️ Tech Stack

### Frontend

* React.js (Hooks + Functional Components)
* CSS (Custom Styling)

### Backend

* Node.js
* Express.js
* File System (`fs`)
* Multer (for image upload)

---

## ✨ Features

### 🔹 Frontend

* 📦 Grid View & List View
* 🔄 Toggle Layout (Grid/List)
* 🔍 Search Products
* 📊 Sorting (Price, Name)
* 🎯 Filtering (Category, Brand, Variants)
* 📄 Pagination (Backend Driven)
* ➕ Add Product
* ✏️ Edit Product
* ❌ Delete Product
* 📱 Responsive UI

---

### 🔹 Backend

* 📁 JSON File as Database
* 🔁 Full CRUD APIs
* 🔍 Search, Filter, Sort, Pagination
* 📂 Image Upload using Multer
* ⚠️ Error Handling

---

## 📂 Project Structure

```id="folder-structure"
project-root/
│
├── backend/
│   ├── controllers/
│   │   └── productControllers.js
│   │
│   ├── data/
│   │   └── products.json
│   │
│   ├── routes/
│   │   └── productRoutes.js
│   │
│   ├── uploads/
│   │
│   ├── utils/
│   │   ├── fileHandler.js
│   │   └── multer.js
│   │
│   ├── .env
│   ├── app.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Filters.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductForm.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/product-listing-app.git
cd product-listing-app
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

Server runs on:

```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on:

```
http://localhost:5173
```

---

## 🔗 API Endpoints

### 📌 Get Products

```
GET /api/products
```

### Example:

```
/api/products?search=phone&page=1&limit=10&sort=price&category=electronics
```

---

### 📌 Get Product by ID

```
GET /api/products/:id
```

---

### 📌 Add Product

```
POST /api/products
```

---

### 📌 Update Product

```
PUT /api/products/:id
```

---

### 📌 Delete Product

```
DELETE /api/products/:id
```

---

## 📊 Query Parameters

| Parameter | Description                        |
| --------- | ---------------------------------- |
| search    | Search by name, brand, description |
| page      | Page number                        |
| limit     | Items per page                     |
| sort      | price / name                       |
| order     | asc / desc                         |
| category  | Filter by category                 |
| brand     | Filter by brand                    |
| minPrice  | Minimum price                      |
| maxPrice  | Maximum price                      |
| minRating | Minimum rating                     |
| color     | Filter by color                    |
| storage   | Filter by storage                  |
| inStock   | true / false                       |
| discount  | true                               |

---

## 🧪 Evaluation Criteria Covered

✅ Clean Code Structure
✅ Proper API Implementation
✅ Full CRUD Working
✅ UI Functional (Search, Filter, Sort, Pagination)
✅ Responsive Design

---

## 🚀 Future Improvements

* 🔐 Authentication (Login/Register)
* ❤️ Wishlist Feature
* 🛒 Cart System
* 💳 Payment Integration
* 🗄️ MongoDB Integration

---

## 👨‍💻 Author

**Mohit Yadav**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
