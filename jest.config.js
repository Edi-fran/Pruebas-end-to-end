module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.(js|jsx|ts|tsx)'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@expo/vector-icons|react-native-safe-area-context|@react-native-async-storage/async-storage))'
  ],
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/hooks/**/*.ts',
    'src/components/**/*.tsx',
    'src/screens/**/*.tsx',
    '!src/**/__tests__/**'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};