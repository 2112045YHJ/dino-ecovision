// src/pages/CommunityWritePage.tsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { createPost, fetchPostDetails, updatePost, uploadPostImage } from "../api/communityApi";
import { EmbedChart } from "../components/charts/EmbedChart";

export function CommunityWritePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [attachDino, setAttachDino] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 에디터 모드 관리 (showSource: 소스코드 보기 활성화)
  const [showSource, setShowSource] = useState(false);

  // B, i, U, S 활성화 상태 피드백
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);

  // 이미지 컨텍스트 툴바 대상 이미지 엘리먼트
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);
  const [imageToolbarPos, setImageToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [imageResizeBox, setImageResizeBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // 드롭다운 메뉴 활성 상태
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 임시 저장 불러오기 및 데이터 바인딩
  useEffect(() => {
    if (isEditMode && id) {
      const loadPost = async () => {
        try {
          setIsInitialLoading(true);
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
          setIsInitialLoading(false);
        }
      };
      loadPost();
    } else {
      // 새 글 작성 시 임시 저장 글 불러오기 유도
      const saved = localStorage.getItem("eco_autosave");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title || parsed.content) {
            const ok = window.confirm("작성 중이던 임시 저장 글이 있습니다. 불러오시겠습니까?");
            if (ok) {
              setTitle(parsed.title || "");
              setContent(parsed.content || "");
              setCategory(parsed.category || "GENERAL");
            } else {
              localStorage.removeItem("eco_autosave");
            }
          }
        } catch (e) {
          console.error("Failed to parse autosave", e);
        }
      }
    }
  }, [id, isEditMode, navigate]);

  // 2. content 변경 시 contenteditable innerHTML 싱글톤 동기화
  useEffect(() => {
    if (!showSource && editorRef.current) {
      // 에디터 화면 렌더링 시 상대 경로를 절대 경로로 가공하여 엑박 방지
      const processed = content.replace(/src="\/uploads\//gi, 'src="http://localhost:8080/uploads/');
      if (editorRef.current.innerHTML !== processed) {
        editorRef.current.innerHTML = processed;
      }
    }
  }, [content, showSource]);

  // 3. 30초마다 자동 임시 저장 연동 (localStorage)
  useEffect(() => {
    if (isEditMode) return; // 수정 모드일 때는 자동 저장하지 않음

    const timer = setInterval(() => {
      if (title.trim() || content.trim()) {
        localStorage.setItem(
          "eco_autosave",
          JSON.stringify({ title, content, category })
        );
      }
    }, 15000); // 15초 단위 주기 자동 저장

    return () => clearInterval(timer);
  }, [title, content, category, isEditMode]);

  const checkActiveFormats = () => {
    if (showSource) return;
    setIsBold(document.queryCommandState("bold"));
    setIsItalic(document.queryCommandState("italic"));
    setIsUnderline(document.queryCommandState("underline"));
    setIsStrike(document.queryCommandState("strikeThrough"));
  };

  // 4. selection 스팬 스타일 삽입 헬퍼
  const applySpanStyle = (styleName: string, value: string) => {
    if (showSource) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString() === "") {
      alert("스타일을 적용할 텍스트 영역을 마우스로 드래그하여 지정해주세요.");
      return;
    }
    
    // execCommand styleWithCSS 활성화 후 wrap
    document.execCommand("styleWithCSS", false, "true");
    
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style.setProperty(styleName, value);

    try {
      range.surroundContents(span);
    } catch (e) {
      // 복수 노드 걸쳐있을 경우 fallback
      const html = `<span style="${styleName}: ${value};">${selection.toString()}</span>`;
      document.execCommand("insertHTML", false, html);
    }

    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    checkActiveFormats();
  };

  // 5. 기본 서식 명령(Bold, Italic 등) 처리
  const handleCommand = (command: string, value: string = "") => {
    if (showSource) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    checkActiveFormats();
  };

  // 6. 이미지 삽입 처리 (캐럿 기준)
  const insertImageAtCursor = (url: string) => {
    // 엑박 방지: 상대 경로 /uploads/를 백엔드 절대 주소로 변환
    const absoluteUrl = url.startsWith("/") ? `http://localhost:8080${url}` : url;

    if (showSource) {
      setContent((prev) => prev + `<p><img src="${absoluteUrl}" style="max-width: 100%; display: block; margin: 10px 0;" /></p>`);
      return;
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const img = document.createElement("img");
      img.src = absoluteUrl;
      img.style.maxWidth = "100%";
      img.style.display = "block";
      img.style.margin = "10px 0";
      img.className = "editable-image cursor-pointer";

      range.insertNode(img);

      // 캐럿을 이미지 뒤로 이동
      const newRange = document.createRange();
      newRange.setStartAfter(img);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    } else {
      setContent((prev) => prev + `<p><img src="${absoluteUrl}" style="max-width: 100%; display: block; margin: 10px 0;" /></p>`);
    }
  };

  // 7. 로컬 파일 업로드 처리
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const url = await uploadPostImage(file);
      insertImageAtCursor(url);
    } catch (err: any) {
      alert(`이미지 업로드 실패: ${err.message}`);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 8. 붙여넣기(`Ctrl+V`) 시 이미지 업로드 감지
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          try {
            setIsUploadingImage(true);
            const url = await uploadPostImage(file);
            insertImageAtCursor(url);
          } catch (err: any) {
            alert(`이미지 붙여넣기 업로드 실패: ${err.message}`);
          } finally {
            setIsUploadingImage(false);
          }
        }
      }
    }
  };

  // 9. 드래그 앤 드롭 이미지 업로드 감지
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith("image/")) {
          try {
            setIsUploadingImage(true);
            const url = await uploadPostImage(files[i]);
            insertImageAtCursor(url);
          } catch (err: any) {
            alert(`이미지 드롭 업로드 실패: ${err.message}`);
          } finally {
            setIsUploadingImage(false);
          }
        }
      }
    }
  };

  // 10. contenteditable 클릭 시 이미지 감지 (컨텍스트 툴바 및 리사이즈 박스 트리거)
  const updateResizeBox = (img: HTMLImageElement) => {
    setImageResizeBox({
      top: img.offsetTop,
      left: img.offsetLeft,
      width: img.offsetWidth,
      height: img.offsetHeight
    });
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      setActiveImage(img);
      updateResizeBox(img);
      
      // 이미지 상단에 툴바 띄우기
      const rect = img.getBoundingClientRect();
      setImageToolbarPos({
        top: img.offsetTop - 40,
        left: img.offsetLeft + (rect.width / 2) - 130
      });
    } else {
      setActiveImage(null);
      setImageToolbarPos(null);
      setImageResizeBox(null);
    }
    
    // 다른 메뉴 닫기
    setFontSizeOpen(false);
    setColorOpen(false);
    setHighlightOpen(false);
  };

  // 11. 이미지 스타일링 제어 (컨텍스트 툴바 용)
  const resizeImage = (widthPercent: string) => {
    if (activeImage) {
      activeImage.style.width = widthPercent;
      activeImage.style.height = "auto";
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
      setTimeout(() => updateResizeBox(activeImage), 50);
    }
  };

  const alignImage = (align: "left" | "center" | "right") => {
    if (activeImage) {
      if (align === "left") {
        activeImage.style.float = "left";
        activeImage.style.margin = "10px 15px 10px 0";
        activeImage.style.display = "inline";
      } else if (align === "center") {
        activeImage.style.float = "none";
        activeImage.style.margin = "10px auto";
        activeImage.style.display = "block";
      } else if (align === "right") {
        activeImage.style.float = "right";
        activeImage.style.margin = "10px 0 10px 15px";
        activeImage.style.display = "inline";
      }
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
      setTimeout(() => updateResizeBox(activeImage), 50);
      setTimeout(() => {
        setImageToolbarPos({
          top: activeImage.offsetTop - 40,
          left: activeImage.offsetLeft + (activeImage.offsetWidth / 2) - 130
        });
      }, 60);
    }
  };

  // 11.5 드래그 이미지 크기 조절 (모서리/꼭짓점 리사이즈 핸들러)
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeImage) return;

    const startWidth = activeImage.offsetWidth;
    const startX = e.clientX;
    const parentWidth = editorRef.current?.clientWidth || 600;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = startWidth + deltaX;
      
      // 최소 크기와 최대 크기 제한
      if (newWidth < 50) newWidth = 50;
      if (newWidth > parentWidth) newWidth = parentWidth;

      // 퍼센트 단위로 지정하여 반응형 대응
      const percentWidth = `${Math.round((newWidth / parentWidth) * 100)}%`;
      activeImage.style.width = percentWidth;
      activeImage.style.height = "auto";

      // 오버레이 박스 갱신
      setImageResizeBox((prev) => prev ? {
        ...prev,
        width: newWidth,
        height: activeImage.offsetHeight
      } : null);

      // 툴바 위치 갱신
      setImageToolbarPos({
        top: activeImage.offsetTop - 40,
        left: activeImage.offsetLeft + (newWidth / 2) - 130
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      
      // 최종 HTML 동기화
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // 12. 에디터 입력 동기화
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  // 13. 등록 및 수정 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim() || content === "<br>" || content === "<div><br></div>") {
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
      // 백엔드 저장 시에는 절대 경로 http://localhost:8080/uploads/를 상대 경로 /uploads/로 정제하여 DB 매핑 무결성 유지
      const cleanContent = content.replace(/http:\/\/localhost:8080\/uploads\//gi, '/uploads/');

      if (isEditMode && id) {
        await updatePost(parseInt(id), {
          title,
          content: cleanContent,
          category,
          chartSnapshotId,
          dinoSnapshot,
        });
        alert("글이 성공적으로 수정되었습니다!");
        localStorage.removeItem("eco_autosave");
        navigate(`/community/${id}`);
      } else {
        const newId = await createPost({
          title,
          content: cleanContent,
          category,
          chartSnapshotId,
          dinoSnapshot,
        });
        alert("글이 성공적으로 등록되었습니다!");
        localStorage.removeItem("eco_autosave");
        navigate(`/community/${newId}`);
      }
    } catch (err: any) {
      console.error("Failed to submit post:", err);
      const errorMsg = err?.message || "오류가 발생했습니다.";
      alert(isEditMode ? `글 수정에 실패했습니다: ${errorMsg}` : `글 등록에 실패했습니다: ${errorMsg}`);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
        <Header />
        <div className="flex justify-center items-center h-[500px]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5F8C74] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // B, I, U 상태 기반 활성화 버튼 스타일 피드백 헬퍼
  const getToolbarBtnClass = (isActive: boolean, hasEffect: boolean) => {
    const base = "p-1.5 px-2.5 rounded transition-all flex items-center justify-center text-xs cursor-pointer select-none font-bold";
    if (showSource) {
      return `${base} text-gray-300 opacity-40 pointer-events-none`;
    }
    if (hasEffect) {
      // 웜 파스텔 블루 톤의 포커스 상태 피드백
      return `${base} bg-[#E6F0FA] text-[#2B6CB0] border border-[#BEE3F8]`;
    }
    return isActive 
      ? `${base} hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500` 
      : `${base} bg-[#E8F2EC] text-[#5F8C74]`;
  };

  // 툴바 비활성 스타일 클래스
  const btnClass = (isActive: boolean = true) => 
    `p-1.5 px-2.5 font-bold rounded transition-all flex items-center justify-center text-xs cursor-pointer select-none ${
      showSource 
        ? "text-gray-300 opacity-40 pointer-events-none" 
        : isActive 
          ? "hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500" 
          : "bg-[#E8F2EC] text-[#5F8C74]"
    }`;

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
            <div className="relative rounded-md border border-gray-300 bg-white overflow-visible focus-within:ring-2 focus-within:ring-[#5F8C74]/20 transition-all flex flex-col">
              
              {/* 이미지 오버레이 컨텍스트 툴바 */}
              {activeImage && imageToolbarPos && (
                <div 
                  style={{ top: `${imageToolbarPos.top}px`, left: `${imageToolbarPos.left}px` }}
                  className="absolute z-20 flex items-center gap-1 bg-gray-800 text-white rounded-lg p-1 shadow-md text-[10px] animate-fadeIn"
                >
                  <button type="button" onClick={() => resizeImage("25%")} className="p-1 px-1.5 hover:bg-gray-700 rounded cursor-pointer font-bold">25%</button>
                  <button type="button" onClick={() => resizeImage("50%")} className="p-1 px-1.5 hover:bg-gray-700 rounded cursor-pointer font-bold">50%</button>
                  <button type="button" onClick={() => resizeImage("100%")} className="p-1 px-1.5 hover:bg-gray-700 rounded cursor-pointer font-bold">100%</button>
                  <span className="text-gray-500 mx-0.5">|</span>
                  <button type="button" onClick={() => alignImage("left")} className="p-1 px-1.5 hover:bg-gray-700 rounded cursor-pointer" title="좌측 정렬">◀</button>
                  <button type="button" onClick={() => alignImage("center")} className="p-1 px-1.5 hover:bg-gray-700 rounded cursor-pointer" title="가운데 정렬">■</button>
                  <button type="button" onClick={() => alignImage("right")} className="p-1 px-1.5 hover:bg-gray-700 rounded cursor-pointer" title="우측 정렬">▶</button>
                </div>
              )}

              {/* 이미지 드래그 리사이즈 오버레이 바운딩 박스 */}
              {activeImage && imageResizeBox && (
                <div 
                  style={{
                    position: "absolute",
                    top: `${imageResizeBox.top}px`,
                    left: `${imageResizeBox.left}px`,
                    width: `${imageResizeBox.width}px`,
                    height: `${imageResizeBox.height}px`,
                    border: "2px dashed #5F8C74",
                    pointerEvents: "none",
                    zIndex: 10
                  }}
                >
                  {/* 우측 하단 리사이즈 드래그 핸들 꼭짓점 점 */}
                  <div 
                    onMouseDown={handleResizeStart}
                    style={{
                      position: "absolute",
                      bottom: "-6px",
                      right: "-6px",
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#5F8C74",
                      border: "1px solid white",
                      borderRadius: "50%",
                      cursor: "se-resize",
                      pointerEvents: "auto",
                      zIndex: 11
                    }}
                  />
                </div>
              )}

              {/* Toolbar */}
              <div className="bg-[#FAF9F5] border-b border-gray-300 p-2 flex flex-wrap gap-0.5 items-center select-none relative">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCommand("bold")}
                  className={getToolbarBtnClass(true, isBold)}
                  title="굵게"
                >
                  <span className="font-extrabold text-sm">B</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCommand("italic")}
                  className={getToolbarBtnClass(true, isItalic)}
                  title="기울임"
                >
                  <span className="italic font-serif font-extrabold text-sm">i</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCommand("underline")}
                  className={getToolbarBtnClass(true, isUnderline)}
                  title="밑줄"
                >
                  <span className="underline text-sm font-bold">U</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCommand("strikeThrough")}
                  className={getToolbarBtnClass(true, isStrike)}
                  title="취소선"
                >
                  <span className="line-through text-sm font-bold">S</span>
                </button>

                {/* Aa 글자 크기 */}
                <div className="relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => !showSource && setFontSizeOpen(!fontSizeOpen)}
                    className={btnClass()}
                    title="글자 크기"
                  >
                    Aa ▾
                  </button>
                  {fontSizeOpen && !showSource && (
                    <div className="absolute top-full left-0 z-30 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-1 text-[11px] grid gap-0.5 w-24">
                      {["60px", "36px", "24px", "16px", "12px"].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            applySpanStyle("font-size", size);
                            setFontSizeOpen(false);
                          }}
                          className="px-2 py-1 text-left hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded cursor-pointer font-medium"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCommand("insertUnorderedList")}
                  className={btnClass()}
                  title="리스트"
                >
                  ☰
                </button>

                {/* foreColor 물방울 */}
                <div className="relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => !showSource && setColorOpen(!colorOpen)}
                    className={btnClass()}
                    title="글자 색상"
                  >
                    💧 ▾
                  </button>
                  {colorOpen && !showSource && (
                    <div className="absolute top-full left-0 z-30 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-[11px] flex gap-1.5 w-40 flex-wrap">
                      {["#2C3531", "#5F8C74", "#E07A5F", "#00A885", "#3F88C5", "#FFD166"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            applySpanStyle("color", c);
                            setColorOpen(false);
                          }}
                          style={{ backgroundColor: c }}
                          className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition cursor-pointer"
                          title={c}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* backColor 형광펜 */}
                <div className="relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => !showSource && setHighlightOpen(!highlightOpen)}
                    className={btnClass()}
                    title="형광펜 배경색"
                  >
                    🖍️ ▾
                  </button>
                  {highlightOpen && !showSource && (
                    <div className="absolute top-full left-0 z-30 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-[11px] flex gap-1.5 w-40 flex-wrap">
                      {["#F29F80", "#F9E0AA", "#C8E6C9", "#B3E5FC", "#E1BEE7", "#FFFFFF"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            applySpanStyle("background-color", c);
                            setHighlightOpen(false);
                          }}
                          style={{ backgroundColor: c }}
                          className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition cursor-pointer"
                          title={c === "#FFFFFF" ? "없음" : c}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCommand("removeFormat")}
                  className={btnClass()}
                  title="서식 지우기"
                >
                  A:
                </button>
                
                <span className="text-gray-300 mx-1 text-xs select-none">|</span>

                {/* 이미지 업로드 */}
                <button
                  type="button"
                  onClick={() => !showSource && fileInputRef.current?.click()}
                  className={btnClass()}
                  title="로컬 이미지 삽입"
                >
                  🖼️
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <span className="text-gray-300 mx-1 text-xs select-none">|</span>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCommand("formatBlock", "p")}
                  className={btnClass()}
                  title="문단 형식"
                >
                  ¶
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCommand("insertHorizontalRule")}
                  className={btnClass()}
                  title="구분선"
                >
                  ▬
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => alert("이모지 추가 기능은 다음 버전에 출시될 예정입니다! 😊")}
                  className={btnClass()}
                  title="이모지 (다음 버전)"
                >
                  😀
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => alert("📊 차트 공유 안내\n\n에너지 대시보드 페이지에서 '🔗 공유하기' 또는 '🔗 차트 스냅샷 공유하기'를 눌러 복사한 차트 공유 URL(예: /embed/...)을 본문에 붙여넣어주세요.\n\n그러면 게시글 목록과 상세 화면에 실시간 라이브 차트 위젯이 자동으로 마운트됩니다.")}
                  className={btnClass()}
                  title="대시보드 차트 안내"
                >
                  📊
                </button>

                <span className="text-gray-300 mx-1 text-xs select-none">|</span>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCommand("undo")}
                  className={btnClass()}
                  title="실행 취소"
                >
                  ↩️
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCommand("redo")}
                  className={btnClass()}
                  title="다시 실행"
                >
                  ↪️
                </button>

                {/* 소스 보기 토글 */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setActiveImage(null);
                    setShowSource(!showSource);
                  }}
                  className={`p-1.5 px-2.5 font-bold rounded transition-all flex items-center justify-center text-xs cursor-pointer select-none ${
                    showSource 
                      ? "bg-[#5F8C74] text-white hover:bg-[#4d735f]" 
                      : "hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500"
                  }`}
                  title="HTML 소스코드 보기"
                >
                  &lt;&gt;
                </button>
                <span className="p-1.5 px-2 text-gray-300 font-bold text-xs select-none">
                  ⋮
                </span>

                {isUploadingImage && (
                  <span className="text-[10px] text-[#5F8C74] font-bold animate-pulse ml-2 flex items-center gap-1">
                    ⏳ 이미지 업로드 중...
                  </span>
                )}
              </div>
              
              {/* Rich Editor / Textarea Display */}
              {showSource ? (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleSourceChange}
                  rows={14}
                  className="w-full p-4 text-xs font-mono text-gray-700 outline-none resize-none leading-relaxed bg-white border-0 focus:ring-0"
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleInput}
                  onPaste={handlePaste}
                  onDrop={handleDrop}
                  onClick={(e) => {
                    handleEditorClick(e);
                    checkActiveFormats();
                  }}
                  onKeyUp={checkActiveFormats}
                  onMouseUp={checkActiveFormats}
                  onFocus={checkActiveFormats}
                  className="w-full min-h-[300px] p-4 text-xs text-gray-700 outline-none overflow-y-auto leading-relaxed bg-white border-0 focus:ring-0 cursor-text"
                  style={{ maxHeight: "500px" }}
                />
              )}

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
