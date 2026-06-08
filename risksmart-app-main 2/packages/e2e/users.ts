export interface User {
  username: string;
  role: string;
}

export const users = {
  standard: {
    username: 'user2@user.com',
    role: 'Standard',
    friendlyName: 'Standard1',
    Id: 'auth0|644152102c766a09dd585d2e',
  },
  riskManager: {
    username: 'user1@user.com',
    role: 'RiskManager',
    friendlyName: 'RiskManager1',
    Id: 'auth0|644151efc3a961d2784456d9',
  },
  standardEnhanced: {
    username: 'standardenhanced@user.com',
    role: 'Standard Enhanced',
    friendlyName: 'StandardEnhanced1',
    Id: '',
  },
  public: {
    username: 'public@user.com',
    role: 'Public',
    friendlyName: 'Public1',
    Id: '',
  },
  customerSupport: {
    username: 'customersupport@user.com',
    role: 'Customer Support',
    friendlyName: 'CustomerSupport1',
    Id: '',
  },
  readOnly: {
    username: 'readonly@user.com',
    role: 'Read Only',
    friendlyName: 'ReadOnly1',
    Id: '',
  },
};
