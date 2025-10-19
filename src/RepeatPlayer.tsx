// src/RepeatPlayer.tsx
import React, { useEffect, useRef, useState } from "react";

export default function RepeatPlayer() {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [count, setCount] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const remainingRef = useRef<number>(0); // plays left after current

  // Create/revoke object URL when file changes
  useEffect(() => {
    setError(null);
    if (!file) {
      if (src) URL.revokeObjectURL(src);
      setSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Handle exact-N repeats
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onEnded = async () => {
      if (remainingRef.current > 0) {
        remainingRef.current -= 1;
        try {
          el.currentTime = 0;
          await el.play();
        } catch {
          /* ignore */
        }
      } else {
        setIsPlaying(false);
      }
    };

    el.addEventListener("ended", onEnded);
    return () => el.removeEventListener("ended", onEnded);
  }, [src]);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const start = async () => {
    const el = videoRef.current;
    if (!el || !src || !file) return;

    // Check browser support for this mime (don’t assume exactly 'video/mp4')
    const mime = file.type || "video/mp4";
    if (!el.canPlayType(mime)) {
      setError(`Browser can't play this type (${mime}). Try H.264/AAC MP4.`);
      return;
    }

    const n = Math.max(1, Math.floor(count));
    remainingRef.current = n - 1;

    try {
      el.currentTime = 0;
      await el.play();
      setIsPlaying(true);
    } catch (e) {
      setError(`Play failed (user gesture/autoplay?): ${String(e)}`);
    }
  };

  const stop = () => {
    const el = videoRef.current;
    if (!el) return;
    remainingRef.current = 0;
    el.pause();
    setIsPlaying(false);
  };

  return (
    <div
      style={{
        fontFamily: "system-ui",
        padding: 16,
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
        Play MP4 N Times
      </h2>

      <input
        type="file"
        accept="video/mp4,video/*,audio/mp4,audio/*"
        onChange={onFileChange}
        style={{ marginBottom: 12 }}
      />

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <label>
          Times:&nbsp;
          <input
            type="number"
            min={1}
            step={1}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ width: 100, padding: 6 }}
          />
        </label>

        <button
          onClick={start}
          disabled={!src || isPlaying}
          style={{ padding: "8px 12px" }}
        >
          ▶️ Play N times
        </button>
        <button
          onClick={stop}
          disabled={!isPlaying}
          style={{ padding: "8px 12px" }}
        >
          ⏹ Stop
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginBottom: 8 }}>{error}</p>}

      {src ? (
        <video
          ref={videoRef}
          src={src}
          controls
          style={{ width: "100%", borderRadius: 12, background: "#000" }}
          loop={false}
        >
          <source src={src} type={file?.type || "video/mp4"} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p style={{ color: "#555" }}>Select an MP4 to begin.</p>
      )}

      {file && (
        <p style={{ marginTop: 8, color: "#666" }}>
          Selected: <strong>{file.name}</strong> ({file.type || "unknown"})
        </p>
      )}
    </div>
  );
}
