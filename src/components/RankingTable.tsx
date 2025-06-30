import { Player } from "../types";
import "./RankingTable.css";

interface RankingTableProps {
  players: Player[];
  onNameClick?: (name: string) => void;
}

const RankingTable = ({ players, onNameClick }: RankingTableProps) => {
  const handleNameClick = (name: string) => {
    if (onNameClick) {
      onNameClick(name);
    }
  };

  return (
    <div className="ranking-table-container">
      <table className="ranking-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>World</th>
            <th>Level</th>
            <th>Job</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td className="rank-cell">
                <span className={`rank ${player.rank <= 3 ? "top-rank" : ""}`}>
                  {player.rank}
                </span>
              </td>
              <td className="name-cell">
                <button
                  className="name-button"
                  onClick={() => handleNameClick(player.name)}
                  title="クリックして検索"
                >
                  {player.name}
                </button>
              </td>
              <td className="world-cell">{player.world}</td>
              <td className="level-cell">{player.level}</td>
              <td className="job-cell">{player.job}</td>
              <td className="timestamp-cell">{player.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {players.length === 0 && (
        <div className="no-results">
          フィルター条件に一致するプレイヤーが見つかりませんでした。
        </div>
      )}
    </div>
  );
};

export default RankingTable;
