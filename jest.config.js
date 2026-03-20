/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  moduleNameMapper: {
    "^config/(.*)$": "<rootDir>/src/config/$1",
    "^functions/(.*)$": "<rootDir>/src/functions/$1",
    "^roles/(.*)$": "<rootDir>/src/roles/$1",
    "^prototypes/(.*)$": "<rootDir>/src/prototypes/$1",
    "^utils/(.*)$": "<rootDir>/src/utils/$1",
    "^types/(.*)$": "<rootDir>/src/types/$1"
  },
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.json",
      diagnostics: false
    }
  }
};
