import { describe, it, expect, beforeEach } from 'vitest';

// Mock the Clarity environment
const mockClarity = {
  accounts: {
    'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM': { balance: 10000 },
    'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG': { balance: 10000 }
  },
  contractStates: {
    totalFunds: 0,
    allocatedFunds: {}
  },
  blockHeight: 123
};

// Simple mocks for contract functions
function contributeFunds(amount) {
  mockClarity.contractStates.totalFunds += amount;
  return { success: true };
}

function allocateFunds(assetId, amount, priority, usageLevel) {
  if (amount > mockClarity.contractStates.totalFunds) {
    return { success: false, error: 'Insufficient funds' };
  }
  
  if (priority > 5) {
    return { success: false, error: 'Priority must be <= 5' };
  }
  
  if (usageLevel > 10) {
    return { success: false, error: 'Usage level must be <= 10' };
  }
  
  mockClarity.contractStates.totalFunds -= amount;
  mockClarity.contractStates.allocatedFunds[assetId] = {
    amount,
    allocationDate: mockClarity.blockHeight,
    priority,
    usageLevel
  };
  
  return { success: true };
}

function getAllocation(assetId) {
  return mockClarity.contractStates.allocatedFunds[assetId];
}

function getTotalFunds() {
  return mockClarity.contractStates.totalFunds;
}

describe('Fund Allocation Contract', () => {
  beforeEach(() => {
    // Reset contract state
    mockClarity.contractStates.totalFunds = 0;
    mockClarity.contractStates.allocatedFunds = {};
  });
  
  it('should contribute funds', () => {
    const result = contributeFunds(1000);
    expect(result.success).toBe(true);
    expect(getTotalFunds()).toBe(1000);
    
    contributeFunds(500);
    expect(getTotalFunds()).toBe(1500);
  });
  
  it('should allocate funds to assets', () => {
    contributeFunds(1000);
    
    const result = allocateFunds(1, 500, 2, 8);
    
    expect(result.success).toBe(true);
    expect(getTotalFunds()).toBe(500);
    
    const allocation = getAllocation(1);
    expect(allocation).toBeDefined();
    expect(allocation.amount).toBe(500);
    expect(allocation.priority).toBe(2);
    expect(allocation.usageLevel).toBe(8);
  });
  
  it('should reject allocations that exceed available funds', () => {
    contributeFunds(1000);
    
    const result = allocateFunds(1, 1500, 2, 8);
    
    expect(result.success).toBe(false);
    expect(getTotalFunds()).toBe(1000); // Funds should remain unchanged
  });
  
  it('should reject invalid priority or usage levels', () => {
    contributeFunds(1000);
    
    let result = allocateFunds(1, 500, 6, 8);
    expect(result.success).toBe(false);
    
    result = allocateFunds(1, 500, 2, 11);
    expect(result.success).toBe(false);
    
    expect(getTotalFunds()).toBe(1000); // Funds should remain unchanged
  });
});
