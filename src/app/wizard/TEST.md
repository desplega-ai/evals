# `/wizard` — verification plan

Multi-step registration form. Steps are dynamic: picking "Business" on step 1
inserts an extra "Business Info" step between Personal Info and Preferences.
Validation errors block the `btn-next` until corrected. Clicking `btn-back`
preserves previously-entered fields.

## States to verify

- **Step 1 validation** — on Account Type without selecting either option,
  click `btn-next`; expect the inline error "Please select an account type." to
  appear and the step to stay at 1.
- **Personal account happy path** — click `account-personal`, `btn-next`; fill
  `input-firstName`, `input-lastName`, `input-email` (valid email),
  `btn-next` → Preferences; pick `theme-dark`, toggle `notif-sms` on; `btn-next`
  → Address; fill `input-street`, `input-city`, `input-state`, `input-zip`
  (e.g. `10001`); `btn-next` → Review; verify the Review shows the entered
  name + email + dark theme; click `btn-submit`; success screen shows
  "Registration Complete!" and "Confirmation code: WIZARD-OK-42".
- **Business account inserts extra step** — reset (Start Over if on success
  screen, else refresh), click `account-business`, walk `btn-next` twice and
  confirm the Step Indicator now shows an extra "Business Info" step and
  `select-companySize` + `select-industry` render.
- **Personal Info email validation** — pick personal, advance to Personal Info,
  type `not-an-email` into `input-email`, click `btn-next`; expect inline error
  "Invalid email format." and step unchanged.
- **Back preserves fields** — on Personal Info with fields filled, click
  `btn-back` to Account Type, click `btn-next` again; verify
  `input-firstName`/`input-lastName`/`input-email` still contain the values
  typed before the back navigation.

## Out of scope

- Deep-linking to a specific step (the wizard always starts at step 1).
- Persistence across reload.
