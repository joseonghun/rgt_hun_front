"use client";
import React, { useState, useEffect } from "react";

type Book = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publishDt: string;
  bookDetails: string;
  thumbSeq: string;
  booksAmount: number;
  sellAmount: number;
};

type BookModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Book, formData:FormData) => Promise<void>;
  bookId?: string;
  formData: FormData;
};

const initialBookState: Book = {
  id: "",
  title: "",
  author: "",
  publisher: "",
  publishDt: "",
  bookDetails: "",
  thumbSeq: "",
  booksAmount: 0,
  sellAmount: 0,
};

export default function BookModal({ isOpen, onClose, onSave, bookId, formData }: BookModalProps) {
  const [bookData, setBookData] = useState<Book>(initialBookState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  async function getBookDetail(bookId: string) {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch books");

      const result = await res.json();
      setBookData(result.obj);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }

  // 편집 모드일 경우 book 데이터로 초기화
  useEffect(() => {
    // 썸네일 인풋 초기화
    setThumbnail(null);

    if (bookId) {
      getBookDetail(bookId);
    } else {
      setBookData(initialBookState);
    }
  }, [bookId, isOpen]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookData((prev) => ({
      ...prev,
      [name]: name === "booksAmount" || name === "selAmount" ? parseInt(value) || 0 : value,
    }));
  };

  // 파일 입력 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // FormData 객체 생성
    const formData = new FormData();

    // Book 객체의 모든 필드를 FormData에 추가
    Object.entries(bookData).forEach(([key, value]) => {
      formData.append(key, value ? value.toString() : '');
    });

    // 썸네일 파일 추가
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    try {
      await onSave(bookData, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 h-[80%] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {bookId ? "도서 정보 편집" : "새 도서 추가"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
              제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={bookData.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="author">
              저자
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={bookData.author}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="publisher">
              출판사
            </label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              value={bookData.publisher}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="publishDt">
              출간일
            </label>
            <input
              type="date"
              id="publishDt"
              name="publishDt"
              value={bookData.publishDt}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="bookDetails">
              상세 정보
            </label>
            <textarea
              id="bookDetails"
              name="bookDetails"
              value={bookData.bookDetails}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="thumbnail" className="block mb-1">썸네일 이미지</label>
            <input
              type="file"
              id="thumbnail"
              name="thumbnail"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              accept="image/*"
              required
            />
            {(thumbnail || bookData.thumbSeq) && (
              <div className="mt-2">
                {thumbnail && (<p>선택된 파일: {thumbnail.name})</p>)}
                <img
                  src={thumbnail ? URL.createObjectURL(thumbnail) : `${process.env.NEXT_PUBLIC_API_URL}/downFiles/${bookData.thumbSeq}`}
                  alt="미리보기"
                  className="mt-2 max-h-40 rounded"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="booksAmount">
                수량
              </label>
              <input
                type="number"
                id="booksAmount"
                name="booksAmount"
                value={bookData.booksAmount}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="selAmount">
                판매량
              </label>
              <input
                type="number"
                id="sellAmount"
                name="sellAmount"
                value={bookData.sellAmount}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}