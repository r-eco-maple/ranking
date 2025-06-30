export interface Player {
  id: number;
  rank: number;
  name: string;
  world: string;
  level: number;
  job: string;
  timestamp: string;
}

export interface ApiResponse {
  success: boolean;
  data: Player[];
}