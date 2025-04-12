/**
 * Represents a user entity with location and profile information.
 */
export interface User {
  id: number;
  email: string;
  name: string;
  urlProfilePhoto: string;
  provider: string;
  latitude: number | null;
  longitude: number | null;
}
