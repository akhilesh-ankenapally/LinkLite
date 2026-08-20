import crypto from 'crypto';
import { CONSTANTS } from '../config/constants';

export class ShortCodeService {
  private static readonly CHARSET = CONSTANTS.SHORT_CODE_CHARSET;
  private static readonly CHARSET_LENGTH = CONSTANTS.SHORT_CODE_CHARSET.length;

  /**
   * Generates a cryptographically random Base62 short code of specified length.
   */
  public static generateCode(length: number = CONSTANTS.SHORT_CODE_MIN_LENGTH): string {
    const randomBytes = crypto.randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += this.CHARSET[randomBytes[i] % this.CHARSET_LENGTH];
    }

    return result;
  }

  /**
   * Validates if a custom alias or short code adheres to system constraints.
   */
  public static isValidCode(code: string, isCustomAlias = false): boolean {
    const minLength = isCustomAlias ? CONSTANTS.CUSTOM_ALIAS_MIN_LENGTH : CONSTANTS.SHORT_CODE_MIN_LENGTH;
    const maxLength = isCustomAlias ? CONSTANTS.CUSTOM_ALIAS_MAX_LENGTH : CONSTANTS.SHORT_CODE_MAX_LENGTH;

    if (code.length < minLength || code.length > maxLength) {
      return false;
    }

    const validCharsRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validCharsRegex.test(code)) {
      return false;
    }

    if (CONSTANTS.RESERVED_CODES.has(code.toLowerCase())) {
      return false;
    }

    return true;
  }
}
