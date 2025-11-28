// ...existing code...
import { useMemo } from 'react';
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis, Cell, LabelList } from 'recharts';
import { Player } from '../types';

interface ChartProps {
  players: Player[];
}

const COLORS = [
  '#667eea', '#a78bfa', '#f472b6', '#fb923c',
  '#34d399', '#22d3ee', '#fbbf24'
];

const JobChart = ({ players }: ChartProps) => {
  const jobData = useMemo(() => {
    const counts = players.reduce((acc, player) => {
      const job = String(player.job);
      acc[job] = (acc[job] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([job, value]) => ({ name: `${job}`, value }))
      .sort((a, b) => b.value - a.value) // 多い順（上に来る）
      .slice(0, 49);
  }, [players]);

  if (jobData.length === 0) {
    return <div>サーバーデータがありません。</div>;
  }

  // 縦並び（カテゴリが多いので高さを自動調整）
  const chartHeight = Math.min(800, jobData.length * 28 + 60);

  return (
    <div>
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={jobData}
            margin={{ top: 10, right: 20, left: 30, bottom: 10 }}
          >
            {/* 横軸：数（数値） */}
            <XAxis type="number" />
            {/* 縦軸：ジョブ名（カテゴリ） */}
            <YAxis type="category" dataKey="name" width={160}
              interval={0}       // 全ラベルを表示（間引き無効化）
            />
            <Tooltip formatter={(value: number) => [`${value}人`, 'プレイヤー数']} />
            <Bar dataKey="value" name="プレイヤー数" barSize={18}>
              {/* バーの右側に数値ラベル */}
              <LabelList dataKey="value" position="right" formatter={(v: number) => `${v}人`} />
              {jobData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default JobChart;