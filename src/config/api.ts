/**
 * API 配置
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888',
  endpoints: {
    createSession: '/session/create',
    analyzeReact: '/ai/analyze/react',
  },
} as const;
