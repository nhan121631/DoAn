"use client";
import { URL_PPYTHON } from "@/services/Constant";
import { useEffect, useState, useRef } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { VscSettings } from "react-icons/vsc";
import ModalFilter from "./Filter/ModalFilter";

const API_URL = `${URL_PPYTHON}/ai_search`;

export default function SearchBar() {
  const [textSearchs, setTextSearchs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [openModalFilter, setOpenModalFilter] = useState(false);
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
  const debouncedSearch = debounce(handleSearch, 500);

  const prevWordCountRef = useRef(0);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount >= 1 && wordCount !== prevWordCountRef.current) {
      debouncedSearch(value.trim());
      prevWordCountRef.current = wordCount;
    } else if (wordCount < 1) {
      setTextSearchs([]);
      prevWordCountRef.current = wordCount;
    }
    setShowSuggest(true);
  };

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
    <div>
      {openModalFilter && (
        <ModalFilter handleClose={() => setOpenModalFilter(false)} />
      )}
      <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-stone-900 rounded-3xl shadow-lg flex items-center px-4 py-3 gap-2">
        <div className="relative w-full flex items-center gap-4 justify-center">
          <div className="flex gap-2 justify-center items-center">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <input
                  ref={inputRef}
                  id="search-input"
                  className="flex-1 w-full md:w-[400px] border rounded-2xl px-4 py-3 text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                  value={inputValue}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggest(true)}
                  autoComplete="off"
                  placeholder="Enter Keyword"
                />
                {showSuggest && (loading || textSearchs.length > 0) && (
                  <ul
                    className="absolute left-0 md:left-14 bg-white border rounded shadow-lg z-50 max-h-60 overflow-auto w-full md:w-[400px] scrollbar-hide"
                    style={{ top: "100%", marginTop: 0 }}
                  >
                    {textSearchs.map((item, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 hover:bg-yellow-100 cursor-pointer text-gray-800"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setInputValue(item);
                          console.log("Selected item:", item);
                          setTextSearchs([]);
                          setShowSuggest(false);
                          prevWordCountRef.current = 0;
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
              <button
                className="border-1 border-gray-500 text-white px-5 py-3 rounded-xl font-semibold shadow flex items-center gap-2"
                onClick={() => {
                  setOpenModalFilter(true);
                }}
              >
                <VscSettings />
                <span>Filter</span>
              </button>
              <button
                className="bg-white hover:bg-gray-300 text-stone-900 px-5 py-3 rounded-xl font-semibold shadow flex items-center gap-2"
                onClick={() => {
                  if (inputValue.trim()) {
                    console.log("Search for:", inputValue);
                    setShowSuggest(false);
                  }
                }}
              >
                <HiOutlineSearch />
                <span>Search </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
