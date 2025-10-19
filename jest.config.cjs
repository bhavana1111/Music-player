/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom", // use 'node' if you don't need the DOM
  transform: { "^.+\\.(ts|tsx)$": "ts-jest" },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/**/*.(test|spec).(ts|tsx|js)"],
  roots: ["<rootDir>/src", "<rootDir>"],
};
