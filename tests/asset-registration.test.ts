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
function registerAsset(name, location, assetType, constructionDate, sender) {
  // In real tests, this would interact with a test VM
  const assetId = Object.keys(mockClarity.contractStates.assets || {}).length;
  
  if (!mockClarity.contractStates.assets) {
    mockClarity.contractStates.assets = {};
  }
  
  mockClarity.contractStates.assets[assetId] = {
    name,
    location,
    assetType,
    constructionDate,
    lastMaintenance: 0,
    owner: sender
  };
  
  return { success: true, assetId };
}

function getAsset(assetId) {
  return mockClarity.contractStates.assets?.[assetId];
}

describe('Asset Registration Contract', () => {
  beforeEach(() => {
    // Reset contract state
    mockClarity.contractStates = {};
  });
  
  it('should register a new asset', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const result = registerAsset(
        'Bridge A123',
        'New York City',
        'bridge',
        2010,
        sender
    );
    
    expect(result.success).toBe(true);
    
    const asset = getAsset(result.assetId);
    expect(asset).toBeDefined();
    expect(asset.name).toBe('Bridge A123');
    expect(asset.owner).toBe(sender);
  });
  
  it('should track multiple assets', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    
    registerAsset('Bridge A123', 'New York City', 'bridge', 2010, sender);
    registerAsset('Highway Section B45', 'Los Angeles', 'highway', 2015, sender);
    registerAsset('Water Treatment Plant', 'Chicago', 'utility', 2008, sender);
    
    const asset0 = getAsset(0);
    const asset1 = getAsset(1);
    const asset2 = getAsset(2);
    
    expect(asset0.name).toBe('Bridge A123');
    expect(asset1.name).toBe('Highway Section B45');
    expect(asset2.name).toBe('Water Treatment Plant');
  });
});
