/**
 * Comprehensive Initial Seed Data for Weddings, Birthdays, and Community Events
 */

export const INITIAL_EVENTS = [
  {
    id: 'evt_wedding_01',
    title: 'Aria & Julian\'s Botanical Greenhouse Wedding',
    type: 'wedding',
    date: '2026-11-14',
    time: '15:30',
    location: 'Glasshouse Conservatory Gardens, Hudson Valley, NY',
    guestCount: 140,
    totalBudget: 38000,
    currency: 'USD',
    vibe: 'Modern Botanical Elegance with Warm Earth Tones & Acoustic Strings',
    colorPalette: ['#2D5A27', '#E8D8C8', '#D4A373', '#FAEDCD', '#1C2826'],
    notes: 'Indoor/Outdoor greenhouse layout. All floral installations must be bee-friendly and foam-free.',
    budgetItems: [
      { id: 'b_01', category: 'Venue', name: 'Glasshouse Conservatory Rental & Setup', estimatedCost: 9500, actualCost: 9500, paidCost: 9500, status: 'paid', notes: 'Includes tables, vintage bistro chairs, and cleanup' },
      { id: 'b_02', category: 'Catering', name: 'Farm-to-Table 3-Course Plated Dinner & Cocktails', estimatedCost: 12000, actualCost: 12400, paidCost: 6000, status: 'deposit_paid', notes: '$85/person + $25 beverage package' },
      { id: 'b_03', category: 'Photography & Film', name: 'Artisan 8-Hour Photo & Drone Videography', estimatedCost: 4200, actualCost: 4000, paidCost: 2000, status: 'deposit_paid', notes: 'Includes raw footage and 200 physical prints' },
      { id: 'b_04', category: 'Florals & Decor', name: 'Living Hanging Vines, Arch & Sustainable Centerpieces', estimatedCost: 3800, actualCost: 3900, paidCost: 1500, status: 'deposit_paid', notes: 'Potted plants to be donated after reception' },
      { id: 'b_05', category: 'Music & Entertainment', name: 'Acoustic String Trio (Ceremony) & 5-Piece Jazz Band', estimatedCost: 3200, actualCost: 3200, paidCost: 3200, status: 'paid', notes: 'Band requires 2 dedicated 20A power circuits' },
      { id: 'b_06', category: 'Attire & Beauty', name: 'Bespoke Attire, Alterations, Hair & Makeup Team', estimatedCost: 2800, actualCost: 2650, paidCost: 2650, status: 'paid', notes: 'Trial session completed' },
      { id: 'b_07', category: 'Contingency Reserve', name: 'Unforeseen Weather & Overtime Buffer (10%)', estimatedCost: 2500, actualCost: 450, paidCost: 450, status: 'partial', notes: 'Used $450 for heater rental deposit' }
    ],
    timeline: [
      { id: 't_01', phase: 'pre-event', time: '09:00', title: 'Bridal Party & Groom Suite Hair & Makeup Prep', description: 'Light breakfast, mimosas, and detail photography (rings, vows, dresses)', assignee: 'Lead Stylist', completed: false },
      { id: 't_02', phase: 'pre-event', time: '11:30', title: 'Florist & Lighting Installation at Conservatory', description: 'Hanging floral installation and bistro string lighting load-in', assignee: 'Verdant Florals', completed: false },
      { id: 't_03', phase: 'day-of', time: '14:00', title: 'Private First Look & Couple Portraits', description: 'Quiet path by the North Orchard fountain', assignee: 'Lead Photographer', completed: false },
      { id: 't_04', phase: 'day-of', time: '15:00', title: 'Guest Arrival, Welcome Mocktails & Acoustic Preludes', description: 'String trio plays modern indie arrangements', assignee: 'Venue Coordinator', completed: false },
      { id: 't_05', phase: 'day-of', time: '15:30', title: 'Ceremony Begins (Processional)', description: 'Unplugged ceremony, personalized vows exchange', assignee: 'Officiant Sarah', completed: false },
      { id: 't_06', phase: 'day-of', time: '16:15', title: 'Cocktail Hour & Golden Hour Family Photos', description: 'Passed hors d\'oeuvres and signature botanical gin & rosemary drinks', assignee: 'Catering Captain', completed: false },
      { id: 't_07', phase: 'day-of', time: '17:45', title: 'Grand Entrance & Plated Dinner Service', description: 'Seasonal roasted harvest vegetables and braised entree', assignee: 'Head Chef Marcus', completed: false },
      { id: 't_08', phase: 'day-of', time: '19:30', title: 'First Dance & Live Band Dance Floor Opening', description: 'Jazz band transitions into energetic funk & modern covers', assignee: 'Band Leader', completed: false },
      { id: 't_09', phase: 'day-of', time: '22:30', title: 'Sparkler / Lantern Send-off & Shuttles Depart', description: 'Coordinated shuttles back to downtown hotels', assignee: 'Logistics Lead', completed: false }
    ],
    vendors: [
      {
        id: 'v_01',
        name: 'The Glasshouse Conservatory',
        category: 'Venue',
        contactPerson: 'Elena Rostova',
        email: 'events@glasshouseconservatory.com',
        phone: '+1 (845) 555-0192',
        status: 'booked',
        cost: 9500,
        paid: 9500,
        contractSigned: true,
        insuranceVerified: true,
        notes: 'Sound curfew at 23:00 strict. Requires COI 30 days prior.',
        backupPlan: 'Covered atrium can be enclosed in 15 minutes if sudden torrential rain occurs.'
      },
      {
        id: 'v_02',
        name: 'Hudson Harvest Kitchen',
        category: 'Catering',
        contactPerson: 'Chef Marcus Vance',
        email: 'marcus@hudsonharvest.com',
        phone: '+1 (845) 555-0348',
        status: 'booked',
        cost: 12400,
        paid: 6000,
        contractSigned: true,
        insuranceVerified: true,
        notes: 'Handling 18 vegan/gluten-free plates, 2 severe peanut allergies (separate prep station).',
        backupPlan: 'Sister commissary kitchen is 12 miles away in Kingston.'
      },
      {
        id: 'v_03',
        name: 'Lumina Stories Photography',
        category: 'Photography',
        contactPerson: 'Chloe Chen',
        email: 'chloe@luminastories.com',
        phone: '+1 (212) 555-8721',
        status: 'booked',
        cost: 4000,
        paid: 2000,
        contractSigned: true,
        insuranceVerified: true,
        notes: 'Needs meal during dinner break; bringing secondary shooter and dual-card backups.',
        backupPlan: 'Associate photographer David Miller on paid on-call retainer.'
      },
      {
        id: 'v_04',
        name: 'Verdant Botanical Florals',
        category: 'Florals',
        contactPerson: 'Sophie Dubois',
        email: 'sophie@verdantbotanicals.com',
        phone: '+1 (845) 555-4491',
        status: 'booked',
        cost: 3900,
        paid: 1500,
        contractSigned: true,
        insuranceVerified: true,
        notes: 'All stems sourced within 50 miles. Setup must finish by 13:30.',
        backupPlan: 'Cold-storage truck on-site until temperature stabilises.'
      }
    ],
    accessibilityNeeds: [
      { id: 'acc_01', title: 'Full Wheelchair Ramp to Ceremony Conservatory', status: 'confirmed', notes: 'Gentle 1:12 slope ramp verified with venue management.' },
      { id: 'acc_02', title: 'Dedicated Sensory Quiet Lounge', status: 'confirmed', notes: 'Reserved Library Room with low lighting and noise-canceling headphones for neurodivergent guests.' },
      { id: 'acc_03', title: 'Severe Allergen Safety Protocol', status: 'in-progress', notes: 'Kitchen notified: Color-coded meal covers for guests with celiac and peanut allergies.' }
    ],
    ideas: [
      { id: 'id_01', category: 'Decor', title: 'Botanical Living Table Numbers', description: 'Terrarium table centerpieces with laser-engraved wooden table markers and seeds guests can take home.' },
      { id: 'id_02', category: 'Cocktails', title: 'His, Hers & Paws Signature Cocktails', description: 'Featuring drinks named after the couple and their rescue golden retriever (with custom illustrated bar signs).' },
      { id: 'id_03', category: 'Guest Engagement', title: 'Audio Guestbook Rotary Phone', description: 'Vintage telephone where guests pick up the receiver, hear a recorded welcome from the couple, and leave heartfelt voice messages.' }
    ]
  },
  {
    id: 'evt_birthday_02',
    title: 'Leo\'s Neon Cyberpunk 30th Birthday Gala',
    type: 'birthday',
    date: '2026-12-05',
    time: '20:00',
    location: 'Warehouse District Loft 4B, Austin, TX',
    guestCount: 65,
    totalBudget: 7500,
    currency: 'USD',
    vibe: 'Retro-Futuristic Cyberpunk, UV Glow, Interactive Retro Arcade & Synthwave Beats',
    colorPalette: ['#00F0FF', '#FF007F', '#7928CA', '#101018', '#FFE600'],
    notes: 'Dress code: High-tech low-life, neon accents, futuristic chic. Surprise guest performer at 22:30.',
    budgetItems: [
      { id: 'bb_01', category: 'Venue', name: 'Industrial Loft Space Rental (8 hrs)', estimatedCost: 2200, actualCost: 2200, paidCost: 2200, status: 'paid', notes: 'Includes industrial freight elevator and staging area' },
      { id: 'bb_02', category: 'Lighting & FX', name: 'UV Blacklights, Lasers, Haze Machine & LED Neon Signs', estimatedCost: 1500, actualCost: 1650, paidCost: 1650, status: 'paid', notes: 'Water-based haze approved by venue fire marshall' },
      { id: 'bb_03', category: 'DJ & Sound System', name: 'Synthwave & Electronic Music Producer + Subwoofers', estimatedCost: 1200, actualCost: 1200, paidCost: 600, status: 'deposit_paid', notes: '3-hour live mixing set with visual projection mapping' },
      { id: 'bb_04', category: 'Bespoke Bar & Catering', name: 'Molecular Mixology Cocktails & Asian Fusion Street Bites', estimatedCost: 1800, actualCost: 1750, paidCost: 900, status: 'deposit_paid', notes: 'Glowing tonic drinks (fluoresces under UV) & Bao buns' },
      { id: 'bb_05', category: 'Cake & Interactive Fun', name: 'Geometric Holographic Drip Cake & CRT Arcade Cabinet', estimatedCost: 800, actualCost: 820, paidCost: 820, status: 'paid', notes: 'Playable custom Street Fighter II cabinet' }
    ],
    timeline: [
      { id: 'tb_01', phase: 'pre-event', time: '17:00', title: 'AV Team & Neon Lighting Rigging Load-in', description: 'Mounting blacklight truss and laser projector calibrations', assignee: 'NeonPulse FX', completed: false },
      { id: 'tb_02', phase: 'day-of', time: '20:00', title: 'Doors Open, Cyberpunk Ambient DJ & Glow Bar', description: 'Guests receive UV body paint touch-ups and glowing welcome shooters', assignee: 'Host / Bartenders', completed: false },
      { id: 'tb_03', phase: 'day-of', time: '21:30', title: 'Arcade High-Score Tournament', description: 'Speedrunner challenge on the retro cabinets with custom 3D printed trophy', assignee: 'Leo (Birthday Guy)', completed: false },
      { id: 'tb_04', phase: 'day-of', time: '22:30', title: 'Surprise Laser Lightshow & Birthday Toast', description: 'Geometric cyberpunk cake reveal with cold spark fountains', assignee: 'Event Host', completed: false },
      { id: 'tb_05', phase: 'day-of', time: '01:00', title: 'Event Wrap & Safe Rides Departure', description: 'Ride-share vouchers distributed; load-out begins', assignee: 'Loft Coordinator', completed: false }
    ],
    vendors: [
      {
        id: 'vb_01',
        name: 'Warehouse 4B Events',
        category: 'Venue',
        contactPerson: 'Zack Morales',
        email: 'zack@loftaustin.com',
        phone: '+1 (512) 555-7781',
        status: 'booked',
        cost: 2200,
        paid: 2200,
        contractSigned: true,
        insuranceVerified: true,
        notes: 'Keycode access given for load-in from 16:00.',
        backupPlan: 'Secondary ground floor studio available in case elevator fails.'
      },
      {
        id: 'vb_02',
        name: 'NeonPulse Visuals & Sound',
        category: 'AV & Lighting',
        contactPerson: 'Kira Sterling',
        email: 'kira@neonpulsefx.io',
        phone: '+1 (512) 555-9043',
        status: 'booked',
        cost: 1650,
        paid: 1650,
        contractSigned: true,
        insuranceVerified: true,
        notes: 'Tested haze machine with venue optical smoke detectors.',
        backupPlan: 'Backup audio amplifier and secondary projector in production van.'
      }
    ],
    accessibilityNeeds: [
      { id: 'ab_01', title: 'Strobe & Photosensitivity Warning Signage', status: 'confirmed', notes: 'Clear warning at entrance and RSVP page; lasers calibrated strictly above eye level.' },
      { id: 'ab_02', title: 'Quiet Low-Sensory Lounge Area', status: 'confirmed', notes: 'Balcony area furnished with lounge chairs, low ambient lighting, and earplugs.' }
    ],
    ideas: [
      { id: 'idb_01', category: 'Activity', title: 'Cybernetic Glow Makeup Bar', description: 'Professional makeup artist applying futuristic UV-reflective geometric line art and cyber decals.' },
      { id: 'idb_02', category: 'Decor', title: 'Retro CRT TV Wall Glitch Display', description: 'Stack of vintage Sony Trinitrons looping 90s anime, retro game intros, and custom photos of the birthday star.' }
    ]
  },
  {
    id: 'evt_community_03',
    title: 'Oakridge Riverfront Harvest Festival & 5K Run',
    type: 'community',
    date: '2026-10-18',
    time: '08:00',
    location: 'Oakridge Riverfront Memorial Park & Promenade',
    guestCount: 850,
    totalBudget: 18500,
    currency: 'USD',
    vibe: 'Warm Autumn Community Gathering, Local Artisans, Kids Zone, and Active 5K',
    colorPalette: ['#9C4123', '#E07A5F', '#3D405B', '#81B29A', '#F2CC8F'],
    notes: 'City Council special event permit approved. Police department providing 4 intersection crossing guards.',
    budgetItems: [
      { id: 'bc_01', category: 'Permits & City Services', name: 'Municipal Parks Permit, EMS Paramedic Unit & Traffic Control', estimatedCost: 3500, actualCost: 3500, paidCost: 3500, status: 'paid', notes: 'Permit #CP-2026-881 signed by City Clerk' },
      { id: 'bc_02', category: '5K Race Operations', name: 'RFID Chip Timing System, Race Bibs & Medals', estimatedCost: 4200, actualCost: 4100, paidCost: 2050, status: 'deposit_paid', notes: '600 registered runners as of this week' },
      { id: 'bc_03', category: 'Stage & Acoustic Rig', name: 'Mobile Covered Bandstand & PA for Community Choirs & Folk Band', estimatedCost: 3800, actualCost: 3600, paidCost: 3600, status: 'paid', notes: 'Generators include sound baffles' },
      { id: 'bc_04', category: 'Sanitation & Logistics', name: 'Portable Restrooms (incl. 4 ADA units) & Zero-Waste Stations', estimatedCost: 3200, actualCost: 3400, paidCost: 1700, status: 'deposit_paid', notes: 'Compost, recycling, and landfill triage monitors' },
      { id: 'bc_05', category: 'Volunteer Logistics & First Aid', name: 'Safety Vests, Radios, Snacks & Hydration Stations', estimatedCost: 1800, actualCost: 1650, paidCost: 1650, status: 'paid', notes: '40 student volunteers from Oakridge High' },
      { id: 'bc_06', category: 'Contingency Reserve', name: 'Weather Protection Tents & Towing Standby', estimatedCost: 2000, actualCost: 0, paidCost: 0, status: 'pending', notes: 'Reserved for emergency rental if rainfall forecasted' }
    ],
    timeline: [
      { id: 'tc_01', phase: 'pre-event', time: '05:30', title: 'Course Marshals & Police Traffic Cones Setup', description: 'Riverfront Parkway closed to vehicular traffic from mile 0 to 3.1', assignee: 'Traffic Lead & Police Sgt. Vance', completed: false },
      { id: 'tc_02', phase: 'pre-event', time: '06:30', title: '5K Check-in & Bib Pickup Booths Open', description: 'Hydration tables prepared, timing gates calibrated', assignee: 'Registration Team', completed: false },
      { id: 'tc_03', phase: 'day-of', time: '08:00', title: '5K Harvest Fun Run Start Horn', description: 'Runners start in 3 waves (competitive, open, stroller/family)', assignee: 'Race Director', completed: false },
      { id: 'tc_04', phase: 'day-of', time: '09:30', title: 'Food Truck Alley & Maker Artisan Market Opens', description: '14 licensed local food trucks, pie baking contest tent open', assignee: 'Vendor Coordinator', completed: false },
      { id: 'tc_05', phase: 'day-of', time: '11:00', title: 'Podium Medal Ceremony & Kids Pumpkin Painting', description: 'Top 3 male/female/age-group medals and raffle giveaway', assignee: 'Mayor\'s Office Liaison', completed: false },
      { id: 'tc_06', phase: 'day-of', time: '13:00', title: 'Folk Music Concert & Line Dancing Workshop', description: 'Family acoustic concert on the community bandshell', assignee: 'Cultural Arts Board', completed: false },
      { id: 'tc_07', phase: 'post-event', time: '16:00', title: 'Festival Conclusion & Park Clean-Sweep Volunteer Crew', description: 'Zero-waste verification and road reopened by 18:00', assignee: 'Volunteer Captains', completed: false }
    ],
    vendors: [
      {
        id: 'vc_01',
        name: 'Precision Race Timing LLC',
        category: 'Race Operations',
        contactPerson: 'Brian O\'Connor',
        email: 'brian@precisiontiming.com',
        phone: '+1 (518) 555-1234',
        status: 'booked',
        cost: 4100,
        paid: 2050,
        contractSigned: true,
        insuranceVerified: true,
        notes: 'Dual inflatable start/finish arches; live results uploaded via cellular uplink.',
        backupPlan: 'Manual backup sprint timer guns and paper tracking logs ready.'
      },
      {
        id: 'vc_02',
        name: 'Hudson Clean Sanitation Services',
        category: 'Logistics',
        contactPerson: 'Maria Santos',
        email: 'maria@hudsonclean.org',
        phone: '+1 (518) 555-6677',
        status: 'booked',
        cost: 3400,
        paid: 1700,
        contractSigned: true,
        insuranceVerified: true,
        notes: 'Delivering 12 standard units, 4 wheelchair accessible units, and 4 hand-wash sinks.',
        backupPlan: 'Standby pump truck on call throughout festival hours.'
      }
    ],
    accessibilityNeeds: [
      { id: 'ac_01', title: 'Paved Wheelchair & Stroller Accessible Course', status: 'confirmed', notes: '100% asphalt course path with no grass traversal required for 5K participants.' },
      { id: 'ac_02', title: 'ASL Interpreters on Stage for Announcements', status: 'confirmed', notes: 'Certified sign language interpreters booked for Mayor opening speech and awards.' },
      { id: 'ac_03', title: 'Low-Mobility Golf Cart Shuttle', status: 'confirmed', notes: 'Two 6-seater golf carts running continuous loops between senior center parking and stage.' }
    ],
    ideas: [
      { id: 'idc_01', category: 'Community', title: 'Giant Communal Leaf Art Mural', description: 'A large canvas board where community members stamp colorful pressed maple leaves with their names and neighborhood wishes.' },
      { id: 'idc_02', category: 'Eco', title: 'Zero Single-Use Plastic Water Refill Oasis', description: 'Partner with local spring water supplier to offer free rapid-fill hydration stations with commemorative aluminum reusable bottles.' }
    ]
  }
];

