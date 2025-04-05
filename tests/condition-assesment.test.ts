import { describe, it, expect, beforeEach } from 'vitest';

// Mock the Clarity environment
const mockClarity = {
  accounts: {
    'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM': { balance: 10000 },
    'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG': { balance: 10000 }
  },
  contractStates: {},
  blockHeight: 123
};

// Simple mocks for contract functions
function recordAssessment(assetId, conditionScore, description, maintenanceRequired, sender) {
  if (!mockClarity.contractStates.assetConditions) {
    mockClarity.contractStates.assetConditions = {};
  }
  
  if (conditionScore > 10) {
    return { success: false, error: 'Condition score must be <= 10' };
  }
  
  mockClarity.contractStates.assetConditions[assetId] = {
    conditionScore,
    assessmentDate: mockClarity.blockHeight,
    assessor: sender,
    description,
    maintenanceRequired
  };
  
  return { success: true };
}

function getCondition(assetId) {
  return mockClarity.contractStates.assetConditions?.[assetId];
}

function needsMaintenance(assetId) {
  const condition = mockClarity.contractStates.assetConditions?.[assetId];
  return condition ? condition.maintenanceRequired : false;
}

describe('Condition Assessment Contract', () => {
  beforeEach(() => {
    // Reset contract state
    mockClarity.contractStates = {};
  });
  
  it('should record a condition assessment', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const assetId = 1;
    
    const result = recordAssessment(
        assetId,
        7,
        'Bridge showing signs of wear on southern section',
        true,
        sender
    );
    
    expect(result.success).toBe(true);
    
    const condition = getCondition(assetId);
    expect(condition).toBeDefined();
    expect(condition.conditionScore).toBe(7);
    expect(condition.maintenanceRequired).toBe(true);
  });
  
  it('should reject condition scores above 10', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const assetId = 1;
    
    const result = recordAssessment(
        assetId,
        11,
        'Invalid score',
        true,
        sender
    );
    
    expect(result.success).toBe(false);
  });
  
  it('should correctly report maintenance needs', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    
    recordAssessment(1, 7, 'Needs repair', true, sender);
    recordAssessment(2, 9, 'Good condition', false, sender);
    
    expect(needsMaintenance(1)).toBe(true);
    expect(needsMaintenance(2)).toBe(false);
    expect(needsMaintenance(3)).toBe(false); // Non-existent asset
  });
});
