/**
 * Generates random usernames for guests.
 */
const WORDS = ['unicorn', 'panda', 'otter', 'falcon', 'koala'];

/**
 * Creates a random guest name: a word followed by a number from 100 to 999.
 * @returns {string} e.g. "unicorn123"
 */
export const generateGuestName = () => {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const number = Math.floor(Math.random() * 900) + 100;

  return `${word}${number}`;
};
