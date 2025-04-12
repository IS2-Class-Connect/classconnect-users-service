/**
 * Represents a user entity with location, profile information, and failed login attempt tracking.
 */
export interface User {
  id: number;
  email: string;
  name: string;
  urlProfilePhoto: string;
  provider: string;
  latitude: number | null;
  longitude: number | null;
  failedAttempts: number;        
  accountLocked: boolean;       
  lockUntil: Date | null;      
  lastFailedAt: Date | null;   
}
