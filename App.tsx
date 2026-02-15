
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlaneTakeoff, 
  Users, 
  Truck, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  LogOut 
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TicketList from './components/TicketList';
import CustomerList from './components/CustomerList';
import SupplierList from './components/SupplierList';
import { dbService } from './services/dbService';
import { Ticket } from './types';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Tickets', icon: <PlaneTakeoff size={20} />, path: '/tickets' },
    { name: 'Customers', icon: <Users size={20} />, path: '/customers' },
    { name: 'Suppliers', icon: <Truck size={20} />, path: '/suppliers' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl">F</div>
        <h1 className="text-xl font-bold tracking-tight">FlyAdmin</h1>
      </div>
      <nav className="flex-1 mt-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-6 py-4 transition-colors ${
              location.pathname === item.path 
                ? 'bg-blue-600 border-r-4 border-orange-500 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors w-full">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const Header = () => {
  const [reminders, setReminders] = useState<Ticket[]>([]);

  useEffect(() => {
    const checkReminders = () => {
      const tickets = dbService.getTickets();
      const now = new Date().getTime();
      const upcoming = tickets.filter(t => {
        const flightTime = new Date(t.flightDate).getTime();
        const diffHours = (flightTime - now) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 24 && !t.reminderSent;
      });
      setReminders(upcoming);
    };
    checkReminders();
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-full w-96">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search bookings, PNR, passengers..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>
      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
          <Bell size={22} className="text-slate-600" />
          {reminders.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {reminders.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">Admin User</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
            <img src="https://picsum.photos/100/100" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          <Header />
          <div className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tickets" element={<TicketList />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/suppliers" element={<SupplierList />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
