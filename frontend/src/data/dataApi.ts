import { Preferences as Storage } from '@capacitor/preferences';

const HAS_LOGGED_IN = 'hasLoggedIn';
const HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
const USERNAME = 'username';

/**
 * Sets the user's logged-in status in local storage.
 * @param {boolean} isLoggedIn - The logged-in status.
 */
export const setIsLoggedInData = async (isLoggedIn: boolean) => {
  await Storage.set({ key: HAS_LOGGED_IN, value: JSON.stringify(isLoggedIn) });
};

/**
 * Sets the user's tutorial seen status in local storage.
 * @param {boolean} hasSeenTutorial - The tutorial seen status.
 */
export const setHasSeenTutorialData = async (hasSeenTutorial: boolean) => {
  await Storage.set({
    key: HAS_SEEN_TUTORIAL,
    value: JSON.stringify(hasSeenTutorial),
  });
};

/**
 * Sets the username in local storage.
 * If username is undefined, it removes the username from local storage.
 * @param {string} [username] - The username to set or undefined to remove.
 */
export const setUsernameData = async (username?: string) => {
  if (!username) {
    await Storage.remove({ key: USERNAME });
  } else {
    await Storage.set({ key: USERNAME, value: username });
  }
};

/**
 * Retrieves user data from local storage.
 * @returns {Promise<object>} An object containing isLoggedin, hasSeenTutorial, and username.
 */
export const getUserData = async () => {
  const response = await Promise.all([
    Storage.get({ key: HAS_LOGGED_IN }),
    Storage.get({ key: HAS_SEEN_TUTORIAL }),
    Storage.get({ key: USERNAME }),
  ]);
  const isLoggedin = (await response[0].value) === 'true';
  const hasSeenTutorial = (await response[1].value) === 'true';
  const username = (await response[2].value) || undefined;
  const data = {
    isLoggedin,
    hasSeenTutorial,
    username,
  };
  return data;
};
