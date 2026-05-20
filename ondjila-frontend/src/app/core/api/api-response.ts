export interface ApiResponse<TData> {
  success: boolean;
  data: TData;
  message: string;
  errors?: unknown;
}
