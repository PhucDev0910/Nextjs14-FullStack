"use client";
import Image, { ImageProps } from "next/image";

type LoaderProps = {
  src: string;
  width: number;
  height?: number;
  quality?: number | undefined;
  aiCrop?: boolean;
};

const imageKitLoader = ({
  src,
  width,
  height,
  quality,
  aiCrop,
}: LoaderProps) => {
  // Loại bỏ dấu "/" đầu tiên nếu có
  if (src[0] === "/") src = src.slice(1);

  const params = [`w-${width}`];
  if (height && aiCrop) {
    params.push(`h-${height}`);
  }
  if (quality) {
    params.push(`q-${quality}`);
  }
  if (aiCrop) {
    params.push("fo-auto");
  }

  const paramsString = params.join(",");
  let urlEndpoint = process.env.NEXT_PUBLIC_IK_ENDPOINT as string;

  // Đảm bảo URL endpoint không có dấu "/" ở cuối
  if (urlEndpoint[urlEndpoint.length - 1] === "/") {
    urlEndpoint = urlEndpoint.slice(0, -1);
  }

  return `${urlEndpoint}/${src}?tr=${paramsString}`;
};

type MyImageProps = ImageProps & {
  aiCrop?: boolean;
  width: number;
  height?: number;
};

const MyImage = ({
  width,
  height,
  aiCrop,
  alt = "Mô tả hình ảnh",
  ...props
}: MyImageProps) => {
  return (
    <Image
      loader={(args) =>
        imageKitLoader({
          ...args,
          width,
          height,
          aiCrop,
        })
      }
      width={width}
      height={height}
      alt={alt} // Thêm thuộc tính alt
      {...props}
    />
  );
};

export default MyImage;
