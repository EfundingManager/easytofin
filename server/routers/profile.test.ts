import { describe, it, expect } from 'vitest';
import { profileRouter } from './profile';

describe('Profile Router', () => {
  it('should have getProfile procedure', () => {
    expect(profileRouter._def.procedures).toHaveProperty('getProfile');
  });

  it('should have updateProfile procedure', () => {
    expect(profileRouter._def.procedures).toHaveProperty('updateProfile');
  });

  it('should have selectServices procedure', () => {
    expect(profileRouter._def.procedures).toHaveProperty('selectServices');
  });

  it('should have submitProfile procedure', () => {
    expect(profileRouter._def.procedures).toHaveProperty('submitProfile');
  });

  it('should have correct procedure types', () => {
    const procedures = profileRouter._def.procedures;
    
    // All procedures should be defined
    expect(procedures.getProfile).toBeDefined();
    expect(procedures.updateProfile).toBeDefined();
    expect(procedures.selectServices).toBeDefined();
    expect(procedures.submitProfile).toBeDefined();
  });
});
