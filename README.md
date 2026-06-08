# 🪐 Planet-FE2
 
> **Khám phá Hệ Mặt Trời** — một ứng dụng web 3D tương tác cho phép bạn du hành qua từng hành tinh, đọc truyền thuyết và tìm hiểu dữ liệu khoa học về vũ trụ.
 
---
 
## ✨ Tính năng
 
- 🌍 **Hệ Mặt Trời 3D** — mô hình các hành tinh quay theo quỹ đạo thực tế, được dựng bằng Three.js
- 📖 **Sách truyền thuyết** — mỗi hành tinh có câu chuyện riêng, hiển thị qua hiệu ứng lật trang 3D cinematic
- 🔭 **Dữ liệu khoa học** — đường kính, khoảng cách, nhiệt độ và nhiều thông tin thiên văn học
- 🎨 **Giao diện vũ trụ** — nền sao, hiệu ứng ánh sáng và không khí không gian sâu
- 📱 **Responsive** — hoạt động trên cả desktop và mobile
---

## NASA/JPL Horizons

Chế độ `Thực tế` lấy vector quỹ đạo từ NASA/JPL Horizons qua route `/api/horizons`.
Khi chạy local, Vite proxy trong `vite.config.js` chuyển tiếp route này tới `https://ssd.jpl.nasa.gov/api/horizons.api` để tránh CORS.
Khi deploy static, cần cấu hình proxy tương tự và đặt `VITE_HORIZONS_PROXY_URL` nếu endpoint không phải `/api/horizons`.
---
 
## 🚀 Demo
 
> _Coming soon_
 
---
 
## 🛠️ Công nghệ sử dụng
 
| Công nghệ | Mục đích |
|-----------|----------|
| **React** | UI framework |
| **Three.js** | Render 3D hành tinh và không gian |
| **Zustand** | Quản lý trạng thái toàn cục |
| **CSS 3D Transforms** | Hiệu ứng lật sách cinematic |
| **Vite** | Build tool & dev server |
 

```
 
---
 
## 🪐 Các hành tinh
 
| Hành tinh | Đặc điểm nổi bật |
|-----------|-----------------|
| ☀️ Mặt Trời | Ngôi sao trung tâm, nhiệt độ bề mặt ~5,500°C |
| 🪨 Sao Thủy | Hành tinh nhỏ nhất, không có khí quyển |
| 🌡️ Sao Kim | Hành tinh nóng nhất do hiệu ứng nhà kính |
| 🌍 Trái Đất | Hành tinh duy nhất có sự sống đã biết |
| 🔴 Sao Hỏa | "Hành tinh đỏ" với ngọn núi lửa cao nhất |
| 🟠 Sao Mộc | Hành tinh lớn nhất với vết đỏ huyền thoại |
| 💍 Sao Thổ | Nổi tiếng với hệ vành đai băng đá |
| 🔵 Sao Thiên Vương | Quay nghiêng 98° so với quỹ đạo |
| 🌊 Sao Hải Vương | Hành tinh xa nhất, gió mạnh nhất hệ mặt trời |
 
---

---
 
## 📄 Giấy phép
 
Dự án được phân phối theo giấy phép **Apache-2.0**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.
 
---
 
<div align="center">
  <p>Made with ❤️ and ✨ by <a href="https://github.com/Meowken248">Meowken248</a></p>
  <p><i>Vũ trụ rộng lớn — hãy bắt đầu khám phá từ đây.</i></p>
</div>
