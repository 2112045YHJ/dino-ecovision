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

// ---------------- LOCALSTORAGE PERSISTENCE HELPERS ----------------

const defaultMockChartSnapshots: Record<string, ChartSnapshotResponse> = {
  "4a1c5d00-4b82-4fcf-8472-872e42c26350": {
    id: "4a1c5d00-4b82-4fcf-8472-872e42c26350",
    title: "우리 동네 5개년 월간 전력 사용량 비교",
    chartType: "BAR",
    chartMetadata: JSON.stringify([
      { month: 1, totalPowerUsage: 340, totalCarbonEmission: 156 },
      { month: 2, totalPowerUsage: 310, totalCarbonEmission: 142 },
      { month: 3, totalPowerUsage: 280, totalCarbonEmission: 128 },
      { month: 4, totalPowerUsage: 290, totalCarbonEmission: 133 },
      { month: 5, totalPowerUsage: 320, totalCarbonEmission: 147 },
      { month: 6, totalPowerUsage: 380, totalCarbonEmission: 174 },
    ]),
    createdAt: new Date().toISOString(),
  }
};

const defaultMockPosts: PostResponse[] = [
  {
    id: 1,
    title: "서비스 런칭 안내 및 웰컴 이벤트! 🎉",
    content: "안녕하세요. EcoVision: Dino Revival 서비스가 마침내 공식 런칭되었습니다! 오늘의 탄소 절감 미션을 완료하고 지구를 구하며 공룡도 알에서 성체까지 육성해보세요. 매주 우수 탄소 가디언즈 10명에게는 에코 뱃지와 특별 리워드가 지급되니 많은 참여 부탁드립니다. 감사합니다!",
    category: "NOTICE",
    authorNickname: "관리자",
    authorId: 1,
    viewCount: 312,
    likeCount: 54,
    commentCount: 2,
    createdAt: "2026-06-10T12:00:00Z",
    updatedAt: "2026-06-10T12:00:00Z",
    chartSnapshotId: null,
    dinoSnapshot: null,
    comments: [
      {
        id: 101,
        content: "와 드디어 런칭했네요! 기다렸습니다!!",
        authorNickname: "초록초록이",
        authorId: 2,
        createdAt: "2026-06-10T12:15:00Z",
        updatedAt: "2026-06-10T12:15:00Z"
      },
      {
        id: 102,
        content: "열심히 공룡 키우고 지구도 지킬게요!! 화이팅!",
        authorNickname: "티라노가드",
        authorId: 3,
        createdAt: "2026-06-10T12:30:00Z",
        updatedAt: "2026-06-10T12:30:00Z"
      }
    ]
  },
  {
    id: 2,
    title: "우리집 용각류 사우로 성장 단계 자랑합니다 🦖",
    content: "안녕하세요! 벌써 3단계 청소년기(JUVENILE) 단계까지 키웠네요. 매일 소등 미션이랑 분리수거 미션을 완료하니까 엄청 빠르게 큽니다. JUVENILE 단계가 되니 날개 같은 등지느러미가 생겨서 너무 귀여워요! 다들 공룡 뭐 키우시나요?",
    category: "GENERAL",
    authorNickname: "초록초록이",
    authorId: 2,
    viewCount: 148,
    likeCount: 32,
    commentCount: 1,
    createdAt: "2026-06-11T08:30:00Z",
    updatedAt: "2026-06-11T08:30:00Z",
    chartSnapshotId: null,
    dinoSnapshot: JSON.stringify({
      type: "SAURO",
      name: "사우로레온",
      stage: "JUVENILE",
      affinity: 75
    }),
    comments: [
      {
        id: 103,
        content: "우와 저도 사우로 키우는데 아직 HATCHLING이에요ㅠㅠ 엄청 빨리 키우셨네요!",
        authorNickname: "에코가드1호",
        authorId: 4,
        createdAt: "2026-06-11T08:45:00Z",
        updatedAt: "2026-06-11T08:45:00Z"
      }
    ]
  },
  {
    id: 3,
    title: "전력 공급 예비율 꿀팁 공유합니다 💡",
    content: "대시보드에서 보니까 전력 예비율이 10% 이하로 내려가면 홈 화면에 오렌지색 비상 던전 경보가 울리더라고요. 이때 미션을 완료하면 탄소 가중치가 2배로 반영되서 보상이 훨씬 세집니다! 다들 이 피크 타임을 놓치지 마세요. 아래는 저희 아파트 단지 전력 사용량 통계 차트 스냅샷입니다!\n\n/embed/4a1c5d00-4b82-4fcf-8472-872e42c26350",
    category: "INFO_SHARE",
    authorNickname: "에코가드1호",
    authorId: 4,
    viewCount: 195,
    likeCount: 42,
    commentCount: 0,
    createdAt: "2026-06-11T09:15:00Z",
    updatedAt: "2026-06-11T09:15:00Z",
    chartSnapshotId: "4a1c5d00-4b82-4fcf-8472-872e42c26350",
    dinoSnapshot: JSON.stringify({
      type: "TYRANO",
      name: "불꽃티라노",
      stage: "HATCHLING",
      affinity: 35
    }),
    comments: []
  }
];

