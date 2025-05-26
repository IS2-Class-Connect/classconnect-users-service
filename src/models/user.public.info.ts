export interface UserPublicInfo {
  uuid: string;
  name: string;
  email: string;
  urlProfilePhoto: string | null;
  description: string | null;
  accountLockedByAdmins: boolean;
  createdAt: Date;
  pushToken: string | null;
  pushTaskAssignment: boolean,
  pushMessageReceived: boolean,
  emailDeadlineReminder: boolean,
  emailEnrollment: boolean,
  emailAssistantAssignment: boolean,
}
