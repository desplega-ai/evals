# `/files` — verification plan

Two side-by-side panels: left is a hidden `<input type="file" multiple>` behind a dashed "Click to upload files" button; right offers a "Download Sample PDF" button plus a per-file download list that appears once uploads exist. The upload input is `aria-label="File upload"`; other controls are identified by visible text ("Click to upload files", "Remove", "Download Sample PDF"). No `data-testid` attributes.

## States to verify

- **Empty initial state** — page renders both panels: left shows the dashed "Click to upload files / Multiple files allowed" dropzone and no uploaded-files list; right shows only the blue "Download Sample PDF" button (no "Your Uploaded Files" section).
- **Single file upload populates both panels** — upload any file via the dropzone (agent should drive the file input, e.g. attach a small text/image file); verify the left panel shows "Uploaded Files (1)" with a row containing the file name, its size (e.g. `2.5 KB`), and a red "Remove" button; the right panel gains a "Your Uploaded Files" subsection containing a clickable row for the same file.
- **Multiple file upload increments the count** — upload a second file; the "Uploaded Files (1)" header becomes "Uploaded Files (2)" and a second row appears in both panels.
- **Remove drops the file from both panels** — click "Remove" on one row in the left panel; that row disappears from both panels and the count decrements.
- **Download sample PDF triggers a download** — click "Download Sample PDF"; the browser initiates a download of `sample-pdf.pdf` (verify via the browser download UI or the presence of the file in the download sink — do not assert on file contents).

## Out of scope

- Drag-and-drop onto the dropzone (not implemented — the button opens the native file chooser).
- Uploading very large files or validating MIME types.
