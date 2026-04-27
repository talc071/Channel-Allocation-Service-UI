import { describe, expect, it } from 'vitest';
import {
  PLATFORMS,
  validateAdId,
  validateChannel,
  validatePlatform,
} from './validation.js';

describe('validateAdId', () => {
  it('rejects empty values', () => {
    expect(validateAdId('').valid).toBe(false);
    expect(validateAdId('   ').valid).toBe(false);
  });

  it('accepts a normal ad id', () => {
    expect(validateAdId('ad-1234').valid).toBe(true);
  });
});

describe('validatePlatform', () => {
  it('accepts every allowed platform', () => {
    for (const platform of PLATFORMS) {
      expect(validatePlatform(platform).valid).toBe(true);
    }
  });

  it('rejects anything else', () => {
    expect(validatePlatform('').valid).toBe(false);
    expect(validatePlatform('twitter').valid).toBe(false);
  });
});

describe('validateChannel', () => {
  it('accepts ono1 through ono99999', () => {
    expect(validateChannel('ono1').valid).toBe(true);
    expect(validateChannel('ono99999').valid).toBe(true);
  });

  it('rejects malformed or out-of-range values', () => {
    expect(validateChannel('').valid).toBe(false);
    expect(validateChannel('ono0').valid).toBe(false);
    expect(validateChannel('ono100000').valid).toBe(false);
    expect(validateChannel('ONO1').valid).toBe(false);
    expect(validateChannel('foo').valid).toBe(false);
  });
});
