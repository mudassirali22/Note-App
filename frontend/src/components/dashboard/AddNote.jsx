// import React, { useState } from 'react';
// import { Save, Image as ImageIcon, X, Loader2 } from 'lucide-react';

// const AddNote = ({ onSave }) => {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     image: null
//   });
//   const [preview, setPreview] = useState(null);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData({ ...formData, image: file });
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   const removeImage = () => {
//     setFormData({ ...formData, image: null });
//     setPreview(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // Simulate API Call
//     console.log("Submitting:", formData);
    
//     // In a real app, use FormData() for images
//     // const data = new FormData();
//     // data.append('title', formData.title);
//     // ...
    
//     setTimeout(() => {
//       setLoading(false);
//       alert("Note saved successfully!");
//     }, 1500);
//   };

//   return (
//     <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
//       {/* Header */}
//       <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
//         <h2 className="text-xl font-bold text-slate-800">Create New Note</h2>
//         <p className="text-sm text-slate-500">Capture your thoughts and attach visual references.</p>
//       </div>

//       <form onSubmit={handleSubmit} className="p-8 space-y-6">
//         {/* Title Input */}
//         <div>
//           <label className="block text-sm font-semibold text-slate-700 mb-2">Note Title</label>
//           <input
//             type="text"
//             required
//             value={formData.title}
//             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
//             placeholder="e.g., Weekly Marketing Strategy"
//           />
//         </div>

//         {/* Description Input */}
//         <div>
//           <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
//           <textarea
//             required
//             rows="5"
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 resize-none"
//             placeholder="Write your detailed notes here..."
//           />
//         </div>

//         {/* Image Upload Area */}
//         <div>
//           <label className="block text-sm font-semibold text-slate-700 mb-2">Attachment</label>
          
//           {!preview ? (
//             <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all">
//               <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                 <ImageIcon className="w-10 h-10 text-slate-400 mb-3" />
//                 <p className="text-sm text-slate-600 font-medium">Click to upload image</p>
//                 <p className="text-xs text-slate-400 mt-1">PNG, JPG or WEBP (MAX. 5MB)</p>
//               </div>
//               <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
//             </label>
//           ) : (
//             <div className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
//               <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
//               <button
//                 type="button"
//                 onClick={removeImage}
//                 className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Submit Button */}
//         <div className="pt-4">
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white transition-all shadow-lg ${
//               loading 
//                 ? 'bg-slate-400 cursor-not-allowed' 
//                 : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]'
//             }`}
//           >
//             {loading ? (
//               <Loader2 className="w-5 h-5 animate-spin" />
//             ) : (
//               <>
//                 <Save size={20} />
//                 Save Note
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddNote;









import React, { useState } from 'react';
import { Save, Image as ImageIcon, X, Loader2, FileText } from 'lucide-react';

const AddNote = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', image: null });
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setPreview(null);
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    console.log("Add Note :", formData);
 
    const token = localStorage.getItem("token");


    const response = await fetch(
      `${import.meta.env.VITE_PORT}/user/addnote`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,

        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      }
    );

    const data = await response.json();

    console.log("Server Response:", data);

    alert("Note added Successfully!");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header - Tightened */}
      <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
            <FileText size={18} />
        </div>
        <h2 className="text-md font-bold text-slate-800">New Note</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        
        {/* Title Field - Compact */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800"
            placeholder="e.g. Project Plan"
          />
        </div>

        {/* Description Field - Reduced Rows */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Description</label>
          <textarea
            required
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-slate-800"
            placeholder="Details..."
          />
        </div>

        {/* Attachment - Much Smaller Height */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Attachment</label>
          
          {!preview ? (
            <label className="group flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-400 transition-all">
              <div className="flex flex-col items-center justify-center py-2">
                <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                <p className="text-[10px] text-slate-600 font-semibold">Upload image</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 h-24">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 p-1.5 bg-white text-red-500 rounded-full shadow-md hover:text-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button - Compact py */}
        <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-[0.98]"
            >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                <Save size={18} />
                Save Note
                </>
            )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddNote;