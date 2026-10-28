import { confirmPasswordError } from '../authValidation';

describe('confirmPasswordError', () => {
  it('accepts a matching confirmation', () => {
    expect(confirmPasswordError('password123', 'password123')).toBeUndefined();
  });

  it('asks for the confirmation when it is empty', () => {
    expect(confirmPasswordError('password123', '')).toMatch(/Ulangi/);
  });

  it('rejects a different confirmation, case-sensitively', () => {
    expect(confirmPasswordError('password123', 'password124')).toMatch(/tidak sama/);
    expect(confirmPasswordError('Password123', 'password123')).toMatch(/tidak sama/);
  });
});
