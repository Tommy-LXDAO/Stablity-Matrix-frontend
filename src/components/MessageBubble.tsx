interface CrashAnalysisResult {
  rootCause: string;
  triggers: string[];
  solutions: string[];
  prevention: string[];
}

interface MessageBubbleProps {
  role: 'user' | 'ai';
  content: string;
  files?: File[];
  crashAnalysisResult?: CrashAnalysisResult;
}

export default function MessageBubble({ role, content, files, crashAnalysisResult }: MessageBubbleProps) {
  const isUser = role === 'user';
  const hasContent = content.trim().length > 0;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-white border border-gray-200 text-gray-800'
        }`}
      >
        {hasContent && (
          <div className="whitespace-pre-wrap">{content}</div>
        )}

        {/* 渲染崩溃分析结果 */}
        {crashAnalysisResult && !isUser && (
          <div className={hasContent ? 'mt-4 border-t border-gray-200 pt-3' : ''}>
            <h3 className="font-bold text-lg mb-2 text-red-600">崩溃分析结果</h3>

            <div className="mb-3">
              <h4 className="font-semibold text-sm text-gray-700 mb-1">根本原因:</h4>
              <p className="text-sm bg-red-50 p-2 rounded">{crashAnalysisResult.rootCause}</p>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold text-sm text-gray-700 mb-1">触发条件:</h4>
              <ul className="text-sm space-y-1">
                {crashAnalysisResult.triggers.map((trigger, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-orange-500">•</span>
                    <span>{trigger}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold text-sm text-gray-700 mb-1">解决方案:</h4>
              <ul className="text-sm space-y-1">
                {crashAnalysisResult.solutions.map((solution, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-green-500">✓</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-1">预防措施:</h4>
              <ul className="text-sm space-y-1">
                {crashAnalysisResult.prevention.map((item, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-blue-500">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {files && files.length > 0 && (
          <div className="mt-2 pt-2 border-t border-opacity-20">
            <p className="text-xs opacity-70 mb-1">附件:</p>
            <div className="flex flex-wrap gap-1">
              {files.map((file, i) => (
                <span
                  key={i}
                  className="text-xs bg-opacity-20 bg-black px-2 py-1 rounded"
                >
                  📎 {file.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
