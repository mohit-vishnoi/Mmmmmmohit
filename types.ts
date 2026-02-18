export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface ChatConfig {
  userName: string;
  topic: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
}