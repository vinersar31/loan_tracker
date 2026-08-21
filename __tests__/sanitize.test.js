import { isValidFirebaseUrl } from '../utils/sanitize';

describe('isValidFirebaseUrl', () => {
  it('should return true for a valid Firebase Storage URL', () => {
    expect(isValidFirebaseUrl('https://firebasestorage.googleapis.com/v0/b/my-project.appspot.com/o/image.png?alt=media')).toBe(true);
  });

  it('should return false for an empty string', () => {
    expect(isValidFirebaseUrl('')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isValidFirebaseUrl(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidFirebaseUrl(undefined)).toBe(false);
  });

  it('should return false for a non-HTTPS URL', () => {
    expect(isValidFirebaseUrl('http://firebasestorage.googleapis.com/path')).toBe(false);
  });

  it('should return false for a different hostname', () => {
    expect(isValidFirebaseUrl('https://example.com/path')).toBe(false);
  });

  it('should return false for a URL with a different subdomain', () => {
    expect(isValidFirebaseUrl('https://fake.firebasestorage.googleapis.com/path')).toBe(false);
  });

  it('should return false for an invalid URL string', () => {
    expect(isValidFirebaseUrl('not-a-url')).toBe(false);
  });
});
