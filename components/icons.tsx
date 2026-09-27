// Ícones de traço simples, no mesmo estilo da landing (1.5px, sem preenchimento).
type P = React.SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const IconOverview = (p: P) => (<svg {...base} {...p}><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="11" y="3" width="6" height="6" rx="1" /><rect x="3" y="11" width="6" height="6" rx="1" /><rect x="11" y="11" width="6" height="6" rx="1" /></svg>);
export const IconExams = (p: P) => (<svg {...base} {...p}><path d="M5 2.5h7l3 3v12H5z" /><path d="M12 2.5v3h3M7.5 10h5M7.5 13h5" /></svg>);
export const IconBiomarkers = (p: P) => (<svg {...base} {...p}><path d="M8 2.5v5L3.5 15a1.6 1.6 0 0 0 1.4 2.5h10.2a1.6 1.6 0 0 0 1.4-2.5L12 7.5v-5M7 2.5h6M6 12h8" /></svg>);
export const IconHistory = (p: P) => (<svg {...base} {...p}><path d="M2.5 15.5l4-5 3.5 3 3.5-6 4 4" /><path d="M2.5 2.5v15h15" /></svg>);
export const IconReports = (p: P) => (<svg {...base} {...p}><path d="M4 2.5h12v15H4z" /><path d="M7 7h6M7 10h6M7 13h3" /></svg>);
export const IconFollowup = (p: P) => (<svg {...base} {...p}><circle cx="10" cy="10" r="7.5" /><path d="M10 5.5V10l3 2" /></svg>);
export const IconProfile = (p: P) => (<svg {...base} {...p}><circle cx="10" cy="7" r="3.5" /><path d="M3.5 17.5c.8-3 3.4-5 6.5-5s5.7 2 6.5 5" /></svg>);
export const IconSettings = (p: P) => (<svg {...base} {...p}><circle cx="10" cy="10" r="2.5" /><path d="M10 2v2.2M10 15.8V18M2 10h2.2M15.8 10H18M4.3 4.3l1.6 1.6M14.1 14.1l1.6 1.6M4.3 15.7l1.6-1.6M14.1 5.9l1.6-1.6" /></svg>);
export const IconLogout = (p: P) => (<svg {...base} {...p}><path d="M8 3.5H4.5v13H8M12.5 6.5 16 10l-3.5 3.5M16 10H8" /></svg>);
export const IconMenu = (p: P) => (<svg {...base} {...p}><path d="M2.5 5.5h15M2.5 10h15M2.5 14.5h15" /></svg>);
export const IconClose = (p: P) => (<svg {...base} {...p}><path d="M4.5 4.5l11 11M15.5 4.5l-11 11" /></svg>);
export const IconPlus = (p: P) => (<svg {...base} {...p}><path d="M10 4v12M4 10h12" /></svg>);
export const IconArrow = (p: P) => (<svg {...base} {...p}><path d="M4 10h12M11 5l5 5-5 5" /></svg>);
export const IconShield = (p: P) => (<svg {...base} {...p}><path d="M10 2 17 5v4.5c0 4.1-3 7.4-7 8.5-4-1.1-7-4.4-7-8.5V5z" /></svg>);
export const IconCheck = (p: P) => (<svg {...base} {...p}><path d="M4 10.5l4 4 8-9" /></svg>);
