# Bài tập 06 - 20/05/2026


## 1. Chức năng Giỏ hàng (Cart)

- Add To Cart
- Update Quantity
- Remove Cart Item
- Clear Cart
- Mini Cart Drawer
- Global Cart State bằng Context API
- Lưu dữ liệu giỏ hàng bằng MongoDB

---

# 2. Chức năng Thanh toán (Checkout)

- Checkout từ Cart
- Thanh toán COD
- Nhập địa chỉ giao hàng
- Snapshot thông tin sản phẩm và giá tại thời điểm đặt hàng
- Tự động clear cart sau khi đặt hàng thành công

---

# 3. Guest & Authentication UI

- Guest hiển thị nút Login
- Chặn checkout khi chưa đăng nhập
- Redirect sang Login trước khi checkout

---

# 4. Chức năng Theo dõi đơn hàng

Người dùng có thể:

- Xem lịch sử mua hàng
- Xem chi tiết đơn hàng
- Theo dõi trạng thái đơn hàng
- Hủy đơn hàng trong 30 phút đầu
- Gửi yêu cầu hủy đơn nếu shop đang chuẩn bị hàng
- Xác nhận đã nhận hàng khi đơn đang giao

---

# 5. Trạng thái đơn hàng

1. Pending (Đơn hàng mới)
2. Confirmed (Đã xác nhận)
3. Preparing (Shop chuẩn bị hàng)
4. Shipping (Đang giao hàng)
5. Delivered (Đã giao thành công)
6. Cancelled (Đã hủy)
7. Cancel Requested (Yêu cầu hủy đơn)

---

# 6. Logic cập nhật trạng thái

## User

- Chỉ được hủy đơn trong 30 phút đầu
- Nếu đơn đang `preparing`
  - Chuyển sang `cancel_requested`
- Nếu đơn đang `shipping`
  - User có thể xác nhận `delivered`

---

## Admin

Admin có thể:

- Xem toàn bộ đơn hàng
- Lọc đơn theo trạng thái
- Cập nhật trạng thái đơn hàng đúng flow

Flow hợp lệ:

```txt
pending -> confirmed
confirmed -> preparing
preparing -> shipping
shipping -> delivered
pending/confirmed -> cancelled
```

---

# 7. Admin Dashboard

- View All Orders
- Filter Orders By Status
- Update Order Status
- Pagination
- Order Timeline Tracking