export const CRISIS_KNOWLEDGE_BASE = [
  {
    category: 'Weather Emergencies',
    title: 'Sudden Torrential Rain During Outdoor Event',
    riskLevel: 'High',
    immediateActions: [
      'Trigger "Plan B" covered pavilion or indoor ballroom transfer protocol immediately.',
      'Cut power to all exposed audio, DJ cables, and outdoor lighting fixtures to avoid electric shock.',
      'Deploy 100+ branded clear umbrellas to guest arrival and transition corridors.',
      'Relocate photo ops to covered architectural arches or interior greenhouse spaces.',
      'Inform catering to move dessert and food stations to indoor climate-controlled staging.'
    ],
    preventativeChecklist: [
      'Contract signed with emergency tent canopy vendor with a 48-hour call trigger.',
      'High-capacity rubber cable crossovers covering all outdoor walkways.',
      'Hourly radar monitoring assigned to dedicated logistics staff.'
    ]
  },
  {
    category: 'Vendor No-Shows & Cancellations',
    title: 'Primary Caterer Cancels 48 Hours Before Event',
    riskLevel: 'Critical',
    immediateActions: [
      'Activate pre-vetted contingency caterer / sister commercial kitchen on standby.',
      'Shift format from elaborate multi-course plated dinner to upscale family-style or luxury gourmet grazing stations with local partner restaurants.',
      'Dispatch rental company immediately for hot-holding chaffing dishes and serving utensils.',
      'Notify venue manager to open auxiliary refrigeration units.',
      'Contact insurance carrier for claim documentation on non-refundable deposits.'
    ],
    preventativeChecklist: [
      'Every major vendor contract must have a replacement clause and Certificate of Insurance (COI).',
      'Maintain phone numbers for 3 emergency on-call food truck operators.',
      'Require vendor re-confirmation 14 days and 48 hours prior.'
    ]
  },
  {
    category: 'Budget Overrun Crisis',
    title: 'Unexpected Expenses Pushing Budget 15-25% Over Target',
    riskLevel: 'Medium',
    immediateActions: [
      'Conduct immediate line-item triage: categorize all remaining items into "Must-Have", "Nice-to-Have", and "Eliminate".',
      'Substitute out-of-season exotic florals with seasonal foliage and ambient pillar candlelight.',
      'Switch open full-liquor bar to curated signature cocktail + beer & wine after the initial 2 hours.',
      'Re-negotiate vendor overtime clauses upfront or cap event duration strictly.',
      'Apply contingency reserve funds (10-15%) specifically allocated at project inception.'
    ],
    preventativeChecklist: [
      'Always budget with a hard 10-15% unallocated contingency reserve.',
      'Lock in written price guarantees on quotes before signing contracts.',
      'Review actual spend weekly in the AuraPlan Financial Ledger.'
    ]
  },
  {
    category: 'Technical & AV Failures',
    title: 'Main Sound System or Microphone Cuts Out During Key Moment',
    riskLevel: 'High',
    immediateActions: [
      'Switch immediately to backup battery-powered acoustic megaphone or wireless secondary amplifier.',
      'Check audio board circuit breaker and master mute relays.',
      'If during wedding ceremony, officiant steps forward and projects acoustically in intimate semicircle.',
      'Sound engineer tests backup wireless handheld channel within 60 seconds.',
      'Band or background acoustic players fill dead air smoothly.'
    ],
    preventativeChecklist: [
      'Never rely on a single wireless mic channel; test frequency scan for RF interference before doors open.',
      'Keep a portable battery-powered PA speaker on stage wings at all times.',
      'Dedicated 20A circuit solely for sound equipment, separate from heavy lighting rigs.'
    ]
  },
  {
    category: 'Guest Health & Safety',
    title: 'Severe Anaphylactic Dietary Reaction or Medical Issue',
    riskLevel: 'Critical',
    immediateActions: [
      'Call 911 / emergency EMS immediately and give exact venue GPS coordinates and entry door number.',
      'Locate on-site certified First Aid responder and check for venue EpiPen in emergency kit.',
      'Clear the corridor for paramedic gurney access; silence loud music and bring house lights to 100%.',
      'Check guest RSVP emergency contact list and dietary matrix in AuraPlan.',
      'Designate one trusted family member/colleague to accompany guest to hospital.'
    ],
    preventativeChecklist: [
      'Guest dietary matrix with table numbers printed for head chef and floor captain.',
      'Allergy warning placards placed clearly at buffet and hors d\'oeuvre stations.',
      'Venue AED (Defibrillator) and First Aid kit locations marked on run-of-show.'
    ]
  }
];
