export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
}

export interface UserResponse {
  id: number;
  name: string;
  username: string;
  email: string;
}