// src/pages/CommunityWritePage.tsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { createPost, fetchPostDetails, updatePost } from "../api/communityApi";
import { EmbedChart } from "../components/charts/EmbedChart";

export function CommunityWritePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(
    isEditMode
      ? ""
      : "생존꿀팁 1번 잘 모르겠을땐 공지읽기\n2번 그래도 모르겠으면 신문고에물어보기"
  );
  const [category, setCategory] = useState("GENERAL");
  const [attachDino, setAttachDino] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // 서식 삽입 헬퍼 함수
  const insertFormat = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = before + selected + after;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);

    // 포커스 및 선택 영역 재지정
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleAction = (type: string) => {
    switch (type) {
      case "bold":
        insertFormat("**", "**");
        break;
      case "italic":
        insertFormat("*", "*");
        break;
      case "underline":
        insertFormat("<u>", "</u>");
        break;
      case "strike":
        insertFormat("~~", "~~");
        break;
      case "fontSize":
        alert("글꼴 크기 조절 기능은 준비 중입니다.");
        break;
      case "list":
        insertFormat("\n- ");
        break;
      case "color":
        alert("글자 색상 기능은 준비 중입니다.");
        break;
      case "highlight":
        alert("형광펜 기능은 준비 중입니다.");
        break;
      case "clear":
        // 단순 서식 문자거르기 (간단 구현)
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          const selected = text.substring(start, end);
          const cleared = selected
            .replace(/\*\*|\*|~~|<u>|<\/u>/g, "");
          const newContent = text.substring(0, start) + cleared + text.substring(end);
          setContent(newContent);
        }
        break;
      case "image":
        const imgUrl = prompt("이미지 주소(URL)를 입력해주세요:");
        if (imgUrl) {
          insertFormat(`![이미지 설명](${imgUrl})`);
        }
        break;
      case "link":
        const linkUrl = prompt("연결할 링크(URL)를 입력해주세요:");
        if (linkUrl) {
          const titleText = prompt("링크 텍스트를 입력해주세요:", "바로가기");
          insertFormat(`[${titleText || "링크"}](${linkUrl})`);
        }
        break;
      case "table":
        insertFormat("\n| 제목1 | 제목2 |\n| --- | --- |\n| 내용1 | 내용2 |\n");
        break;
      case "emoji":
        alert("이모지 추가 기능은 다음 버전에 출시될 예정입니다! 😊");
        break;
      case "chart":
        alert(
          "📊 차트 공유 안내\n\n에너지 대시보드 페이지에서 '🔗 공유하기' 또는 '🔗 차트 스냅샷 공유하기'를 눌러 복사한 차트 공유 URL(예: /embed/...)을 본문에 붙여넣어주세요.\n\n그러면 게시글 목록과 상세 화면에 실시간 라이브 차트 카드가 자동으로 연동되어 삽입됩니다."
        );
        break;
      case "ai":
        alert("AI 글쓰기 도우미 기능은 다음 버전에 출시될 예정입니다! 🤖");
        break;
      case "mention":
        alert("사용자 태그(@) 기능은 준비 중입니다.");
        break;
      case "undo":
        alert("실행 취소는 브라우저 기본 단축키(Ctrl+Z)를 이용해주세요.");
        break;
      case "redo":
        alert("다시 실행은 브라우저 기본 단축키(Ctrl+Y)를 이용해주세요.");
        break;
      case "code":
        insertFormat("```\n", "\n```");
        break;
      default:
        break;
    }
  };

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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#5F8C74] cursor-pointer"
            >
              <option value="GENERAL">일반</option>
              <option value="INFO_SHARE">정보공유</option>
              <option value="NOTICE">공지사항</option>
            </select>

            {/* 제목 */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#5F8C74]"
            />

            {/* Rich Editor Container */}
            <div className="rounded-md border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#5F8C74]/20 transition-all flex flex-col">
              {/* Toolbar */}
              <div className="bg-[#FAF9F5] border-b border-gray-300 p-2 flex flex-wrap gap-1 items-center select-none text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => handleAction("bold")}
                  className="p-1 px-2 font-bold hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="굵게"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("italic")}
                  className="p-1 px-2 italic hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="기울임"
                >
                  i
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("underline")}
                  className="p-1 px-2 underline hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="밑줄"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("strike")}
                  className="p-1 px-2 line-through hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="취소선"
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("fontSize")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer flex items-center gap-0.5"
                  title="글자 크기"
                >
                  Aa <span>▾</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("list")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="목록"
                >
                  ☰
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("color")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="글자 색상"
                >
                  💧
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("highlight")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="형광펜"
                >
                  🖍️
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("clear")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer font-semibold"
                  title="서식 지우기"
                >
                  A:
                </button>
                
                <span className="text-gray-300 mx-1">|</span>

                <button
                  type="button"
                  onClick={() => handleAction("image")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="이미지 삽입"
                >
                  🖼️
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("link")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="링크 삽입"
                >
                  🔗
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("table")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="표 삽입"
                >
                  ➕
                </button>

                <span className="text-gray-300 mx-1">|</span>

                <button
                  type="button"
                  onClick={() => handleAction("fontSize")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="문단 형식"
                >
                  ¶
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("emoji")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="이모지 (다음 버전)"
                >
                  😀
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("chart")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="대시보드 차트 (연동 검증 완료)"
                >
                  📊
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("ai")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer font-bold"
                  title="AI 도우미 (다음 버전)"
                >
                  AI
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("mention")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="사용자 멘션"
                >
                  👥
                </button>

                <span className="text-gray-300 mx-1">|</span>

                <button
                  type="button"
                  onClick={() => handleAction("undo")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="실행 취소"
                >
                  ↩️
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("redo")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer"
                  title="다시 실행"
                >
                  ↪️
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("code")}
                  className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer font-semibold"
                  title="소스코드"
                >
                  &lt;&gt;
                </button>
                <span className="p-1 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded transition-colors cursor-pointer font-bold">
                  ⋮
                </span>
              </div>
              
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="내용을 입력해주세요."
                className="w-full p-4 text-xs text-gray-700 outline-none resize-none leading-relaxed bg-white border-0 focus:ring-0"
              />

              {/* Editor Footer */}
              <div className="bg-[#FAF9F5] border-t border-gray-200 px-4 py-2 flex justify-end text-[10px] text-gray-400 select-none">
                <span>문자 : {content.length}</span>
              </div>
            </div>

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
