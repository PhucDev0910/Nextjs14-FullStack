import MyImage from "@/components/MyImage";
import { UploadResponse } from "imagekit/dist/libs/interfaces";
import React from "react";

type Props = {
  file: UploadResponse;
  onClick?: () => void;
};

export default function UploadThumbnail({ file, onClick }: Props) {
  /**
   * Hàm handleClick được gọi khi người dùng nhấp vào thumbnail hoặc liên kết của file.
   * ev.preventDefault(): Ngăn hành vi mặc định của liên kết khi có onClick. 
   * Nếu một hàm onClick được cung cấp, hàm này sẽ được thực thi thay vì chuyển hướng.
   * Nếu không có hàm onClick, người dùng sẽ được chuyển hướng tới URL của file (tức là file.url) khi nhấp vào.
   */
  function handleClick(ev: React.MouseEvent) {
    if (onClick) {
      ev.preventDefault();
      return onClick();
    }
    location.href = file.url;
  }
  if (file.fileType === "image") {
    return (
      <a onClick={handleClick} target="_blank">
        <MyImage
          width={300}
          height={300}
          alt={"product thumbnail"}
          aiCrop={true}
          src={file.filePath}
        />
      </a>
    );
  }
  return <div>{file.url} &raquo;</div>;
}
