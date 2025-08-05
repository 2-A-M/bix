// Jest setup para configurações globais de teste
import '@testing-library/jest-dom'

// Mock do localStorage para testes
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

global.localStorage = localStorageMock

// Mock do fetch para testes
global.fetch = jest.fn()

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock do styled-components para testes
jest.mock('styled-components', () => ({
  ...jest.requireActual('styled-components'),
  ServerStyleSheet: jest.fn(() => ({
    collectStyles: jest.fn(),
    getStyleTags: jest.fn(),
  })),
}))

// Configurar timezone para testes consistentes
process.env.TZ = 'UTC'

// Setup global antes de cada teste
beforeEach(() => {
  // Limpar todos os mocks
  jest.clearAllMocks()
  
  // Resetar localStorage mock
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  
  // Resetar fetch mock
  global.fetch.mockClear()
})

// Configurar console para testes mais limpos
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})