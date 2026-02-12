// Global test setup and type extensions
import '@testing-library/jest-dom'

// Extend Jest's expect matchers with testing-library matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toBeDisabled(): R
      toHaveClass(...classNames: string[]): R
      toBeEnabled(): R
      toHaveTextContent(text: string | RegExp): R
      toContainHTML(htmlText: string): R
      toHaveStyle(css: string | Record<string, unknown>): R
    }
  }
}

export {}