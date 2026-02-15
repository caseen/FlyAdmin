
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: number;
}

export interface Ticket {
  id: string;
  passengers: string[];
  segments: string;
  flightDate: string;
  flightTime: string;
  pnr: string;
  eTicketNo: string;
  issuedDate: string;
  airline: string;
  customerId: string;
  supplierId: string;
  salesPrice: number;
  purchasePrice: number;
  profit: number;
  dummyTicket: boolean;
  pdfUrl?: string;
  createdAt: number;
  reminderSent: boolean;
}

export interface ExtractedTicketData {
  passengers: string[];
  segments: string;
  flightDate: string;
  flightTime: string;
  pnr: string;
  eTicket: string;
  issuedDate: string;
}
