
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Phone, Mail, Globe, X } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Supplier } from '../types';

const SupplierList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '', phone: '', email: '', notes: ''
  });

  const load = () => setSuppliers(dbService.getSuppliers());
  useEffect(() => { load(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSupplier: Supplier = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      phone: formData.phone!,
      email: formData.email!,
      notes: formData.notes!,
      createdAt: Date.now(),
    };
    dbService.saveSupplier(newSupplier);
    setShowForm(false);
    setFormData({ name: '', phone: '', email: '', notes: '' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Suppliers</h2>
          <p className="text-slate-500">Manage your ticketing agents and airline suppliers.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg"
        >
          <Truck size={20} />
          Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg">
                {s.name.charAt(0)}
              </div>
              <Globe size={18} className="text-slate-300" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{s.name}</h3>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">SUP-#{s.id.substr(0,4)}</p>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400" />
                {s.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail size={14} className="text-slate-400" />
                {s.email}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-orange-50/50">
              <h3 className="text-xl font-bold text-slate-800">New Supplier</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
                <input required className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-400" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Support Phone</label>
                <input required className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-400" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Billing Email</label>
                <input required type="email" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-400" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 mt-4 transition-all hover:scale-[1.02]">
                Create Supplier Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierList;
