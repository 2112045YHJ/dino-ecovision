// src/pages/MyPage.tsx

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { fetchPosts, type PostResponse } from "../api/communityApi";
import { apiRequest } from "../api/apiClient";
import { getRegions, type Region } from "../api/meApi";

interface PointHistoryItem {
  id: number;
  reason: string;
  amount: number;
  createdAt: string;
}

interface ProfileResponse {
  userId: number;
  email: string;
  nickname: string;
  regionCode: string;
  regionName: string;
  totalPoints: number;
  rankingPoint: number;
  savedCarbonKg: number;
  role: string;
  onboardingRequired: boolean;
  avatarUrl?: string;
}

function formatDateTime(createdAt: any): string {
  if (!createdAt) return "";
  if (Array.isArray(createdAt)) {
    const [y, m, d, hh, mm, ss] = createdAt;
    const date = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0);
    return date.toLocaleString();
  }
  return new Date(createdAt).toLocaleString();
}

function formatPointReason(reason: string): string {
  const mapping: Record<string, string> = {
    "COMMENT_WRITE": "💬 댓글 작성 보상",
    "POST_WRITE": "📝 게시글 작성 보상",
    "QUIZ_CORRECT": "🧠 오늘의 퀴즈 정답 보상",
    "MISSION_COMPLETE": "🌿 일일 탄소 미션 완료",
    "DAILY_MISSION_COMPLETE": "🌿 일일 탄소 미션 완료",
    "DUNGEON_MISSION_COMPLETE": "🚨 비상 던전 미션 완료",
    "DAILY_QUIZ": "🧠 에코 퀴즈 참여 보상",
    "ONBOARDING": "🦖 신규 에코 가디언 가입 축하 포인트",
    "ADMIN_ADJUST": "⚙️ 관리자 포인트 지급/차감",
  };
  return mapping[reason] || reason;
}

function renderAvatar(url: string, sizeClass: string = "h-20 w-20 text-4xl") {
  if (!url) return null;
  const isImage = url.startsWith("data:") || url.startsWith("http") || url.startsWith("/");
  if (isImage) {
    const widthHeight = sizeClass.split(" ").filter(c => c.startsWith("h-") || c.startsWith("w-"));
    const wClass = widthHeight.find(c => c.startsWith("w-")) || "w-20";
    const hClass = widthHeight.find(c => c.startsWith("h-")) || "h-20";
    return (
      <img 
        src={url} 
        alt="Avatar" 
        className={`${wClass} ${hClass} rounded-full object-cover shadow-inner border border-gray-200 bg-white`}
      />
    );
  }
  return (
    <div className={`flex ${sizeClass} items-center justify-center rounded-full bg-[#E8F2EC] shadow-inner border border-gray-200/50`}>
      {url}
    </div>
  );
}

