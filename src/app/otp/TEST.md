# `/otp` — verification plan

TOTP demo that generates a QR code + secret and accepts validation via either a single 6-digit text input or six single-digit fields. A `?seed=<string>` query-param makes the secret deterministic for automated tests — the existing home page links here as `/otp?seed=1337`. The currently-valid code can be revealed via a `<details>` disclosure. Selectors are the visible `id`/label combinations (e.g. `#otpInput`, `#otp-field-0`–`#otp-field-5`, "Copy", "Rotate Secret"). No `data-testid` attributes.

## States to verify

- **Seeded deterministic render** — navigate to `${BASE_URL}/otp?seed=1337`; a blue info banner at the top shows `Seed: 1337`; the "Secret Key" box displays a 32-character base32 string; a QR code image renders to the left of it.
- **Reveal current code (details expanded)** — click the `<summary>` "Show current valid code (for testing)"; the details expand, showing a 6-digit monospace code and a "Expires in: Ns" countdown with a circular progress arc.
- **Text-input validation — valid code** — reveal the current code, then in the "Text Input" tab type the 6 digits into `#otpInput`; a green `✓ OK` panel appears under the input.
- **Text-input validation — invalid code** — type `000000` into `#otpInput` (assuming that is not the current code); a red `✗ NO` panel appears.
- **Digit-fields tab auto-advances** — click the "Digit Fields" tab; six 1-char inputs appear; type a digit into `#otp-field-0`; focus moves to `#otp-field-1`. Paste the 6-digit current code into any field; all six fields populate and the green `✓ OK` panel appears.
- **Copy secret feedback** — click "Copy"; the button label flips to `✓ Copied` for ~2 seconds then reverts.
- **Rotate Secret regenerates** — click "Rotate Secret"; the secret value and QR image change; any previous validation result is cleared.

## Out of scope

- Verifying the QR code is a *correct* encoding of the otpauth URL (opaque binary — verification by scanning out of scope).
- 30-second TOTP window expiration timing.
