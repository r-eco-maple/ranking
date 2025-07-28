import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Player } from '../types';

interface LevelChartProps {
  players: Player[];
}

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
}

const COLORS = [
  '#667eea', '#a78bfa', '#f472b6', '#fb923c', '#34d399',
  '#22d3ee', '#fbbf24', '#f87171', '#c084fc', '#818cf8'
];

const LevelChart = ({ players }: LevelChartProps) => {
  const levelData = useMemo(() => {
    const levelCounts = players.reduce((acc, player) => {
      const level = player.level;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(levelCounts)
      .map(([level, value]) => ({ name: `Lv.${level}`, value, level: parseInt(level) }))
      .sort((a, b) => b.level - a.level); // Sort by level descending

  }, [players]);

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: CustomLabelProps) => {
    const RADIAN = Math.PI / 180;
    // ラベルを配置する半径を調整（セクションの中央付近）
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  if (levelData.length === 0) {
    return <div>レベルデータがありません。</div>;
  }

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={levelData}
            cx="50%"
            cy="50%"
            label={CustomLabel}
            labelLine={false}
            outerRadius={100} // Make space for legend
            fill="#8884d8"
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            // isAnimationActive={false}
            animationDuration={700}
            animationBegin={10}
          >
            {levelData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value}人`, name]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LevelChart;
