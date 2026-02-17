import { authenticator } from "otplib";

export const TOTP_DIGITS = 6;
export const TOTP_STEP_SECONDS = 30;
export const TOTP_WINDOW_PROD = 2;
export const TOTP_WINDOW_DEV = 10;

function getTotpWindow(): number {
    return process.env.NODE_ENV === "production" ? TOTP_WINDOW_PROD : TOTP_WINDOW_DEV;
}

function getAuthenticator() {
    authenticator.options = {
        digits: TOTP_DIGITS,
        step: TOTP_STEP_SECONDS,
        window: getTotpWindow(),
    };

    return authenticator;
}

export function normalizeTotpCode(code: string): string | null {
    const digitsOnly = code.replace(/\D/g, "");
    return digitsOnly.length === TOTP_DIGITS ? digitsOnly : null;
}

export function generateTotpSecret(): string {
    return getAuthenticator().generateSecret();
}

export function buildTotpOtpAuthUrl(secret: string, accountEmail: string, issuer = "SecYourFlow"): string {
    return getAuthenticator().keyuri(accountEmail, issuer, secret);
}

export function generateTotpToken(secret: string): string {
    const currentOptions = authenticator.options;
    authenticator.options = {
        ...currentOptions,
        digits: TOTP_DIGITS,
        step: TOTP_STEP_SECONDS,
        window: getTotpWindow(), // Symmetric window for compatibility
    };

    const token = authenticator.generate(secret);

    authenticator.options = currentOptions;
    return token;
}

export function verifyTotpToken(
    secret: string,
    code: string,
    lastUsedStep: number | null,
    epochMs = Date.now(),
):
    | { valid: true; matchedStep: number }
    | { valid: false; reason: "invalid_code" }
    | { valid: false; reason: "replay"; matchedStep: number } {
    const normalized = normalizeTotpCode(code);
    if (!normalized) {
        return { valid: false, reason: "invalid_code" };
    }

    const currentOptions = authenticator.options;
    authenticator.options = {
        ...currentOptions,
        digits: TOTP_DIGITS,
        step: TOTP_STEP_SECONDS,
        window: getTotpWindow(), // Symmetric window
    };

    const delta = authenticator.checkDelta(normalized, secret);

    authenticator.options = currentOptions;

    if (delta === null) {
        return { valid: false, reason: "invalid_code" };
    }

    const currentStep = Math.floor(epochMs / (TOTP_STEP_SECONDS * 1000));
    const matchedStep = currentStep + delta;

    if (lastUsedStep !== null && matchedStep <= lastUsedStep) {
        return { valid: false, reason: "replay", matchedStep };
    }

    return { valid: true, matchedStep };
}
