export const extractEmptyFields = (args: Object): string[] => {
  const emptyFields = (Object.keys(args) as Array<keyof typeof args>).filter(
    (key) => !args[key]
  );
  return emptyFields as string[];
};

export const generateRandomCode = (length: number): string => {
  let result: string = "";
  const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < length; i++) {
    result += pool.charAt(Math.floor(Math.random() * pool.length));
  }
  return result;
};
