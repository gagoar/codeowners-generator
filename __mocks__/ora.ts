export const stopAndPersist = jest.fn();
export const fail = jest.fn();

const ora = {
  start: jest.fn(() => ({
    stopAndPersist,
    fail,
  })),
};
export default (): typeof ora => ora;
