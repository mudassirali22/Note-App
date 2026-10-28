import { useState } from "react";
import { AlertCircle, ArrowRight, FileText, LoaderCircle, Pin, Save } from "lucide-react";

const AddNote = ({ onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_PORT}/user/addnote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), category, isPinned }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Your note couldn't be saved.");

      onCreated?.(data.data);
      setTitle("");
      setDescription("");
      setCategory("Personal");
      setIsPinned(false);
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="note-editor-form" onSubmit={handleSubmit}>
      {error && <div className="note-editor-alert" role="alert"><AlertCircle size={16} />{error}</div>}
      <div className="note-editor-title"><span><FileText size={17} /></span><div><strong>A note to come back to</strong><small>Write it down. Get it out of your head.</small></div></div>

      <label htmlFor="note-title">Give it a title</label>
      <input id="note-title" type="text" placeholder="e.g. The idea I had on my walk" minLength={3} maxLength={50} required value={title} onChange={(event) => setTitle(event.target.value)} />
      <label htmlFor="note-category">Choose a category</label>
      <select id="note-category" className="note-category-select" value={category} onChange={(event) => setCategory(event.target.value)}>
        <option>Personal</option><option>Work</option><option>Ideas</option><option>Study</option>
      </select>
      <div className="note-editor-label-row"><label htmlFor="note-description">Your thoughts</label><span>{description.length}/500</span></div>
      <textarea id="note-description" placeholder="Start anywhere. It doesn't have to be perfect." minLength={10} maxLength={500} rows={8} required value={description} onChange={(event) => setDescription(event.target.value)} />
      <div className="note-editor-actions">
        <button className={`pin-toggle${isPinned ? " selected" : ""}`} type="button" onClick={() => setIsPinned((pinned) => !pinned)} aria-pressed={isPinned}><Pin size={14} />{isPinned ? "Pinned" : "Pin for later"}</button>
        <span>Only you can see this note.</span>
        <button type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />}{loading ? "Saving..." : "Save note"}{!loading && <ArrowRight size={15} />}</button>
      </div>
    </form>
  );
};

export default AddNote;
