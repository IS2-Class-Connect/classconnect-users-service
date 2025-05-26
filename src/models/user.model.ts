/**
 * Represents a user entity with location, profile information, and failed login attempt tracking.
 */
export interface User {
  uuid:                     string;
  email:                    string;
  name:                     string;
  urlProfilePhoto:          string;
  provider:                 string;
  latitude:                 number | null;
  longitude:                number | null;
  failedAttempts:           number;
  accountLocked:            boolean;
  description:              string;
  lockUntil:                Date | null;
  lastFailedAt:             Date | null;
  accountLockedByAdmins:    boolean;
  pushToken:                string | null;
  pushTaskAssignment:       boolean;
  pushMessageReceived:      boolean;
  emailDeadlineReminder:    boolean;
  emailEnrollment:          boolean;
  emailAssistantAssignment: boolean;
}
