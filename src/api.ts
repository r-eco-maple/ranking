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

export const fetchRankingData = async (source: string = 'ranking'): Promise<ApiResponse> => {
  try {
    // ranking_burningの場合はローカルファイルを優先（開発環境のみ）
    if (source === 'ranking_burning' && import.meta.env.DEV) {
      try {
        // Viteの静的ファイル配信を使用（publicDirからの相対パス）
        const localResponse = await fetch('/data/ranking_burning.json');
        if (localResponse.ok) {
          const data = await localResponse.json();
          console.log("Using local ranking_burning data");
          return data;
        }
      } catch (localError) {
        console.log("Local ranking_burning.json not found, trying alternative path...");
        // 代替パスを試行
        try {
          const altResponse = await fetch('/ranking-data/data/ranking_burning.json');
          if (altResponse.ok) {
            const data = await altResponse.json();
            console.log("Using local ranking_burning data (alternative path)");
            return data;
          }
        } catch (altError) {
          console.log("Alternative path also failed, falling back to GitHub Pages");
        }
      }
    }
    
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

    // ranking_burningで全て失敗した場合はダミーデータを返す
    if (source === 'ranking_burning') {
      console.warn("All ranking_burning data sources failed, returning dummy data");
      return {
        success: true,
        data: [
          {"id":1,"rank":1,"name":"バーニングプレイヤー1","world":"バーニング","level":300,"job":"バーニングジョブ","timestamp":"2025-06-30T12:00:00.000Z"},
          {"id":2,"rank":2,"name":"バーニングプレイヤー2","world":"バーニング","level":299,"job":"バーニングジョブ2","timestamp":"2025-06-30T12:00:01.000Z"},
          {"id":3,"rank":3,"name":"バーニングプレイヤー3","world":"バーニング","level":298,"job":"バーニングジョブ3","timestamp":"2025-06-30T12:00:02.000Z"}
        ]
      };
    }

    // フォールバック失敗時
    throw new Error("Unable to fetch ranking data. Please try again later.");
  }
};

// メタデータ取得用の新しい関数
export const fetchMetaData = async (source: string = 'ranking') => {
  try {
    // ranking_burningの場合はローカルファイルを優先（開発環境のみ）
    if (source === 'ranking_burning' && import.meta.env.DEV) {
      try {
        // Viteの静的ファイル配信を使用（publicDirからの相対パス）
        const localResponse = await fetch('/data/meta-ranking_burning.json');
        if (localResponse.ok) {
          console.log("Using local meta-ranking_burning data");
          return await localResponse.json();
        }
      } catch (localError) {
        console.log("Local meta-ranking_burning.json not found, trying alternative path...");
        // 代替パスを試行
        try {
          const altResponse = await fetch('/ranking-data/data/meta-ranking_burning.json');
          if (altResponse.ok) {
            console.log("Using local meta-ranking_burning data (alternative path)");
            return await altResponse.json();
          }
        } catch (altError) {
          console.log("Alternative path also failed, falling back to GitHub Pages");
        }
      }
    }
    
    const baseUrl = getApiBaseUrl();
    const metaFile = source === 'ranking' ? 'meta.json' : `meta-${source}.json`;
    const response = await fetch(`${baseUrl}/${metaFile}`);
    if (!response.ok) {
      throw new Error(`Meta data fetch error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching meta data:", error);
    
    // ranking_burningの場合はテスト用メタデータを返す
    if (source === 'ranking_burning') {
      return {
        lastUpdated: new Date().toISOString(),
        source: "Burning Ranking System (fallback)",
        updateFrequency: "Test data",
        dataCount: 3,
        success: true,
        buildNumber: "burning-fallback"
      };
    }
    
    return {
      lastUpdated: new Date().toISOString(),
      source: "fallback",
      updateFrequency: "unknown",
    };
  }
};
