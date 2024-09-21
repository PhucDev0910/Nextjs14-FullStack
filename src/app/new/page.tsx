"use client";
import AdForm from "@/components/AdForm";

// Định nghĩa kiểu dữ liệu cho location
type Location = {
  lat: number;
  lng: number;
};

// Đối tượng location mặc định
const locationDefault: Location = {
  lat: 59.432226005726896,
  lng: 18.057839558207103,
};

// Component NewAdPage
export default function NewAdPage() {
  return (
    <div>
      {/* Gửi locationDefault như một prop tới AdForm */}
      <AdForm defaultLocation={locationDefault} />
    </div>
  );
}
