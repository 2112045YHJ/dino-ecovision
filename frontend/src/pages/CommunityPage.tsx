// src/pages/CommunityPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { fetchPosts, type PostResponse } from "../api/communityApi";

export function CommunityPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // 검색 상태
  const [searchType, setSearchType] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState<{ type: string; keyword: string } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true);
        const data = await fetchPosts(
          page,
          10,
          selectedCategory === "ALL" ? undefined : selectedCategory,
          activeSearch?.type,
          activeSearch?.keyword
        );
        setPosts(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, [page, selectedCategory, activeSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setActiveSearch(null);
      setPage(0);
      return;
    }
    const stripped = searchInput.replace(/\s+/g, "");
    if (stripped.length < 2) {
      alert("검색어는 공백을 제외하고 2글자 이상 입력해야 합니다.");
      return;
    }
    setActiveSearch({ type: searchType, keyword: searchInput });
    setPage(0);
  };

  const handleReset = () => {
    setSearchInput("");
    setActiveSearch(null);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        {/* 상단 타이틀 및 버튼 */}
        <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">ECO COMMUNITY</p>
            <h1 className="mt-1 text-3xl font-bold text-[#2C3531]">탄소 중립 커뮤니티</h1>
            <p className="mt-2 text-sm text-gray-600">
              차트 분석 스냅샷과 나의 반려 공룡 상태를 공유하고 에코 가디언들과 소통해보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/community/write")}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#5F8C74] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d735f] shadow-sm self-start sm:self-center shrink-0"
          >
            <span>📝</span> 새 글 작성하기
          </button>
        </section>

        {/* 카테고리 탭 및 검색 바 */}
        <section className="mb-6 flex flex-col justify-between gap-4 border-b border-[#E8F2EC] pb-5 md:flex-row md:items-center">
          {/* 카테고리 탭 */}
          <div className="flex gap-2">
            {[
              { key: "ALL", label: "전체" },
              { key: "NOTICE", label: "공지" },
              { key: "GENERAL", label: "일반" },
              { key: "INFO_SHARE", label: "정보공유" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setSelectedCategory(tab.key);
                  setPage(0);
                }}
                className={`rounded-2xl px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === tab.key
                    ? "bg-[#5F8C74] text-white shadow-sm"
                    : "border border-[#E8F2EC] bg-white text-gray-500 hover:bg-[#E8F2EC]/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 검색 바 */}
          <form
            onSubmit={handleSearch}
            className="flex w-full overflow-hidden rounded-2xl border border-[#E8F2EC] bg-white shadow-sm md:max-w-xs focus-within:ring-2 focus-within:ring-[#5F8C74]/20 transition-all"
          >
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="bg-[#FAF9F5] px-3 py-2 text-xs font-bold text-gray-600 border-r border-[#E8F2EC] focus:outline-none cursor-pointer"
            >
              <option value="ALL">전체</option>
              <option value="TITLE_CONTENT">제목/내용</option>
              <option value="TITLE">제목</option>
              <option value="CONTENT">내용</option>
              <option value="AUTHOR">글쓴이</option>
            </select>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="검색어 입력 (2자 이상)"
              className="flex-1 px-3 py-2 text-xs text-gray-800 focus:outline-none"
            />
            {activeSearch && (
              <button
                type="button"
                onClick={handleReset}
                className="px-2 text-gray-400 hover:text-gray-600 transition-colors text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="bg-[#5F8C74] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#4d735f] shrink-0 cursor-pointer"
            >
              검색
            </button>
          </form>
        </section>

        {/* 게시글 목록 카드 리스트 */}
        <section className="rounded-3xl border border-[#E8F2EC] bg-white shadow-sm overflow-hidden">
          <ul className="divide-y divide-[#E8F2EC]">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <li key={i} className="p-6 animate-pulse flex flex-col gap-3">
                  <div className="h-6 bg-gray-100 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-50 rounded w-1/3"></div>
                </li>
              ))
            ) : posts.length === 0 ? (
              <li className="p-12 text-center text-sm font-semibold text-gray-500">
                작성된 게시글이 없습니다. 첫 글의 주인공이 되어보세요!
              </li>
            ) : (
              posts.map((post) => (
                <li
                  key={post.id}
                  onClick={() => navigate(`/community/${post.id}`)}
                  className="p-6 hover:bg-[#E8F2EC]/20 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 카테고리 태그 */}
                      {post.category === "NOTICE" && (
                        <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 border border-red-200">
                          공지
                        </span>
                      )}
                      {post.category === "INFO_SHARE" && (
                        <span className="rounded bg-[#E8F2EC] px-2 py-0.5 text-[10px] font-bold text-[#5F8C74] border border-[#5F8C74]/20">
                          정보공유
                        </span>
                      )}
                      <h3 className="text-base font-bold text-gray-800 truncate">{post.title}</h3>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-semibold text-[#5F8C74]">{post.authorNickname}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* 수치 요약 */}
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 shrink-0 self-end sm:self-center">
                    <span className="flex items-center gap-1" title="조회수">
                      <span>👁️</span> {post.viewCount}
                    </span>
                    <span className="flex items-center gap-1" title="댓글수">
                      <span>💬</span> {post.commentCount}
                    </span>
                    <span className="flex items-center gap-1 text-[#E07A5F]" title="좋아요">
                      <span>👍</span> {post.likeCount}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-3 text-xs">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-xl border border-[#E8F2EC] bg-white px-4 py-2 font-bold text-gray-600 disabled:opacity-50 hover:bg-[#E8F2EC]/30 cursor-pointer disabled:cursor-not-allowed shadow-sm"
            >
              이전
            </button>
            <span className="font-bold text-gray-700">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-xl border border-[#E8F2EC] bg-white px-4 py-2 font-bold text-gray-600 disabled:opacity-50 hover:bg-[#E8F2EC]/30 cursor-pointer disabled:cursor-not-allowed shadow-sm"
            >
              다음
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
