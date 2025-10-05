export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  birthday: string;
  location: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  birthday?: string;
  location?: string;
}
