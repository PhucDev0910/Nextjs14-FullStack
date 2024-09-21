"use client"; // Thêm nếu bạn sử dụng trong Next.js

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export type Location = {
  lat: number; // vĩ độ
  lng: number; // kinh độ
};

export default function LocationPicker({
  defaultLocation,
  onChange,
  gpsCoords,
}: {
  defaultLocation: Location;
  onChange: (location: Location) => void;
  gpsCoords: Location | null;
}) {
  const divRef = useRef<HTMLDivElement>(null); // Sử dụng useRef cho DOM reference

  async function loadMap() {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_MAPS_KEY as string,
    });
    const { Map } = await loader.importLibrary("maps");
    const { AdvancedMarkerElement } = await loader.importLibrary("marker");

    if (divRef.current) {
      const map = new Map(divRef.current, {
        mapId: "map", // ID
        center: defaultLocation, // vị trí trung tâm
        zoom: 6, // mức độ zoom
        mapTypeControl: false,
        streetViewControl: false,
      });

      const pin = new AdvancedMarkerElement({
        map,
        position: defaultLocation,
      });

      map.addListener("click", (ev: google.maps.MapMouseEvent) => {
        if (ev.latLng) { // Kiểm tra nếu latLng tồn tại
          const lat = ev.latLng.lat(); // Lấy vĩ độ
          const lng = ev.latLng.lng(); // Lấy kinh độ
          pin.position = ev.latLng; // Cập nhật vị trí pin
          onChange({ lat, lng }); // Gọi onChange
        }
      });

      // Nếu có tọa độ GPS, cập nhật vị trí pin và trung tâm bản đồ
      if (gpsCoords) {
        const newCoords = new google.maps.LatLng(gpsCoords.lat, gpsCoords.lng);
        pin.position = newCoords;
        map.setCenter(newCoords);
      }
    }
  }

  useEffect(() => {
    loadMap(); // Tải bản đồ khi gpsCoords hoặc defaultLocation thay đổi
  }, [gpsCoords, defaultLocation]);

  return (
    <>
      <div ref={divRef} id="map" className="w-full h-[200px]"></div>
    </>
  );
}
