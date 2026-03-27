/** GPS航路ポイント */
export interface RoutePoint {
  id: string;
  record_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: string;
}
