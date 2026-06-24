// src/pages/CommunityWritePage.tsx

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { createPost, fetchPostDetails, updatePost, uploadPostImage } from "../api/communityApi";
import { EmbedChart } from "../components/charts/EmbedChart";
import { fetchMyChartSnapshots, deleteChartSnapshot } from "../api/dashboardApi";

// 생 텍스트 /embed/{uuid}를 wrapper HTML로 일괄 변환해주는 헬퍼
const convertRawEmbedsToWrappers = (html: string): string => {
  if (!html) return "";
  const regex = /(?:https?:\/\/[a-zA-Z0-9.-]+(?::\d+)?)?\/embed\/([a-zA-Z0-9-]+)/g;
  return html.replace(regex, (_, uuid) => {
    return `<div class="chart-embed-wrapper" contenteditable="false" data-uuid="${uuid}" style="margin: 16px 0; border: 1px solid #E8F2EC; border-radius: 16px; padding: 12px; background-color: #FAF9F5; display: block; text-align: center;"><div class="chart-embed-placeholder" data-uuid="${uuid}"></div><div class="chart-embed-link" style="text-align: center; color: #5F8C74; font-family: monospace; font-size: 11px; margin-top: 8px;">📊 [공유 차트 스냅샷: ${uuid}]</div></div><p><br></p>`;
  });
};

