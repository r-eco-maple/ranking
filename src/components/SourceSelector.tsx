import "./SourceSelector.css";

interface SourceSelectorProps {
  currentSource: string;
  onSourceChange: (source: string) => void;
  availableSources: { value: string; label: string }[];
}

const SourceSelector = ({
  currentSource,
  onSourceChange,
  availableSources,
}: SourceSelectorProps) => {
  return (
    <div className="source-selector">
      {/* <h3>データソース</h3> */}
      <div className="source-buttons">
        {availableSources.map((source) => (
          <button
            key={source.value}
            className={`source-button ${
              currentSource === source.value ? "active" : ""
            }`}
            onClick={() => onSourceChange(source.value)}
          >
            {source.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SourceSelector;
