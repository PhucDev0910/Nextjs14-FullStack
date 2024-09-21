import DistancePicker from "@/components/DistancePicker";
import LabelRadioButton from "@/components/LabelRadioButton";
import { Location } from "@/components/LocationPicker";
import SubmitButton from "@/components/SubmitButton";
import { categories, defaultRadius } from "@/libs/helpers";
import { faStore } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";

type Props = {
  action: (data: FormData) => void;
};

export default function SearchForm({ action }: Props) {
  const [radius, setRadius] = useState(defaultRadius); // Lưu trữ giá trị bán kính, được khởi tạo bằng defaultRadius
  const [center, setCenter] = useState<Location | null>(null); // Lưu trữ vị trí trung tâm của bản đồ hoặc tìm kiếm
  const [prevCenter, setPrevCenter] = useState<Location | null>(null); // lưu trữ vị trí trung tâm trước đó
  const formRef = useRef<HTMLFormElement | null>(null);
  
  //chạy khi center thay đổi
  useEffect(() => {
    if (center && !prevCenter) {
      // kiểm tra vị trí trung tâm có được thay đổi trước đó
      /**
       * formRef.current kiểm tra xem tham chiếu formRef có trỏ tới một form hợp lệ hay không.
       * requestSubmit() là phương thức gửi biểu mẫu ngay lập tức mà không cần một sự kiện người dùng (như nhấn nút).
       */
      formRef.current?.requestSubmit();
      //Sau khi form được submit, giá trị center hiện tại sẽ được lưu vào prevCenter để đảm bảo form chỉ submit một lần khi center thay đổi lần đầu.
      //Điều này ngăn chặn việc form được gửi nhiều lần mỗi khi center thay đổi sau đó.
      setPrevCenter(center);
    }
  }, [center,prevCenter]);
  
  
  return (
    <form
      ref={formRef}
      action={action}
      className="bg-white grow w-1/4 p-4 border-r flex flex-col gap-4 sticky top-0"
    >
      <input name="phrase" type="text" placeholder="Search Marketplace" />
      <div className="flex flex-col gap-0">
        <LabelRadioButton
          name={"category"}
          value={""}
          icon={faStore}
          onClick={() => formRef.current?.requestSubmit()}
          label={"All categories"}
          defaultChecked={true}
        />
        {categories.map(({ key: categoryKey, label, icon }) => (
          <LabelRadioButton
            key={categoryKey}
            name={"category"}
            value={categoryKey}
            icon={icon}
            onClick={() => formRef.current?.requestSubmit()}
            label={label}
          />
        ))}
      </div>
      <div className="">
        <label>Filter by price</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input name="min" type="number" placeholder="min" />
          </div>
          <div>
            <input name="max" type="number" placeholder="max" />
          </div>
        </div>
      </div>
      <div>
        <input type="hidden" name="radius" value={radius} />
        <input
          type="hidden"
          name="center"
          value={center?.lat + "-" + center?.lng}
        />
        <DistancePicker
          defaultRadius={defaultRadius}
          onChange={({ radius, center }) => {
            setRadius(radius);
            setCenter(center);
          }}
        />
      </div>
      <SubmitButton>Search</SubmitButton>
    </form>
  );
}
