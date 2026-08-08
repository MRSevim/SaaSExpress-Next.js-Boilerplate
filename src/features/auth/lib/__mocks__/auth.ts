export const auth = {
  api: {
    signInEmail: jest.fn(),
    signUpEmail: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    listUserAccounts: jest.fn(),
    deleteUser: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
  },
};
