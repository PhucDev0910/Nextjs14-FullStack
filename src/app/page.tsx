"use client";
import AdItem from "@/components/AdItem";
import SearchForm from "@/components/SearchForm";
import { defaultRadius } from "@/libs/helpers";
import { Ad } from "@/models/Ad";
import { useState } from "react";

export default function Home() {
  const [ads, setAds] = useState<Ad[] | null>(null); //Biến trạng thái lưu trữ danh sách các quảng cáo (Ad[])
  const [adsParams, setAdsParams] = useState<URLSearchParams>(
    new URLSearchParams()
  ); // Biến trạng thái lưu trữ các tham số tìm kiếm dưới dạng URLSearchParams, được sử dụng để tạo URL cho các yêu cầu tìm kiếm (API request).

  /**
   * fetchAds: Làm nhiệm vụ lấy dữ liệu quảng cáo từ API, với các tham số tìm kiếm như center và radius. 
    * Nếu không có center, không thực hiện yêu cầu API.
   * handleSearch: Lấy dữ liệu từ form, chuyển chúng thành tham số URL và gọi fetchAds để thực hiện tìm kiếm quảng cáo.
   * formDirty: Kiểm tra xem form tìm kiếm đã được người dùng chỉnh sửa hay chưa, dựa trên các tham số tìm kiếm hiện tại.
   */
  function fetchAds(params?: URLSearchParams) {
    if (!params) {
      params = new URLSearchParams();
    }
    if (!params.get("center")) {
      return;
    }
    if (!params.has("radius")) {
      params.set("radius", defaultRadius.toString());
    }
    const url = `/api/ads?${params?.toString() || ""}`;
    fetch(url).then((response) => {
      response.json().then((adsDocs) => {
        setAds(adsDocs);
        setAdsParams(params);
      });
    });
  }

  function handleSearch(formData: FormData) {
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      if (typeof value === "string") {
        params.set(key, value);
      }
    });
    fetchAds(params);
  }

  const formDirty =
    adsParams.get("phrase") ||
    adsParams.get("category") ||
    adsParams.get("min") ||
    adsParams.get("max");

  return (
    <div className="flex w-full">
      <SearchForm action={handleSearch} />
      <div className="p-4 grow bg-gray-100 w-3/4">
        <h2 className="font-bold mt-2 mb-4">
          {formDirty ? "Search results" : "Latest ads"}
        </h2>
        <div className="grid md:grid-cols-4 gap-x-4 gap-y-6">
          {ads && ads.map((ad) => <AdItem key={ad._id} ad={ad} />)}
        </div>
        {ads && ads?.length === 0 && (
          <div className="text-gray-400">No products found</div>
        )}
        {ads === null && <div className="text-gray-400">Loading...</div>}
      </div>
    </div>
  );
}
