/**
 * The six places time and money leak most often. Used beside the leaky bucket on
 * the home page and as the choices on the contact page.
 */
export interface Problem {
  key: string;
  name: string;
  problem: string;
  fix: string;
  side: 'left' | 'right';
  /** Height of this leak on the bucket (between about 200 and 360) */
  y: number;
  /** 24x24 stroke icon path */
  icon: string;
  /** Shorter name for the bucket label, when the full name is long */
  short?: string;
}

export const problems = [
  {
    key: 'invoicing',
    name: 'Invoicing',
    problem: 'Invoices prepared manually, details copied from spreadsheets, and payments chased one at a time.',
    fix: 'Approved work becomes an invoice. Reminders go out automatically.',
    side: 'left',
    y: 214,
    icon: 'M7 3h7l4 4v14H7zM14 3v4h4M12.5 10v8M14.5 11.3c-.4-.6-1.1-.9-2-.9-1.2 0-2 .6-2 1.5 0 2 4 1.1 4 3.1 0 .9-.9 1.5-2 1.5-.9 0-1.7-.4-2.1-1',
  },
  {
    key: 'data-entry',
    name: 'Data entry',
    problem: 'The same client, donor, or project details entered into multiple platforms.',
    fix: 'Enter information once. It updates across the tools your team uses.',
    side: 'right',
    y: 238,
    icon: 'M8 4h10a2 2 0 0 1 2 2v10M4 8h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM7 13h6M7 16h4',
  },
  {
    key: 'reporting',
    name: 'Reporting',
    problem: 'Hours spent pulling numbers from different spreadsheets before every meeting.',
    fix: 'A live dashboard brings your key numbers together automatically.',
    side: 'left',
    y: 272,
    icon: 'M4 20h16M7 16v-4M12 16V8M17 16v-7M7 8.5l5-3.5 5 3',
  },
  {
    key: 'followups',
    name: 'Follow-ups',
    problem: 'Leads, outstanding payments, applications, and important requests waiting for someone to follow up.',
    fix: 'Every outstanding item gets an owner, a reminder, and a next step.',
    side: 'right',
    y: 298,
    icon: 'M3 7l9 6 9-6M3 7v10a1 1 0 0 0 1 1h9M3 7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6M16 18h5M19 16l2 2-2 2',
  },
  {
    key: 'scheduling',
    name: 'Scheduling',
    problem: 'Endless emails coordinating availability, appointments, and meetings.',
    fix: 'People book directly into available times. Confirmations go out automatically.',
    side: 'left',
    y: 330,
    icon: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h2M12 14h2M16 14h0M8 17h2M12 17h2',
  },
  {
    key: 'reconciliation',
    name: 'Reconciliation',
    problem: 'Receipts, transactions, records, and spreadsheets manually checked against one another.',
    fix: 'Transactions are matched, exceptions flagged, and records kept up to date.',
    side: 'right',
    y: 352,
    icon: 'M3.5 4h6v16h-6zM14.5 4h6v16h-6zM9.5 9h5M13 7.5l1.5 1.5-1.5 1.5M14.5 15h-5M11 13.5L9.5 15l1.5 1.5',
  },
] as const;
