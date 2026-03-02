'use client';

import { useState, useEffect } from 'react';
import MessageList from '@/components/MessageList';
import InputArea from '@/components/InputArea';
import Sidebar from '@/components/Sidebar';
import { API_CONFIG } from '@/config/api';

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

interface Conversation {
  id: string;
  title: string;
  lastUpdated: string;
}

const STORAGE_KEY = 'conversations';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // 从 localStorage 加载会话列表
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConversations(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error('加载会话列表失败:', e);
      }
    }
  }, []);

  // 保存会话列表到 localStorage
  const saveConversations = (newConversations: Conversation[]) => {
    setConversations(newConversations);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConversations));
  };

  // 创建新会话
  const handleNewConversation = async () => {
    const newSessionId = await getSessionId();
    if (newSessionId) {
      const newConversation: Conversation = {
        id: newSessionId,
        title: '新会话',
        lastUpdated: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
      const updated = [newConversation, ...conversations];
      saveConversations(updated);
      setCurrentSessionId(newSessionId);
      setMessages([]);
      setSessionId(newSessionId);
    }
  };

  // 选择会话
  const handleSelectConversation = (id: string) => {
    setCurrentSessionId(id);
    setSessionId(id);
    // TODO: 加载对应会话的消息历史
  };

  // 删除会话
  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter(conv => conv.id !== id);
    saveConversations(updated);
    if (currentSessionId === id && updated.length > 0) {
      setCurrentSessionId(updated[0].id);
      setSessionId(updated[0].id);
    }
  };

  // 获取 sessionId
  const getSessionId = async (): Promise<string | null> => {
    if (sessionId) return sessionId;

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/session/create`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);

        // 将标题和sessionId封装为对象，放入localStorage
        const newConversation: Conversation = {
          id: data.sessionId,
          title: '新会话',
          lastUpdated: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
        };
        const updated = [newConversation, ...conversations];
        saveConversations(updated);

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

      const response = await fetch(`${API_CONFIG.baseUrl}/ai/analyze`, {
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
    <div className="flex h-screen bg-gray-50">
      {/* 左侧侧边栏 */}
      <Sidebar
        conversations={conversations}
        currentSessionId={currentSessionId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewConversation={handleNewConversation}
      />

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto">
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
    </div>
  );
}