export function MyPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = userId ? parseInt(userId, 10) : null;
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const isOwnPage = !parsedUserId || parsedUserId === myUserId;

  const [activeTab, setActiveTab] = useState<"posts" | "points">("posts");
  const [myPosts, setMyPosts] = useState<PostResponse[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([]);
  const activePointHistory = pointHistory.filter(
    (item) => item.amount > 0 && !item.reason.endsWith("_LIMIT_EXCEEDED")
  );

  // 이미지 수동 자르기 관련 refs & states
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgAspect, setImgAspect] = useState<number | null>(null);

  const [profile, setProfile] = useState<{
    nickname: string;
    email: string;
    totalPoints: number;
    rankingPoint: number;
    savedCarbonKg: number;
    avatarUrl: string;
    regionCode: string;
    regionName: string;
  }>({
    nickname: localStorage.getItem("nickname") || "에코시티즌",
    email: "",
    totalPoints: 0,
    rankingPoint: 0,
    savedCarbonKg: 0,
    avatarUrl: "🦖",
    regionCode: "",
    regionName: "",
  });

  // 모달 및 개인 정보 편집 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editRegionCode, setEditRegionCode] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("🦖");
  const [regions, setRegions] = useState<Region[]>([]);
  const [isRegionLoading, setIsRegionLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 탄소 절감량 -> 소나무 수량 변환 (소나무 1그루당 연간 6.6kg 흡수 기준)
  const pineTrees = Math.round((profile.savedCarbonKg / 6.6) * 10) / 10;
  const wholeTrees = Math.floor(pineTrees);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    async function loadMyPosts(nicknameToQuery: string) {
      try {
        const data = await fetchPosts(0, 100, undefined, "AUTHOR", nicknameToQuery);
        setMyPosts(data.content);
      } catch (e) {
        console.error("Failed to load my posts:", e);
      }
    }

    async function loadProfile() {
      try {
        const url = isOwnPage ? "/api/me" : `/api/users/${parsedUserId}`;
        const data = await apiRequest<ProfileResponse>(url, { token });
        if (data) {
          const targetNickname = data.nickname || "에코시티즌";
          setProfile({
            nickname: targetNickname,
            email: data.email || "",
            totalPoints: data.totalPoints,
            rankingPoint: data.rankingPoint,
            savedCarbonKg: data.savedCarbonKg,
            avatarUrl: data.avatarUrl || "🦖",
            regionCode: data.regionCode || "",
            regionName: data.regionName || "",
          });
          if (isOwnPage) {
            setMyUserId(data.userId);
            if (data.nickname) {
              localStorage.setItem("nickname", data.nickname);
            }
          }
          loadMyPosts(targetNickname);
        }
      } catch (err) {
        console.error("Failed to fetch profile from API:", err);
      }
    }

    async function loadPoints() {
      try {
        const url = isOwnPage ? "/api/me/points" : `/api/users/${parsedUserId}/points`;
        const data = await apiRequest<PointHistoryItem[]>(url, { token });
        if (data) {
          setPointHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch point history from API:", err);
      }
    }

    async function loadMyUserIdFirst() {
      if (!myUserId) {
        try {
          const data = await apiRequest<ProfileResponse>("/api/me", { token });
          if (data) {
            setMyUserId(data.userId);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    loadMyUserIdFirst().then(() => {
      loadProfile();
      loadPoints();
    });
  }, [parsedUserId, isOwnPage, myUserId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // gif 확장자 및 MIME 타입 체크
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.gif') || file.type === 'image/gif') {
      alert('GIF 이미지는 프로필 사진으로 등록할 수 없습니다.');
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCropImageSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // 동일한 파일의 재선택도 감지할 수 있도록 초기화
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - cropOffset.x, y: touch.clientY - cropOffset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setCropOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setZoom(1);
    const aspect = img.naturalWidth / img.naturalHeight;
    setImgAspect(aspect);
    
    // 180x180 뷰포트에 맞춘 초기 중앙 배치 계산
    if (aspect > 1) {
      const displayedWidth = aspect * 180;
      setCropOffset({ x: (180 - displayedWidth) / 2, y: 0 });
    } else {
      const displayedHeight = 180 / aspect;
      setCropOffset({ x: 0, y: (180 - displayedHeight) / 2 });
    }
  };

  const handleApplyCrop = () => {
    if (!imageRef.current || !viewportRef.current) return;
    const imgEl = imageRef.current;
    const viewEl = viewportRef.current;

    const rect = imgEl.getBoundingClientRect();
    const viewRect = viewEl.getBoundingClientRect();

    // 뷰포트 대비 이미지의 스크린 상대적 오프셋 및 렌더링된 크기 구하기
    const x = rect.left - viewRect.left;
    const y = rect.top - viewRect.top;
    const w = rect.width;
    const h = rect.height;

    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 180px 뷰포트에서 150px 캔버스로의 리사이즈 비율 계산
      const ratio = 150 / 180;

      // 흰색 캔버스 초기 배경
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 150, 150);

      // 사용자가 맞춘 위치와 줌 비율대로 이미지 그리기
      ctx.drawImage(imgEl, x * ratio, y * ratio, w * ratio, h * ratio);

      // 0.7 압축율로 JPEG 인코딩
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      setEditAvatarUrl(compressedBase64);
      setCropImageSrc(null); // 자르기 워크스페이스 해제
    }
  };

  const openEditModal = async () => {
    setEditNickname(profile.nickname);
    setEditRegionCode(profile.regionCode);
    setEditAvatarUrl(profile.avatarUrl || "🦖");
    setErrorMessage("");
    setIsEditModalOpen(true);

    setIsRegionLoading(true);
    try {
      const regionList = await getRegions();
      setRegions(regionList);
    } catch (err) {
      console.error("Failed to fetch regions:", err);
    } finally {
      setIsRegionLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editNickname.trim()) {
      setErrorMessage("닉네임을 입력해 주세요.");
      return;
    }
    const nicknameRegex = /^[가-힣A-Za-z0-9]{2,12}$/;
    if (!nicknameRegex.test(editNickname)) {
      setErrorMessage("닉네임은 2~12자리의 한글, 영문, 숫자만 가능합니다.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    setIsSaving(true);
    setErrorMessage("");

    try {
      // 1. 닉네임 변경 (변경된 경우에만)
      if (editNickname !== profile.nickname) {
        await apiRequest("/api/me/nickname", {
          method: "PATCH",
          body: { nickname: editNickname },
          token
        });
      }

      // 2. 지역 변경 (변경된 경우에만)
      if (editRegionCode !== profile.regionCode) {
        await apiRequest("/api/me/region", {
          method: "PATCH",
          body: { regionCode: editRegionCode },
          token
        });
      }

      // 3. 아바타 변경 (변경된 경우에만)
      if (editAvatarUrl !== profile.avatarUrl) {
        await apiRequest("/api/me/avatar", {
          method: "PATCH",
          body: { avatarUrl: editAvatarUrl },
          token
        });
      }

      // 변경 후 최신 프로필 갱신
      const updatedData = await apiRequest<ProfileResponse>("/api/me", { token });
      if (updatedData) {
        setProfile({
          nickname: updatedData.nickname || "에코시티즌",
          email: updatedData.email || "",
          totalPoints: updatedData.totalPoints,
          rankingPoint: updatedData.rankingPoint,
          savedCarbonKg: updatedData.savedCarbonKg,
          avatarUrl: updatedData.avatarUrl || "🦖",
          regionCode: updatedData.regionCode || "",
          regionName: updatedData.regionName || "",
        });
        localStorage.setItem("nickname", updatedData.nickname || "에코시티즌");
      }
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setErrorMessage(err.message || "프로필 변경 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        {/* 프로필 서머리 카드 */}
        <section className="mb-6 rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* 아바타 */}
            {renderAvatar(profile.avatarUrl, "h-20 w-20 text-4xl")}
            
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-800">{profile.nickname}</h2>
                <span className="rounded-full bg-[#E8F2EC] px-2.5 py-0.5 text-[10px] font-bold text-[#5F8C74] border border-[#5F8C74]/20">
                  Eco Guardian
                </span>
                {isOwnPage && (
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="text-xs text-gray-400 hover:text-[#5F8C74] font-bold ml-1 transition-colors flex items-center gap-1 cursor-pointer bg-none border-none p-0 outline-none"
                  >
                    ⚙️ 수정
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">{profile.email}</p>
              <p className="mt-1 text-[10px] text-gray-400">거주지역: {profile.regionName || "미설정"}</p>
            </div>
          </div>

          {/* 지표 보드 */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto min-w-[280px]">
            {/* 포인트 */}
            <div className="rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] p-4 flex items-center gap-3">
              <span className="text-2xl">🪙</span>
              <div>
                <p className="text-[10px] font-bold text-gray-400">보유 포인트</p>
                <p className="text-base font-bold text-gray-800 mt-0.5">{profile.totalPoints.toLocaleString()} P</p>
              </div>
            </div>
            {/* 탄소 절감 */}
            <div className="rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] p-4 flex items-center gap-3">
              <span className="text-2xl">🌿</span>
              <div>
                <p className="text-[10px] font-bold text-gray-400">탄소 절감량</p>
                <p className="text-base font-bold text-gray-800 mt-0.5">{profile.savedCarbonKg.toLocaleString()} kg</p>
              </div>
            </div>
          </div>
        </section>

        {/* 소나무 심기 효과 시각화 */}
        <section className="mb-6 rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-[#5F8C74] tracking-wider mb-2">ECO EFFECT</p>
          <h3 className="text-base font-bold text-gray-800 mb-3">누적 탄소 배출 절감 효과</h3>
          
          <div className="rounded-2xl bg-[#E8F2EC]/40 p-5 border border-[#5F8C74]/10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-gray-700 font-medium">
                지금까지 절감한 탄소량은 <span className="font-bold text-[#E07A5F]">소나무 {pineTrees} 그루</span>를 심은 것과 같습니다!
              </p>
              <span className="text-xs font-bold text-[#5F8C74] bg-white px-3 py-1 rounded-full border border-[#5F8C74]/20 shadow-2xs">
                🌲 그루당 연간 6.6kg 상쇄 기준
              </span>
            </div>

            {/* 소나무 숲 아이콘 그리드 */}
            <div className="mt-4 flex flex-wrap gap-1.5 p-3 bg-white rounded-xl border border-dashed border-[#5F8C74]/20">
              {wholeTrees === 0 ? (
                <span className="text-xs text-gray-400">탄소를 절감하여 에코 소나무 숲을 가꿔보세요!</span>
              ) : (
                [...Array(Math.min(wholeTrees, 30))].map((_, i) => (
                  <span key={i} className="text-2xl animate-fade-in" title="에코 소나무">
                    🌲
                  </span>
                ))
              )}
              {wholeTrees > 30 && <span className="text-xs text-gray-400 font-bold self-end ml-1">외 {wholeTrees - 30}그루+</span>}
            </div>
          </div>
        </section>

        {/* 탭 구조 */}
        <section className="space-y-4">
          <div className="flex border-b border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`py-3 px-5 font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "posts"
                  ? "border-[#5F8C74] text-[#5F8C74]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              📝 {isOwnPage ? "내가 쓴 게시글" : "작성한 게시글"} ({myPosts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("points")}
              className={`py-3 px-5 font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "points"
                  ? "border-[#5F8C74] text-[#5F8C74]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              🪙 포인트 획득 타임라인 ({activePointHistory.length})
            </button>
          </div>

          {/* 탭 내용 */}
          <div className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm min-h-[200px]">
            {activeTab === "posts" ? (
              myPosts.length === 0 ? (
                <p className="text-center py-10 text-xs text-gray-400">아직 작성한 커뮤니티 게시글이 없습니다.</p>
              ) : (
                <ul className="divide-y divide-[#E8F2EC]">
                  {myPosts.map((post) => (
                    <li
                      key={post.id}
                      onClick={() => navigate(`/community/${post.id}`)}
                      className="py-3.5 hover:bg-[#E8F2EC]/20 cursor-pointer rounded-lg px-2 transition-colors flex justify-between items-center gap-4 group"
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#5F8C74] bg-[#E8F2EC] px-2 py-0.5 rounded-md border border-[#5F8C74]/20 shrink-0">
                          {post.category === "NOTICE" ? "공지" : post.category === "INFO_SHARE" ? "정보공유" : "일반"}
                        </span>
                        {post.content && post.content.includes("<img") && (
                          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <title>이미지 첨부됨</title>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                        <span className="text-xs font-bold text-gray-800 group-hover:text-[#5F8C74] transition-colors truncate">{post.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              activePointHistory.length === 0 ? (
                <p className="text-center py-10 text-xs text-gray-400">포인트 획득 이력이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {activePointHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5]/40 text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{formatPointReason(item.reason)}</p>
                        <p className="text-[9px] text-gray-400 mt-1">{formatDateTime(item.createdAt)}</p>
                      </div>
                      <span className="font-bold text-[#E07A5F] bg-[#FFF1EC] px-3 py-1 rounded-full border border-[#E07A5F]/20 shrink-0">
                        +{item.amount} P
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </section>

      </main>

      {/* 개인 정보 수정 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-[#E8F2EC] animate-scale-in">
            {cropImageSrc ? (
              /* 자르기 화면 (Cropping Screen) */
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-800">프로필 사진 자르기</h3>
                  <p className="text-xs text-gray-400 mt-1">드래그하여 원하는 위치를 맞추고 슬라이더로 크기를 조절하세요.</p>
                </div>

                {/* 뷰포트 영역 */}
                <div className="flex justify-center py-2">
                  <div 
                    ref={viewportRef}
                    className="w-[180px] h-[180px] rounded-full overflow-hidden border-2 border-[#5F8C74] bg-gray-50 relative shadow-inner cursor-move select-none"
                    style={{ touchAction: 'none' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => setIsDragging(false)}
                  >
                    <img
                      ref={imageRef}
                      src={cropImageSrc}
                      alt="To Crop"
                      onLoad={handleCropImageLoad}
                      className="max-w-none pointer-events-none absolute top-0 left-0"
                      style={{
                        width: imgAspect && imgAspect > 1 ? 'auto' : '180px',
                        height: imgAspect && imgAspect > 1 ? '180px' : 'auto',
                        transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${zoom})`,
                        transformOrigin: 'center center',
                      }}
                    />
                  </div>
                </div>

                {/* 슬라이더 제어 */}
                <div className="space-y-2 px-2">
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                    <span>1.0x (축소)</span>
                    <span>3.0x (확대)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5F8C74]"
                  />
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCropImageSrc(null)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    className="flex-1 rounded-xl bg-[#5F8C74] py-3 text-xs font-bold text-white hover:bg-[#4d735f] cursor-pointer transition-colors"
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : (
              /* 일반 프로필 수정 폼 */
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  ⚙️ 개인 정보 수정
                </h3>

                <div className="space-y-4">
                  {/* 아바타 선택 */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">프로필 캐릭터 및 이미지</label>
                    <div className="flex gap-2 justify-between bg-[#FAF9F5] p-3 rounded-2xl border border-[#E8F2EC] mb-3">
                      {["🦖", "🦕", "🐢", "🐊", "🐍", "🦎"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setEditAvatarUrl(emoji)}
                          className={`h-11 w-11 rounded-full text-2xl flex items-center justify-center transition-all cursor-pointer ${
                            editAvatarUrl === emoji
                              ? "bg-[#E8F2EC] border-2 border-[#5F8C74] scale-110 shadow-sm"
                              : "bg-white hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* 커스텀 이미지 파일 업로드 */}
                    <div className="flex items-center gap-4 bg-[#FAF9F5] p-3 rounded-2xl border border-[#E8F2EC]">
                      {/* 프리뷰 */}
                      {renderAvatar(editAvatarUrl, "h-14 w-14 text-2xl")}
                      <div className="flex-1">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="avatar-file-input"
                        />
                        <div className="flex gap-2">
                          <label 
                            htmlFor="avatar-file-input"
                            className="inline-block px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-700 cursor-pointer transition-colors shadow-sm"
                          >
                            사진 변경 (GIF 제외)
                          </label>
                          {editAvatarUrl && (editAvatarUrl.startsWith("data:") || editAvatarUrl.startsWith("http")) && (
                            <button
                              type="button"
                              onClick={() => setEditAvatarUrl("🦖")}
                              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              사진 제거
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1">JPEG, PNG 등 지원 (직접 자르기 & 압축 적용)</p>
                      </div>
                    </div>
                  </div>

                  {/* 닉네임 입력 */}
                  <div>
                    <label htmlFor="edit-nickname" className="block text-xs font-bold text-gray-500 mb-1.5">닉네임</label>
                    <input
                      id="edit-nickname"
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      className="w-full rounded-xl border border-[#E8F2EC] p-3 text-xs bg-white text-gray-800 focus:border-[#5F8C74] focus:outline-none"
                      placeholder="닉네임을 입력하세요"
                    />
                  </div>

                  {/* 거주지역 선택 */}
                  <div>
                    <label htmlFor="edit-region" className="block text-xs font-bold text-gray-500 mb-1.5">거주 지역</label>
                    <select
                      id="edit-region"
                      value={editRegionCode}
                      onChange={(e) => setEditRegionCode(e.target.value)}
                      disabled={isRegionLoading || regions.length === 0}
                      className="w-full rounded-xl border border-[#E8F2EC] p-3 text-xs bg-white text-gray-800 focus:border-[#5F8C74] focus:outline-none"
                    >
                      {isRegionLoading ? (
                        <option>지역 정보 불러오는 중...</option>
                      ) : regions.length === 0 ? (
                        <option>지역 목록이 비어 있습니다.</option>
                      ) : (
                        regions.map((reg) => (
                          <option key={reg.regionCode} value={reg.regionCode}>
                            {reg.regionName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* 에러 메시지 */}
                  {errorMessage && (
                    <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                      ⚠️ {errorMessage}
                    </p>
                  )}

                  {/* 버튼 그룹 */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      disabled={isSaving}
                      className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving || isRegionLoading}
                      className="flex-1 rounded-xl bg-[#5F8C74] py-3 text-xs font-bold text-white hover:bg-[#4d735f] cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? "저장 중..." : "저장 완료"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
