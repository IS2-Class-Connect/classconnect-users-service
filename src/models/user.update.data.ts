// Defines optional fields for updating a user's name, email, profile photo URL, and description.
export interface UpdateUserProfileDto {
    name?:                     string;
    email?:                    string;
    urlProfilePhoto?:          string;
    description?:              string;
    pushTaskAssignment?:       boolean;
    pushMessageReceived?:      boolean;
    emailDeadlineReminder?:    boolean;
    emailEnrollment?:          boolean;
    emailAssistantAssignment?: boolean;
  }
  
