export interface CryptoAnalysisRequest {
  symbol: string;
  investment: number;
}

export interface CryptoAnalysisResult {
  symbol: string;
  investment: number;
  numberOfCoins: number;
  profit: number;
  growthFactor: number;
  lambos: number;
  generatedAt: string;
}

export interface GraphPoint {
  x: string | Date; // Date for graphing
  y: number; // Price/Value
}

export interface GraphData {
  points: GraphPoint[];
  color: string;
}

export interface AnalysisResponse {
  result: CryptoAnalysisResult;
  graphData: GraphData; // Simplified for now, might need to match frontend expectation
}
