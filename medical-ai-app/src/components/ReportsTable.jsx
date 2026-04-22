import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, collectionGroup } from 'firebase/firestore';
import { Search, Activity, Cpu, Hash, User, Clock, DatabaseZap } from 'lucide-react';

const ReportsTable = () => {
  const [allLogs, setAllLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('serialNumber');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // Using collectionGroup("logs") ensures that even if you saved logs 
    // INSIDE a machine document, they will still show up here.
    const q = query(collectionGroup(db, "logs"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setAllLogs(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = allLogs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();
    
    const getVal = (fields) => {
      return fields.map(f => (log[f] || '').toString().toLowerCase()).join(' ');
    };

    switch (searchCategory) {
      case 'serialNumber':
        return getVal(['serialNumber', 'serial_number', 'sn']).includes(term);
      case 'model':
        return getVal(['machineModel', 'model']).includes(term);
      case 'type':
        return getVal(['machineType', 'machine_type']).includes(term);
      case 'engineer':
        return getVal(['engineerName', 'engineer_name']).includes(term);
      default:
        return true;
    }
  });

  return (
    <div className="max-w-4xl mx-auto mb-20 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={`Searching ${allLogs.length} total records...`}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-sm outline-none cursor-pointer hover:bg-blue-600 transition-colors"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          >
            <option value="serialNumber">Serial Number</option>
            <option value="model">Machine Model</option>
            <option value="type">Machine Type</option>
            <option value="engineer">Engineer Name</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10 animate-pulse text-slate-400 font-black">CONNECTING TO DATABASE...</div>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm border-l-4 border-l-blue-500">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-black text-slate-800">{log.machineType || log.machine_type || "Unit"}</h4>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">
                      {log.machineModel || log.model || 'M3'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-400 uppercase">
                    <span className="flex items-center gap-1"><Hash size={12}/> {log.serialNumber || log.serial_number || 'N/A'}</span>
                    <span className="flex items-center gap-1"><User size={12}/> {log.engineerName}</span>
                    <span className="flex items-center gap-1 col-span-2"><Clock size={12}/> {log.date}</span>
                  </div>
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-2xl italic text-sm text-slate-600">
                  "{log.description}"
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <DatabaseZap size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest">
              {searchTerm ? "No match found" : "No logs found in database"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsTable;