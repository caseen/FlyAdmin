
import { Ticket, Customer, Supplier } from '../types';

const STORAGE_KEYS = {
  TICKETS: 'flyadmin_tickets',
  CUSTOMERS: 'flyadmin_customers',
  SUPPLIERS: 'flyadmin_suppliers',
};

export const dbService = {
  // Tickets
  getTickets: (): Ticket[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return data ? JSON.parse(data) : [];
  },
  saveTicket: (ticket: Ticket) => {
    const tickets = dbService.getTickets();
    const existingIndex = tickets.findIndex(t => t.id === ticket.id);
    if (existingIndex > -1) {
      tickets[existingIndex] = ticket;
    } else {
      tickets.push(ticket);
    }
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  },
  deleteTicket: (id: string) => {
    const tickets = dbService.getTickets().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  },

  // Customers
  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  },
  saveCustomer: (customer: Customer) => {
    const customers = dbService.getCustomers();
    customers.push(customer);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  // Suppliers
  getSuppliers: (): Supplier[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return data ? JSON.parse(data) : [];
  },
  saveSupplier: (supplier: Supplier) => {
    const suppliers = dbService.getSuppliers();
    suppliers.push(supplier);
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  },
};