const getLocalPosts = (): PostResponse[] => {
  const data = localStorage.getItem("mockPosts");
  if (!data) {
    localStorage.setItem("mockPosts", JSON.stringify(defaultMockPosts));
    return defaultMockPosts;
  }
  return JSON.parse(data);
};

const saveLocalPosts = (posts: PostResponse[]) => {
  localStorage.setItem("mockPosts", JSON.stringify(posts));
};

const getLocalSnapshots = (): Record<string, ChartSnapshotResponse> => {
  const data = localStorage.getItem("mockChartSnapshots");
  if (!data) {
    localStorage.setItem("mockChartSnapshots", JSON.stringify(defaultMockChartSnapshots));
    return defaultMockChartSnapshots;
  }
  return JSON.parse(data);
};

const saveLocalSnapshots = (snapshots: Record<string, ChartSnapshotResponse>) => {
  localStorage.setItem("mockChartSnapshots", JSON.stringify(snapshots));
};

// ----------------- API CALLS -----------------

export async function createPost(request: { title: string; content: string; category: string; chartSnapshotId?: string | null; dinoSnapshot?: string | null }) {
  try {
    const token = localStorage.getItem("accessToken");
    return await apiRequest<number>("/api/posts", {
      method: "POST",
      body: request,
      token,
    });
  } catch (e) {
    console.warn("API Call failed, adding to localStorage mock database: ", e);
    const posts = getLocalPosts();
    const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    const newPost: PostResponse = {
      id: newId,
      title: request.title,
      content: request.content,
      category: request.category as any,
      authorNickname: localStorage.getItem("nickname") || "로그인유저",
      authorId: 101,
      viewCount: 1,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chartSnapshotId: request.chartSnapshotId,
      dinoSnapshot: request.dinoSnapshot,
      comments: [],
    };
    posts.unshift(newPost);
    saveLocalPosts(posts);
    return newId;
  }
}

export async function fetchPosts(page: number = 0, size: number = 10, category?: string, searchType?: string, keyword?: string): Promise<PageResponse<PostResponse>> {
  try {
    const token = localStorage.getItem("accessToken");
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("size", size.toString());
    if (category) query.append("category", category);
    if (searchType) query.append("searchType", searchType);
    if (keyword) query.append("keyword", keyword);

    return await apiRequest<PageResponse<PostResponse>>(`/api/posts?${query.toString()}`, { token });
  } catch (e) {
    console.warn("API Call failed, loading from localStorage mock: ", e);
    let filtered = getLocalPosts();
    
    if (category && category !== "ALL") {
      filtered = filtered.filter(p => p.category === category);
    }
    if (keyword && keyword.trim().length >= 2) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(p => {
        if (searchType === "TITLE") return p.title.toLowerCase().includes(kw);
        if (searchType === "CONTENT") return p.content.toLowerCase().includes(kw);
        if (searchType === "AUTHOR") return p.authorNickname.toLowerCase().includes(kw);
        return p.title.toLowerCase().includes(kw) || p.content.toLowerCase().includes(kw) || p.authorNickname.toLowerCase().includes(kw);
      });
    }

    const start = page * size;
    const paginated = filtered.slice(start, start + size);

    return {
      content: paginated,
      totalPages: Math.ceil(filtered.length / size),
      totalElements: filtered.length,
      size,
      number: page,
    };
  }
}

export async function fetchPostDetails(id: number): Promise<PostResponse> {
  try {
    const token = localStorage.getItem("accessToken");
    return await apiRequest<PostResponse>(`/api/posts/${id}`, { token });
  } catch (e) {
    console.warn("API Call failed, loading details from localStorage mock: ", e);
    const posts = getLocalPosts();
    const post = posts.find(p => p.id === id);
    if (!post) throw new Error("게시글을 찾을 수 없습니다.");
    // 조회수 증가 시뮬레이션
    post.viewCount++;
    saveLocalPosts(posts);
    return post;
  }
}

