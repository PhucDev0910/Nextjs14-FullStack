import { Location } from "@/components/LocationPicker";
import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState, useCallback } from "react";

/** Cách hoạt động
 * Khi component được render lần đầu tiên, useEffect thứ 3 sẽ chạy và cố gắng lấy vị trí hiện tại của người dùng.
 * Nếu lấy được vị trí, component sẽ cập nhật giá trị center và lưu vị trí này vào localStorage.
 * Khi bán kính hoặc vị trí trung tâm thay đổi, onChange sẽ được gọi để truyền dữ liệu mới nhất ra ngoài component.
 */
export default function DistancePicker({
  onChange,
  defaultRadius,
}: {
  onChange: ({ radius, center }: { radius: number; center: Location }) => void;
  defaultRadius: number;
}) {
  const [radius, setRadius] = useState(defaultRadius); // lưu trữ giá trị bán kính
  const [center, setCenter] = useState<Location | null>(null);
  const [zoom, setZoom] = useState<number>(7);
  const [geoError, setGeoError] = useState("");
  const mapsDiv = useRef<HTMLDivElement | null>(null);

  const loadMap = useCallback(async () => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_MAPS_KEY as string,
    });

    const Core = await loader.importLibrary("core");
    const { Map, Circle } = await loader.importLibrary("maps");
    const map = new Map(mapsDiv.current as HTMLDivElement, {
      mapId: "map",
      center: center,
      zoom: zoom,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: true,
    });
    const circle = new Circle({
      map,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      center: center,
      radius,
      editable: true,
    });

    Core.event.addListener(circle, "bounds_changed", () => {
      const radius = circle.getRadius();
      setRadius(radius);
      // Điều chỉnh zoom tương ứng với bán kính
      if (radius > 1500000) map.setZoom(1);
      else if (radius > 800000) map.setZoom(2);
      else if (radius > 400000) map.setZoom(3);
      else if (radius > 180000) map.setZoom(4);
      else if (radius > 100000) map.setZoom(5);
      else if (radius > 50000) map.setZoom(6);
      else if (radius > 25000) map.setZoom(7);
      else if (radius > 11000) map.setZoom(8);
      else if (radius > 5000) map.setZoom(9);
      else if (radius <= 10000) map.setZoom(10);
      setZoom(map.getZoom() as number);
    });

    Core.event.addListener(circle, "center_changed", () => {
      const circleCenter: Location | undefined = circle.getCenter()?.toJSON();
      if (circleCenter) {
        setCenter(circleCenter);
        map.setCenter(circleCenter);
      }
    });
  }, [center, radius, zoom]); // Thêm các dependency cần thiết

  useEffect(() => {
    if (center) {
      loadMap();
      if (window && window.localStorage) {
        window.localStorage.setItem("center", JSON.stringify(center));
      }
    } else if (window && window.localStorage) {
      const centerFromLS = window.localStorage.getItem("center");
      if (centerFromLS) {
        setCenter(JSON.parse(centerFromLS));
      }
    }
  }, [center, loadMap]);

  useEffect(() => {
    if (center && radius) {
      onChange({ center, radius });
    }
  }, [center, radius, onChange]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (ev) => {
        setCenter({ lat: ev.coords.latitude, lng: ev.coords.longitude });
      },
      (err) => setGeoError(err.message)
    );
  }, []);

  return (
    <>
      <label>Where</label>
      <div ref={mapsDiv} className="w-full h-48 bg-gray-200">
        {(!center || geoError) && (
          <div className="text-gray-400 p-4">
            {geoError || "Loading map...."}
          </div>
        )}
      </div>
    </>
  );
}
