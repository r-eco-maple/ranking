import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Player } from "../types";
import "./RankingChart.css";

interface RankingChartProps {
  selectedPlayerName: string;
  allPlayers: Player[];
}

interface ChartData {
  date: string;
  rank: number;
  level: number;
  displayDate: string;
}

const RankingChart = ({
  selectedPlayerName,
  allPlayers,
}: RankingChartProps) => {
  const chartData = useMemo(() => {
    if (!selectedPlayerName) return [];

    const playerData = allPlayers
      .filter((player) => player.name === selectedPlayerName)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .map((player) => ({
        date: player.timestamp.split("T")[0],
        rank: player.rank,
        level: player.level,
        displayDate: new Date(player.timestamp).toLocaleDateString("ja-JP", {
          month: "2-digit",
          day: "2-digit",
        }),
      }));

    const uniqueData: ChartData[] = [];
    const seenDates = new Set<string>();

    playerData.forEach((data) => {
      if (!seenDates.has(data.date)) {
        seenDates.add(data.date);
        uniqueData.push(data);
      }
    });

    return uniqueData;
  }, [selectedPlayerName, allPlayers]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{`日付: ${data.displayDate}`}</p>
          <p className="tooltip-rank">{`ランク: ${data.rank}位`}</p>
          <p className="tooltip-level">{`レベル: ${data.level}`}</p>
        </div>
      );
    }
    return null;
  };

  if (!selectedPlayerName) {
    return null;
  }

  if (chartData.length === 0) {
    return (
      <div className="ranking-chart-container">
        <h3>{selectedPlayerName} のランキング推移</h3>
        <div className="no-data">
          このキャラクターのデータが見つかりませんでした。
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-chart-container">
      <h3>{selectedPlayerName} のランキング推移</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e5e9" />
            <XAxis dataKey="displayDate" stroke="#6b7280" fontSize={12} />
            <YAxis
              yAxisId="left"
              stroke="#6b7280"
              fontSize={12}
              reversed={true}
              domain={["dataMin - 2", "dataMax + 3"]}
              label={{ value: "ランク", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#4cd497"
              fontSize={12}
              domain={["dataMin - 2", "dataMax + 3"]}
              label={{ value: "レベル", angle: 90, position: "insideRight" }}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="linear"
              dataKey="rank"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ fill: "#667eea", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8, fill: "#4f46e5" }}
              name="ランキング"
            />
            <Line
              yAxisId="right"
              type="linear"
              dataKey="level"
              stroke="#4cd497"
              strokeWidth={3}
              dot={{ fill: "#4cd497", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8, fill: "#3ca676" }}
              name="レベル"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-info">
        <p>期間: {chartData.length}日間のデータ</p>
        <p>最高順位: {Math.min(...chartData.map((d) => d.rank))}位</p>
        <p>最新順位: {chartData[chartData.length - 1]?.rank}位</p>
        <p>最高レベル: {Math.max(...chartData.map((d) => d.level))}</p>
        <p>最新レベル: {chartData[chartData.length - 1]?.level}</p>
      </div>
    </div>
  );
};

export default RankingChart;
