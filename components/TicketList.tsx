
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit2, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { Ticket } from '../types';
import TicketForm from './TicketForm';

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | undefined>();
  const [search, setSearch] = useState('');
  const [filterAirline, setFilterAirline] = useState('');

  const loadTickets = () => {
    setTickets(dbService.getTickets());
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchSearch = t.passengers.some(p => p.toLowerCase().includes(search.toLowerCase())) || 
                          t.pnr.toLowerCase().includes(search.toLowerCase());
      const matchAirline = !filterAirline || t.airline.toLowerCase() === filterAirline.toLowerCase();
      return matchSearch && matchAirline;
    });
  }, [tickets, search, filterAirline]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      dbService.deleteTicket(id);
      loadTickets();
    }
  };

  const airlines = useMemo(() => {
    const set = new Set(tickets.map(t => t.airline));
    return Array.from(set);
  }, [tickets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Flight Tickets</h2>
          <p className="text-slate-500">Manage and track your issued flight tickets.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
            onClick={() => {
              setEditingTicket(undefined);
              setShowForm(true);
            }}
          >
            <Plus size={20} />
            New Ticket
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors">
            <Download size={20} />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 w-full md:w-96">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search passenger or PNR..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
              value={filterAirline}
              onChange={e => setFilterAirline(e.target.value)}
            >
              <option value="">All Airlines</option>
              {airlines.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Passenger & PNR</th>
                <th className="px-6 py-4">Route & Airline</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">Profit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400">No tickets found</td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 text-sm">
                          {ticket.passengers[0]} {ticket.passengers.length > 1 && <span className="text-blue-500 font-medium">+{ticket.passengers.length - 1} more</span>}
                        </p>
                        <p className="text-xs font-mono text-slate-500 bg-slate-100 inline-block px-1 rounded uppercase tracking-tighter">PNR: {ticket.pnr}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700 text-sm">{ticket.segments}</p>
                      <p className="text-xs text-orange-600 font-bold uppercase">{ticket.airline}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{ticket.flightDate}</p>
                      <p className="text-xs text-slate-500">{ticket.flightTime}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <p className="text-slate-500">Sales: <span className="text-slate-800 font-bold">LKR {ticket.salesPrice?.toLocaleString()}</span></p>
                        <p className="text-slate-500">Cost: <span className="text-slate-400">LKR {ticket.purchasePrice?.toLocaleString()}</span></p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${ticket.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        LKR {ticket.profit?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {ticket.dummyTicket ? (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase w-fit">Dummy</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase w-fit">Confirmed</span>
                        )}
                        {new Date(ticket.flightDate).getTime() < Date.now() && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold uppercase w-fit">Departed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingTicket(ticket);
                            setShowForm(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(ticket.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">Showing {filteredTickets.length} entries</p>
          <div className="flex gap-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <TicketForm 
          onClose={() => {
            setShowForm(false);
            setEditingTicket(undefined);
          }} 
          onSaved={() => {
            setShowForm(false);
            setEditingTicket(undefined);
            loadTickets();
          }}
          ticketToEdit={editingTicket}
        />
      )}
    </div>
  );
};

export default TicketList;
