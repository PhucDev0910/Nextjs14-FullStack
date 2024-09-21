"use server";

import { Location } from "@/components/LocationPicker";
import { authOptions } from "@/libs/authOptions";
import { AdModel } from "@/models/Ad";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

async function connect() {
  return mongoose.connect(process.env.MONGODB_URL as string);
}

/**
 * locationObjectToMongoObject nhận một đối tượng Location với thuộc tính lat (vĩ độ) và lng (kinh độ).
 * Hàm này chuyển đổi tọa độ đó thành một đối tượng GeoJSON có kiểu Point với thứ tự tọa độ phù hợp (longitude trước, latitude sau).
 * MongoDB có thể sử dụng đối tượng này để lưu trữ dữ liệu địa lý và thực hiện các truy vấn không gian (geospatial queries).
 * Như tìm kiếm địa điểm gần nhau.
 */
function locationObjectToMongoObject(location: Location) {
  return {
    type: "Point",
    coordinates: [Number(location.lng), Number(location.lat)], // Chuyển đổi thành số
  };
}

export async function createAd(formData: FormData) {
  //chuyển đổi formdata thành một object với mỗi trường trong formdata thành một cặp key-value
  const { files, location, ...data } = Object.fromEntries(formData);
  await connect();
  const session = await getServerSession(authOptions);
  const newAdData = {
    ...data,
    files: JSON.parse(files as string), // chuyển chuỗi json chứa list hình ảnh thành mảng
    location: locationObjectToMongoObject(JSON.parse(location as string)), // chuyển đổi json chứa vị trí thành mảng chứa vị trí
    userEmail: session?.user?.email, //  save user email present
  };
  const newAdDoc = await AdModel.create(newAdData);
  return JSON.parse(JSON.stringify(newAdDoc));
}

export async function updateAd(formData: FormData) {
  const { _id, files, location, ...data } = Object.fromEntries(formData);
  await connect();
  const session = await getServerSession(authOptions);
  const adDoc = await AdModel.findById(_id); // tìm kiểm một quảng cáo bằng id trong mongo để cập nhật
  if (!adDoc || adDoc.userEmail !== session?.user?.email) {
    // nếu 1 trong 2 điều kiện này đúng thì không cho phép cập nhật và kết thúc hàm
    return;
  }
  const adData = {
    ...data,
    files: JSON.parse(files as string),
    location: locationObjectToMongoObject(JSON.parse(location as string)),
  };
  const newAdDoc = await AdModel.findByIdAndUpdate(_id, adData); // update lại ads trong mongo bằng id và dữ liệu mới addata
  /**
   * revalidatePath(/ad/ + _id): Sau khi quảng cáo được cập nhật, lệnh này yêu cầu Next.js tái xác thực (revalidate). 
   * Trang tương ứng với quảng cáo. Điều này đảm bảo rằng dữ liệu mới sẽ được hiển thị khi người dùng truy cập lại trang.
   */
  revalidatePath(`/ad/` + _id);
  return JSON.parse(JSON.stringify(newAdDoc)); // returns về tài liệu quảng cáo đã cập nha
}
