import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowDownWideNarrow,
  ArrowUpRight,
  BriefcaseBusiness,
  Download,
  FileText,
  Folder,
  GraduationCap,
  LayoutGrid,
  Lightbulb,
  LogOut,
  Menu,
  Pin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Trash2,
  X,
  PencilLine,
  RotateCcw,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddNote from "./AddNote";
import EditNoteModal from "./EditNoteModal";

const API_URL = import.meta.env.VITE_PORT;
const CATEGORIES = [
  { name: "Personal", icon: Folder },
  { name: "Work", icon: BriefcaseBusiness },
  { name: "Ideas", icon: Lightbulb },
  { name: "Study", icon: GraduationCap },
];

const getInitials = (name = "") =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "N";

const Dashboard = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("All notes");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const loadNotes = useCallback(async (accessToken) => {
    const response = await fetch(`${API_URL}/user/allnotes`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Your notes couldn't be loaded.");
    setNotes(data.notes || []);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_URL}/user/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }
        if (!response.ok) throw new Error(data.message || "Your workspace couldn't be loaded.");
        setUser(data.user);
        setCurrentTime(Date.now());
        await loadNotes(token);
      } catch (requestError) {
        setError(requestError.message || "Something went wrong while loading your workspace.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [loadNotes, navigate, token]);

  useEffect(() => {
    const handleShortcut = (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key.toLowerCase() === "n" && !isTyping) {
        event.preventDefault();
        setActiveTab("New note");
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const counts = useMemo(() => ({
    all: notes.filter((note) => !note.isDeleted && !note.isArchived).length,
    pinned: notes.filter((note) => !note.isDeleted && !note.isArchived && note.isPinned).length,
    archived: notes.filter((note) => !note.isDeleted && note.isArchived).length,
    trash: notes.filter((note) => note.isDeleted).length,
    categories: Object.fromEntries(CATEGORIES.map(({ name }) => [
      name,
      notes.filter((note) => !note.isDeleted && !note.isArchived && (note.category || "Personal") === name).length,
    ])),
  }), [notes]);

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = notes.filter((note) => {
      if (activeTab === "Pinned") return note.isPinned && !note.isDeleted && !note.isArchived;
      if (activeTab === "Archive") return note.isArchived && !note.isDeleted;
      if (activeTab === "Trash") return note.isDeleted;
      if (CATEGORIES.some(({ name }) => name === activeTab)) {
        return (note.category || "Personal") === activeTab && !note.isArchived && !note.isDeleted;
      }
      return !note.isArchived && !note.isDeleted;
    });

    if (query) {
      result = result.filter((note) =>
        `${note.title} ${note.description} ${note.category || ""}`.toLowerCase().includes(query)
      );
    }

    return result.sort((first, second) => {
      if (sort === "title") return first.title.localeCompare(second.title);
      if (sort === "oldest") return new Date(first.updatedAt) - new Date(second.updatedAt);
      if (activeTab === "All notes" || CATEGORIES.some(({ name }) => name === activeTab)) {
        if (first.isPinned !== second.isPinned) return first.isPinned ? -1 : 1;
      }
      return new Date(second.updatedAt) - new Date(first.updatedAt);
    });
  }, [activeTab, notes, search, sort]);

  const recentCount = useMemo(() => {
    const weekAgo = (currentTime ?? 0) - 7 * 24 * 60 * 60 * 1000;
    return notes.filter((note) => !note.isDeleted && !note.isArchived && new Date(note.createdAt).getTime() >= weekAgo).length;
  }, [currentTime, notes]);

  const updateNote = async (id, updates) => {
    const response = await fetch(`${API_URL}/user/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "This note couldn't be updated.");
    setNotes((current) => current.map((note) => note._id === id ? data.note : note));
    setSelectedNote(null);
    return data.note;
  };

  const handleQuickUpdate = async (id, updates) => {
    try {
      await updateNote(id, updates);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "This note couldn't be updated.");
    }
  };

  const handleDelete = async (note) => {
    if (activeTab === "Trash") {
      if (!window.confirm(`Permanently delete "${note.title}"? This can't be undone.`)) return;
      try {
        const response = await fetch(`${API_URL}/user/delete-permanently/${note._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "This note couldn't be deleted.");
        setNotes((current) => current.filter((item) => item._id !== note._id));
      } catch (requestError) {
        setError(requestError.message || "This note couldn't be deleted.");
      }
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user/delete/${note._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "This note couldn't be moved to trash.");
      setNotes((current) => current.map((item) => item._id === note._id
        ? { ...item, isDeleted: true, isArchived: false, isPinned: false }
        : item));
    } catch (requestError) {
      setError(requestError.message || "This note couldn't be moved to trash.");
    }
  };

  const handleRestore = async (note) => {
    try {
      const response = await fetch(`${API_URL}/user/restore/${note._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "This note couldn't be restored.");
      setNotes((current) => current.map((item) => item._id === note._id ? data.note : item));
    } catch (requestError) {
      setError(requestError.message || "This note couldn't be restored.");
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm("Permanently delete every item in Trash? This can't be undone.")) return;
    try {
      const response = await fetch(`${API_URL}/user/empty-trash`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Trash couldn't be emptied.");
      setNotes((current) => current.filter((note) => !note.isDeleted));
    } catch (requestError) {
      setError(requestError.message || "Trash couldn't be emptied.");
    }
  };

  const exportNotes = () => {
    try {
      const exportData = visibleNotes.map(({ title, description, category, isPinned, isArchived, isDeleted, createdAt, updatedAt }) => ({
        title,
        description,
        category: category || "Personal",
        isPinned: Boolean(isPinned),
        isArchived: Boolean(isArchived),
        isDeleted: Boolean(isDeleted),
        createdAt,
        updatedAt,
      }));
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `notespace-${activeTab.toLowerCase().replace(/\s+/g, "-")}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    } catch (exportError) {
      setError(exportError.message || "Your notes couldn't be exported.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/user/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (requestError) {
      console.error("Logout request failed:", requestError);
    } finally {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const viewItems = [
    { name: "All notes", icon: LayoutGrid, count: counts.all },
    { name: "Pinned", icon: Pin, count: counts.pinned },
    { name: "Archive", icon: Archive, count: counts.archived },
    { name: "Trash", icon: Trash2, count: counts.trash },
  ];
  const isNewNote = activeTab === "New note";
  const activeCount = activeTab === "All notes" ? counts.all
    : activeTab === "Pinned" ? counts.pinned
      : activeTab === "Archive" ? counts.archived
        : activeTab === "Trash" ? counts.trash
          : counts.categories[activeTab] ?? 0;
  const formattedDate = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="workspace">
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`workspace-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div>
          <button className="workspace-brand" onClick={() => switchTab("All notes")} aria-label="NoteSpace dashboard">
            <span className="brand-mark"><StickyNote size={19} /></span>
            <span>notespace<span className="brand-period">.</span></span>
          </button>

          <div className="sidebar-label">YOUR WORKSPACE</div>
          <nav className="workspace-nav" aria-label="Workspace">
            {viewItems.map(({ name, icon: Icon, count }) => (
              <button key={name} className={activeTab === name ? "active" : ""} onClick={() => switchTab(name)}>
                <Icon size={18} /><span>{name}</span><span className="nav-count">{count}</span>
              </button>
            ))}
            <button className={isNewNote ? "active" : ""} onClick={() => switchTab("New note")}>
              <Plus size={18} /><span>New note</span><kbd className="nav-shortcut">N</kbd>
            </button>
          </nav>

          <div className="sidebar-label category-label">CATEGORIES</div>
          <nav className="workspace-nav category-nav" aria-label="Note categories">
            {CATEGORIES.map(({ name, icon: Icon }) => (
              <button key={name} className={activeTab === name ? "active" : ""} onClick={() => switchTab(name)}>
                <Icon size={17} /><span>{name}</span><span className="nav-count">{counts.categories[name]}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-tip"><Sparkles size={16} /><p><strong>A thought worth keeping?</strong><span>Get it out of your head and onto a note.</span></p></div>
          <button className="sidebar-logout" onClick={handleLogout}><LogOut size={17} />Sign out</button>
          <div className="sidebar-identity">
            <span className="user-avatar">{getInitials(user?.userName)}</span>
            <span className="sidebar-user"><strong>{user?.userName || "Your account"}</strong><small>{user?.email || "Private workspace"}</small></span>
            <ShieldCheck size={16} className="verified-icon" aria-label="Verified account" />
          </div>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="topbar-title">
            <button className="mobile-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
            <div><span className="dashboard-date">{formattedDate}</span><h1>{isNewNote ? "A new thought" : activeTab}</h1></div>
          </div>
          <div className="topbar-actions">
            <label className="dashboard-search">
              <Search size={17} />
              <input ref={searchRef} aria-label="Search notes" placeholder="Search your notes..." value={search} onChange={(event) => setSearch(event.target.value)} />
              {search ? <button className="clear-search" type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={14} /></button> : <kbd>/</kbd>}
            </label>
            <button className="topbar-avatar" onClick={() => switchTab("All notes")} aria-label={`Signed in as ${user?.userName || "user"}`}>{getInitials(user?.userName)}</button>
          </div>
        </header>

        <main className="workspace-content">
          <div className="workspace-content-inner">
            {error && <div className="dashboard-alert" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss"><X size={16} /></button></div>}

            {isNewNote ? (
              <section className="new-note-page">
                <div className="new-note-heading"><span className="section-eyebrow">LET IT OUT OF YOUR HEAD</span><h2>Catch that thought.</h2><p>No need to make it perfect. Just get it down.</p></div>
                <div className="new-note-card">
                  <AddNote onCreated={(note) => {
                    if (note) setNotes((current) => [note, ...current]);
                    switchTab("All notes");
                  }} />
                </div>
              </section>
            ) : (
              <>
                {activeTab === "All notes" && (
                  <>
                    <section className="welcome-banner">
                      <div className="welcome-copy">
                        <span className="welcome-kicker"><Sparkles size={14} /> A CLEARER HEAD STARTS HERE</span>
                        <h2>Make room for<br />your next <em>big idea.</em></h2>
                        <p>Every note is a little more breathing room for your mind.</p>
                        <button className="banner-button" onClick={() => switchTab("New note")}>Write a note <ArrowUpRight size={16} /></button>
                      </div>
                      <div className="welcome-art" aria-hidden="true">
                        <div className="art-orbit art-orbit-outer" /><div className="art-orbit art-orbit-inner" />
                        <div className="art-paper"><span className="art-paper-icon"><StickyNote size={20} /></span><span className="paper-line paper-line-long" /><span className="paper-line" /><span className="paper-line paper-line-short" /><span className="paper-highlight" /></div>
                        <span className="art-star art-star-one">✳</span><span className="art-star art-star-two">✦</span>
                        <span className="art-caption">ideas in<br />good company</span>
                      </div>
                    </section>

                    <section className="stat-row" aria-label="Workspace overview">
                      <article className="stat-card"><span className="stat-icon stat-icon-lilac"><FileText size={18} /></span><div><span className="stat-label">All your notes</span><strong>{loading ? "—" : counts.all}</strong></div><small>in your space</small></article>
                      <article className="stat-card"><span className="stat-icon stat-icon-yellow"><Pin size={18} /></span><div><span className="stat-label">Pinned notes</span><strong>{loading ? "—" : counts.pinned}</strong></div><small>close at hand</small></article>
                      <article className="stat-card"><span className="stat-icon stat-icon-green"><ArrowDownWideNarrow size={18} /></span><div><span className="stat-label">New this week</span><strong>{loading ? "—" : recentCount}</strong></div><small>fresh thoughts</small></article>
                    </section>
                  </>
                )}

                <section className="notes-section">
                  <div className="notes-heading">
                    <div><span className="section-eyebrow">{activeTab === "Trash" ? "NOTES YOU'VE REMOVED" : activeTab === "Archive" ? "TUCKED AWAY FOR LATER" : activeTab === "Pinned" ? "YOUR MOST IMPORTANT THOUGHTS" : activeTab === "All notes" ? "YOUR PERSONAL COLLECTION" : `YOUR ${activeTab.toUpperCase()} COLLECTION`}</span><h2>{activeTab} <span>{activeCount}</span></h2></div>
                    <div className="notes-heading-actions">
                      {activeTab === "Trash" && counts.trash > 0 && <button className="text-button text-button-danger" onClick={handleEmptyTrash}><Trash2 size={15} /> Empty trash</button>}
                      {activeTab !== "Trash" && activeTab !== "Archive" && <button className="text-button" onClick={() => switchTab("New note")}><Plus size={16} /> New note</button>}
                    </div>
                  </div>

                  <div className="notes-toolbar">
                    <span>{search ? `${visibleNotes.length} matching ${visibleNotes.length === 1 ? "note" : "notes"}` : "Your thoughts, neatly gathered."}</span>
                    <div className="toolbar-controls">
                      {visibleNotes.length > 0 && <button className="export-button" onClick={exportNotes}><Download size={14} /> Export</button>}
                      <label className="sort-control"><ArrowDownWideNarrow size={14} /><select aria-label="Sort notes" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recent">Recently updated</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select></label>
                    </div>
                  </div>

                  {loading ? (
                    <div className="notes-loading" aria-label="Loading notes"><span /><span /><span /></div>
                  ) : visibleNotes.length ? (
                    <div className="notes-grid">
                      {visibleNotes.map((note, index) => (
                        <article className={`note-card note-card-${index % 4}${note.isPinned ? " is-pinned" : ""}`} key={note._id}>
                          <div className="note-card-top">
                            <span className={`category-badge category-${(note.category || "Personal").toLowerCase()}`}><StickyNote size={12} />{note.category || "Personal"}</span>
                            <div className="note-actions">
                              {activeTab === "Trash" ? (
                                <>
                                  <button onClick={() => handleRestore(note)} aria-label={`Restore ${note.title}`} title="Restore"><RotateCcw size={16} /></button>
                                  <button onClick={() => handleDelete(note)} aria-label={`Permanently delete ${note.title}`} title="Delete forever"><Trash2 size={16} /></button>
                                </>
                              ) : (
                                <>
                                  {activeTab !== "Archive" && <button className={note.isPinned ? "action-active" : ""} onClick={() => handleQuickUpdate(note._id, { isPinned: !note.isPinned })} aria-label={note.isPinned ? `Unpin ${note.title}` : `Pin ${note.title}`} title={note.isPinned ? "Unpin note" : "Pin note"}><Pin size={15} /></button>}
                                  <button onClick={() => handleQuickUpdate(note._id, activeTab === "Archive" ? { isArchived: false } : { isArchived: true, isPinned: false })} aria-label={activeTab === "Archive" ? `Unarchive ${note.title}` : `Archive ${note.title}`} title={activeTab === "Archive" ? "Restore from archive" : "Archive note"}>{activeTab === "Archive" ? <RotateCcw size={16} /> : <Archive size={16} />}</button>
                                  {activeTab !== "Archive" && <button onClick={() => setSelectedNote(note)} aria-label={`Edit ${note.title}`} title="Edit"><PencilLine size={16} /></button>}
                                  <button onClick={() => handleDelete(note)} aria-label={`Move ${note.title} to trash`} title="Move to trash"><Trash2 size={16} /></button>
                                </>
                              )}
                            </div>
                          </div>
                          <h3>{note.title}</h3>
                          <p>{note.description}</p>
                          <div className="note-card-footer"><span>{note.updatedAt ? `Updated ${new Date(note.updatedAt).toLocaleDateString()}` : "Just added"}</span><span>{note.description.trim().split(/\s+/).filter(Boolean).length} words</span></div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-notes">
                      <span className="empty-note-icon">{search ? <Search size={25} /> : activeTab === "Trash" ? <Trash2 size={25} /> : activeTab === "Archive" ? <Archive size={25} /> : activeTab === "Pinned" ? <Heart size={25} /> : <StickyNote size={25} />}</span>
                      <h3>{search ? "No notes found" : activeTab === "Trash" ? "Trash is empty" : activeTab === "Archive" ? "Nothing tucked away" : activeTab === "Pinned" ? "Pin a thought to keep it close" : "Your page is still blank"}</h3>
                      <p>{search ? "Try another search or check your spelling." : activeTab === "Trash" ? "Notes you remove will appear here. You can restore them or delete them forever." : activeTab === "Archive" ? "Archived notes stay safe here, out of your main collection." : activeTab === "Pinned" ? "Use the pin on any note to make it easy to find later." : `No ${activeTab.toLowerCase()} notes yet. Start with one small thought.`}</p>
                      {activeTab !== "Trash" && activeTab !== "Archive" && activeTab !== "Pinned" && <button className="text-button" onClick={() => switchTab("New note")}><Plus size={16} /> Write a note</button>}
                    </div>
                  )}
                  {activeTab === "Trash" && counts.trash > 0 && <p className="trash-retention">Items in Trash remain here until you permanently delete them.</p>}
                </section>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedNote && <EditNoteModal note={selectedNote} onClose={() => setSelectedNote(null)} onUpdate={updateNote} />}
    </div>
  );
};

export default Dashboard;
