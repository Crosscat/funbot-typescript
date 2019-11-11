export interface WordInfo {
  id: number;
  word: string;
  frequency: number;
  startFrequency: number;
  endFrequency: number;
}

export interface IdInfo {
  id: number;
  followingIds: number[];
  trailingIds: number[];
}

export interface DatabaseHandler {
  connect(path: string): void;
  disconnect(): void;
  getInfos(words: string[]): Promise<WordInfo[]>;
  updateWords(words: string[]): Promise<void>;
  exec(sql: string): Promise<void>;
}
