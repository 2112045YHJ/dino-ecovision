import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function EmbedLandingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) {
      navigate("/home");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      // 로그인된 경우 대시보드로 이동 (snapshotId를 들고 감)
      navigate(`/dashboard?snapshotId=${id}`);
    } else {
      // 로그인되지 않은 경우 로그인 페이지로 이동 (redirect 경로를 들고 감)
      navigate(`/login?redirect=/embed/${id}`);
    }
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-bold text-[#5F8C74] animate-pulse">차트 정보를 불러오는 중...</p>
      </div>
    </div>
  );
}
