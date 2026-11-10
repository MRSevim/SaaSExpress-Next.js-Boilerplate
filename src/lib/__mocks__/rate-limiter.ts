const ratelimiter = {
  limit: jest.fn(() => Promise.resolve({ success: true })),
};

export default ratelimiter;
