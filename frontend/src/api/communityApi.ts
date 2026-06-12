// src/api/communityApi.ts

import { apiRequest } from "./apiClient";

export interface CommentResponse {
  id: number;
  content: string;
  authorNickname: string;
  authorId: number;
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

export async function createPost(request: { title: string; content: string; category: string; chartSnapshotId?: string | null; dinoSnapshot?: string | null }) {
  const token = localStorage.getItem("accessToken");
  return await apiRequest<number>("/api/posts", {
    method: "POST",
    body: request,
    token,
  });
}

export async function fetchPosts(page: number = 0, size: number = 10, category?: string, searchType?: string, keyword?: string): Promise<PageResponse<PostResponse>> {
  const token = localStorage.getItem("accessToken");
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("size", size.toString());
  if (category) query.append("category", category);
  if (searchType) query.append("searchType", searchType);
  if (keyword) query.append("keyword", keyword);

  return await apiRequest<PageResponse<PostResponse>>(`/api/posts?${query.toString()}`, { token });
}

export async function fetchPostDetails(id: number): Promise<PostResponse> {
  const token = localStorage.getItem("accessToken");
  return await apiRequest<PostResponse>(`/api/posts/${id}`, { token });
}

export async function deletePost(id: number): Promise<void> {
  const token = localStorage.getItem("accessToken");
  await apiRequest<void>(`/api/posts/${id}`, { method: "DELETE", token });
}

export async function likePost(id: number): Promise<{ likeCount: number; liked: boolean }> {
  const token = localStorage.getItem("accessToken");
  return await apiRequest<{ likeCount: number; liked: boolean }>(`/api/posts/${id}/like`, { method: "POST", token });
}

export async function createComment(postId: number, content: string): Promise<number> {
  const token = localStorage.getItem("accessToken");
  return await apiRequest<number>(`/api/posts/${postId}/comments`, {
    method: "POST",
    body: { content },
    token,
  });
}

export async function deleteComment(commentId: number): Promise<void> {
  const token = localStorage.getItem("accessToken");
  await apiRequest<void>(`/api/posts/comments/${commentId}`, { method: "DELETE", token });
}

export async function createChartSnapshot(request: { title: string; chartType: string; chartMetadata: string }): Promise<ChartSnapshotResponse> {
  const token = localStorage.getItem("accessToken");
  return await apiRequest<ChartSnapshotResponse>("/api/charts/snapshot", {
    method: "POST",
    body: request,
    token,
  });
}

export async function fetchChartSnapshot(id: string): Promise<ChartSnapshotResponse> {
  const token = localStorage.getItem("accessToken");
  return await apiRequest<ChartSnapshotResponse>(`/api/charts/snapshot/${id}`, { token });
}
