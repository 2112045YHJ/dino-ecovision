// src/components/dashboard/ChartShareModal.tsx

import { useState } from "react";
import { copyToClipboard } from "../../utils/clipboard";

type Props = {
  filterCondition: string;
  onClose: () => void;
};

export function ChartShareModal({ filterCondition, onClose }: Props) {
  const [isCopied, setIsCopied] = useState(false);

  // 실제로는 백엔드에서 UUID 받아옴
  const embedUrl = `https://ecovision.com/embed/${crypto.randomUUID().slice(0, 8)}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(embedUrl);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      console.error("복사 실패");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        {/* 타이틀 */}
        <div className="text-center">
          <p className="text-2xl">📊</p>
          <h2 className="mt-2 text-lg font-bold text-[#5F8C74]">
            차트 공유 링크 생성 완료
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            이 차트 뷰를 보존하고 커뮤니티에 위젯으로 삽입할 수 있습니다.
          </p>
        </div>

        {/* 필터 조건 */}
        <div className="mt-5 rounded-2xl bg-[#FAF9F5] p-4">
          <p className="text-xs font-bold text-gray-500">
            스냅샷 대상 필터 조건
          </p>
          <p className="mt-1 text-sm font-bold text-[#2C3531]">
            {filterCondition}
          </p>
        </div>

        {/* 임베드 주소 */}
        <div className="mt-4">
          <p className="text-xs font-bold text-[#5F8C74]">
            발급된 공유 임베드 주소
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={embedUrl}
              readOnly
              className="flex-1 rounded-xl border border-[#E8F2EC] bg-[#FAF9F5] px-3 py-2 text-xs text-gray-600"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl bg-[#5F8C74] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#4d735f]"
            >
              {isCopied ? "복사됨!" : "복사"}
            </button>
          </div>
        </div>

        {/* 안내 */}
        <p className="mt-4 rounded-xl bg-[#FFF1EC] p-3 text-center text-xs font-bold text-[#E07A5F]">
          복사된 링크를 커뮤니티 글쓰기에 입력 시 실시간 차트가 렌더링됩니다.
        </p>

        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
