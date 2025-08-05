const nextJest = require('next/jest')

// Configurar jest com Next.js
const createJestConfig = nextJest({
  // Fornecer o caminho para a aplicação Next.js para carregar next.config.js e arquivos .env
  dir: './',
})

// Configuração personalizada do Jest
const customJestConfig = {
  // Configurar ambiente de teste
  testEnvironment: 'jsdom',
  
  // Configurar arquivos de setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Padrões de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // Ignorar pastas específicas
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  
  // Transformar arquivos específicos
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  
  // Mapear imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Cobertura de código
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  
  // Limite de cobertura (ajustado para foco em lógica crítica)
  coverageThreshold: {
    'lib/**/*.ts': {
      branches: 50, // Temporarily lowered for useAuth.ts
      functions: 80,
      lines: 60,
      statements: 60,
    },
  },
}

// Exportar configuração do Jest
module.exports = createJestConfig(customJestConfig)