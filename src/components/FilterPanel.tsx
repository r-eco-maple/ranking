import { useState, useEffect } from 'react';
import Select from 'react-select';
import { Player } from '../types';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: {
    name: string;
  };
  onFilterChange: (filters: any) => void;
  players: Player[];
}

const FilterPanel = ({ filters, onFilterChange, players }: FilterPanelProps) => {
  const [uniqueNames, setUniqueNames] = useState<string[]>([]);

  useEffect(() => {
    const names = [...new Set(players.map(p => p.name))].sort();
    setUniqueNames(names);
  }, [players]);

  const handleNameChange = (selectedOption: any) => {
    onFilterChange({
      name: selectedOption ? selectedOption.value : ''
    });
  };

  const clearFilters = () => {
    onFilterChange({
      name: ''
    });
  };

  return (
    <div className="filter-panel">
      <h3>キャラクター検索</h3>
      
      <div className="filter-grid">
        <div className="filter-group">
          <label>プレイヤー名</label>
          <Select
            options={uniqueNames.map(name => ({ value: name, label: name }))}
            value={filters.name ? { value: filters.name, label: filters.name } : null}
            onChange={handleNameChange}
            placeholder="プレイヤー名で検索"
            isClearable
            isSearchable
            className="react-select-container"
            classNamePrefix="react-select"
            filterOption={(option, inputValue) =>
              option.label.toLowerCase().startsWith(inputValue.toLowerCase())
            }
          />
        </div>

        <div className="filter-group">
          <button className="clear-button" onClick={clearFilters}>
            検索をクリア
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
