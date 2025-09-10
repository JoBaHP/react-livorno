Place your hero video here as `pizza.mp4`.

Recommended:
- Duration: 10–20s loop
- Codec: H.264 (mp4), 1080p or 720p
- No audio or keep it muted

Path used by the app: /media/pizza.mp4

If the file exceeds GitHub's 100 MB limit, use the helper script to shrink and amend the last commit:

  cd static-website && npm run shrink:video

This tries multiple CRF/scale settings using ffmpeg until the file drops below ~97 MB and amends the most recent commit.
