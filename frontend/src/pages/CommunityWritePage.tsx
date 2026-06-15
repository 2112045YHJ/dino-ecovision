// src/pages/CommunityWritePage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { createPost } from "../api/communityApi";
import { EmbedChart } from "../components/charts/EmbedChart";

export function CommunityWritePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [attachDino, setAttachDino] = useState(false);
  const [selectedChartId, setSelectedChartId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    // 작성할 공룡 스냅샷 데이터 취득
    let dinoSnapshot: string | null = null;
    if (attachDino) {
      const localDino = localStorage.getItem("myDino");
      if (localDino) {
        dinoSnapshot = localDino;
      } else {
        // 공룡이 없을 경우 가상 데이터 생성
        dinoSnapshot = JSON.stringify({
          type: "SAURO",
          name: "초록초록이",
          stage: "HATCHLING",
          affinity: 15
        });
      }
    }

    // 차트 첨부 시 본문에 /embed/uuid 덧붙이기
    let finalContent = content;
    if (selectedChartId) {
      finalContent += `\n\n/embed/${selectedChartId}`;
    }

    try {
      const id = await createPost({
        title,
        content: finalContent,
        category,
        chartSnapshotId: selectedChartId || null,
        dinoSnapshot,
      });
      alert("글이 성공적으로 등록되었습니다!");
      navigate(`/community/${id}`);
    } catch (err) {
      console.error("Failed to write post:", err);
      alert("글 등록에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-3xl p-6">
        {/* 뒤로 가기 */}
        <button
          type="button"
          onClick={() => navigate("/community")}
          className="mb-5 rounded-2xl border border-[#E8F2EC] bg-white px-4 py-2 text-xs font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC] cursor-pointer shadow-sm"
        >
          ← 목록으로 돌아가기
        </button>

        {/* 폼 본체 */}
        <section className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-[#5F8C74] tracking-wider mb-2">CREATE NEW POST</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">커뮤니티 글 작성</h2>

          <form onSubmit={handleSubmit} className="grid gap-5">
            {/* 카테고리 선택 */}
            <label className="grid gap-2">
              <span className="text-xs font-bold text-[#5F8C74]">카테고리</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full sm:w-48 rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-4 py-3 text-xs font-semibold outline-none focus:border-[#5F8C74] cursor-pointer"
              >
                <option value="GENERAL">일반 게시글</option>
                <option value="INFO_SHARE">정보 공유</option>
                <option value="NOTICE">공지사항 (관리자 전용)</option>
              </select>
            </label>

            {/* 제목 */}
            <label className="grid gap-2">
              <span className="text-xs font-bold text-[#5F8C74]">제목</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력해주세요."
                className="w-full rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-4 py-3 text-xs outline-none focus:border-[#5F8C74]"
              />
            </label>

            {/* 내용 */}
            <label className="grid gap-2">
              <span className="text-xs font-bold text-[#5F8C74]">내용</span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="내용을 입력해주세요. 깨끗하고 건강한 탄소중립 커뮤니티를 함께 만들어갑니다."
                className="w-full rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-4 py-3 text-xs outline-none focus:border-[#5F8C74] resize-none leading-relaxed"
              />
            </label>

            {/* 실시간 차트 미리보기 */}
            {(() => {
              const EMBED_REGEX = /\/embed\/([a-zA-Z0-9-]+)/i;
              const match = content.match(EMBED_REGEX);
              if (match) {
                return (
                  <div className="grid gap-2 border-t border-[#E8F2EC] pt-4">
                    <span className="text-xs font-bold text-[#5F8C74] flex items-center gap-1.5">
                      📊 본문 내 삽입된 대시보드 차트 미리보기
                    </span>
                    <div className="rounded-2xl border border-dashed border-[#5F8C74]/30 bg-[#FAF9F5]/50 p-2">
                      <EmbedChart snapshotId={match[1]} />
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* 공유 기능 설정 */}
            <div className="grid gap-4 border-t border-[#E8F2EC] pt-4">
              <span className="text-xs font-bold text-[#5F8C74]">탄소 감축 공유 옵션</span>
              
              <div className="flex flex-col sm:flex-row gap-6">
                {/* 공룡 자랑 */}
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attachDino}
                    onChange={(e) => setAttachDino(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#5F8C74] focus:ring-[#5F8C74]"
                  />
                  <span>나의 반려공룡(Dino) 자랑 카드 자랑하기</span>
                </label>

                {/* 차트 공유 */}
                <label className="flex flex-col gap-1.5 text-xs text-gray-700">
                  <span>분석 차트 스냅샷 첨부</span>
                  <select
                    value={selectedChartId}
                    onChange={(e) => setSelectedChartId(e.target.value)}
                    className="rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-3 py-2 text-xs font-semibold outline-none focus:border-[#5F8C74] cursor-pointer"
                  >
                    <option value="">첨부하지 않음</option>
                    <option value="4a1c5d00-4b82-4fcf-8472-872e42c26350">
                      우리 동네 5개년 월간 전력 사용량 비교
                    </option>
                  </select>
                </label>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f] cursor-pointer shadow-sm"
            >
              글 등록하기
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
