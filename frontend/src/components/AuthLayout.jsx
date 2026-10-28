import { ArrowUpRight, Check, NotebookPen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  "A calmer place for every thought",
  "Private notes, always yours",
  "Pick up where inspiration finds you",
];

const AuthLayout = ({ title, description, eyebrow = "A little more clarity", children, footer }) => (
  <div className="auth-page">
    <header className="auth-topbar">
      <Link className="brand-lockup" to="/" aria-label="NoteSpace home">
        <span className="brand-mark"><NotebookPen size={19} strokeWidth={2.2} /></span>
        <span>notespace<span className="brand-period">.</span></span>
      </Link>
      <span className="topbar-note"><span className="status-dot" /> Your space, your pace</span>
    </header>

    <main className="auth-layout">
      <section className="auth-story" aria-label="About NoteSpace">
        <div className="story-kicker"><Sparkles size={14} /> YOUR MIND, WITH ROOM TO BREATHE</div>
        <h1>Good ideas<br />deserve a <span>good place.</span></h1>
        <p className="story-copy">A thoughtful home for the notes, plans, and little sparks you don't want to lose.</p>

        <div className="story-note" aria-hidden="true">
          <div className="story-note-head"><span className="note-dot" /><span className="note-dot" /><span className="note-dot" /><span className="note-label">TODAY'S THOUGHTS</span></div>
          <p>Make space for<br /><em>what matters.</em></p>
          <div className="story-note-foot"><span>Keep the good stuff close</span><ArrowUpRight size={15} /></div>
        </div>

        <ul className="story-highlights">
          {highlights.map((highlight) => (
            <li key={highlight}><span><Check size={12} /></span>{highlight}</li>
          ))}
        </ul>
        <div className="story-orbit story-orbit-one" />
        <div className="story-orbit story-orbit-two" />
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-heading">
            <span className="auth-eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </section>
    </main>

    <footer className="auth-bottom">
      <span>© {new Date().getFullYear()} NoteSpace</span>
      <span>Made for the ideas that stay with you <span className="footer-spark">✳</span></span>
    </footer>
  </div>
);

export default AuthLayout;
