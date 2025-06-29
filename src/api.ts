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

// 開発用フォールバック (GAS直接アクセス) - 環境変数が設定されている場合のみ  
const FALLBACK_GAS_URL =
  "https://script.google.com/macros/s/AKfycbwOxOppce1dLNhYI3F3IfznonZZI5hIRYFg5Rmu-CLa73KUGJk3ek4o9hAFnxm7F6zn7A/exec";

// 環境変数からAPIキーを取得 (開発時のみ)
const getApiKey = () => {
  if (typeof window !== 'undefined') {
    // ブラウザ環境では環境変数は使用しない（セキュリティ上）
    return null;
  }
  return import.meta.env.VITE_GAS_API_KEY || null;
};

export const fetchRankingData = async (): Promise<ApiResponse> => {
  try {
    // 統合デプロイ: 同一ドメインまたはGitHub PagesのAPIエンドポイント
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/ranking.json`);

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

    // 開発環境でのみGASフォールバックを試行
    const apiKey = getApiKey();
    if (apiKey && import.meta.env.DEV) {
      try {
        console.log("Attempting GAS fallback in development mode");
        const fallbackUrl = `${FALLBACK_GAS_URL}?apiKey=${encodeURIComponent(apiKey)}`;
        const fallbackResponse = await fetch(fallbackUrl);

        if (!fallbackResponse.ok) {
          throw new Error(`GAS fallback error: ${fallbackResponse.status}`);
        }

        return await fallbackResponse.json();
      } catch (fallbackError) {
        console.error("GAS fallback also failed:", fallbackError);
      }
    }

    // フォールバック失敗時
    throw new Error("Unable to fetch ranking data. Please try again later.");
  }
};

// メタデータ取得用の新しい関数
export const fetchMetaData = async () => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/meta.json`);
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
