import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Player } from "../types";
import "./WeeklyChart.css";

interface WeeklyChartProps {
  allPlayers: Player[];
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  [key: string]: number | string | null; // プレイヤー名をキーとした順位データ
}

interface PlayerLineData {
  name: string;
  color: string;
}

const COLORS = [
  "#667eea", // 紫
  "#4cd497", // 緑
  "#f59e0b", // オレンジ
  "#ef4444", // 赤
  "#3b82f6", // 青
  "#8b5cf6", // 紫2
  "#ec4899", // ピンク
  "#06b6d4", // シアン
  "#84cc16", // ライム
  "#f97316", // オレンジ2
];

const WeeklyChart = ({ allPlayers }: WeeklyChartProps) => {
  const { chartData, playerLines } = useMemo(() => {
    if (!allPlayers || allPlayers.length === 0) {
      return { chartData: [], playerLines: [] };
    }

    // 全ユニークなタイムスタンプを取得して日付順にソート
    const uniqueTimestamps = Array.from(
      new Set(allPlayers.map((p) => p.timestamp))
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // 最新から7件を取得
    const recentTimestamps = uniqueTimestamps.slice(-7);

    if (recentTimestamps.length === 0) {
      return { chartData: [], playerLines: [] };
    }

    // 最新のタイムスタンプのデータを取得
    const latestTimestamp = recentTimestamps[recentTimestamps.length - 1];
    const latestData = allPlayers
      .filter((p) => p.timestamp === latestTimestamp)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10); // トップ10を取得

    // トップ10のプレイヤー名リスト
    const top10Players = latestData.map((p) => p.name);

    // 各日付のデータポイントを作成
    const dataPoints: ChartDataPoint[] = recentTimestamps.map((timestamp) => {
      const dateObj = new Date(timestamp);
      const point: ChartDataPoint = {
        date: timestamp,
        displayDate: dateObj.toLocaleDateString("ja-JP", {
          month: "2-digit",
          day: "2-digit",
        }),
      };

      // その日のデータを取得
      const dayData = allPlayers.filter((p) => p.timestamp === timestamp);

      // 各トップ10プレイヤーのその日の順位を取得
      top10Players.forEach((playerName) => {
        const playerData = dayData.find((p) => p.name === playerName);
        if (playerData) {
          // 11位以下は10位にマッピング
          const rank = playerData.rank > 10 ? 10 : playerData.rank;
          point[playerName] = rank;
          // 実際の順位も保存（ツールチップ用）
          point[`${playerName}_actual`] = playerData.rank;
        } else {
          // データがない場合は10位として扱う
          point[playerName] = 10;
          point[`${playerName}_actual`] = null;
        }
      });

      return point;
    });

    // プレイヤーの線データを作成
    const lines: PlayerLineData[] = top10Players.map((name, index) => ({
      name,
      color: COLORS[index % COLORS.length],
    }));

    return { chartData: dataPoints, playerLines: lines };
  }, [allPlayers]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="weekly-chart-tooltip">
          <p className="tooltip-date">{`日付: ${label}`}</p>
          {payload.map((entry: any, index: number) => {
            const playerName = entry.dataKey;
            const actualRank = entry.payload[`${playerName}_actual`];
            const displayRank = actualRank !== null ? actualRank : "圏外";
            
            return (
              <p key={index} style={{ color: entry.color }}>
                {`${playerName}: ${displayRank}位`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // 最後のデータポイントにラベルを表示するカスタムラベルコンポーネント
  const CustomLabel = (props: any) => {
    const { x, y, index, playerName, color } = props;
    // 最後のデータポイントのみラベルを表示
    if (index === chartData.length - 1) {
      return (
        <text
          x={x + 10}
          y={y}
          fill={color}
          fontSize={12}
          fontWeight={600}
          textAnchor="start"
          dominantBaseline="middle"
        >
          {playerName}
        </text>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="weekly-chart-container">
      <h3>週間ランキング推移（トップ10）</h3>
      <div className="weekly-chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 100,
              left: 50,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e5e9" />
            <XAxis
              dataKey="displayDate"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              reversed={true}
              domain={[1, 10]}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              label={{ value: "順位", angle: -90, position: "insideLeft" }}
            />
            <Tooltip content={<CustomTooltip />} />
            {playerLines.map((player) => (
              <Line
                key={player.name}
                type="monotone"
                dataKey={player.name}
                stroke={player.color}
                strokeWidth={2}
                dot={{ fill: player.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name={player.name}
                connectNulls={false}
                label={(props) => <CustomLabel {...props} playerName={player.name} color={player.color} />}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="weekly-chart-info">
        <p>直近7日間のトップ10プレイヤーの順位推移</p>
        {/* <p>※11位以下の場合は10位として表示されます</p> */}
      </div>
    </div>
  );
};

export default WeeklyChart;

