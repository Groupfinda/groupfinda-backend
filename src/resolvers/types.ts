export type CreateUserType = {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  birthday: Date;
};

export type LoginUserType = {
  username: string;
  password: string;
};

export type ForgetPasswordType = {
  username: string;
  email: string;
};

export type ResetPasswordType = {
  originalPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type DeleteUserType = {
  username: string;
};

export type CreateEventType = {
  title: string;
  description: string;
  dateOfEvent: Date;
  recurringMode: boolean;
  dateLastRegister: Date;
  images: [string];
  private: boolean;
  groupSize: number;
  category: [string];
  locationOn: boolean;
  location: LocationType;
};

export type LocationType = {
  address: string;
  postalCode: string;
};

export type RegisterEventType = {
  eventId: string;
};

export type UnregisterEventType = {
  eventId: string;
};

export type SearchEventType = {
  searchTerm?: string;
  eventCode?: string;
};

export type SubmitRangeQuestionType = {
  order: number;
  value: number;
  
};
