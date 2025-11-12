"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "comment-box:v1";
const MAX_CHARS = 280;

function generateInitials(name) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "G") + (parts[1]?.[0] || "");
}

function relativeTimeFrom(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommentBox() {
  const [displayName, setDisplayName] = useState("");
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState({});
  const [liked, setLiked] = useState({});
  const textRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setComments(Array.isArray(saved.comments) ? saved.comments : []);
      setDisplayName(typeof saved.displayName === "string" ? saved.displayName : "Guest");
      setLikes(saved.likes || {});
      setLiked(saved.liked || {});
    } catch {}
  }, []);

  useEffect(() => {
    const payload = { comments, displayName, likes, liked };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [comments, displayName, likes, liked]);

  useEffect(() => {
    if (!textRef.current) return;
    textRef.current.style.height = "auto";
    textRef.current.style.height = Math.min(textRef.current.scrollHeight, 320) + "px";
  }, [text]);

  const remaining = MAX_CHARS - text.length;
  const canSubmit = text.trim().length > 0 && remaining >= 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    const now = new Date();
    const comment = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2)}`,
      name: displayName || "Guest",
      text: text.trim(),
      createdAt: now.toISOString(),
    };
    setComments([comment, ...comments]);
    setText("");
  }

  function toggleLike(id) {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    setLikes((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + (liked[id] ? -1 : 1)) }));
  }

  const initials = useMemo(() => generateInitials(displayName || "Guest"), [displayName]);

  return (
    <div>
      <div className="panel">
        <form onSubmit={handleSubmit} aria-label="Post a comment">
          <div className="row">
            <div className="avatar" aria-hidden>
              <span>{initials}</span>
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 40))}
                aria-label="Display name"
                style={{
                  width: "100%",
                  background: "transparent",
                  color: "var(--text)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: 10,
                }}
              />
              <textarea
                ref={textRef}
                className="textarea"
                placeholder="Share your thoughts..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={MAX_CHARS + 100}
                aria-label="Comment text"
              />
              <div className="actions">
                <div className={`counter ${remaining < 0 ? "over" : ""}`} aria-live="polite">
                  {remaining} characters left
                </div>
                <button className="button" type="submit" disabled={!canSubmit}>
                  Post
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="list" aria-live="polite">
        {comments.map((c) => (
          <article key={c.id} className="item">
            <div className="meta">
              <div className="avatar" aria-hidden>
                <span>{generateInitials(c.name)}</span>
              </div>
              <div className="name">{c.name}</div>
              <div>?</div>
              <time dateTime={c.createdAt}>{relativeTimeFrom(new Date(c.createdAt))}</time>
            </div>
            <div className="content">{c.text}</div>
            <div className="itemActions">
              <button
                type="button"
                className={`iconBtn ${liked[c.id] ? "active" : ""}`}
                onClick={() => toggleLike(c.id)}
                aria-pressed={!!liked[c.id]}
                aria-label={liked[c.id] ? "Unlike" : "Like"}
              >
                ?? {likes[c.id] || 0}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="footerNote">Comments are stored locally in your browser.</div>
    </div>
  );
}
