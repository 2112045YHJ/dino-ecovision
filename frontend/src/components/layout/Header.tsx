// src/components/layout/Header.tsx

import { useLocation, useNavigate } from "react-router-dom";

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

        {/* 메뉴 목록 */}
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
        </nav>
      </div>
    </header>
  );
}