export async function deletePost(id: number): Promise<void> {
  try {
    const token = localStorage.getItem("accessToken");
    await apiRequest<void>(`/api/posts/${id}`, { method: "DELETE", token });
  } catch (e) {
    console.warn("API Call failed, deleting post in localStorage mock: ", e);
    const posts = getLocalPosts();
    const idx = posts.findIndex(p => p.id === id);
    if (idx !== -1) {
      posts.splice(idx, 1);
      saveLocalPosts(posts);
    }
  }
}

export async function likePost(id: number): Promise<{ likeCount: number; liked: boolean }> {
  try {
    const token = localStorage.getItem("accessToken");
    return await apiRequest<{ likeCount: number; liked: boolean }>(`/api/posts/${id}/like`, { method: "POST", token });
  } catch (e) {
    console.warn("API Call failed, toggling post like in localStorage mock: ", e);
    const posts = getLocalPosts();
    const post = posts.find(p => p.id === id);
    let isLiked = false;
    let newLikeCount = 0;
    if (post) {
      const likedStr = localStorage.getItem("mockLikedPosts");
      let likedIds: number[] = likedStr ? JSON.parse(likedStr) : [];
      
      if (likedIds.includes(id)) {
        likedIds = likedIds.filter(pid => pid !== id);
        post.likeCount = Math.max(0, post.likeCount - 1);
        isLiked = false;
      } else {
        likedIds.push(id);
        post.likeCount++;
        isLiked = true;
      }
      newLikeCount = post.likeCount;
      
      localStorage.setItem("mockLikedPosts", JSON.stringify(likedIds));
      saveLocalPosts(posts);
    }
    return { likeCount: newLikeCount, liked: isLiked };
  }
}

export async function createComment(postId: number, content: string): Promise<number> {
  try {
    const token = localStorage.getItem("accessToken");
    return await apiRequest<number>(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: { content },
      token,
    });
  } catch (e) {
    console.warn("API Call failed, adding comment to localStorage mock: ", e);
    const posts = getLocalPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error("게시글을 찾을 수 없습니다.");
    const commentId = Math.floor(Math.random() * 1000) + 200;
    const newComment: CommentResponse = {
      id: commentId,
      content,
      authorNickname: localStorage.getItem("nickname") || "로그인유저",
      authorId: 101,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!post.comments) post.comments = [];
    post.comments.push(newComment);
    post.commentCount = post.comments.length;
    saveLocalPosts(posts);
    return commentId;
  }
}

export async function deleteComment(commentId: number): Promise<void> {
  try {
    const token = localStorage.getItem("accessToken");
    await apiRequest<void>(`/api/posts/comments/${commentId}`, { method: "DELETE", token });
  } catch (e) {
    console.warn("API Call failed, deleting comment in localStorage mock: ", e);
    const posts = getLocalPosts();
    let found = false;
    for (const post of posts) {
      if (post.comments) {
        const idx = post.comments.findIndex(c => c.id === commentId);
        if (idx !== -1) {
          post.comments.splice(idx, 1);
          post.commentCount = post.comments.length;
          found = true;
          break;
        }
      }
    }
    if (found) {
      saveLocalPosts(posts);
    }
  }
}

export async function createChartSnapshot(request: { title: string; chartType: string; chartMetadata: string }): Promise<ChartSnapshotResponse> {
  try {
    const token = localStorage.getItem("accessToken");
    return await apiRequest<ChartSnapshotResponse>("/api/charts/snapshot", {
      method: "POST",
      body: request,
      token,
    });
  } catch (e) {
    console.warn("API Call failed, creating chart snapshot in localStorage mock: ", e);
    const snapshots = getLocalSnapshots();
    const snapshotId = `mock-snap-${Math.floor(Math.random() * 900000) + 100000}`;
    const newSnapshot: ChartSnapshotResponse = {
      id: snapshotId,
      title: request.title,
      chartType: request.chartType,
      chartMetadata: request.chartMetadata,
      createdAt: new Date().toISOString(),
    };
    snapshots[snapshotId] = newSnapshot;
    saveLocalSnapshots(snapshots);
    return newSnapshot;
  }
}

export async function fetchChartSnapshot(id: string): Promise<ChartSnapshotResponse> {
  try {
    const { data } = await apiRequest<{ success: boolean; data: ChartSnapshotResponse }>(`/api/charts/snapshot/${id}`);
    return data as any;
  } catch (e) {
    console.warn("API Call failed, fetching snapshot from localStorage mock: ", e);
    const snapshots = getLocalSnapshots();
    const snapshot = snapshots[id];
    if (!snapshot) throw new Error("스냅샷을 찾을 수 없습니다.");
    return snapshot;
  }
}
