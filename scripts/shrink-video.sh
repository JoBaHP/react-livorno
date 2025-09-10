#!/usr/bin/env bash

# Compress a video to be under a GitHub-safe size limit (default 97MB)
# Usage:
#   scripts/shrink-video.sh <input.mp4> [--max-mb 97] [--output <path>] [--amend]
#
# - Tries multiple CRF values and optional downscales until the output is <= max MB
# - Writes to a temp file alongside the input, then atomically replaces the input
# - With --amend, stages the file and amends the last commit (to drop the large blob)

set -u

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Error: ffmpeg is required but not found. Install with 'brew install ffmpeg' (macOS)." >&2
  exit 1
fi

print_usage() {
  echo "Usage: $0 <input.mp4> [--max-mb 97] [--output <path>] [--amend]" >&2
}

if [ $# -lt 1 ]; then
  print_usage
  exit 1
fi

INPUT="$1"; shift || true
MAX_MB=97
OUTPUT=""
AMEND=false
# Optional tweaks
SHOW_PROGRESS=false
PRESET="slow"  # default for better compression; can be overridden

while [ $# -gt 0 ]; do
  case "$1" in
    --max-mb)
      shift
      MAX_MB=${1:-97}
      ;;
    --output)
      shift
      OUTPUT=${1:-}
      ;;
    --amend)
      AMEND=true
      ;;
    --show-progress)
      SHOW_PROGRESS=true
      ;;
    --fast)
      PRESET="faster"
      ;;
    --preset)
      shift
      PRESET=${1:-slow}
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      print_usage
      exit 1
      ;;
  esac
  shift || true
done

if [ ! -f "$INPUT" ]; then
  echo "Error: Input file not found: $INPUT" >&2
  exit 1
fi

# Compute size helpers
bytes_of() {
  local f="$1"
  if stat -f%z "$f" >/dev/null 2>&1; then
    stat -f%z "$f"
  else
    stat -c%s "$f"
  fi
}

human_size() {
  local b="$1"
  # Print MB with 1 decimal
  awk -v b="$b" 'BEGIN { printf "%.1f MB", b/1024/1024 }'
}

TARGET_BYTES=$(( MAX_MB * 1024 * 1024 ))

IN_DIR="$(dirname "$INPUT")"
IN_BASE="$(basename "$INPUT")"
EXT="${IN_BASE##*.}"
NAME_NOEXT="${IN_BASE%.*}"

if [ -z "$OUTPUT" ]; then
  # By default, replace the original input path
  OUTPUT="$IN_DIR/$IN_BASE"
fi

TMP_OUT="$IN_DIR/$NAME_NOEXT.tmp.$EXT"

ORIG_BYTES=$(bytes_of "$INPUT")
echo "Original: $(human_size "$ORIG_BYTES") ($ORIG_BYTES bytes)"
echo "Target max: ${MAX_MB} MB ($TARGET_BYTES bytes)"

# Progressive attempts: start at original resolution CRF 30, then scale widths and/or increase CRF.
CRFS=(30 32 34 36)
SCALES=("" "scale=1920:-2" "scale=1280:-2" "scale=960:-2")

attempt_n=0
best_file=""
best_bytes=0
success=false

for crf in "${CRFS[@]}"; do
  for scale in "${SCALES[@]}"; do
    attempt_n=$((attempt_n+1))
    desc="crf=${crf}"
    vf_args=()
    if [ -n "$scale" ]; then
      desc+=" ${scale}"
      vf_args+=( -vf "$scale" )
    fi

    echo "Attempt #$attempt_n: $desc"

    # Run ffmpeg encode (avoid array expansion issues under set -u by branching)
    # Notes:
    # -movflags +faststart: web-friendly mp4
    # -preset: compression speed/ratio tradeoff (default: slow)
    # -pix_fmt yuv420p: broad compatibility
    # -c:a aac -b:a 128k: standard audio
    # Build base ffmpeg args (optionally show progress)
    if [ "$SHOW_PROGRESS" = true ]; then
      LOG_ARGS=( -hide_banner -stats -v info )
      REDIRECT_OUTPUT=false
    else
      LOG_ARGS=( -hide_banner -v error )
      REDIRECT_OUTPUT=true
    fi

    if [ -n "$scale" ]; then
      if [ "$REDIRECT_OUTPUT" = true ]; then
        ffmpeg "${LOG_ARGS[@]}" -y -i "$INPUT" \
          -vf "$scale" \
          -movflags +faststart \
          -c:v libx264 -preset "$PRESET" -crf "$crf" -pix_fmt yuv420p \
          -c:a aac -b:a 128k \
          "$TMP_OUT" >/dev/null 2>&1
      else
        ffmpeg "${LOG_ARGS[@]}" -y -i "$INPUT" \
          -vf "$scale" \
          -movflags +faststart \
          -c:v libx264 -preset "$PRESET" -crf "$crf" -pix_fmt yuv420p \
          -c:a aac -b:a 128k \
          "$TMP_OUT"
      fi
    else
      if [ "$REDIRECT_OUTPUT" = true ]; then
        ffmpeg "${LOG_ARGS[@]}" -y -i "$INPUT" \
          -movflags +faststart \
          -c:v libx264 -preset "$PRESET" -crf "$crf" -pix_fmt yuv420p \
          -c:a aac -b:a 128k \
          "$TMP_OUT" >/dev/null 2>&1
      else
        ffmpeg "${LOG_ARGS[@]}" -y -i "$INPUT" \
          -movflags +faststart \
          -c:v libx264 -preset "$PRESET" -crf "$crf" -pix_fmt yuv420p \
          -c:a aac -b:a 128k \
          "$TMP_OUT"
      fi
    fi

    if [ "$?" -ne 0 ]; then
      echo "  ffmpeg failed, skipping this attempt"
      rm -f "$TMP_OUT" 2>/dev/null || true
      continue
    fi

    out_bytes=$(bytes_of "$TMP_OUT")
    echo "  Result: $(human_size "$out_bytes") ($out_bytes bytes)"

    if [ "$out_bytes" -le "$TARGET_BYTES" ]; then
      echo "Success: within target size with $desc"
      mv -f "$TMP_OUT" "$OUTPUT"
      best_file="$OUTPUT"
      best_bytes="$out_bytes"
      success=true
      break 2
    else
      # Track best so far (keep the smallest artifact); move it to a stable path
      if [ "$best_bytes" -eq 0 ] || [ "$out_bytes" -lt "$best_bytes" ]; then
        stable_best="$IN_DIR/$NAME_NOEXT.best.$EXT"
        mv -f "$TMP_OUT" "$stable_best"
        # Remove previous best if it was a different file
        if [ -n "$best_file" ] && [ "$best_file" != "$stable_best" ]; then
          rm -f "$best_file" 2>/dev/null || true
        fi
        best_file="$stable_best"
        best_bytes="$out_bytes"
      else
        rm -f "$TMP_OUT" 2>/dev/null || true
      fi
    fi
  done
done

if [ -z "$best_file" ]; then
  echo "Error: No output produced." >&2
  exit 2
fi

if [ "$success" != true ]; then
  echo "Warning: Could not reach target size (${MAX_MB} MB). Using smallest produced file instead: $(human_size "$best_bytes")."
  mv -f "$best_file" "$OUTPUT"
fi

echo "Output written to: $OUTPUT ($(human_size "$(bytes_of "$OUTPUT")"))"

if [ "$AMEND" = true ]; then
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Amending last commit with updated file"
    git add "$INPUT"
    git commit --amend --no-edit
  else
    echo "Warning: Not a git repository; skipping --amend"
  fi
fi

echo "Done."
