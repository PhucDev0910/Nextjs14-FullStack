"use client";
import MyImage from "@/components/MyImage";
import UploadThumbnail from "@/components/UploadThumbnail";
import UploadView from "@/components/UploadView";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UploadResponse } from "imagekit/dist/libs/interfaces";
import { useState } from "react";

/**
 * files là một mảng các file với kiểu UploadResponse[]. 
 * Mỗi phần tử trong mảng đại diện cho một file đã tải lên (ví dụ: ảnh, video, tài liệu...).
 * UploadResponse có thể chứa thông tin như fileId, fileType, filePath, v.v.
 */
/**
 * Component này cho phép người dùng xem từng file trong mảng files và di chuyển qua lại giữa các file bằng hai hàm next và prev.
    activeFile được cập nhật dựa trên vị trí của file hiện tại trong mảng files.
 */
export default function Gallery({ files }: { files: UploadResponse[] }) {
  const [activeFile, setActiveFile] = useState<UploadResponse | null>(
    files?.[0] || null
  );
  /**
   * Tìm vị trí của activeFile: findIndex được sử dụng để tìm vị trí (index) của file hiện tại (activeFile) trong mảng files dựa vào fileId.
   * ActiveFile?.fileId: Sử dụng optional chaining để đảm bảo chỉ lấy fileId nếu activeFile không phải null.
   * Tính toán chỉ số của file tiếp theo (nextIndex):
    * Nếu activeFile đang là file cuối cùng trong mảng (activeFileIndex === files.length - 1).
    * chỉ số của file tiếp theo sẽ là 0 (vòng lại file đầu tiên).
    * Ngược lại, chỉ số file tiếp theo sẽ là activeFileIndex + 1.
    * Cập nhật activeFile: File tiếp theo (nextFile) được lấy từ mảng files dựa vào nextIndex và cập nhật lại activeFile bằng setActiveFile(nextFile).
   */
  function next() {
    const activeFileIndex = files.findIndex(
      (f) => f.fileId === activeFile?.fileId
    );
    const nextIndex =
      activeFileIndex === files.length - 1 ? 0 : activeFileIndex + 1;
    const nextFile = files[nextIndex];
    setActiveFile(nextFile);
  }

  /**
   * tư tượng như hàm next vẫn sử dụng optional chaining
   * Tính toán chỉ số của file trước đó (prevIndex):
    * Nếu activeFile đang là file đầu tiên trong mảng (activeFileIndex === 0).
    * chỉ số của file trước đó sẽ là files.length - 1 (vòng lại file cuối cùng).
    * Ngược lại, chỉ số file trước đó sẽ là activeFileIndex - 1.
    * Cập nhật activeFile: File trước đó (prevFile) được lấy từ mảng files dựa vào prevIndex.
    * và cập nhật lại activeFile bằng setActiveFile(prevFile).
   */
  function prev() {
    const activeFileIndex = files.findIndex(
      (f) => f.fileId === activeFile?.fileId
    );
    const prevIndex =
      activeFileIndex === 0 ? files.length - 1 : activeFileIndex - 1;
    const prevFile = files[prevIndex];
    setActiveFile(prevFile);
  }
  return (
    <>
      {activeFile && (
        <div className="absolute inset-0 overflow-hidden">
          <MyImage
            src={activeFile.filePath}
            alt={"bg"}
            width={2048}
            height={2048}
            className="object-cover opacity-20 blur w-full h-full"
          />
        </div>
      )}
      <div className="grow flex items-center relative">
        {activeFile && (
          <>
            <div className="absolute inset-4 flex items-center justify-center">
              <UploadView file={activeFile} />
            </div>
            <div className="absolute inset-4 flex items-center">
              <div className="flex justify-between w-full">
                <button
                  onClick={prev}
                  className="rounded-full size-12 flex justify-center items-center transition bg-gray-500/40 hover:bg-gray-500/80"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  onClick={next}
                  className="rounded-full size-12 flex justify-center items-center transition bg-gray-500/40 hover:bg-gray-500/80"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="p-4 flex gap-4 justify-center relative z-10">
        {files.map((file) => (
          <div
            key={file.fileId}
            className="size-14 cursor-pointer rounded overflow-hidden"
          >
            <UploadThumbnail onClick={() => setActiveFile(file)} file={file} />
          </div>
        ))}
      </div>
    </>
  );
}
