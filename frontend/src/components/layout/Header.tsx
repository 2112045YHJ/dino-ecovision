// src/components/layout/Header.tsx

import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi"; // 경로는 authApi.ts 위치에 맞춰 확인 필요

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (path: string, label: string) => {
    if (path) {
      navigate(path);
    } else {
      alert(`${label} 기능은 준비 중입니다!`);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;

    try {
      await logout();
    } catch (error) {
      // 서버 로그아웃 실패해도 클라이언트 쪽 정리는 계속 진행
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      navigate("/login", { replace: true });
    }
  };

  const menuItems = [
    { label: "홈", path: "/home" },
    { label: "대시보드", path: "/dashboard" },
    { label: "커뮤니티", path: "/community" },
    { label: "마이페이지", path: "/mypage" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#5F8C74] bg-[#FAF9F5] px-6 py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        {/* 로고 */}
        <div
          className="flex cursor-pointer items-center gap-2 text-xl font-bold text-[#5F8C74]"
          onClick={() => navigate("/home")}
        >
          <span>🌿</span> EcoVision
        </div>

        {/* 메뉴 목록 + 로그아웃 */}
        <nav className="flex items-center gap-2">
          {menuItems.map((item) => {
            const isActive =
              item.path !== "" && location.pathname.startsWith(item.path);

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleMenuClick(item.path, item.label)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#E8F2EC] text-[#5F8C74]"
                    : "text-[#2C3531] hover:bg-[#E8F2EC]/50 hover:text-[#5F8C74]"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* 구분선 */}
          <div className="mx-1 h-5 w-px bg-[#E8F2EC]" />

          {/* 로그아웃 버튼 */}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#E07A5F] transition-all hover:bg-[#FFF1EC]"
          >
            로그아웃
          </button>
        </nav>
      </div>
    </header>
  );
}
