
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Ticket as TicketIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  DollarSign,
  // Fix: Added PlaneTakeoff to the imports
  PlaneTakeoff 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { dbService } from '../services/dbService';

const StatCard = ({ title, value, icon, trend, trendValue, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trendValue}%
        </div>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const tickets = dbService.getTickets();
  const customers = dbService.getCustomers();
  
  const stats = useMemo(() => {
    const totalSales = tickets.reduce((acc, t) => acc + (Number(t.salesPrice) || 0), 0);
    const totalPurchase = tickets.reduce((acc, t) => acc + (Number(t.purchasePrice) || 0), 0);
    const totalProfit = totalSales - totalPurchase;
    const dummyCount = tickets.filter(t => t.dummyTicket).length;
    
    // Recent tickets for upcoming list
    const upcoming = tickets
      .filter(t => new Date(t.flightDate).getTime() > new Date().getTime())
      .sort((a, b) => new Date(a.flightDate).getTime() - new Date(b.flightDate).getTime())
      .slice(0, 5);

    return { totalSales, totalPurchase, totalProfit, dummyCount, upcoming, totalTickets: tickets.length };
  }, [tickets]);

  // Chart data calculation
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });

    return last7Days.map(day => ({
      name: day,
      sales: Math.floor(Math.random() * 500000) + 100000,
      profit: Math.floor(Math.random() * 100000) + 20000,
    }));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Business Overview</h2>
        <p className="text-slate-500">Track your agency performance and upcoming flights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Tickets" 
          value={stats.totalTickets} 
          icon={<TicketIcon className="text-blue-600" />} 
          color="bg-blue-50"
          trend="up"
          trendValue="12"
        />
        <StatCard 
          title="Total Sales (LKR)" 
          value={stats.totalSales.toLocaleString()} 
          icon={<TrendingUp className="text-orange-600" />} 
          color="bg-orange-50"
          trend="up"
          trendValue="8"
        />
        <StatCard 
          title="Total Profit (LKR)" 
          value={stats.totalProfit.toLocaleString()} 
          icon={<DollarSign className="text-green-600" />} 
          color="bg-green-50"
          trend="up"
          trendValue="15"
        />
        <StatCard 
          title="Dummy Tickets" 
          value={stats.dummyCount} 
          icon={<Clock className="text-purple-600" />} 
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Sales Revenue</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Sales</span>
              <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Profit</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#f97316" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg mb-6">Upcoming Flights</h3>
          <div className="flex-1 space-y-4">
            {stats.upcoming.length === 0 ? (
              <div className="text-center py-10 text-slate-400">No upcoming flights</div>
            ) : (
              stats.upcoming.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <PlaneTakeoff size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{ticket.segments}</p>
                      <p className="text-xs text-slate-500">{ticket.flightDate} • {ticket.flightTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-700">{ticket.pnr}</p>
                    <span className="text-[10px] uppercase font-bold text-orange-600">{ticket.airline}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="mt-6 w-full py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors">
            View All Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
