declare module 'speakeasy' {
  export interface GeneratedSecret {
    ascii: string;
    hex: string;
    base32: string;
    qr_code_ascii: string;
    qr_code_hex: string;
    qr_code_url: string;
    otpauth_url?: string;
  }

  export interface TotpVerifyOptions {
    secret: string;
    encoding?: 'ascii' | 'hex' | 'base32' | 'utf8';
    token: string;
    window?: number;
    time?: number;
  }

  export interface TotpGenerateOptions {
    secret: string;
    encoding?: 'ascii' | 'hex' | 'base32' | 'utf8';
    time?: number;
  }

  export interface GenerateSecretOptions {
    name?: string;
    issuer?: string;
    length?: number;
    symbols?: boolean;
  }

  export const generateSecret: (options?: GenerateSecretOptions) => GeneratedSecret;
  export const totp: {
    verify: (options: TotpVerifyOptions) => boolean;
    generate: (options: TotpGenerateOptions) => string;
  };
}
