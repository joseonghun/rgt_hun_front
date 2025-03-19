"use client";
import { useEffect, useState } from "react";
import BookModal from "./BooksModal";

type Book = {
    id: string;
    title: string;
    author: string;
    publisher: string;
    publishDt: string;
    bookDetails: string;
    thumbUrl: string;
    booksAmount: number;
    sellAmount: number;
};

type BooksResponse = {
    list: Book[];
    responseMessage: string;
    totalPages: number;
    responseCode: number;
};

export default function BooksClient() {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [data, setData] = useState<BooksResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [viewCnt, setViewCnt] = useState(10);

    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState("");

    async function getBooks() {
        try {
            setLoading(true);
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/books?page=${page}&viewCnt=${viewCnt}&searchKeyword=${searchKeyword}`,
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
            setData(result);
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getBooks();
    }, [page, viewCnt, searchKeyword]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // 검색 시 첫 페이지로 이동
        getBooks();
    };

    // 페이지 네비게이션 처리
    const getPaginationRange = () => {
        if(!data) return [];

        const range: number[] = [];
        const maxVisiblePages = 10;

        // 시작 페이지와 끝 페이지 번호 계산
        let start = Math.max(page - 5, 1); // 최대 5페이지 전
        let end = Math.min(page + 4, data.totalPages); // 최대 5페이지 후

        if (end - start + 1 < maxVisiblePages) {
            if (start === 1) {
                end = Math.min(start + maxVisiblePages - 1, data.totalPages);
            } else {
                start = Math.max(end - maxVisiblePages + 1, 1);
            }
        }

        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        return range;
    };


    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // 도서 추가 모달 열기
    const handleAddBook = () => {
        setSelectedBook(""); // 새 도서 추가 모드
        setIsModalOpen(true);
    };

    // 도서 편집 모달 열기
    const handleEditBook = (bookId: string) => {
        setSelectedBook(bookId); // 편집 모드
        setIsModalOpen(true);
    };

    // 도서 저장 처리 (추가 또는 업데이트)
    const handleSaveBook = async (book: Book, formData: FormData) => {
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/books${book.id ? `/${book.id}` : ''}`;
            const method = book.id ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "저장에 실패했습니다.");
            }

            // 데이터 갱신
            getBooks();

        } catch (error) {
            console.error("Error saving book:", error);
            throw error;
        }
    };

    const handleDelBook = async (bookId: string) => {
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}`;
            const method = "DELETE";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "저장에 실패했습니다.");
            }

            // 데이터 갱신
            getBooks();

        } catch (error) {
            console.error("Error saving book:", error);
            throw error;
        }
    }

    return (
        <>
            <div className="mb-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="도서 검색"
                        className="border p-2 rounded"
                    />
                    <button type="submit" className="bg-blue-500 hover:bg-blue-800 text-white px-4 py-2 rounded">
                        검색
                    </button>
                </form>
            </div>
            <div className="grid grid-cols-6 gap-4 w-full border-y bg-gray-200 text-center p-2">
                <div className="">제목</div>
                <div className="">저자</div>
                <div className="">출판사</div>
                <div className="">출간일</div>
                <div className="">수량</div>
                <div className="">제거</div>
            </div>
            {loading ? (
                <div className="grid grid-cols-6 gap-4 w-full border-y border-gray-300 text-center p-2">
                    <div className="col-span-6">로딩 중...</div>
                </div>
            ) : data ? (
                <BooksList books={data.list} responseMessage={data.responseMessage} onEditBook={handleEditBook} onDeleteBook={handleDelBook} />
            ) : (
                <div className="grid grid-cols-6 gap-4 w-full border-y border-gray-300 text-center p-2">
                    <div className="col-span-6">데이터를 불러올 수 없습니다.</div>
                </div>
            )}

            {data && data.list && data.list.length > 0 && (
                <div className="mt-4 flex justify-center gap-2">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        이전
                    </button>
                    {getPaginationRange().map((paging) => (
                        <button
                            key={paging}
                            onClick={() => handlePageChange(paging)}
                            className={`px-4 py-2 border ${paging === page ? 'bg-blue-500 text-white' : 'bg-white'} hover:bg-blue-500 hover:text-white`}
                        >
                            {paging}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        className="px-3 py-1 border rounded"
                    >
                        다음
                    </button>
                </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
                <button
                    onClick={handleAddBook}
                    className="bg-green-500 hover:bg-green-800 text-white px-4 py-2 rounded"
                >
                    도서 추가
                </button>
            </div>
            <BookModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveBook}
                bookId={selectedBook}
                formData={new FormData}
            />
        </>
    );
}

type BooksListProps = {
    books: Book[];
    responseMessage: string;
    onEditBook: (bookId: string) => void;
    onDeleteBook: (bookId: string) => void;
};

function BooksList({ books, responseMessage, onEditBook, onDeleteBook }: BooksListProps) {
    return (
        <>
            {books && books.length > 0 ? (
                books.map((book) => (
                    <div className="grid grid-cols-6 gap-4 w-full border-y border-gray-300 text-center p-2 hover:bg-gray-100 hover:cursor-pointer" key={book.id}>
                        <div className="" onClick={() => onEditBook(book.id)}>{book.title}</div>
                        <div className="" onClick={() => onEditBook(book.id)}>{book.author}</div>
                        <div className="" onClick={() => onEditBook(book.id)}>{book.publisher}</div>
                        <div className="" onClick={() => onEditBook(book.id)}>{book.publishDt}</div>
                        <div className="" onClick={() => onEditBook(book.id)}>{book.booksAmount}</div>
                        <div className="">
                            <button
                                onClick={() => onDeleteBook(book.id)}
                                className="bg-red-500 hover:bg-red-800 text-white px-2 py-1 rounded text-sm"
                            >
                                제거
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="grid grid-cols-6 gap-4 w-full border-y border-gray-300 text-center p-2">
                    <div className="col-span-6">{responseMessage || "도서 정보가 없습니다."}</div>
                </div>
            )}
        </>
    );
}