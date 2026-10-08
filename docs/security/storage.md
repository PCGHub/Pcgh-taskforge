# Evidence Storage

The task-evidence Supabase Storage bucket must be private.

Path: task-evidence/{application_user_id}/{assignment_id}/{submission_id}/{random-id}-{sanitized-file-name}

V1 maximum file size is 25 MB. Allowed types: JPEG, PNG, WebP, MP4, PDF, plain text.

Workers upload only evidence belonging to their own submission. Administrators receive short-lived signed URLs for review.

Never expose a public storage URL.

Future hardening includes malware scanning, content-hash duplicate detection, EXIF/privacy controls, and server-issued signed upload URLs.
