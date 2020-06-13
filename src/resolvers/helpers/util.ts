export const extractEmptyFields = (args: Object): string[] => {
  const emptyFields = (Object.keys(args) as Array<keyof typeof args>).filter(
    (key) => !args[key] || args[key].length === 0
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

type UserPreferences = {
  [key: string]: number;
};

export const incrementPreferences = (
  userPref: UserPreferences,
  categories: string[]
): UserPreferences => {
  const preferences = userPref;

  categories.forEach((cat) => {
    const catToLower = cat.toLowerCase();
    if (!preferences[catToLower]) {
      preferences[catToLower] = 1;
    } else {
      preferences[catToLower] = preferences[catToLower] + 1;
    }
  });

  return preferences;
};

export const decrementPreferences = (
  userPref: UserPreferences,
  categories: string[]
): UserPreferences => {
  const preferences = userPref;
  categories.forEach((cat) => {
    const catToLower = cat.toLowerCase();
    if (!preferences[catToLower]) {
      preferences[catToLower] = -1;
    } else {
      preferences[catToLower] = preferences[catToLower] - 1;
    }
  });

  return preferences;
};
