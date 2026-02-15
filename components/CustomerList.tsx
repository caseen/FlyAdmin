
import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Phone, Mail, FileText, X } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Customer } from '../types';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '', phone: '', email: '', notes: ''
  });

  const load = () => setCustomers(dbService.getCustomers());
  useEffect(() => { load(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      phone: formData.phone!,
      email: formData.email!,
      notes: formData.notes!,
      createdAt: Date.now(),
    };
    dbService.saveCustomer(newCustomer);
    setShowForm(false);
    setFormData({ name: '', phone: '', email: '', notes: '' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
          <p className="text-slate-500">Manage your client contact information.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
        >
          <UserPlus size={20} />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                {c.name.charAt(0)}
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <FileText size={18} />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{c.name}</h3>
              <p className="text-xs text-slate-400 font-medium">ID: {c.id.toUpperCase()}</p>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400" />
                {c.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail size={14} className="text-slate-400" />
                {c.email}
              </div>
            </div>
            {c.notes && (
              <p className="text-xs text-slate-400 italic pt-2 border-t border-slate-50">{c.notes}</p>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">New Customer</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input required className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                <input required className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input required type="email" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label>
                <textarea className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400" 
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 mt-4">
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
