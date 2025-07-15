export function generateAuthToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Validate a token (simple implementation for demo)
export function validateAuthToken(token: string): boolean {
  // In a real app, you would validate against a database or JWT
  // For this demo, we'll accept any non-empty string
  return !!token && token.length > 10;
}
