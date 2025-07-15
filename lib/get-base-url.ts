export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // browser should use relative path
    return '';
  }
  // assume localhost for server-side rendering
  return 'http://localhost:3000';
}
