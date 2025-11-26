
export interface TranscriptLine {
  speaker: string;
  text: string;
  timestamp: string; // e.g., "00:15"
}

export interface SentimentPoint {
  timeOffset: number; // seconds or index
  label: string; // e.g., "02:30"
  score: number; // 0 to 100
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface CoachingInsight {
  title: string;
  description: string;
}

export interface AnalysisResult {
  transcript: TranscriptLine[];
  sentimentGraph: SentimentPoint[];
  coaching: {
    strengths: CoachingInsight[];
    improvements: CoachingInsight[];
    summary: string;
  };
}

export enum AppState {
  IDLE = 'IDLE',
  // ANALYZING and ERROR states are now managed per Job in the new architecture
  WORKSPACE = 'WORKSPACE', 
}

export type JobStatus = 'pending' | 'analyzing' | 'completed' | 'error';

export interface AnalysisJob {
  id: string;
  file: File;
  status: JobStatus;
  result?: AnalysisResult;
  error?: string;
  createdAt: number;
}
