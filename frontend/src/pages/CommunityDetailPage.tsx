// src/pages/CommunityDetailPage.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { EmbedChart } from "../components/charts/EmbedChart";
import {
  fetchPostDetails,
  likePost,
  createComment,
  updateComment,
  deleteComment,
  deletePost,
  type PostResponse,
} from "../api/communityApi";
import { getMe, type MeProfile } from "../api/meApi";

export function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostResponse | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<MeProfile | null>(null);
  
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");

  useEffect(() => {
    loadPostDetails();
    loadUser();
  }, [id]);

  async function loadUser() {
    try {
      const user = await getMe();
      setCurrentUser(user);
    } catch (err) {
      console.error("Failed to load current user:", err);
    }
  }

  async function loadPostDetails() {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await fetchPostDetails(parseInt(id));
      setPost(data);
    } catch (err) {
      console.error("Failed to load post details:", err);
      alert("존재하지 않는 게시글이거나 오류가 발생했습니다.");
      navigate("/community");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeletePost = async () => {
    if (!post) return;
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

    try {
      await deletePost(post.id);
      alert("게시글이 삭제되었습니다.");
      navigate("/community");
    } catch (err: any) {
      console.error("Failed to delete post:", err);
      const errorMsg = err?.message || "오류가 발생했습니다.";
      alert(`게시글 삭제에 실패했습니다: ${errorMsg}`);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      const res = await likePost(post.id);
      // 로컬 화면 갱신
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likeCount: res.likeCount,
              liked: res.liked,
            }
          : null
      );
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentInput.trim()) return;

    try {
      await createComment(post.id, commentInput);
      setCommentInput("");
      // 다시 불러오기
      const updated = await fetchPostDetails(post.id);
      setPost(updated);
    } catch (err: any) {
      console.error("Failed to submit comment:", err);
      const errorMsg = err?.message || "오류가 발생했습니다.";
      alert(`댓글 등록에 실패했습니다: ${errorMsg}`);
    }
  };

  const handleCommentEditStart = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setEditingCommentContent(content);
  };

  const handleCommentEditCancel = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleCommentEditSave = async (commentId: number) => {
    if (!editingCommentContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    try {
      await updateComment(commentId, editingCommentContent);
      setEditingCommentId(null);
      setEditingCommentContent("");
      // 다시 불러오기
      const updated = await fetchPostDetails(post!.id);
      setPost(updated);
    } catch (err: any) {
      console.error("Failed to edit comment:", err);
      const errorMsg = err?.message || "오류가 발생했습니다.";
      alert(`댓글 수정에 실패했습니다: ${errorMsg}`);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!post) return;
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;

    try {
      await deleteComment(commentId);
      // 다시 불러오기
      const updated = await fetchPostDetails(post.id);
      setPost(updated);
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      const errorMsg = err?.message || "오류가 발생했습니다.";
      alert(`댓글 삭제에 실패했습니다: ${errorMsg}`);
    }
  };

  // 공룡 스냅샷 렌더러
  const renderDinoCard = (snapshotText?: string | null) => {
    if (!snapshotText) return null;
    try {
      const dino = JSON.parse(snapshotText);
      const dinoEmojis: Record<string, string> = {
        TYRANO: "🦖",
        SAURO: "🦕",
        CERATO: "🛡️"
      };
      const dinoEmoji = dinoEmojis[dino.type] || "🦕";

      return (
        <div className="mt-8 rounded-3xl border border-[#5F8C74]/20 bg-[#FAF9F5] p-5 flex items-center gap-4 max-w-sm">
          <div className="text-4xl">{dinoEmoji}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-sm">{dino.name}</span>
              <span className="text-[9px] font-bold text-[#5F8C74] bg-[#E8F2EC] px-1.5 py-0.5 rounded-full uppercase">
                {dino.stage}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">친밀도: {dino.affinity}% ♡</p>
            <p className="text-[9px] text-gray-400 mt-0.5">※ 작성자가 글을 남길 당시의 반려공룡 카드입니다.</p>
          </div>
        </div>
      );
    } catch (e) {
      console.error("Failed to parse dino snapshot:", e);
      return null;
    }
  };

  // XSS 방어용 클라이언트 사이드 HTML 새니타이즈
  const sanitizeHtml = (html: string): string => {
    if (!html) return "";
    return html
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "") // 스크립트 태그 제거
      .replace(/on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]*)/gi, ""); // 인라인 이벤트 핸들러 제거
  };

  // 본문 안에서 차트 스냅샷 감지 및 렌더링 (HTML 지원)
  const renderContent = (content: string) => {
    const EMBED_REGEX = /\/embed\/([a-zA-Z0-9-]+)/i;
    const match = content.match(EMBED_REGEX);
    const sanitized = sanitizeHtml(content);

    if (match) {
      const parts = sanitized.split(EMBED_REGEX);
      return (
        <>
          <div dangerouslySetInnerHTML={{ __html: parts[0] }} className="rich-content leading-relaxed" />
          <EmbedChart snapshotId={match[1]} />
          {parts[2] && <div dangerouslySetInnerHTML={{ __html: parts[2] }} className="rich-content leading-relaxed mt-4" />}
        </>
      );
    }

    return <div dangerouslySetInnerHTML={{ __html: sanitized }} className="rich-content leading-relaxed" />;
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

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-3xl p-6">
        {/* 목록으로 이동 */}
        <button
          type="button"
          onClick={() => navigate("/community")}
          className="mb-5 rounded-2xl border border-[#E8F2EC] bg-white px-4 py-2 text-xs font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC] cursor-pointer shadow-sm"
        >
          ← 목록으로 돌아가기
        </button>

        {/* 게시글 본체 */}
        <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
          {/* 머리말 */}
          <header className="border-b border-[#E8F2EC] pb-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className={`rounded px-2.5 py-0.5 text-[10px] font-bold border ${
                post.category === "NOTICE" 
                  ? "bg-red-50 text-red-600 border-red-200" 
                  : "bg-[#E8F2EC] text-[#5F8C74] border-[#5F8C74]/20"
              }`}>
                {post.category === "NOTICE" ? "공지" : post.category === "INFO_SHARE" ? "정보공유" : "일반"}
              </span>
            </div>
            
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-2xl font-bold text-gray-800 flex-1">{post.title}</h2>
              {/* 게시글 수정/삭제 버튼 */}
              {currentUser && (
                <div className="flex items-center gap-2 shrink-0 mt-1.5">
                  {post.authorId === currentUser.userId && (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate(`/community/edit/${post.id}`)}
                        className="text-xs font-bold text-[#5F8C74] hover:text-[#4d735f] cursor-pointer"
                      >
                        수정
                      </button>
                      <span className="text-xs text-gray-300">|</span>
                    </>
                  )}
                  {(post.authorId === currentUser.userId || currentUser.role === "ADMIN") && (
                    <button
                      type="button"
                      onClick={handleDeletePost}
                      className="text-xs font-bold text-red-400 hover:text-red-600 cursor-pointer"
                    >
                      삭제
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {(() => {
              const isEdited = post.updatedAt && post.createdAt &&
                (new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 5000);
              return (
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-[#5F8C74]">{post.authorNickname}</span>
                    <span>•</span>
                    <span>작성: {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</span>
                    {isEdited && (
                      <>
                        <span>•</span>
                        <span className="text-gray-400">수정: {new Date(post.updatedAt).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span>조회수 {post.viewCount}</span>
                    <span>•</span>
                    <span className="text-[#E07A5F]">추천 {post.likeCount}</span>
                  </div>
                </div>
              );
            })()}
          </header>

          {/* 본문 내용 */}
          <section className="text-sm text-gray-700">
            {renderContent(post.content)}
          </section>

          {/* 공룡 카드 자랑 */}
          {renderDinoCard(post.dinoSnapshot)}

          {/* 추천 버튼 */}
          <div className="mt-8 flex justify-center border-t border-[#E8F2EC] pt-6">
            <button
              type="button"
              onClick={handleLike}
              className={`flex cursor-pointer items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition shadow-sm ${
                post.liked
                  ? "bg-[#5F8C74] text-white hover:bg-[#4d735f]"
                  : "bg-[#E8F2EC] text-[#5F8C74] hover:bg-[#5F8C74] hover:text-white"
              }`}
            >
              <span>👍</span> {post.liked ? "추천 완료" : "게시글 추천하기"} ({post.likeCount})
            </button>
          </div>
        </article>

        {/* 댓글 영역 */}
        <section className="mt-6 rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-1.5">
            <span>💬</span> 댓글 {post.comments?.length || 0}
          </h3>

          {/* 댓글 목록 */}
          <ul className="divide-y divide-gray-100 mb-6">
            {post.comments?.length === 0 ? (
              <li className="py-6 text-center text-xs text-gray-400">아직 등록된 댓글이 없습니다.</li>
            ) : (
              post.comments?.map((comment) => (
                <li key={comment.id} className="py-4 flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-[#5F8C74]">{comment.authorNickname}</span>
                      <span className="text-gray-400 text-[10px]">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={editingCommentContent}
                          onChange={(e) => setEditingCommentContent(e.target.value)}
                          className="flex-1 rounded-xl border border-[#E8F2EC] bg-[#FAF9F5] px-3 py-1.5 text-xs outline-none focus:border-[#5F8C74]"
                        />
                        <button
                          type="button"
                          onClick={() => handleCommentEditSave(comment.id)}
                          className="bg-[#5F8C74] hover:bg-[#4d735f] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={handleCommentEditCancel}
                          className="border border-[#E8F2EC] hover:bg-gray-50 text-gray-500 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{comment.content}</p>
                    )}
                  </div>
                  
                  {/* 댓글 수정/삭제 버튼 */}
                  {currentUser && (comment.authorId === currentUser.userId || currentUser.role === "ADMIN") && (
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      {comment.authorId === currentUser.userId && editingCommentId !== comment.id && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCommentEditStart(comment.id, comment.content)}
                            className="text-[10px] font-bold text-[#5F8C74] hover:text-[#4d735f] cursor-pointer"
                          >
                            수정
                          </button>
                          <span className="text-[10px] text-gray-200">|</span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCommentDelete(comment.id)}
                        className="text-[10px] font-bold text-red-400 hover:text-red-600 cursor-pointer"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>

          {/* 댓글 입력 폼 */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="댓글을 남겨주세요."
              className="flex-1 rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-4 py-2.5 text-xs outline-none focus:border-[#5F8C74]"
            />
            <button
              type="submit"
              className="bg-[#5F8C74] hover:bg-[#4d735f] text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer shadow-sm"
            >
              등록
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
