
import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { dbService } from '../services/dbService';
import { extractTicketData } from '../services/geminiService';
import { Ticket, ExtractedTicketData, Customer, Supplier } from '../types';

interface TicketFormProps {
  onClose: () => void;
  onSaved: () => void;
  ticketToEdit?: Ticket;
}

const TicketForm: React.FC<TicketFormProps> = ({ onClose, onSaved, ticketToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Ticket>>(ticketToEdit || {
    passengers: [],
    segments: '',
    flightDate: '',
    flightTime: '',
    pnr: '',
    eTicketNo: '',
    issuedDate: '',
    airline: '',
    customerId: '',
    supplierId: '',
    salesPrice: 0,
    purchasePrice: 0,
    profit: 0,
    dummyTicket: false,
    reminderSent: false,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [newPassenger, setNewPassenger] = useState('');

  useEffect(() => {
    setCustomers(dbService.getCustomers());
    setSuppliers(dbService.getSuppliers());
  }, []);

  const calculateProfit = (sales: number, purchase: number) => sales - purchase;

  const handlePriceChange = (field: 'salesPrice' | 'purchasePrice', value: string) => {
    const numValue = parseFloat(value) || 0;
    const updatedData = { ...formData, [field]: numValue };
    const sales = field === 'salesPrice' ? numValue : (formData.salesPrice || 0);
    const purchase = field === 'purchasePrice' ? numValue : (formData.purchasePrice || 0);
    setFormData({
      ...updatedData,
      profit: calculateProfit(sales, purchase)
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const extracted = await extractTicketData(base64String);
        
        setFormData(prev => ({
          ...prev,
          passengers: [...(prev.passengers || []), ...extracted.passengers],
          segments: extracted.segments || prev.segments,
          flightDate: extracted.flightDate || prev.flightDate,
          flightTime: extracted.flightTime || prev.flightTime,
          pnr: extracted.pnr || prev.pnr,
          eTicketNo: extracted.eTicket || prev.eTicketNo,
          issuedDate: extracted.issuedDate || prev.issuedDate,
        }));
        setLoading(false);
      };
    } catch (error) {
      console.error(error);
      alert('AI extraction failed. Please enter details manually.');
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket: Ticket = {
      ...formData as Ticket,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      createdAt: formData.createdAt || Date.now(),
    };
    dbService.saveTicket(ticket);
    onSaved();
  };

  const addPassenger = () => {
    if (newPassenger.trim()) {
      setFormData({
        ...formData,
        passengers: [...(formData.passengers || []), newPassenger.trim()]
      });
      setNewPassenger('');
    }
  };

  const removePassenger = (index: number) => {
    const updated = [...(formData.passengers || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, passengers: updated });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{ticketToEdit ? 'Edit Ticket' : 'Create New Ticket'}</h3>
            <p className="text-sm text-slate-500">Upload PDF to auto-fill or enter manually.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* AI Upload Section */}
          {!ticketToEdit && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-400 transition-all bg-slate-50/50">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <div className="text-center">
                      <p className="font-bold text-slate-800">AI is analyzing ticket...</p>
                      <p className="text-sm text-slate-500">Extracting passengers, dates, and PNR</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Upload size={30} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-800">Upload Flight PDF</p>
                      <p className="text-sm text-slate-500">Let Gemini AI fill the form for you</p>
                    </div>
                    <label className="px-6 py-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
                      <Sparkles size={16} />
                      Choose PDF File
                      <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Passengers Section */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Passengers</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newPassenger}
                  onChange={(e) => setNewPassenger(e.target.value)}
                  placeholder="Enter passenger name"
                  className="flex-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <button 
                  type="button"
                  onClick={addPassenger}
                  className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <PlusCircle size={24} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {formData.passengers?.map((name, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-2">
                    {name}
                    <button type="button" onClick={() => removePassenger(i)} className="hover:text-blue-900"><X size={12}/></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Segment</label>
                <input 
                  type="text" 
                  placeholder="CMB - DXB"
                  value={formData.segments}
                  onChange={e => setFormData({...formData, segments: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Airline</label>
                <input 
                  type="text" 
                  placeholder="Emirates"
                  value={formData.airline}
                  onChange={e => setFormData({...formData, airline: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Flight Date</label>
                <input 
                  type="date" 
                  value={formData.flightDate}
                  onChange={e => setFormData({...formData, flightDate: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Flight Time</label>
                <input 
                  type="time" 
                  value={formData.flightTime}
                  onChange={e => setFormData({...formData, flightTime: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PNR</label>
                <input 
                  type="text" 
                  value={formData.pnr}
                  onChange={e => setFormData({...formData, pnr: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">eTicket No</label>
                <input 
                  type="text" 
                  value={formData.eTicketNo}
                  onChange={e => setFormData({...formData, eTicketNo: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>

            {/* Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Customer</label>
              <select 
                value={formData.customerId}
                onChange={e => setFormData({...formData, customerId: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              >
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Supplier</label>
              <select 
                value={formData.supplierId}
                onChange={e => setFormData({...formData, supplierId: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Pricing */}
            <div className="bg-slate-50 p-6 rounded-2xl grid grid-cols-2 gap-4 md:col-span-2 border border-slate-100 shadow-inner">
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sales Price (LKR)</label>
                <input 
                  type="number" 
                  value={formData.salesPrice}
                  onChange={e => handlePriceChange('salesPrice', e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none font-bold text-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Purchase Price (LKR)</label>
                <input 
                  type="number" 
                  value={formData.purchasePrice}
                  onChange={e => handlePriceChange('purchasePrice', e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none font-bold text-red-600"
                />
              </div>
              <div className="col-span-2 pt-4 flex items-center justify-between border-t border-slate-200">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-500 uppercase">Profit:</span>
                  <span className={`text-xl font-black ${Number(formData.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    LKR {formData.profit?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <label className="text-xs font-bold text-slate-500 uppercase">Dummy Ticket?</label>
                   <select 
                    value={formData.dummyTicket ? 'yes' : 'no'}
                    onChange={e => setFormData({...formData, dummyTicket: e.target.value === 'yes'})}
                    className="p-2 rounded-lg border border-slate-200 bg-white"
                   >
                     <option value="no">No</option>
                     <option value="yes">Yes</option>
                   </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 px-6 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Save Ticket Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
