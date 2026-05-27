export interface ChatRide {
  id: number;
  status: string;
  ride_type: string;
  driver_name: string | null;
  passenger_name: string | null;
}

export interface ChatMessage {
  id: number;
  ride_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  message: string;
  mine: boolean;
  created_at: string;
  time: string;
}

export interface ChatThread {
  ride: ChatRide | null;
  messages: ChatMessage[];
}
