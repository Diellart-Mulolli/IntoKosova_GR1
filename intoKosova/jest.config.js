module.exports = {
  preset: "jest-expo",

  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  testMatch: ["**/__tests__/**/*.test.ts?(x)"],

  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|@testing-library))",
  ],

  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
};
