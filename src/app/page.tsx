'use client';

import { useState } from 'react';
import MessageList from '@/components/MessageList';
import InputArea from '@/components/InputArea';

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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 获取 sessionId
  const getSessionId = async (): Promise<string | null> => {
    if (sessionId) return sessionId;

    try {
      const response = await fetch('http://localhost:8888/session/create', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        return data.sessionId;
      }
    } catch (error) {
      console.error('获取sessionId失败:', error);
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      files: files.length > 0 ? [...files] : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setFiles([]);

    // 添加空的AI消息用于显示加载状态
    const loadingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: loadingId, role: 'ai', content: '...' }]);
    setIsLoading(true);

    try {
      // 获取 sessionId
      const currentSessionId = await getSessionId();

      const formData = new FormData();
      formData.append('question', input);
      if (currentSessionId) {
        formData.append('sessionId', currentSessionId);
      }
      files.forEach(file => formData.append('files', file));

      const response = await fetch('http://localhost:8888/ai/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      // 判断请求是否成功，提取 crashAnalysisResult
      const crashResult = data.success && data.crashAnalysisResult
        ? data.crashAnalysisResult
        : undefined;

      // 更新AI回复
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingId
            ? {
                ...msg,
                content: data.result || data.message || (data.success ? '请求成功' : JSON.stringify(data)),
                crashAnalysisResult: crashResult
              }
            : msg
        )
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingId
            ? { ...msg, content: `请求失败: ${error instanceof Error ? error.message : '未知错误'}` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
      </div>

      <InputArea
        input={input}
        files={files}
        isLoading={isLoading}
        onInputChange={setInput}
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        onSend={handleSend}
      />
    </div>
  );
}
