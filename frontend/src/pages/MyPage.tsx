// src/pages/MyPage.tsx

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { fetchPosts, type PostResponse } from "../api/communityApi";
import { apiRequest, ApiRequestError } from "../api/apiClient";
import { getRegions, type Region } from "../api/meApi";
import { isValidNickname, NICKNAME_RULE_MESSAGE } from "../utils/nickname";

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
    COMMENT_WRITE: "💬 댓글 작성 보상",
    POST_WRITE: "📝 게시글 작성 보상",
    QUIZ_CORRECT: "🧠 오늘의 퀴즈 정답 보상",
    MISSION_COMPLETE: "🌿 일일 탄소 미션 완료",
    DAILY_MISSION_COMPLETE: "🌿 일일 탄소 미션 완료",
    DUNGEON_MISSION_COMPLETE: "🚨 비상 던전 미션 완료",
    DAILY_QUIZ: "🧠 에코 퀴즈 참여 보상",
    ONBOARDING: "🦖 신규 에코 가디언 가입 축하 포인트",
    ADMIN_ADJUST: "⚙️ 관리자 포인트 지급/차감",
  };

  return mapping[reason] || reason;
}

function renderAvatar(url: string, sizeClass: string = "h-20 w-20 text-4xl") {
  if (!url) return null;

  const isImage =
    url.startsWith("data:") || url.startsWith("http") || url.startsWith("/");

  if (isImage) {
    const widthHeight = sizeClass
      .split(" ")
      .filter((c) => c.startsWith("h-") || c.startsWith("w-"));

    const wClass = widthHeight.find((c) => c.startsWith("w-")) || "w-20";
    const hClass = widthHeight.find((c) => c.startsWith("h-")) || "h-20";

    return (
      <img
        src={url}
        alt="Avatar"
        className={`${wClass} ${hClass} rounded-full border border-gray-200 bg-white object-cover shadow-inner`}
      />
    );
  }

  return (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-full border border-gray-200/50 bg-[#E8F2EC] shadow-inner`}
    >
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
    (item) => item.amount > 0 && !item.reason.endsWith("_LIMIT_EXCEEDED"),
  );

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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editRegionCode, setEditRegionCode] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("🦖");
  const [regions, setRegions] = useState<Region[]>([]);
  const [isRegionLoading, setIsRegionLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const pineTrees = Math.round((profile.savedCarbonKg / 6.6) * 10) / 10;
  const wholeTrees = Math.floor(pineTrees);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    async function loadMyPosts(nicknameToQuery: string) {
      try {
        const data = await fetchPosts(
          0,
          100,
          undefined,
          "AUTHOR",
          nicknameToQuery,
        );
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
        const url = isOwnPage
          ? "/api/me/points"
          : `/api/users/${parsedUserId}/points`;

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

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".gif") || file.type === "image/gif") {
      alert("GIF 이미지는 프로필 사진으로 등록할 수 없습니다.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        setCropImageSrc(event.target.result as string);
      }
    };

    reader.readAsDataURL(file);
    e.target.value = "";
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
      y: e.clientY - dragStart.y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - cropOffset.x,
      y: touch.clientY - cropOffset.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];

    setCropOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setZoom(1);

    const aspect = img.naturalWidth / img.naturalHeight;
    setImgAspect(aspect);

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

    const x = rect.left - viewRect.left;
    const y = rect.top - viewRect.top;
    const w = rect.width;
    const h = rect.height;

    const canvas = document.createElement("canvas");
    canvas.width = 150;
    canvas.height = 150;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      const ratio = 150 / 180;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 150, 150);
      ctx.drawImage(imgEl, x * ratio, y * ratio, w * ratio, h * ratio);

      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      setEditAvatarUrl(compressedBase64);
      setCropImageSrc(null);
    }
  };
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    if (window.location.pathname === "/mypage/edit") {
      navigate("/mypage");
    }
  };

  useEffect(() => {
    if (window.location.pathname === "/mypage/edit" && profile.email && !hasAutoOpened) {
      setHasAutoOpened(true);
      openEditModal();
    }
  }, [profile.email, hasAutoOpened]);

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

    if (!isValidNickname(editNickname)) {
      setErrorMessage(NICKNAME_RULE_MESSAGE);
      return;
    }

    const token = localStorage.getItem("accessToken");
    setIsSaving(true);
    setErrorMessage("");

    try {
      if (editNickname !== profile.nickname) {
        await apiRequest("/api/me/nickname", {
          method: "PATCH",
          body: { nickname: editNickname },
          token,
        });
      }

      if (editRegionCode !== profile.regionCode) {
        await apiRequest("/api/me/region", {
          method: "PATCH",
          body: { regionCode: editRegionCode },
          token,
        });
      }

      if (editAvatarUrl !== profile.avatarUrl) {
        await apiRequest("/api/me/avatar", {
          method: "PATCH",
          body: { avatarUrl: editAvatarUrl },
          token,
        });
      }

      const updatedData = await apiRequest<ProfileResponse>("/api/me", {
        token,
      });

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

      closeEditModal();
    } catch (err: any) {
      console.error("Failed to save profile:", err);

      // 저장 시점에 백엔드가 닉네임 중복(409, code=DUPLICATE_NICKNAME)을 거부하면,
      // 길이 검증 라벨과 같은 자리에 명확한 경고를 보여줍니다(별도 중복 확인 버튼 없이 차단).
      const isDuplicateNickname =
        err instanceof ApiRequestError && err.code === "DUPLICATE_NICKNAME";

      setErrorMessage(
        isDuplicateNickname
          ? "이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요."
          : err?.message || "프로필 변경 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* 상단 프로필 히어로 카드 */}
        <section className="mb-6 overflow-hidden rounded-[32px] border border-[#E8F2EC] bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#E8F2EC] via-white to-[#FFF4ED] px-7 py-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                <div className="relative">
                  <div className="rounded-full bg-white p-2 shadow-sm">
                    {renderAvatar(profile.avatarUrl, "h-24 w-24 text-5xl")}
                  </div>

                  <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#5F8C74] text-lg shadow-sm">
                    🌿
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-2xl font-extrabold text-[#1F2D2A]">
                      {profile.nickname}
                    </h1>

                    <span className="rounded-full border border-[#5F8C74]/20 bg-white px-3 py-1 text-[11px] font-bold text-[#5F8C74] shadow-sm">
                      Eco Guardian
                    </span>

                    {isOwnPage && (
                      <button
                        type="button"
                        onClick={openEditModal}
                        className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-gray-500 shadow-sm transition hover:bg-[#E8F2EC] hover:text-[#5F8C74]"
                      >
                        ⚙️ 수정
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-gray-500">{profile.email}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    거주지역: {profile.regionName || "미설정"}
                  </p>

                  <p className="mt-4 max-w-md text-sm leading-6 text-gray-600">
                    오늘의 미션과 에코 활동을 쌓아 나만의 탄소 절감 기록을
                    만들어보세요.
                  </p>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 lg:w-[360px]">
                <article className="rounded-3xl border border-[#E8F2EC] bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4D9] text-xl">
                      🪙
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400">
                        보유 포인트
                      </p>
                      <p className="mt-0.5 text-lg font-extrabold text-[#1F2D2A]">
                        {profile.totalPoints.toLocaleString()} P
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-3xl border border-[#E8F2EC] bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F2EC] text-xl">
                      🌿
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400">
                        탄소 절감량
                      </p>
                      <p className="mt-0.5 text-lg font-extrabold text-[#1F2D2A]">
                        {profile.savedCarbonKg.toLocaleString()} kg
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-3xl border border-[#E8F2EC] bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF3FF] text-xl">
                      🏆
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400">
                        랭킹 포인트
                      </p>
                      <p className="mt-0.5 text-lg font-extrabold text-[#1F2D2A]">
                        {profile.rankingPoint.toLocaleString()} P
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-3xl border border-[#E8F2EC] bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0F8ED] text-xl">
                      🌲
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400">
                        소나무 환산
                      </p>
                      <p className="mt-0.5 text-lg font-extrabold text-[#1F2D2A]">
                        {pineTrees} 그루
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* 탄소 절감 효과 카드 */}
        <section className="mb-6 rounded-[32px] border border-[#E8F2EC] bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold tracking-wide text-[#5F8C74]">
                ECO EFFECT
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#1F2D2A]">
                누적 탄소 배출 절감 효과
              </h2>

              {profile.savedCarbonKg > 0 ? (
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  지금까지 절감한 탄소량은{" "}
                  <span className="font-extrabold text-[#E07A5F]">
                    소나무 {pineTrees}그루
                  </span>
                  를 심은 것과 비슷해요.
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  아직 탄소 절감 기록이 없습니다. 오늘의 미션을 완료하면 나만의
                  에코 숲이 자라기 시작해요.
                </p>
              )}
            </div>

            <div className="rounded-full border border-[#5F8C74]/20 bg-[#E8F2EC] px-4 py-2 text-xs font-bold text-[#5F8C74]">
              🌲 소나무 1그루당 연간 6.6kg 상쇄 기준
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-dashed border-[#DDEBE3] bg-[#FAF9F5] p-5">
            {wholeTrees === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm">
                  🌱
                </div>

                <p className="mt-4 text-sm font-bold text-[#1F2D2A]">
                  아직 심어진 에코 소나무가 없어요
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  미션과 퀴즈를 완료하면 탄소 절감 기록이 쌓입니다.
                </p>

                {isOwnPage && (
                  <button
                    type="button"
                    onClick={() => navigate("/missions")}
                    className="mt-5 rounded-2xl bg-[#5F8C74] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#4d735f]"
                  >
                    오늘의 미션 하러가기
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...Array(Math.min(wholeTrees, 30))].map((_, i) => (
                  <span key={i} className="text-3xl" title="에코 소나무">
                    🌲
                  </span>
                ))}

                {wholeTrees > 30 && (
                  <span className="self-end text-xs font-bold text-gray-400">
                    외 {wholeTrees - 30}그루+
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 활동 탭 카드 */}
        <section className="rounded-[32px] border border-[#E8F2EC] bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-[#E8F2EC] px-6 pt-5 sm:flex-row">
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`rounded-t-2xl px-5 py-3 text-sm font-bold transition ${
                activeTab === "posts"
                  ? "bg-[#E8F2EC] text-[#5F8C74]"
                  : "text-gray-400 hover:bg-[#FAF9F5] hover:text-gray-600"
              }`}
            >
              📝 {isOwnPage ? "내가 쓴 게시글" : "작성한 게시글"} (
              {myPosts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("points")}
              className={`rounded-t-2xl px-5 py-3 text-sm font-bold transition ${
                activeTab === "points"
                  ? "bg-[#E8F2EC] text-[#5F8C74]"
                  : "text-gray-400 hover:bg-[#FAF9F5] hover:text-gray-600"
              }`}
            >
              🪙 포인트 획득 타임라인 ({activePointHistory.length})
            </button>
          </div>

          <div className="min-h-[260px] p-6">
            {activeTab === "posts" ? (
              myPosts.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E8F2EC] text-3xl">
                    📝
                  </div>

                  <h3 className="mt-4 text-lg font-extrabold text-[#1F2D2A]">
                    아직 작성한 게시글이 없어요
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                    오늘의 실천 기록이나 디노 성장 후기를 커뮤니티에 남겨보세요.
                    작은 기록도 좋은 에코 활동이 될 수 있어요.
                  </p>

                  {isOwnPage && (
                    <button
                      type="button"
                      onClick={() => navigate("/community/write")}
                      className="mt-5 rounded-2xl bg-[#5F8C74] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#4d735f]"
                    >
                      커뮤니티 글쓰기
                    </button>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-[#E8F2EC]">
                  {myPosts.map((post) => (
                    <li
                      key={post.id}
                      onClick={() => navigate(`/community/${post.id}`)}
                      className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl px-3 py-4 transition hover:bg-[#FAF9F5]"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="shrink-0 rounded-xl border border-[#5F8C74]/20 bg-[#E8F2EC] px-2.5 py-1 text-[11px] font-bold text-[#5F8C74]">
                          {post.category === "NOTICE"
                            ? "공지"
                            : post.category === "INFO_SHARE"
                              ? "정보공유"
                              : "일반"}
                        </span>

                        {post.content && post.content.includes("<img") && (
                          <span className="shrink-0 text-sm text-gray-400">
                            🖼️
                          </span>
                        )}

                        <span className="truncate text-sm font-bold text-gray-800 transition group-hover:text-[#5F8C74]">
                          {post.title}
                        </span>
                      </div>

                      <span className="shrink-0 text-xs text-gray-400">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )
            ) : activePointHistory.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFF4D9] text-3xl">
                  🪙
                </div>

                <h3 className="mt-4 text-lg font-extrabold text-[#1F2D2A]">
                  아직 포인트 획득 이력이 없어요
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  퀴즈를 풀거나 미션을 완료하면 포인트 획득 기록이 이곳에
                  표시됩니다.
                </p>

                {isOwnPage && (
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/missions")}
                      className="rounded-2xl bg-[#5F8C74] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#4d735f]"
                    >
                      미션 하러가기
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/quiz-test")}
                      className="rounded-2xl border border-[#5F8C74] bg-white px-5 py-3 text-xs font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
                    >
                      퀴즈 풀기
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {activePointHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-[#E8F2EC] bg-[#FAF9F5] p-4 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#1F2D2A]">
                        {formatPointReason(item.reason)}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-[#E07A5F]/20 bg-[#FFF1EC] px-4 py-2 text-sm font-extrabold text-[#E07A5F]">
                      +{item.amount} P
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 개인 정보 수정 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-xl animate-scale-in">
            {cropImageSrc ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-800">
                    프로필 사진 자르기
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">
                    드래그하여 원하는 위치를 맞추고 슬라이더로 크기를
                    조절하세요.
                  </p>
                </div>

                <div className="flex justify-center py-2">
                  <div
                    ref={viewportRef}
                    className="relative h-[180px] w-[180px] cursor-move select-none overflow-hidden rounded-full border-2 border-[#5F8C74] bg-gray-50 shadow-inner"
                    style={{ touchAction: "none" }}
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
                      className="pointer-events-none absolute left-0 top-0 max-w-none"
                      style={{
                        width: imgAspect && imgAspect > 1 ? "auto" : "180px",
                        height: imgAspect && imgAspect > 1 ? "180px" : "auto",
                        transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${zoom})`,
                        transformOrigin: "center center",
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2 px-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
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
                    className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#5F8C74]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCropImageSrc(null)}
                    className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-50"
                  >
                    취소
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    className="flex-1 cursor-pointer rounded-xl bg-[#5F8C74] py-3 text-xs font-bold text-white transition-colors hover:bg-[#4d735f]"
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                  ⚙️ 개인 정보 수정
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-gray-500">
                      프로필 캐릭터 및 이미지
                    </label>

                    <div className="mb-3 flex justify-between gap-2 rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] p-3">
                      {["🦖", "🦕", "🐢", "🐊", "🐍", "🦎"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setEditAvatarUrl(emoji)}
                          className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-2xl transition-all ${
                            editAvatarUrl === emoji
                              ? "scale-110 border-2 border-[#5F8C74] bg-[#E8F2EC] shadow-sm"
                              : "border border-gray-200 bg-white hover:bg-gray-100"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] p-3">
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
                            className="inline-block cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-[10px] font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                          >
                            사진 변경 (GIF 제외)
                          </label>

                          {editAvatarUrl &&
                            (editAvatarUrl.startsWith("data:") ||
                              editAvatarUrl.startsWith("http")) && (
                              <button
                                type="button"
                                onClick={() => setEditAvatarUrl("🦖")}
                                className="cursor-pointer rounded-xl bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600 transition-colors hover:bg-red-100"
                              >
                                사진 제거
                              </button>
                            )}
                        </div>

                        <p className="mt-1 text-[9px] text-gray-400">
                          JPEG, PNG 등 지원 (직접 자르기 & 압축 적용)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-nickname"
                      className="mb-1.5 block text-xs font-bold text-gray-500"
                    >
                      닉네임
                    </label>

                    <input
                      id="edit-nickname"
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      className="w-full rounded-xl border border-[#E8F2EC] bg-white p-3 text-xs text-gray-800 focus:border-[#5F8C74] focus:outline-none"
                      placeholder="닉네임을 입력하세요"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-region"
                      className="mb-1.5 block text-xs font-bold text-gray-500"
                    >
                      거주 지역
                    </label>

                    <select
                      id="edit-region"
                      value={editRegionCode}
                      onChange={(e) => setEditRegionCode(e.target.value)}
                      disabled={isRegionLoading || regions.length === 0}
                      className="w-full rounded-xl border border-[#E8F2EC] bg-white p-3 text-xs text-gray-800 focus:border-[#5F8C74] focus:outline-none"
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

                  {errorMessage && (
                    <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-500">
                      ⚠️ {errorMessage}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      disabled={isSaving}
                      className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      취소
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving || isRegionLoading}
                      className="flex-1 cursor-pointer rounded-xl bg-[#5F8C74] py-3 text-xs font-bold text-white transition-colors hover:bg-[#4d735f] disabled:opacity-50"
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
