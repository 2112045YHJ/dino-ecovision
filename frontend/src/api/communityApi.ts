// src/api/communityApi.ts

import { apiRequest } from "./apiClient";

export interface CommentResponse {
  id: number;
  content: string;
  authorNickname: string;
  authorId: number;
  authorAvatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  category: "NOTICE" | "GENERAL" | "INFO_SHARE";
  authorNickname: string;
  authorId: number;
  authorAvatarUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  chartSnapshotId?: string | null;
  dinoSnapshot?: string | null; // JSON String
  liked?: boolean;
  comments?: CommentResponse[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface ChartSnapshotResponse {
  id: string;
  title: string;
  chartType: string;
  chartMetadata: string; // JSON String
  createdAt: string;
}



// ----------------- API CALLS -----------------
// 토큰은 apiRequest가 localStorage에서 자동 주입하고, 401 시 자동 재발급/재시도합니다.

export async function createPost(request: { title: string; content: string; category: string; chartSnapshotId?: string | null; dinoSnapshot?: string | null }) {
  return await apiRequest<number>("/api/posts", {
    method: "POST",
    body: request,
  });
}

export async function fetchPosts(page: number = 0, size: number = 10, category?: string, searchType?: string, keyword?: string): Promise<PageResponse<PostResponse>> {
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("size", size.toString());
  if (category) query.append("category", category);
  if (searchType) query.append("searchType", searchType);
  if (keyword) query.append("keyword", keyword);

  return await apiRequest<PageResponse<PostResponse>>(`/api/posts?${query.toString()}`);
}

export async function fetchPostDetails(id: number): Promise<PostResponse> {
  return await apiRequest<PostResponse>(`/api/posts/${id}`);
}

export async function deletePost(id: number): Promise<void> {
  await apiRequest<void>(`/api/posts/${id}`, { method: "DELETE" });
}

export async function updatePost(id: number, request: { title: string; content: string; category: string; chartSnapshotId?: string | null; dinoSnapshot?: string | null }): Promise<void> {
  await apiRequest<void>(`/api/posts/${id}`, {
    method: "PUT",
    body: request,
  });
}

export async function likePost(id: number): Promise<{ likeCount: number; liked: boolean }> {
  return await apiRequest<{ likeCount: number; liked: boolean }>(`/api/posts/${id}/like`, { method: "POST" });
}

export async function createComment(postId: number, content: string): Promise<number> {
  return await apiRequest<number>(`/api/posts/${postId}/comments`, {
    method: "POST",
    body: { content },
  });
}

export async function updateComment(commentId: number, content: string): Promise<void> {
  await apiRequest<void>(`/api/posts/comments/${commentId}`, {
    method: "PUT",
    body: { content },
  });
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiRequest<void>(`/api/posts/comments/${commentId}`, { method: "DELETE" });
}

export async function createChartSnapshot(request: { title: string; chartType: string; chartMetadata: string }): Promise<ChartSnapshotResponse> {
  return await apiRequest<ChartSnapshotResponse>("/api/charts/snapshot", {
    method: "POST",
    body: request,
  });
}

export async function fetchChartSnapshot(id: string): Promise<ChartSnapshotResponse> {
  return await apiRequest<ChartSnapshotResponse>(`/api/charts/snapshot/${id}`);
}

export async function uploadPostImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  return await apiRequest<string>("/api/posts/images", {
    method: "POST",
    body: formData,
    fallbackMessage: "이미지 업로드에 실패했습니다.",
  });
}
