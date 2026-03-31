const PHONE_REGEX = /(\+?\d[\d\-\s().]{7,}\d)/g;
const EMAIL_REGEX = /([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  const tail = digits.slice(-4);
  return `***${tail}`;
}

export function maskEmail(email: string): string {
  return email.replace(EMAIL_REGEX, (_whole, first: string, domain: string) => `${first}***${domain}`);
}

export function maskPII(input: string): string {
  return input
    .replace(PHONE_REGEX, (value) => maskPhone(value))
    .replace(EMAIL_REGEX, (_whole, first: string, domain: string) => `${first}***${domain}`);
}
