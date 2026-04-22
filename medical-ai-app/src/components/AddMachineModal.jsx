import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

const AddMachineModal = ({ isOpen, onClose, onSave, editingMachine }) => {
  const [formData, setFormData] = useState({
    machine_type: '',
    model: '',
    serial_number: '',
    image: null
  });

  useEffect(() => {
    if (editingMachine) {
      setFormData(editingMachine);
    } else {
      setFormData({ machine_type: '', model: '', serial_number: '', image: null });
    }
  }, [editingMachine, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {editingMachine ? 'Edit Machine' : 'Add New Machine'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative min-h-[120px]">
            {formData.image ? (
              <img src={formData.image} alt="Preview" className="h-20 w-20 object-cover rounded-lg mb-2" />
            ) : (
              <Upload className="text-slate-400 mb-2" size={32} />
            )}
            <span className="text-xs text-slate-500 font-bold uppercase">
              {formData.image ? 'Change Photo' : 'Upload Machine Photo'}
            </span>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="image/*" 
              onChange={handleImageChange}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Machine Name</label>
            <input 
              required
              value={formData.machine_type}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, machine_type: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Model</label>
            <input 
              required
              value={formData.model}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, model: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Serial Number</label>
            <input 
              required
              value={formData.serial_number}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
            />
          </div>
          
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-2">
            {editingMachine ? 'Update Records' : 'Save to Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMachineModal;