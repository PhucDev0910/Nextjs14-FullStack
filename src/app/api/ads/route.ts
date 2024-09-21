import { authOptions } from "@/libs/authOptions";
import { connect } from "@/libs/helpers";
import { Ad, AdModel } from "@/models/Ad";
import { FilterQuery, PipelineStage } from "mongoose";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  await connect();
  const { searchParams } = new URL(req.url); //URL từ yêu cầu của người dùng. Dùng URL(req.url) để tạo một đối tượng URL từ đó.
  //searchParams.get(...): Hàm này được dùng để lấy giá trị của các tham số từ URL (query parameters).
  const phrase = searchParams.get("phrase"); // cụm từ tìm kiếm quảng cáo
  const category = searchParams.get("category"); //danh mục quảng cáo
  const min = searchParams.get("min"); // giới hạn giá trị nhỏ nhất
  const max = searchParams.get("max"); // giới hạn giá trị lớn nhất
  const radius = searchParams.get("radius"); // sử dụng cho tìm kiếm địa lý
  const center = searchParams.get("center"); // sử dụng cho tìm kiếm địa lý

  //Được sử dụng để tạo điều kiện lọc khi tìm kiếm các quảng cáo. Dựa trên các tham số người dùng cung cấp
  const filter: FilterQuery<Ad> = {};
  const aggregationSteps: PipelineStage[] = [];
  if (phrase) {
    /**
     * Nếu có cụm từ tìm kiếm (phrase), sẽ tìm quảng cáo mà tiêu đề khớp với cụm từ đó.
     * Bằng cách sử dụng biểu thức chính quy ($regex), không phân biệt chữ hoa/thường.
     */
    filter.title = { $regex: ".*" + phrase + ".*", $options: "i" };
  }
  if (category) {
    //Nếu có danh mục được chọn, chỉ tìm kiếm quảng cáo thuộc danh mục đó.
    filter.category = category;
  }
  //Nếu có giá trị min hoặc max, sẽ lọc quảng cáo có giá nằm trong khoảng này.
  if (min && !max) filter.price = { $gte: min };
  if (max && !min) filter.price = { $lte: max };
  if (min && max) filter.price = { $gte: min, $lte: max };

  //tìm kiếm theo vị trí địa lý
  if (radius && center) {
    const coords = center.split("-"); // toạ độ
    const lat = parseFloat(coords[0]); // vĩ độ
    const lng = parseFloat(coords[1]); // kinh độ
    aggregationSteps.push({
      //$geoNear sử dụng để tìm kiếm vị trí (GeoSearch)
      $geoNear: {
        near: {
          // vị trí trung tâm tìm kiếm được xác định bằng [lng,lat] kinh độ và vĩ độ
          type: "Point",
          coordinates: [lng, lat],
        },
        query: filter, // điều kiện lọc
        includeLocs: "location", // lưu thông tin vị trí quảng cáo dưới trường "location"
        distanceField: "distance", // lưu khoảng cách giữa vị trí tìm kiếm và tài liệu vào trường "distance".
        maxDistance: parseInt(radius), // bán kính tối đa tính bằng met
        spherical: true, // Giúp tính toán khoảng cách trên bề mặt hình cầu (trái đất).
      },
    });
  }
  //sắp xếp ads theo thời gian tạo
  aggregationSteps.push({
    $sort: { createdAt: -1 }, //$sort: Sắp xếp các quảng cáo theo trường createdAt (thời gian tạo) theo thứ tự giảm dần (-1).
  });
  //AdModel.aggregate(aggregationSteps): Chạy một truy vấn với các bước xử lý (aggregation pipeline) được xây dựng trước đó.
  const adsDocs = await AdModel.aggregate(aggregationSteps);
  return Response.json(adsDocs); // trả về kết quả ads dưới dạng json
}

export async function DELETE(req: Request) {
  const url = new URL(req.url); // Chuyển URL thành một đối tượng URL để dễ dàng thao tác với các tham số truy vấn (query parameters).
  const id = url.searchParams.get("id"); //Lấy giá trị của tham số truy vấn "id" từ URL, đây là id của quảng cáo mà người dùng muốn xóa.
  await connect();
  // Tìm quảng cáo có id được truyền trong yêu cầu bằng phương thức findById của MongoDB.
  // Kết quả trả về sẽ là tài liệu (document) tương ứng hoặc null nếu không tìm thấy.
  const adDoc = await AdModel.findById(id);
  const session = await getServerSession(authOptions); // xác thực phiên đăng nhập
  /**
   * Kiểm tra xem quảng cáo có tồn tại không và người dùng hiện tại có phải là chủ sở hữu của quảng cáo không (dựa trên địa chỉ email).
   * Nếu không, trả về false, nghĩa là không cho phép xóa.
   */
  if (!adDoc || adDoc.userEmail !== session?.user?.email) {
    return Response.json(false);
  }
  await AdModel.findByIdAndDelete(id); //Xóa quảng cáo có id tương ứng khỏi cơ sở dữ liệu.
  return Response.json(true); //Trả về phản hồi với giá trị true để chỉ ra rằng thao tác xóa đã thành công.
}
