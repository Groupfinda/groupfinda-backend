import { MessageType } from "../models";

export type ObjIterator = {
  [key: string]: any;
};
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

export type FetchUserType = {
  userId: string;
}

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
  id: string | undefined;
  title: string;
  description: string;
  dateOfEvent: Date;
  recurringMode: boolean;
  dateLastRegister: Date;
  images: string[];
  private: boolean;
  groupSize: number;
  category: string[];
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

export type ViewEventType = {
  eventId: string;
  type: "LIKE" | "DISLIKE";
};

export type SearchEventType = {
  searchTerm?: string;
  eventCode?: string;
};

export type SubmitRangeQuestionType = {
  order: number;
  value: number;
};

export type GetEventType = {
  eventId: string;
};

export type UpdateProfileType = {
  userHobbies?: string[];
  userFaculty?: string;
  userYearOfStudy?: number;
};

export type UpdateUserType = {
  firstName?: string;
  lastName?: string;
  birthday?: Date;
  gender?: string;
  avatar?: string;
  lowerAge?: number;
  upperAge?: number;
  maxDistance?: number;
  newUser?: boolean;
};

export type GetGroupType = {
  eventId?: string;
};

export type GetMessageRoomType = {
  id: string;
};

export type SendMessageType = {
  messageRoomId: string;
  message: MessageType;
};

export type MessageSubscriptionPayload = {
  messageSent: {
    message: MessageType;
    room: string;
  };
};

export type MessageSubscriptionVariables = {
  messageRoomId: string;
};

export type AddExpoTokenType = {
  token: string;
};

export type SubmitReportType = {
  title: string;
  category: string;
  description: string;
};

export type DeleteEventType = {
  eventId: string;
};