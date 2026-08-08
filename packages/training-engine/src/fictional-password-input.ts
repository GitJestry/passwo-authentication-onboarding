export const MAX_FICTIONAL_PASSWORD_LENGTH = 128;

const emojiCharacter = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Emoji_Modifier}]/u;
const emojiKeycap = /[0-9#*]\uFE0F?\u20E3/u;

/**
 * Training passwords remain deliberately bounded to the local analysis contract's 128 UTF-16
 * code-unit limit. Unicode is supported by the analysis, except emoji characters and keycap
 * sequences, which the fictional-password input does not accept.
 */
export function isPermittedFictionalPassword(value: string): boolean {
  return (
    value.length <= MAX_FICTIONAL_PASSWORD_LENGTH &&
    !emojiCharacter.test(value) &&
    !emojiKeycap.test(value)
  );
}
