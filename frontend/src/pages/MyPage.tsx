// src/pages/MyPage.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { fetchPosts, type PostResponse } from "../api/communityApi";
import { apiRequest } from "../api/apiClient";

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
}

export function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"posts" | "points">("posts");
  const [myPosts, setMyPosts] = useState<PostResponse[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([]);

  const [profile, setProfile] = useState<{
    nickname: string;
    email: string;
    totalPoints: number;
    rankingPoint: number;
    savedCarbonKg: number;
  }>({
    nickname: localStorage.getItem("nickname") || "에코시티즌",
    email: "",
    totalPoints: 0,
    rankingPoint: 0,
    savedCarbonKg: 0,
  });

  // 탄소 절감량 -> 소나무 수량 변환 (소나무 1그루당 연간 6.6kg 흡수 기준)
  const pineTrees = Math.round((profile.savedCarbonKg / 6.6) * 10) / 10;
  const wholeTrees = Math.floor(pineTrees);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    async function loadProfile() {
      try {
        const data = await apiRequest<ProfileResponse>("/api/me", { token });
        if (data) {
          setProfile({
            nickname: data.nickname || "에코시티즌",
            email: data.email || "",
            totalPoints: data.totalPoints,
            rankingPoint: data.rankingPoint,
            savedCarbonKg: data.savedCarbonKg,
          });
          // 로컬 스토리지에 동기화해둠 (상세 보기 등에서 활용 가능하도록)
          if (data.nickname) {
            localStorage.setItem("nickname", data.nickname);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile from API:", err);
      }
    }

    async function loadPoints() {
      try {
        const data = await apiRequest<PointHistoryItem[]>("/api/me/points", { token });
        if (data) {
          setPointHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch point history from API:", err);
      }
    }

    async function loadMyPosts() {
      try {
        const data = await fetchPosts(0, 100);
        const filtered = data.content.filter(
          (p) => p.authorNickname === profile.nickname
        );
        setMyPosts(filtered);
      } catch (e) {
        console.error("Failed to load my posts:", e);
      }
    }

    loadProfile();
    loadPoints();
    loadMyPosts();
  }, [profile.nickname]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        {/* 프로필 서머리 카드 */}
        <section className="mb-6 rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* 아바타 */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F2EC] text-4xl shadow-inner border-2 border-white">
              🦖
            </div>
            
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-800">{profile.nickname}</h2>
                <span className="rounded-full bg-[#E8F2EC] px-2.5 py-0.5 text-[10px] font-bold text-[#5F8C74] border border-[#5F8C74]/20">
                  Eco Guardian
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{profile.email}</p>
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
              📝 내가 쓴 게시글 ({myPosts.length})
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
              🪙 포인트 획득 타임라인 ({pointHistory.length})
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
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#5F8C74] bg-[#E8F2EC] px-2 py-0.5 rounded-md border border-[#5F8C74]/20 mr-2">
                          {post.category === "NOTICE" ? "공지" : post.category === "INFO_SHARE" ? "정보공유" : "일반"}
                        </span>
                        <span className="text-xs font-bold text-gray-800 group-hover:text-[#5F8C74] transition-colors">{post.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              pointHistory.length === 0 ? (
                <p className="text-center py-10 text-xs text-gray-400">포인트 획득 이력이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {pointHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5]/40 text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{item.reason}</p>
                        <p className="text-[9px] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
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
    </div>
  );
}
