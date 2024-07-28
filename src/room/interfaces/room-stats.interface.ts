export interface RoomStats {
  totalRooms: number;
  totalNetUseableArea: number;
  maxOccupancy: number;
  red: number;
  amber: number;
  green: number;
  roomFunctions: { function: string; count: number }[];
  departments: { department: string; count: number }[];
  roomNames: string[];
}
