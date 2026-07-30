export interface ValidateResult {
  valid: boolean;
  formatted: string | null;
  reason?: string;
}

export interface DecodeResult {
  formatted: string;
  bankCode: string;
  stateCode: string;
  branchCode: string;
}

export interface LookupOptions {
  fetch?: typeof fetch;
  signal?: AbortSignal;
}

export const API_BASE: string;

export function formatBSB(input: string | number): string | null;
export function validateBSB(input: string | number): ValidateResult;
export function decodeBSB(input: string | number): DecodeResult | null;
export function lookupBSB(input: string | number, options?: LookupOptions): Promise<Record<string, unknown>>;
