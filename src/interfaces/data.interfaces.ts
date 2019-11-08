export interface WordInfo {
  id: number;
  word: string;
  frequency: number;
  startFrequency: number;
  endFrequency: number;
}

export interface DatabaseHandler {
  connect(path: string): void;
  disconnect(): void;
  getInfo(word: string): Promise<WordInfo>; 
  getInfos(words: string[]): Promise<WordInfo[]>; 
}
