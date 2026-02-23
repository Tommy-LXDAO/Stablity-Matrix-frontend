import { useRef } from 'react';
import FileChip from './FileChip';

interface InputAreaProps {
  input: string;
  files: File[];
  isLoading?: boolean;
  onInputChange: (value: string) => void;
  onFileSelect: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  onSend: () => void;
}

export default function InputArea({
  input,
  files,
  isLoading = false,
  onInputChange,
  onFileSelect,
  onFileRemove,
  onSend,
}: InputAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileSelect(Array.from(e.target.files));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t bg-white p-4">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file, i) => (
            <FileChip
              key={i}
              file={file}
              onRemove={() => onFileRemove(i)}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
          title="上传文件"
        >
          📎
        </button>
        <textarea
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          className="flex-1 resize-none border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
        />
        <button
          onClick={onSend}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
}
