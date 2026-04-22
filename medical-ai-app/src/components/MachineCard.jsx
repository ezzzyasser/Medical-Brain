import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Cpu, User, Edit3, Trash2, BookOpen, Calendar } from 'lucide-react';

const MachineCard = ({ machine, onEditClick, onDeleteClick, onLogClick }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="perspective-1000 w-full h-[400px] cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
          <div className="h-3/5 bg-slate-100 flex items-center justify-center relative overflow-hidden">
             {machine.image ? (
               <img src={machine.image} alt="machine" className="w-full h-full object-cover" />
             ) : (
               <Settings size={80} className="text-slate-200 animate-spin-slow" />
             )}
             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-blue-600 border border-blue-100">
               Active Status
             </div>
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-2">{machine.machine_type}</h3>
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={14} />
              <p className="text-xs font-bold uppercase tracking-widest">{machine.model}</p>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 text-white flex flex-col justify-between"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-5 mb-6">
              <h3 className="text-xl font-black text-blue-400 tracking-tighter italic uppercase">Technical File</h3>
              <div className="flex gap-3">
                <button onClick={(e) => { e.stopPropagation(); onEditClick(machine); }} className="p-3 bg-slate-800 hover:bg-blue-600 rounded-2xl transition-all"><Edit3 size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteClick(machine.id); }} className="p-3 bg-slate-800 hover:bg-red-600 rounded-2xl transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg"><Cpu size={20} className="text-blue-400" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Serial Index</p>
                  <span className="text-sm font-mono font-bold text-slate-200">{machine.serial_number}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg"><User size={20} className="text-blue-400" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Responsible Engineer</p>
                  <span className="text-xs font-bold text-slate-400">{machine.engineerName}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onLogClick(machine); }}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-[1.5rem] transition-all font-black text-sm text-white shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 active:scale-95"
          >
            <BookOpen size={20} />
            Service History Log
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MachineCard;