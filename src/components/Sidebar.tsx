'use client';

interface Conversation {
  id: string;
  title: string;
  lastUpdated: string;
}

interface SidebarProps {
  conversations?: Conversation[];
  currentSessionId?: string | null;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onNewConversation?: () => void;
}

export default function Sidebar({
  conversations = [],
  currentSessionId = null,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
}: SidebarProps) {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteConversation?.(id);
  };
  const uniqueConversations = conversations.filter(
    (conv, index, self) =>
      index === self.findIndex((c) => c.id === conv.id)
  );
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">历史会话</h2>
      </div>

      {/* 新建会话按钮 */}
      <div className="p-3 border-b border-gray-200">
        <button
          onClick={onNewConversation}
          className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          新建会话
        </button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {uniqueConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation?.(conv.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer mb-1 transition-colors ${
                conv.id === currentSessionId
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex-1 min-w-0 mr-2">
                <p
                  className={`text-sm font-medium truncate ${
                    conv.id === currentSessionId ? 'text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {conv.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{conv.lastUpdated}</p>
              </div>

              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                title="删除会话"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="text-center text-gray-400 py-8 text-sm">
              暂无会话记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
