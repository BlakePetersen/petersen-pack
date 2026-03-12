// ABOUTME: Prompt injection sanitization for user-controlled text.
// ABOUTME: Strips known attack patterns before sending content to Claude.

export function sanitize(input: string): string {
  return (
    input
      // Strip XML tag injection attempts
      .replace(/<\/?(?:system|assistant|human|user|instructions?)>/gi, '')
      // Strip "ignore previous instructions" patterns
      .replace(/ignore\s+(all\s+)?previous\s+instructions?/gi, '[redacted]')
      // Strip line-start impersonation attempts
      .replace(/^(system|assistant)\s*:/gim, '[redacted]:')
      // Remove control characters (keep normal whitespace: \t \n \r \x20)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
  );
}
