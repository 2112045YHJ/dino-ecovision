// src/pages/CommunityWritePage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { createPost, fetchPostDetails, updatePost } from "../api/communityApi";
import { EmbedChart } from "../components/charts/EmbedChart";

export function CommunityWritePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [attachDino, setAttachDino] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      const loadPost = async () => {
        try {
          setIsLoading(true);
          const post = await fetchPostDetails(parseInt(id));
          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category);
          setAttachDino(!!post.dinoSnapshot);
        } catch (err: any) {
          console.error("Failed to load post for edit:", err);
          alert("수정할 게시글 정보를 불러오는 데 실패했습니다.");
          navigate("/community");
        } finally {
          setIsLoading(false);
        }
      };
      loadPost();
    }
  }, [id, isEditMode, navigate]);

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

    // 작성/수정할 공룡 스냅샷 데이터 취득 (수정 시점의 최신 상태 반영)
    let dinoSnapshot: string | null = null;
    if (attachDino) {
      const localDino = localStorage.getItem("myDino");
      if (localDino) {
        dinoSnapshot = localDino;
      } else {
        // 공룡이 없을 경우 기본 셋 데이터
        dinoSnapshot = JSON.stringify({
          type: "TYRANO",
          name: "티라노",
          stage: "EGG",
          affinity: 0
        });
      }
    }

    // 본문에서 차트 스냅샷 UUID 자동 추출 (정규식 파싱)
    const EMBED_REGEX = /\/embed\/([a-zA-Z0-9-]+)/i;
    const match = content.match(EMBED_REGEX);
    const chartSnapshotId = match ? match[1] : null;

    try {
      if (isEditMode && id) {
        await updatePost(parseInt(id), {
          title,
          content,
          category,
          chartSnapshotId,
          dinoSnapshot,
        });
        alert("글이 성공적으로 수정되었습니다!");
        navigate(`/community/${id}`);
      } else {
        const newId = await createPost({
          title,
          content,
          category,
          chartSnapshotId,
          dinoSnapshot,
        });
        alert("글이 성공적으로 등록되었습니다!");
        navigate(`/community/${newId}`);
      }
    } catch (err: any) {
      console.error("Failed to submit post:", err);
      const errorMsg = err?.message || "오류가 발생했습니다.";
      alert(isEditMode ? `글 수정에 실패했습니다: ${errorMsg}` : `글 등록에 실패했습니다: ${errorMsg}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
        <Header />
        <div className="flex justify-center items-center h-[500px]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5F8C74] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-3xl p-6">
        {/* 뒤로 가기 */}
        <button
          type="button"
          onClick={() => navigate(isEditMode ? `/community/${id}` : "/community")}
          className="mb-5 rounded-2xl border border-[#E8F2EC] bg-white px-4 py-2 text-xs font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC] cursor-pointer shadow-sm"
        >
          {isEditMode ? "← 게시글로 돌아가기" : "← 목록으로 돌아가기"}
        </button>

        {/* 폼 본체 */}
        <section className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-[#5F8C74] tracking-wider mb-2">
            {isEditMode ? "EDIT POST" : "CREATE NEW POST"}
          </p>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {isEditMode ? "커뮤니티 글 수정" : "커뮤니티 글 작성"}
          </h2>

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
              
              <div className="flex flex-col gap-4">
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

                {/* 차트 가이드 안내 */}
                <div className="rounded-2xl bg-[#E8F2EC]/30 p-4 border border-[#E8F2EC]">
                  <p className="text-[11px] font-bold text-[#5F8C74] flex items-center gap-1.5">
                    📊 차트 공유 가이드
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                    에너지 대시보드에서 복사한 차트 공유 URL(예: /embed/...)을 본문에 붙여넣으면, 게시글 목록과 상세 화면에 실시간 라이브 차트 카드가 자동으로 삽입됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f] cursor-pointer shadow-sm"
            >
              {isEditMode ? "글 수정하기" : "글 등록하기"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
