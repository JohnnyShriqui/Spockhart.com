/**
 * Shared bits for showing case studies (Our Work and the home page).
 *
 * Client names and logos are withheld, so each case study gets an industry mark where the
 * client's logo would sit (24x24 stroke icons, drawn in a navy hexagon).
 */
export const industryIcons: Record<string, string> = {
  'survival-sports-platform': 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3M12 13v4M9 21h6M10 17h4',
  'receiving-labels': 'M3 8.5 12 4l9 4.5v8L12 21l-9-4.5zM3 8.5 12 13l9-4.5M12 13v8M7 10.7l9-4.5',
  'commission-automation': 'M3 21V11l5 3v-3l5 3v-3l5 3V5h3v16zM3 21h18M7 17h2M12 17h2M17 17h1',
  'project-feasibility-platform': 'M4 21V9h7v12M11 21V3h3l6 4M14 7h6M18 7v4M3 21h18M6.5 12h2M6.5 15h2M6.5 18h2',
  'subcontractor-financing-marketplace': 'M3 17.5h18M5 17.5a7 7 0 0 1 14 0M10.5 10.6V6.5h3v4.1M12 20.5v.01',
  'sales-performance-system': 'M4 20h16M6 16l4-4 3 3 5-6M14 9h4v4',
  'digital-practice-growth': 'M4 8h16v11H4zM9 8V5.5h6V8M4 13h16M11 13v2h2v-2',
  'momentum-exchange-prototype': 'M12 3c3 2.2 4.8 6 4.8 10l-2 3H9.2l-2-3c0-4 1.8-7.8 4.8-10zM9.4 16.2 7.5 20.5M14.6 16.2l1.9 4.3M12 8.5v3',
  'lead-generation-engine': 'M3 4.5h18l-7 8v6l-4 2v-8zM8 8.5h8',
  'supply-chain-assessment': 'M12 10v11M8.5 21h7M12 10l-3.5 11M12 10l3.5 11M9 6.5a4.2 4.2 0 0 0 0 6M15 6.5a4.2 4.2 0 0 1 0 6M6.2 4a8 8 0 0 0 0 11M17.8 4a8 8 0 0 1 0 11',
};
export const iconFor = (id: string) => industryIcons[id] ?? industryIcons['digital-practice-growth'];

/** Headlines mark their numbers in [brackets]; those parts are set in blue. Odd parts are marked. */
export const headline = (title: string) => title.split(/\[(.+?)\]/g);
export const plainTitle = (title: string) => title.replace(/[\[\]]/g, '');
