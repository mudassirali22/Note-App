import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Edit2, Trash2, LayoutGrid, PlusCircle, 
  Edit3, LogOut, Menu, X, User 
} from 'lucide-react';
import AddNote from "./AddNote";
import EditNoteModal from "./EditNoteModal"; 

const NotesDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // Sidebar toggle for mobile
  const [activeTab, setActiveTab] = useState('All Notes');
  const [selectedNote, setSelectedNote] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [stats, setStats] = useState({
    totalNotes: 0,
    pendingTasks: 0,
    storageUsed: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadDashboardData = async () => {
      try {
        // Fetch User Info
        const resUser = await fetch(`${import.meta.env.VITE_PORT}/user/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (resUser.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const userData = await resUser.json();
        if (resUser.ok) {
          setUser(userData.user);
          fetchNotes(token);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err.message);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const fetchNotes = async (token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/user/allnotes`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNotes(data.notes);
        // Update stats based on fetched notes
        setStats(prev => ({ ...prev, totalNotes: data.notes.length }));
      }
    } catch (error) {
      console.error("Notes Fetch Error:", error.message);
    }
  };

  // --- Note Actions ---
  const handleUpdate = async (id, updatedData) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/user/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchNotes(token); // Refresh the list
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    
    const token = localStorage.getItem("token");
    try {
      await fetch(`${import.meta.env.VITE_PORT}/user/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // --- Navigation Items ---
  const menuItems = [
    { name: 'All Notes', icon: <LayoutGrid size={20} /> },
    { name: 'Add Note', icon: <PlusCircle size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-hidden">
      
      {/* Mobile Menu Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out
        flex flex-col justify-between p-6 shadow-xl
      `}>
        <div>
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="h-9 w-9 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              N
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Smart Notes</h1>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                    setActiveTab(item.name);
                    setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.name 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors mt-auto"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{activeTab}</h2>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Dashboard / {activeTab}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user?.userName || "Loading..."}</p>
              <p className="text-xs text-indigo-500 font-semibold">{user?.email || "User Account"}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="p-6 lg:p-10 overflow-y-auto bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            
            {activeTab === 'All Notes' && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-slate-500 text-sm font-medium">Total Notes</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.totalNotes}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-slate-500 text-sm font-medium">Active Session</p>
                        <p className="text-3xl font-bold text-slate-800">Online</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-slate-500 text-sm font-medium">Account Status</p>
                        <p className="text-3xl font-bold text-indigo-600">Pro</p>
                    </div>
                </div>

                {/* Notes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes.length === 0 ? (
                    <p className="text-slate-500">No notes found. Start by adding one!</p>
                  ) : (
                    notes.map((note) => (
                      <div key={note._id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all border-t-4 border-t-indigo-500">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{note.title}</h3>
                          <div className="flex gap-2">
                            <button 
                                onClick={() => { setSelectedNote(note); setShowEditModal(true); }}
                                className="text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDelete(note._id)}
                                className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-500 text-sm line-clamp-3">{note.description}</p>
                        {note.image && (
                          <img src={note.image} alt="note" className="mt-3 rounded-lg w-full h-40 object-cover" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === "Add Note" && <AddNote />}
          </div>
        </main>
      </div>

      {/* Edit Modal Component */}
      {showEditModal && selectedNote && (
        <EditNoteModal
          note={selectedNote}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default NotesDashboard;