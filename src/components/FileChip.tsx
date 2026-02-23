interface FileChipProps {
  file: File;
  onRemove: () => void;
}

export default function FileChip({ file, onRemove }: FileChipProps) {
  return (
    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
      📎 {file.name}
      <button
        onClick={onRemove}
        className="ml-1 text-gray-500 hover:text-red-500"
      >
        ×
      </button>
    </span>
  );
}
