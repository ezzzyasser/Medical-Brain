import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { X, ClipboardList, Send, User, Clock, BrainCircuit, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const ServiceLogModal = ({ isOpen, onClose, onSave, machine, currentUser }) => {
  const [description, setDescription] = useState('');
  const [logs, setLogs] = useState([]);
  const [view, setView] = useState('add');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    if (!machine || !isOpen) return;
    const q = query(collection(db, "machines", machine.id, "logs"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [machine, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    const baseLogData = {
      description,
      engineerName: currentUser.displayName,
      engineerId: currentUser.uid,
      date: new Date().toLocaleString(),
      timestamp: new Date()
    };

    try {
      const response = await fetch('http://localhost:8000/process-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_text: description,
          engineer_name: currentUser.displayName
        })
      });
      const result = await response.json();

      // Ensure your handleSubmit passes the full log object:
      const logData = {
        description,
        ai_extracted: result.status === 'success' ? result.extracted_data : null,
        engineerName: currentUser.displayName,
        engineerId: currentUser.uid,
        date: new Date().toLocaleString(),
        timestamp: new Date()
      };


      await onSave(logData);
      setDescription('');
      setIsAnalyzing(false);
      setView('history');
    } catch (error) {
      console.error("Backend Error:", error);
      await onSave({ ...baseLogData, ai_extracted: null });
      setDescription('');
      setIsAnalyzing(false);
      setView('history');
    }
  };

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Service Control</h2>
              <p className="text-xs text-slate-500 font-black uppercase tracking-widest">{machine.machine_type} • {machine.serial_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
        </div>

        <div className="flex px-8 pt-4 gap-6 border-b border-slate-100">
          <button onClick={() => setView('add')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${view === 'add' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'}`}>Add New Log</button>
          <button onClick={() => setView('history')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${view === 'history' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'}`}>History ({logs.length})</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          {view === 'add' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest text-center">Describe Technical Findings</label>
                <textarea 
                  required disabled={isAnalyzing} rows="6"
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-slate-700 font-medium text-lg shadow-inner disabled:opacity-50"
                  placeholder="Paste the technical report here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center gap-4">
                    <Loader2 size={40} className="text-blue-600 animate-spin" />
                    <p className="font-black text-blue-600 text-sm animate-pulse uppercase tracking-widest">Medical Brain Analyzing...</p>
                  </div>
                )}
              </div>
              <button type="submit" disabled={isAnalyzing} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:bg-slate-300">
                {isAnalyzing ? "Processing..." : <><Send size={20} /> Analyze & Save</>}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const ai = log.ai_extracted;
                return (
                  <div key={log.id} className="group">
                    <button 
                      onClick={() => toggleExpand(log.id)}
                      className={`w-full text-left bg-white border ${isExpanded ? 'border-blue-500 ring-2 ring-blue-500/5' : 'border-slate-100'} p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all relative overflow-hidden`}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isExpanded ? 'bg-blue-600' : 'bg-slate-200'}`} />
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{log.engineerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock size={12} />
                          <span className="text-[9px] font-bold">{log.date}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-full border border-blue-100 uppercase">Error: {ai?.error_code || 'None'}</span>
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full border border-green-100 uppercase">Model: {ai?.model || 'N/A'}</span>
                      </div>
                      <p className={`text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl italic text-sm ${!isExpanded && 'line-clamp-2'}`}>
                        "{log.description}"
                      </p>
                      {isExpanded && ai && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-2 mb-4 text-blue-600">
                            <BrainCircuit size={16} />
                            <h4 className="font-black text-xs uppercase tracking-widest">Medical Brain Analysis</h4>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Problem Description</p>
                              <p className="text-sm text-slate-700 font-bold">{ai.problem_description}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Troubleshooting Steps</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {Array.isArray(ai.troubleshooting_steps) ? ai.troubleshooting_steps.map((step, i) => (
                                  <span key={i} className="text-[10px] bg-white text-slate-600 px-3 py-1 rounded-lg border border-slate-200 shadow-sm">• {step}</span>
                                )) : <p className="text-sm text-slate-600">{ai.troubleshooting_steps}</p>}
                              </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                              <p className="text-[9px] font-black text-green-600 uppercase mb-1">Final Result</p>
                              <p className="text-sm text-green-800 font-black">{ai.final_solution}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceLogModal;