# Review Redirector

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Main public page: displays a large "Copy Review" button
- On button click: randomly selects one of ~15 positive service review comments, copies it to the clipboard, then redirects the user to the stored Google Maps link
- Admin page: protected by a simple password, allows the admin to view and update the Google Maps redirect URL
- Backend stores the Google Maps URL and exposes endpoints to get/set it
- Backend stores a list of review comments (seeded with defaults)

### Modify
- None

### Remove
- None

## Implementation Plan
1. Backend (Motoko):
   - Store the Google Maps URL (default: placeholder)
   - getGoogleMapsUrl() -> Text
   - setGoogleMapsUrl(url: Text) -> () (admin only, password protected via simple shared secret or admin role)
   - getReviews() -> [Text] (returns list of review strings)

2. Frontend - Main page:
   - Fetches the Google Maps URL from backend
   - Shows a prominent "Copy Review" button
   - On click: picks a random review, copies to clipboard, redirects to Google Maps URL
   - Shows a brief confirmation message before redirect

3. Frontend - Admin page (/admin):
   - Simple password login form
   - After login: shows current Google Maps URL with an input to update it
   - Save button calls setGoogleMapsUrl on the backend
