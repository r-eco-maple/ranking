import { ApiResponse } from "./types";

// GitHub Pages統合デプロイ用 (本番: 同一ドメイン、開発: GitHub Pages)
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    // 開発時は GitHub Pages の API を直接参照
    return "https://r-eco-maple.github.io/ranking";
  } else {
    // 本番時も GitHub Pages ドメインの /ranking/ パスを使用
    return "https://r-eco-maple.github.io/ranking";
  }
};

export const fetchRankingData = async (source: string = 'ranking'): Promise<ApiResponse> => {
  try {
    // 統合デプロイ: 同一ドメインまたはGitHub PagesのAPIエンドポイント
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/${source}.json`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // データの有効性をチェック
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error("Invalid data format received");
    }

    return data;
  } catch (error) {
    console.warn("Primary API fetch failed:", error);
    throw new Error("Unable to fetch ranking data. Please try again later.");
  }
};

// メタデータ取得用の新しい関数
export const fetchMetaData = async (source: string = 'ranking') => {
  try {
    const baseUrl = getApiBaseUrl();
    const metaFile = source === 'ranking' ? 'meta.json' : `meta-${source}.json`;
    const response = await fetch(`${baseUrl}/${metaFile}`);
    if (!response.ok) {
      throw new Error(`Meta data fetch error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching meta data:", error);
    return {
      lastUpdated: new Date().toISOString(),
      source: "fallback",
      updateFrequency: "unknown",
    };
  }
};
