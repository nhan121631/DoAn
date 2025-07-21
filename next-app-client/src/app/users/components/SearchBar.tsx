"use client";
import { useEffect, useState, useRef } from "react";

const API_URL = "http://localhost:5000/ai_search";

export default function SearchBar() {
  const [textSearchs, setTextSearchs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [inputValue, setInputValue] = useState("");
  //   const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setTextSearchs([]);
      //   setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    // setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setTextSearchs(data.map((item: { title: string }) => item.title));
      } else if (data.error) {
        setTextSearchs([]);
        console.error("API error:", data.error);
      } else {
        setTextSearchs([]);
      }
    } catch (e) {
      setTextSearchs([]);
      console.error("Error fetching search results:", e);
    } finally {
      setLoading(false);
    }
  };

  function debounce<T extends (...args: string[]) => Promise<void>>(
    func: T,
    wait: number
  ) {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
  const debouncedSearch = debounce(handleSearch, 1500);

  // Lưu số từ lần trước để kiểm tra khi nào gọi API
  const prevWordCountRef = useRef(0);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    // Chỉ gọi API khi số từ tăng lên (cứ nhập thêm 1 từ lại gọi 1 lần)
    if (wordCount >= 1 && wordCount !== prevWordCountRef.current) {
      debouncedSearch(value.trim());
      prevWordCountRef.current = wordCount;
    } else if (wordCount < 1) {
      setTextSearchs([]);
      prevWordCountRef.current = wordCount;
    }
    setShowSuggest(true);
  };

  // Hide suggest when click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white rounded-xl shadow-lg flex items-center px-6 py-4 gap-4">
      <div className="relative w-full">
        <input
          ref={inputRef}
          className="flex-1 border rounded px-4 py-2 w-full"
          value={inputValue}
          onChange={handleSearchChange}
          onFocus={() => setShowSuggest(true)}
          placeholder="Enter Keyword"
        />
        {showSuggest && (loading || textSearchs.length > 0) && (
          <ul className="absolute left-0 right-0 top-full mt-2 bg-white border rounded shadow-lg z-50 max-h-60 overflow-auto">
            {loading && (
              <li className="px-4 py-2 text-gray-500">Đang lấy gợi ý AI...</li>
            )}
            {!loading && textSearchs.length === 0 && (
              <li className="px-4 py-2 text-gray-500">
                Không có gợi ý phù hợp
              </li>
            )}
            {textSearchs.map((item, idx) => (
              <li
                key={idx}
                className="px-4 py-2 hover:bg-yellow-100 cursor-pointer text-gray-800"
                onMouseDown={(e) => {
                  e.preventDefault(); // Ngăn mất focus trước khi xử lý
                  setInputValue(item);
                  console.log("Selected item:", item);
                  setTextSearchs([]); // Xóa gợi ý, chỉ hiện kết quả vừa chọn
                  setShowSuggest(false);
                  prevWordCountRef.current = 0; // Reset để không bị logic ghi đè
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
