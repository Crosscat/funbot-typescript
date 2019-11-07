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
  getInfo(word: string): WordInfo; 
  getInfos(words: string[]): WordInfo[]; 
}
