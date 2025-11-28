import { useMemo } from 'react';
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis, Cell, LabelList } from 'recharts';
import { Player } from '../types';

interface ChartProps {
  players: Player[];
}

const COLORS = [
  '#667eea', '#a78bfa', '#f472b6', '#fb923c'
];

const JobAndServerChart = ({ players }: ChartProps) => {
  const worldData = useMemo(() => {
    const worldCounts = players.reduce((acc, player) => {
      const world = player.world;
      acc[world] = (acc[world] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(worldCounts)
      .map(([world, value]) => ({ name: `${world}`, value, world: parseInt(world) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [players]);

  if (worldData.length === 0) {
    return <div>サーバーデータがありません。</div>;
  }

  return (
    <div>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={worldData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`${value}人`, 'プレイヤー数']}
            />
            <Bar dataKey="value" name="プレイヤー数">
              <LabelList dataKey="value" position="top" />
              {worldData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', justifyContent: 'center' }}>
        {worldData.map((entry, index) => (
          <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: COLORS[index], borderRadius: '2px' }} />
            <span>{entry.name}: {entry.value}人</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobAndServerChart;