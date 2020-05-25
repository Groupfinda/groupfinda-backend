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
