import { useState, useEffect, useCallback } from "react";
import { Player } from "./types";
import { fetchRankingData } from "./api";
import RankingTable from "./components/RankingTable";
import FilterPanel from "./components/FilterPanel";
import RankingChart from "./components/RankingChart";
import SourceSelector from "./components/SourceSelector";
import "./App.css";

function App() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dataStats, setDataStats] = useState({
    uniquePlayerCount: 0,
    dataStartDate: "",
    dataEndDate: "",
    minLevel: 0,
    maxLevel: 0,
  });

  const [filters, setFilters] = useState({
    name: "",
  });

  const [currentSource, setCurrentSource] = useState("ranking");

  // URL パラメータで状態を管理するヘルパー関数
  const updateURL = useCallback((source: string, searchName: string) => {
    const params = new URLSearchParams();
    if (source !== "ranking") params.set("source", source);
    if (searchName) params.set("search", searchName);
    
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState(null, '', newURL);
  }, []);

  // URLから状態を読み取るヘルパー関数
  const getStateFromURL = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('source') || 'ranking';
    const searchName = params.get('search') || '';
    return { source, searchName };
  }, []);

  // 2025年7月5日0:00 JST以降にバーニングランキングを表示
  const showBurningRanking = () => {
    const targetDate = new Date("2025-07-05T00:00:00+09:00"); // JST
    const currentDate = new Date();
    return currentDate >= targetDate;
  };

  const availableSources = [
    { value: "ranking", label: "総合" },
    ...(showBurningRanking()
      ? [{ value: "ranking_burning", label: "バーニング" }]
      : []),
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchRankingData(currentSource);
        if (response.success && response.data && response.data.length > 0) {
          setAllPlayers(response.data);
          const latestData = response.data.slice(-100);
          setPlayers(latestData);
          setFilteredPlayers(latestData);

          // データ統計を計算
          const uniqueNames = new Set(response.data.map((p) => p.name));
          const timestamps = response.data
            .map((p) => new Date(p.timestamp))
            .sort((a, b) => a.getTime() - b.getTime());
          const levels = response.data.map((p) => p.level);
          const minLevel = levels.slice(-1)[0];

          setDataStats({
            uniquePlayerCount: uniqueNames.size,
            dataStartDate: timestamps[0]?.toLocaleDateString("ja-JP") || "",
            dataEndDate:
              timestamps[timestamps.length - 1]?.toLocaleDateString("ja-JP") ||
              "",
            minLevel: minLevel ? minLevel : 0,
            maxLevel: levels.length > 0 ? Math.max(...levels) : 0,
          });
        } else {
          setError("データの取得に失敗しました。しばらく後にお試しください。");
        }
      } catch (err) {
        console.error("Data fetch error:", err);
        setError(
          "データサーバーに接続できません。しばらく後にお試しください。"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentSource]);

  useEffect(() => {
    const hasActiveFilters = filters.name;

    let dataToFilter = hasActiveFilters ? allPlayers : players;
    let filtered = dataToFilter;

    if (filters.name) {
      filtered = filtered.filter(
        (player) => player.name.toLowerCase() === filters.name.toLowerCase()
      );
    }

    setFilteredPlayers(filtered);
  }, [players, allPlayers, filters]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // URLを更新
    updateURL(currentSource, newFilters.name);
  };

  const handleNameClick = (name: string) => {
    setFilters({ name });
    // URLを更新
    updateURL(currentSource, name);
  };

  const handleSourceChange = (source: string) => {
    setCurrentSource(source);
    // ソース変更時にフィルターをリセット
    setFilters({ name: "" });
    // URLを更新
    updateURL(source, "");
  };

  // 初期ロード時にURLから状態を復元
  useEffect(() => {
    const { source, searchName } = getStateFromURL();
    
    // バーニングランキングが利用可能でない場合は総合に戻す
    const validSource = (source === "ranking_burning" && !showBurningRanking()) 
      ? "ranking" 
      : source;
    
    setCurrentSource(validSource);
    if (searchName) {
      setFilters({ name: searchName });
    }
  }, [getStateFromURL]);

  // 戻るボタンの対応
  useEffect(() => {
    const handlePopState = () => {
      const { source, searchName } = getStateFromURL();
      
      const validSource = (source === "ranking_burning" && !showBurningRanking()) 
        ? "ranking" 
        : source;
      
      setCurrentSource(validSource);
      setFilters({ name: searchName });
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getStateFromURL]);

  // バーニングランキングが利用可能でない場合、総合に戻す
  useEffect(() => {
    if (currentSource === "ranking_burning" && !showBurningRanking()) {
      setCurrentSource("ranking");
    }
  }, [currentSource]);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="main-container">
        <header className="app-header">
          <h1>経験値ランキング</h1>
          <div className="data-stats">
            <span>プレイヤー数: {dataStats.uniquePlayerCount}人</span>
            <span>
              期間: {dataStats.dataStartDate} ~ {dataStats.dataEndDate}
            </span>
            <span>
              レベル範囲: Lv.{dataStats.minLevel} - {dataStats.maxLevel}
            </span>
          </div>
          <div className="info-section">
            <ul>
              <li>
                データ更新は毎日8:00~12:00くらいにされます。(※メンテ時は未定)
              </li>
              <li>総合ランキングの1~100位のデータを取得しています。</li>
              <li>
                100位以内に入ってランク外になった場合でもリストに乗っています。
              </li>
              <li>
                <a
                  href={
                    currentSource === "ranking_burning"
                      ? "https://maplestory.nexon.co.jp/community/exp/ranking/?p=1&worldname=49&jobname=%E7%94%B7%E5%A5%B3%EF%BC%8B%E8%81%B7%E6%A5%AD%E5%85%A8%E4%BD%93"
                      : "https://maplestory.nexon.co.jp/community/exp/ranking/"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  公式ランキング
                </a>
              </li>
            </ul>
          </div>
        </header>

        <div className="controls-section">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            players={allPlayers}
          />

          <SourceSelector
            currentSource={currentSource}
            onSourceChange={handleSourceChange}
            availableSources={availableSources}
          />
        </div>
      </div>

      {filters.name && (
        <RankingChart
          selectedPlayerName={filters.name}
          allPlayers={allPlayers}
        />
      )}

      <RankingTable players={filteredPlayers} onNameClick={handleNameClick} />
    </div>
  );
}

export default App;
