import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Plus, LogOut } from 'lucide-react'; // Removed Database icon import
import MachineCard from './components/MachineCard';
import AddMachineModal from './components/AddMachineModal';
import ServiceLogModal from './components/ServiceLogModal';
import ReportsTable from './components/ReportsTable';
import Login from './components/Login';

// 1. IMPORT YOUR LOGO HERE
import myLogo from './logo.png'; 

const App = () => {
  const [user, setUser] = useState(null);
  const [machines, setMachines] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [editingMachine, setEditingMachine] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "machines"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMachines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleSaveMachine = async (formData) => {
    try {
      if (editingMachine) {
        await updateDoc(doc(db, "machines", editingMachine.id), formData);
      } else {
        await addDoc(collection(db, "machines"), {
          ...formData,
          engineerName: user.displayName,
          engineerId: user.uid,
          createdAt: serverTimestamp()
        });
      }
      setEditingMachine(null);
    } catch (e) { console.error("Error: ", e); }
  };

  const handleDeleteMachine = async (id) => {
    if (window.confirm("Delete this machine and all its records?")) {
      await deleteDoc(doc(db, "machines", id));
    }
  };

  const handleAddLog = async (logData) => {
    try {
      if (!selectedMachine) return;

      const machineLogRef = collection(db, "machines", selectedMachine.id, "logs");
      await addDoc(machineLogRef, logData);

      const globalLogRef = collection(db, "logs");
      await addDoc(globalLogRef, {
        ...logData,
        machineId: selectedMachine.id,
        machineType: selectedMachine.machine_type || selectedMachine.machineType, 
        serialNumber: selectedMachine.serial_number || selectedMachine.serialNumber,
        machineModel: selectedMachine.model || selectedMachine.machineModel
      });
    } catch (e) { console.error("Error saving log: ", e); }
  };

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* LOGO CONTAINER */}
          <div className="bg-white-600 p-1.5 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center">
            {/* 2. NEW LOGO IMAGE TAG */}
            <img 
              src={myLogo} 
              alt="Medical Brain Logo" 
              className="w-20 h-20 object-contain" 
            />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Medical Brain</h1>
          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase">v3.0 Live</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[20px] font-black text-slate-900">{user.displayName}</span>
            <span className="text-[15px] font-bold text-slate-400 uppercase tracking-widest">Field Engineer</span>
          </div>
          <button onClick={() => signOut(auth)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Fleet Overview</h2>
            <p className="text-slate-500 font-medium">Manage and track your assigned medical units.</p>
          </div>
          <button 
            onClick={() => { setEditingMachine(null); setIsAddModalOpen(true); }}
            className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <Plus size={20} /> New Machine
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {machines.map(m => (
            <MachineCard 
              key={m.id} 
              machine={m} 
              onEditClick={(m) => { setEditingMachine(m); setIsAddModalOpen(true); }}
              onDeleteClick={handleDeleteMachine}
              onLogClick={(m) => { setSelectedMachine(m); setIsLogModalOpen(true); }}
            />
          ))}
        </div>

        <ReportsTable />
      </main>

      <AddMachineModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleSaveMachine}
        editingMachine={editingMachine}
      />

      <ServiceLogModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)}
        onSave={handleAddLog}
        machine={selectedMachine}
        currentUser={user}
      />
    </div>
  );
};

export default App;