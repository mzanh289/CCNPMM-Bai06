# Bài tập 05 - 18/05/2026

Yêu cầu: bài tập cá nhân bao gồm API + UI, commit lên github cá nhân.

---

# Giới thiệu dự án

Dự án xây dựng website Ecommerce sử dụng:

- Frontend: React + Vite + TailwindCSS + Ant Design
- Backend: Node.js + Express + MongoDB
- UI responsive hiện đại
- Lazy loading sản phẩm
- Tìm kiếm và lọc nhiều điều kiện
- Swiper hiển thị ảnh sản phẩm
- API RESTful

---

# Chức năng chính

## Trang chủ

Hiển thị các khu vực:

- Khuyến mãi (Promotions)
- Sản phẩm mới nhất (Latest Products)
- Sản phẩm bán chạy nhất (Best Sellers)
- Sản phẩm xem nhiều nhất (Most Viewed)
- Danh mục sản phẩm
- Thông tin thành viên đăng nhập
- Logout

---

## Trang chi tiết sản phẩm

Bao gồm:

- Thông tin sản phẩm
- Swiper nhiều ảnh sản phẩm
- Báo số lượng tồn kho
- Số lượng đã bán
- Tăng giảm số lượng
- Sản phẩm tương tự
- Hiển thị danh mục tương ứng

---

## Tìm kiếm và lọc sản phẩm

Hỗ trợ:

- Tìm kiếm theo tên
- Lọc theo danh mục
- Khoảng giá
- Có giảm giá
- Còn hàng
- Bán chạy
- Sắp xếp giá tăng/giảm
- Sản phẩm mới nhất

---

# Yêu cầu nâng cao

## 1. Lazy Loading sản phẩm theo danh mục

Chức năng hiển thị tất cả sản phẩm theo từng danh mục sử dụng:

- Lazy Loading để tải tiếp sản phẩm khi kéo xuống cuối trang
- Có hỗ trợ API phân trang
- UI tự động load thêm sản phẩm khi scroll

Áp dụng cho:

- Product Catalog
- Search Result
- Category Products

---

## 2. Hiển thị Top 10 sản phẩm bán chạy và xem nhiều

Bao gồm:

- Top 10 Best Sellers
- Top 10 Most Viewed Products

Tính năng:

- API riêng cho từng loại
- Hiển thị dạng horizontal slider
- Phân trang/cuộn ngang bằng nút Prev/Next
- Responsive UI

---

# Công nghệ sử dụng

## Frontend

- React
- Vite
- TailwindCSS
- Ant Design
- Swiper
- Axios
- React Router DOM

## Backend

- Node.js
- ExpressJS
- MongoDB + Mongoose
- JWT Authentication
- Multer Upload
- Nodemailer

---

# Cấu trúc thư mục

```bash
project-root/
│
├── backend/
│   ├── src/
│   ├── package.json
│
├── frontend/
│   ├── src/
│   ├── package.json
│
├── package.json
└── README.md
```

---

# Hướng dẫn cài đặt và chạy dự án

## 1. Clone project

```bash
git clone <your-repository-url>
cd Group10-ecommerce-api-ui
```

---

## 2. Cài dependencies

### Cài package cho root

```bash
npm install
```

### Cài package cho backend

```bash
cd backend
npm install
```

### Cài package cho frontend

```bash
cd ../frontend
npm install
```

---

# Cấu hình môi trường

## Tạo file `.env`

Tạo file:

```bash
backend/.env
```

---

# Import dữ liệu sản phẩm

Từ thư mục root:

```bash
npm run seed
```

Hoặc:

```bash
cd backend
npm run seed:products
```

Script sẽ:

- Import sản phẩm
- Import danh mục
- Random soldQuantity
- Random viewCount
- Random discountPrice
- Không bị duplicate dữ liệu

---

# Chạy Backend

Mở terminal:

```bash
cd backend
npm run dev
```

Backend chạy tại:

```bash
http://localhost:8080
```

---

# Chạy Frontend

Mở terminal khác:

```bash
cd frontend
npm run dev
```

Frontend chạy tại:

```bash
http://localhost:5173
```

---

