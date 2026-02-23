import MessageBubble from './MessageBubble';

interface CrashAnalysisResult {
  rootCause: string;
  triggers: string[];
  solutions: string[];
  prevention: string[];
}

interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
  files?: File[];
  crashAnalysisResult?: CrashAnalysisResult;
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <p className="text-lg">开始与AI对话</p>
        <p className="text-sm">发送消息或上传文件开始</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          role={msg.role}
          content={msg.content}
          files={msg.files}
          crashAnalysisResult={msg.crashAnalysisResult}
        />
      ))}
    </div>
  );
}
