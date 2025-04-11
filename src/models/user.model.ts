export interface User {
  id: number;
  email: string;
  name: string;
  urlProfilePhoto: string;
  provider: string;
  location: string | null;
}