export function CommunityWritePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [portals, setPortals] = useState<{ el: Element; uuid: string }[]>([]);
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

  // 플러스 메뉴 및 테이블/차트 추가 제어 상태
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [hoveredGrid, setHoveredGrid] = useState<{ r: number; c: number } | null>(null);
  const [mySnapshots, setMySnapshots] = useState<any[]>([]);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false);

  // 문단 서식 및 서브 툴바 토글 제어 상태
  const [isBlockMenuOpen, setIsBlockMenuOpen] = useState(false);

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
          setContent(convertRawEmbedsToWrappers(post.content));
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
              setContent(convertRawEmbedsToWrappers(parsed.content || ""));
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
      const processed = content.replace(/src="\/uploads\//gi, 'src="' + (import.meta.env.DEV ? "http://localhost:8080" : "") + '/uploads/');
      if (editorRef.current.innerHTML !== processed) {
        editorRef.current.innerHTML = processed;
      }
    }
  }, [content, showSource]);

  // 2.5 에디터 내 차트 플레이스홀더 스캔 및 portals 생성 함수
  const scanPortals = () => {
    if (editorRef.current && !showSource && !isInitialLoading) {
      const elements = editorRef.current.querySelectorAll(".chart-embed-placeholder");
      const nextPortals: { el: Element; uuid: string }[] = [];
      elements.forEach((el) => {
        const uuid = el.getAttribute("data-uuid");
        if (uuid) {
          nextPortals.push({ el, uuid });
        }
      });
      setPortals(nextPortals);
    } else {
      setPortals([]);
    }
  };

  // 에디터 모드에서 차트 및 마크업 태그를 제외한 순수 본문 글자 수를 추출하는 헬퍼
  const getCharacterCount = () => {
    if (showSource) {
      return content.length;
    }
    if (!editorRef.current) {
      return 0;
    }
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      
      // 차트 래퍼 요소를 글자 수 계산에서 제외
      const wrappers = tempDiv.querySelectorAll(".chart-embed-wrapper");
      wrappers.forEach((el) => {
        el.parentNode?.removeChild(el);
      });
      
      const pureText = tempDiv.textContent || tempDiv.innerText || "";
      // 본문 줄바꿈 문자 등을 세분화하여 최종 글자 수 반환
      return pureText.length;
    } catch (e) {
      return content.length;
    }
  };

  useEffect(() => {
    let rId1: number;
    let rId2: number;

    rId1 = requestAnimationFrame(() => {
      rId2 = requestAnimationFrame(scanPortals);
    });

    return () => {
      cancelAnimationFrame(rId1);
      if (rId2) cancelAnimationFrame(rId2);
    };
  }, [content, showSource, isInitialLoading]);

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

  const handleCustomIndent = (isOutdent: boolean = false) => {
    if (showSource) return;
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const blockTags = ["P", "DIV", "H1", "H2", "H3", "LI"];
    
    // 선택 영역과 교차하는 모든 블록 요소를 찾음
    const allBlocks = Array.from(editorRef.current.querySelectorAll("*")).filter((el) => {
      const element = el as HTMLElement;
      if (!blockTags.includes(element.tagName)) return false;
      try {
        return range.intersectsNode(element);
      } catch (e) {
        return false;
      }
    }) as HTMLElement[];

    // 선택된 블록이 없다면, 커서가 위치한 단일 블록 탐색
    if (allBlocks.length === 0) {
      let node = range.commonAncestorContainer as HTMLElement;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement as HTMLElement;
      }
      let current: HTMLElement | null = node;
      while (current && current !== editorRef.current) {
        if (blockTags.includes(current.tagName)) {
          allBlocks.push(current);
          break;
        }
        current = current.parentElement;
      }
    }

    if (allBlocks.length > 0) {
      allBlocks.forEach((block) => {
        const currentMargin = parseInt(block.style.marginLeft || "0", 10);
        let newMargin = isOutdent ? currentMargin - 40 : currentMargin + 40;
        if (newMargin < 0) newMargin = 0;
        block.style.marginLeft = newMargin > 0 ? `${newMargin}px` : "";
      });

      setContent(editorRef.current.innerHTML);
    } else {
      document.execCommand("formatBlock", false, "p");
      setTimeout(() => handleCustomIndent(isOutdent), 50);
    }
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
    const absoluteUrl = url.startsWith("/") ? `${import.meta.env.DEV ? "http://localhost:8080" : ""}${url}` : url;

    if (showSource) {
      setContent((prev) => prev + `<img src="${absoluteUrl}" class="fr-fic fr-dii" style="width: 250px; display: inline-block; vertical-align: bottom; margin: 0 8px;" />`);
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
      img.style.width = "250px";
      img.style.maxWidth = "100%";
      img.style.display = "inline-block";
      img.style.verticalAlign = "bottom";
      img.style.margin = "0 8px";
      img.className = "editable-image cursor-pointer fr-fic fr-dii";

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
      setContent((prev) => prev + `<img src="${absoluteUrl}" class="fr-fic fr-dii" style="width: 250px; display: inline-block; vertical-align: bottom; margin: 0 8px;" />`);
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

  // 8. 붙여넣기(`Ctrl+V`) 시 이미지 업로드 및 차트 공유 링크 자동 래핑 감지
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    // 8.1 이미지 붙여넣기 처리
    const items = e.clipboardData?.items;
    if (items) {
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
            return;
          }
        }
      }
    }

    // 8.2 텍스트 붙여넣기 중 /embed/uuid 감지 처리
    const pastedText = e.clipboardData?.getData("text") || "";
    const EMBED_REGEX_GLOBAL = /(?:https?:\/\/[a-zA-Z0-9.-]+(?::\d+)?)?\/embed\/([a-zA-Z0-9-]+)/g;
    if (EMBED_REGEX_GLOBAL.test(pastedText)) {
      e.preventDefault();
      const htmlToInsert = pastedText.replace(EMBED_REGEX_GLOBAL, (_, uuid) => {
        return `<div class="chart-embed-wrapper" contenteditable="false" data-uuid="${uuid}" style="margin: 16px 0; border: 1px solid #E8F2EC; border-radius: 16px; padding: 12px; background-color: #FAF9F5; display: block; text-align: center;"><div class="chart-embed-placeholder" data-uuid="${uuid}"></div><div class="chart-embed-link" style="text-align: center; color: #5F8C74; font-family: monospace; font-size: 11px; margin-top: 8px;">📊 [공유 차트 스냅샷: ${uuid}]</div></div><p><br></p>`;
      });
      document.execCommand("insertHTML", false, htmlToInsert);
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
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

  // 9.5 이미지 상대 좌표 계산 헬퍼 (getBoundingClientRect 활용)
  const getImageCoordinates = (img: HTMLImageElement) => {
    const container = editorRef.current?.parentElement;
    if (!container) {
      return {
        top: img.offsetTop,
        left: img.offsetLeft,
        width: img.offsetWidth,
        height: img.offsetHeight
      };
    }
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    return {
      top: imgRect.top - containerRect.top + container.scrollTop,
      left: imgRect.left - containerRect.left + container.scrollLeft,
      width: imgRect.width,
      height: imgRect.height
    };
  };

  // 10. contenteditable 클릭 시 이미지 감지 (컨텍스트 툴바 및 리사이즈 박스 트리거)
  const updateResizeBox = (img: HTMLImageElement) => {
    const coords = getImageCoordinates(img);
    setImageResizeBox(coords);
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      setActiveImage(img);
      updateResizeBox(img);
      
      // 이미지 하단에 툴바 띄우기
      const coords = getImageCoordinates(img);
      setImageToolbarPos({
        top: coords.top + coords.height + 10,
        left: coords.left + (coords.width / 2) - 130
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
      let cleanClass = activeImage.className
        .replace(/\b(fr-dii|fr-dib|fr-fic)\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (align === "left") {
        activeImage.style.float = "left";
        activeImage.style.margin = "10px 15px 10px 0";
        activeImage.style.display = "inline";
        activeImage.className = `${cleanClass} fr-fic`.trim();
      } else if (align === "center") {
        activeImage.style.float = "none";
        activeImage.style.margin = "10px auto";
        activeImage.style.display = "block";
        activeImage.className = `${cleanClass} fr-dib`.trim();
      } else if (align === "right") {
        activeImage.style.float = "right";
        activeImage.style.margin = "10px 0 10px 15px";
        activeImage.style.display = "inline";
        activeImage.className = `${cleanClass} fr-fic`.trim();
      }
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
      setTimeout(() => updateResizeBox(activeImage), 50);
      setTimeout(() => {
        const coords = getImageCoordinates(activeImage);
        setImageToolbarPos({
          top: coords.top + coords.height + 10,
          left: coords.left + (coords.width / 2) - 130
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
      const coords = getImageCoordinates(activeImage);
      setImageToolbarPos({
        top: coords.top + activeImage.offsetHeight + 10,
        left: coords.left + (newWidth / 2) - 130
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

  // 11.6 테이블 및 저장한 차트 에디터 삽입 함수군
  const openChartModal = async () => {
    setPlusMenuOpen(false);
    setChartModalOpen(true);
    try {
      setIsLoadingSnapshots(true);
      const data = await fetchMyChartSnapshots();
      setMySnapshots(data);
    } catch (err: any) {
      console.error("Failed to load my snapshots:", err);
      alert("저장된 차트 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingSnapshots(false);
    }
  };

  const handleDeleteSnapshot = async (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation(); // 차트 선택 삽입 전파 차단
    if (!window.confirm("정말로 이 저장된 차트를 삭제하시겠습니까?")) return;

    try {
      await deleteChartSnapshot(uuid);
      alert("차트가 보관함에서 삭제되었습니다.");
      const data = await fetchMyChartSnapshots();
      setMySnapshots(data);
    } catch (err: any) {
      console.error("Failed to delete snapshot:", err);
      alert(`차트 삭제 실패: ${err.message || "오류가 발생했습니다."}`);
    }
  };

  const scanAndConvertRawTextToWrapper = () => {
    const editor = editorRef.current;
    if (!editor || showSource) return;

    // 현재 커서 위치 저장
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    
    // 텍스트 내에 /embed/uuid 가 있는지 먼저 검사하여 없으면 조기 반환
    const textContent = editor.textContent || "";
    const rawEmbedRegex = /(?:https?:\/\/[a-zA-Z0-9.-]+(?::\d+)?)?\/embed\/([a-zA-Z0-9-]+)/;
    if (!rawEmbedRegex.test(textContent)) return;

    // 래퍼가 없는 생 /embed/uuid 가 실제로 존재하는지 확인하기 위해 비교
    const currentHtml = editor.innerHTML;
    const convertedHtml = convertRawEmbedsToWrappers(currentHtml);
    if (currentHtml === convertedHtml) return;

    // 커서 위치에 임시 마커 삽입
    const marker = document.createElement("span");
    marker.id = "editor-cursor-marker";
    try {
      range.insertNode(marker);
    } catch (e) {
      return; // 비정상 상황 방어
    }

    const htmlWithMarker = editor.innerHTML;
    const nextHtml = convertRawEmbedsToWrappers(htmlWithMarker);

    editor.innerHTML = nextHtml;
    
    // 마커를 찾아서 커서 위치 복원 후 마커 제거
    const newMarker = editor.querySelector("#editor-cursor-marker");
    if (newMarker) {
      const newRange = document.createRange();
      newRange.setStartAfter(newMarker);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      newMarker.parentNode?.removeChild(newMarker);
    }
    setContent(editor.innerHTML);
  };

  const insertChartToEditor = (uuid: string) => {
    const wrapperHtml = `<div class="chart-embed-wrapper" contenteditable="false" data-uuid="${uuid}" style="margin: 16px 0; border: 1px solid #E8F2EC; border-radius: 16px; padding: 12px; background-color: #FAF9F5; display: block; text-align: center;"><div class="chart-embed-placeholder" data-uuid="${uuid}"></div><div class="chart-embed-link" style="text-align: center; color: #5F8C74; font-family: monospace; font-size: 11px; margin-top: 8px;">📊 [공유 차트 스냅샷: ${uuid}]</div></div><p><br></p>`;

    if (showSource) {
      setContent((prev) => prev + wrapperHtml);
      setChartModalOpen(false);
      return;
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = wrapperHtml;
      const fragment = document.createDocumentFragment();
      let child;
      while ((child = tempDiv.firstChild)) {
        fragment.appendChild(child);
      }
      range.insertNode(fragment);

      const newRange = document.createRange();
      newRange.setStartAfter(fragment);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);

      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    } else {
      setContent((prev) => prev + wrapperHtml);
    }
    setChartModalOpen(false);

    // 즉시 포탈 스캔 실행 (렌더링 동기화 보장)
    requestAnimationFrame(() => {
      requestAnimationFrame(scanPortals);
    });
  };

  const insertTableToEditor = (rows: number, cols: number) => {
    const colWidth = (100 / cols).toFixed(1) + "%";
    let tableHtml = `<table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin: 12px 0; border: 1px solid #E8F2EC;"><tbody>`;
    for (let r = 0; r < rows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td style="border: 1px solid #E8F2EC; padding: 8px; width: ${colWidth}; min-width: 30px; word-break: break-all;">&nbsp;</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;

    if (showSource) {
      setContent((prev) => prev + tableHtml);
      setPlusMenuOpen(false);
      return;
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = tableHtml;
      const fragment = document.createDocumentFragment();
      let child;
      while ((child = tempDiv.firstChild)) {
        fragment.appendChild(child);
      }
      range.insertNode(fragment);
      
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    } else {
      setContent((prev) => prev + tableHtml);
    }
    setPlusMenuOpen(false);
  };

  // 11.7 테이블 열 너비 드래그 리사이징 마우스 이벤트 핸들러
  const handleEditorMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showSource) return;
    const target = e.target as HTMLElement;
    const cell = target.closest("td, th") as HTMLTableCellElement;
    if (cell) {
      const rect = cell.getBoundingClientRect();
      // 셀의 오른쪽 경계선 8px 이내인지 감지
      if (rect.right - e.clientX < 8) {
        cell.style.cursor = "col-resize";
      } else {
        cell.style.cursor = "text";
      }
    }
  };

  const handleEditorMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showSource) return;
    const target = e.target as HTMLElement;
    const cell = target.closest("td, th") as HTMLTableCellElement;
    if (!cell) return;

    const rect = cell.getBoundingClientRect();
    const mouseX = e.clientX;

    // 셀의 오른쪽 경계선 8px 이내인지 감지 시 리사이즈 동작 시작
    if (rect.right - mouseX < 8) {
      e.preventDefault();
      e.stopPropagation();

      const startWidth = cell.offsetWidth;
      const startX = mouseX;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = Math.max(30, startWidth + deltaX);
        cell.style.width = `${newWidth}px`;

        // HTML 본문 동기화
        if (editorRef.current) {
          setContent(editorRef.current.innerHTML);
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
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
      // 1) DOMParser를 이용해 래퍼 HTML 블록 전체를 /embed/{uuid} 생 텍스트로 치환 (제출 시 문자열 가공이므로 캐럿 영향 없음)
      let cleanContent = content;
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        const wrappers = doc.querySelectorAll(".chart-embed-wrapper");
        wrappers.forEach((wrapper) => {
          const uuid = wrapper.getAttribute("data-uuid");
          if (uuid) {
            const textNode = doc.createTextNode(`/embed/${uuid}`);
            wrapper.parentNode?.replaceChild(textNode, wrapper);
          } else {
            wrapper.parentNode?.removeChild(wrapper);
          }
        });
        cleanContent = doc.body.innerHTML;
      } catch (e) {
        console.error("DOMParser fallback during submit:", e);
        // Fallback: 정규식 기반 처리
        cleanContent = content.replace(/<div[^>]*class="chart-embed-wrapper"[^>]*>[\s\S]*?<\/div>/gi, (match) => {
          const uuidMatch = match.match(/data-uuid="([a-zA-Z0-9-]+)"/);
          return uuidMatch ? `/embed/${uuidMatch[1]}` : "";
        });
      }

      // 2) 혹시 에디터에 남은 📊 [공유 차트 스냅샷: uuid] 텍스트가 있다면 /embed/uuid 로 치환
      cleanContent = cleanContent.replace(/📊\s*\[공유 차트 스냅샷:\s*([a-zA-Z0-9-]+)\]/g, '/embed/$1');

      // 3) 백엔드 저장 시에는 절대 경로 http://localhost:8080/uploads/를 상대 경로 /uploads/로 정제하여 DB 매핑 무결성 유지
      cleanContent = cleanContent.replace(/http:\/\/localhost:8080\/uploads\//gi, '/uploads/');

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

                {/* 단락/포맷 토글 버튼 */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => !showSource && setIsBlockMenuOpen(!isBlockMenuOpen)}
                  className={btnClass(!isBlockMenuOpen)}
                  title="단락/포맷 서브 메뉴"
                >
                  <span className="font-extrabold text-xs">¶⋮</span>
                </button>
                {/* +: 추가 기능 드롭다운 (표 삽입 및 저장한 차트 추가) */}
                <div className="relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => !showSource && setPlusMenuOpen(!plusMenuOpen)}
                    className={btnClass(!plusMenuOpen)}
                    title="추가 기능"
                  >
                    +: ▾
                  </button>
                  {plusMenuOpen && !showSource && (
                    <div className="absolute top-full left-0 z-30 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 text-[11px] flex flex-col gap-2 w-48">
                      {/* 테이블 삽입 격자 */}
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-500">표 삽입 ({hoveredGrid ? `${hoveredGrid.r}x${hoveredGrid.c}` : "크기 선택"})</span>
                        <div className="grid grid-cols-10 gap-0.5 border border-gray-100 p-1 bg-gray-50 rounded-lg">
                          {Array.from({ length: 2 }).map((_, rIdx) => {
                            const r = rIdx + 1;
                            return (
                              <React.Fragment key={r}>
                                {Array.from({ length: 10 }).map((_, cIdx) => {
                                  const c = cIdx + 1;
                                  const isHighlighted = hoveredGrid && r <= hoveredGrid.r && c <= hoveredGrid.c;
                                  return (
                                    <div
                                      key={`${r}-${c}`}
                                      onMouseEnter={() => setHoveredGrid({ r, c })}
                                      onMouseLeave={() => setHoveredGrid(null)}
                                      onClick={() => insertTableToEditor(r, c)}
                                      className={`w-3.5 h-3.5 border transition cursor-pointer ${
                                        isHighlighted 
                                          ? "bg-[#5F8C74]/55 border-[#5F8C74]" 
                                          : "bg-white border-gray-200 hover:border-[#5F8C74]"
                                      }`}
                                    />
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                      
                      <hr className="border-gray-100 my-1" />
                      
                      {/* 저장한 차트 추가 버튼 */}
                      <button
                        type="button"
                        onClick={openChartModal}
                        className="w-full text-left py-1.5 px-2 hover:bg-[#E8F2EC] hover:text-[#5F8C74] rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer text-gray-600"
                      >
                        📊 저장한 차트 추가
                      </button>
                    </div>
                  )}
                </div>
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
                  onClick={openChartModal}
                  className={btnClass()}
                  title="저장한 차트 추가"
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

              {/* Sub Toolbar (단락/포맷 토글 시 노출) */}
              {isBlockMenuOpen && !showSource && (
                <div className="bg-[#FAF9F5] border-b border-gray-300 p-2 flex flex-wrap gap-1 items-center select-none animate-fadeIn transition-all">
                  {/* 1. 텍스트 정렬 */}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCommand("justifyLeft")}
                    className="p-1.5 rounded transition-all hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500 cursor-pointer flex items-center justify-center"
                    title="좌측 정렬"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M3 21h18v-2H3v2zM3 3v2h18V3H3zm0 6h12v2H3V9zm0 6h18v-2H3v2z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCommand("justifyCenter")}
                    className="p-1.5 rounded transition-all hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500 cursor-pointer flex items-center justify-center"
                    title="가운데 정렬"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M3 21h18v-2H3v2zM3 3v2h18V3H3zm4 6h10v2H7V9zm0 6h10v-2H7v2z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCommand("justifyRight")}
                    className="p-1.5 rounded transition-all hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500 cursor-pointer flex items-center justify-center"
                    title="우측 정렬"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M3 21h18v-2H3v2zM3 3v2h18V3H3zm6 6h12v2H9V9zm0 6h12v-2H9v2z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCommand("justifyFull")}
                    className="p-1.5 rounded transition-all hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500 cursor-pointer flex items-center justify-center"
                    title="양쪽 정렬"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M3 21h18v-2H3v2zM3 3v2h18V3H3zm0 6h18v2H3V9zm0 6h18v-2H3v2z"/>
                    </svg>
                  </button>

                  <span className="text-gray-300 mx-1 text-xs select-none">|</span>

                  {/* 2. 리스트 */}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCommand("insertOrderedList")}
                    className="p-1.5 rounded transition-all hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500 cursor-pointer flex items-center justify-center"
                    title="순서 있는 목록 (ol)"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9v-.9H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-5h14v-2H7v2z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCommand("insertUnorderedList")}
                    className="p-1.5 rounded transition-all hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500 cursor-pointer flex items-center justify-center"
                    title="순서 없는 목록 (ul)"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
                    </svg>
                  </button>

                  <span className="text-gray-300 mx-1 text-xs select-none">|</span>

                  {/* 3. 들여쓰기 */}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCustomIndent(true)}
                    className="p-1.5 rounded transition-all hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500 cursor-pointer flex items-center justify-center"
                    title="들여쓰기 줄이기"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCustomIndent(false)}
                    className="p-1.5 rounded transition-all hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500 cursor-pointer flex items-center justify-center"
                    title="들여쓰기 늘리기"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M3 21h18v-2H3v2zM3 3v2h18V3H3zm11 14h7v-2h-7v2zm-7-5l-4 4V8l4 4zm4 1h10v-2H11v2zm0-4h10V7H11v2z"/>
                    </svg>
                  </button>
                  
                  <span className="text-gray-300 mx-1 text-xs select-none">|</span>
                  
                  {/* 4. 인용구 */}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCommand("indent")}
                    className="p-1.5 rounded transition-all hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500 cursor-pointer flex items-center justify-center"
                    title="인용구 블록 (blockquote)"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                    </svg>
                  </button>

                  <span className="text-gray-300 mx-1 text-xs select-none">|</span>

                  {/* 5. 가로 구분선 */}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCommand("insertHorizontalRule")}
                    className="p-1.5 rounded transition-all hover:bg-[#E8F2EC] hover:text-[#5F8C74] text-gray-500 cursor-pointer flex items-center justify-center"
                    title="구분선 삽입 (hr)"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M19 13H5v-2h14v2z"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* 스크롤 컨테이너 (relative overflow-y-auto min-h-[300px] max-h-[500px]) */}
              <div 
                className="relative overflow-y-auto min-h-[300px] max-h-[500px] flex-1"
                onScroll={() => {
                  if (activeImage) {
                    updateResizeBox(activeImage);
                    const coords = getImageCoordinates(activeImage);
                    setImageToolbarPos({
                      top: coords.top + coords.height + 10,
                      left: coords.left + (coords.width / 2) - 130
                    });
                  }
                }}
              >
                
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
                    onMouseMove={handleEditorMouseMove}
                    onMouseDown={handleEditorMouseDown}
                    onClick={(e) => {
                      handleEditorClick(e);
                      checkActiveFormats();
                    }}
                    onKeyUp={(e) => {
                      checkActiveFormats();
                      if (e.key === " " || e.key === "Enter") {
                        scanAndConvertRawTextToWrapper();
                      }
                    }}
                    onBlur={() => {
                      scanAndConvertRawTextToWrapper();
                    }}
                    onMouseUp={checkActiveFormats}
                    onFocus={checkActiveFormats}
                    className="w-full min-h-[300px] p-4 text-xs text-gray-700 outline-none leading-relaxed bg-white border-0 focus:ring-0 cursor-text"
                  />
                )}
              </div>

              {/* Editor Footer */}
              <div className="bg-[#FAF9F5] border-t border-gray-200 px-4 py-2 flex justify-end text-[10px] text-gray-400 select-none">
                <span>문자 : {getCharacterCount()}</span>
              </div>
            </div>

            {/* 실시간 차트 포탈 렌더링 */}
            {portals.map(({ el, uuid }) => 
              ReactDOM.createPortal(<EmbedChart key={uuid} snapshotId={uuid} />, el)
            )}

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

      {/* 저장한 차트 목록 조회 모달 */}
      {chartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8F2EC] p-6 shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-[#E8F2EC] pb-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                📊 저장한 차트 추가
              </h3>
              <button 
                type="button" 
                onClick={() => setChartModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {isLoadingSnapshots ? (
              <div className="flex justify-center items-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5F8C74] border-t-transparent"></div>
              </div>
            ) : mySnapshots.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                저장된 차트 스냅샷이 없습니다.<br/>
                대시보드에서 차트의 '공유하기' 버튼을 눌러 스냅샷을 먼저 생성해 보세요!
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 grid gap-2 pr-1">
                {mySnapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-[#FAF9F5]/50 hover:bg-[#E8F2EC]/40 hover:border-[#5F8C74]/30 transition gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => insertChartToEditor(snapshot.id)}
                      className="flex-1 text-left flex flex-col gap-1 cursor-pointer"
                    >
                      <span className="font-bold text-gray-800 text-xs">{snapshot.title || "제목 없음"}</span>
                      <div className="flex justify-between w-full text-[9px] text-gray-400">
                        <span>종류: {snapshot.chartType === "GAS" ? "가스 사용량" : "전력 사용량"}</span>
                        <span>작성: {snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSnapshot(e, snapshot.id)}
                      className="text-red-400 hover:text-red-600 font-bold text-xs p-1 cursor-pointer shrink-0"
                      title="차트 삭제"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setChartModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
