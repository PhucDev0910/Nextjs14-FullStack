"use client";
import { createAd, updateAd } from "@/app/actions/adActions";
import AdTextInputs, { AdTexts } from "@/components/AdTextInputs";
import LocationPicker, { Location } from "@/components/LocationPicker";
import SubmitButton from "@/components/SubmitButton";
import UploadArea from "@/components/UploadArea";
import { faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UploadResponse } from "imagekit/dist/libs/interfaces";
import { redirect } from "next/navigation";
import { useState } from "react";

type Props = {
  id?: string | null; // ID của quảng cáo nếu là bản cập nhật
  defaultFiles?: UploadResponse[]; // Tệp tin mặc định cho quảng cáo
  defaultLocation: Location; // Vị trí mặc định cho quảng cáo
  defaultTexts?: AdTexts; // Văn bản mặc định cho quảng cáo
};

export default function AdForm({
  id = null,
  defaultFiles = [],
  defaultLocation,
  defaultTexts = {},
}: Props) {
  const [files, setFiles] = useState<UploadResponse[]>(defaultFiles); //Trạng thái lưu trữ các tệp tin hiện tại. Khởi tạo bằng defaultFiles
  const [location, setLocation] = useState<Location>(defaultLocation); //Trạng thái lưu trữ vị trí hiện tại. Khởi tạo bằng defaultLocation
  const [gpsCoords, setGpsCoords] = useState<Location | null>(null); //Trạng thái lưu trữ tọa độ GPS hiện tại. Khởi tạo bằng null

  function handleFindMyPositionClick() {
    /**
     * Hàm này lấy vị trí hiện tại của người dùng bằng API navigator.geolocation và cập nhật trạng thái location và gpsCoords.
     */
    navigator.geolocation.getCurrentPosition((ev) => {
      const location = { lat: ev.coords.latitude, lng: ev.coords.longitude };
      //Khi thành công, hàm cập nhật location và gpsCoords với tọa độ hiện tại của người dùng.
      setLocation(location);
      setGpsCoords(location);
    }, console.error);
  }
  //Hàm này xử lý việc gửi dữ liệu từ form đến server.
  async function handleSubmit(formData: FormData) {
    formData.set("location", JSON.stringify(location)); //Chuyển đổi đối tượng location thành chuỗi JSON và thiết lập nó trong FormData.
    formData.set("files", JSON.stringify(files)); //Chuyển đổi mảng files thành chuỗi JSON và thiết lập nó trong FormData.
    if (id) {
      formData.set("_id", id); //Nếu id có giá trị, thêm nó vào FormData để cập nhật quảng cáo hiện có.
    }
    const result = id ? await updateAd(formData) : await createAd(formData);
    redirect("/ad/" + result._id); // nhận được kết quả từ server, hàm chuyển hướng đến trang chi tiết của quảng cáo (/ad/ + result._id).
  }

  return (
    <form
      action={handleSubmit}
      className="max-w-xl mx-auto grid grid-cols-2 gap-12"
    >
      <div className="grow pt-8">
        <UploadArea files={files} setFiles={setFiles} />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="" className="mt-0 mb-0">
              Where
            </label>
            <div>
              <button
                type="button"
                onClick={handleFindMyPositionClick}
                className="border flex p-1 items-center gap-1 justify-center text-gray-600 rounded"
              >
                <FontAwesomeIcon icon={faLocationCrosshairs} />
              </button>
            </div>
          </div>
          <div className="bg-gray-100 rounded overflow-hidden text-gray-400 text-center">
            <LocationPicker
              defaultLocation={defaultLocation}
              gpsCoords={gpsCoords}
              onChange={(location) => setLocation(location)}
            />
          </div>
        </div>
      </div>

      <div className="grow pt-2">
        <AdTextInputs defaultValues={defaultTexts} />
        <SubmitButton>{id ? "Save" : "Publish"}</SubmitButton>
      </div>
    </form>
  );
}
