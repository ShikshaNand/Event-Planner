/**
 * Core GenAI Orchestration Service for AuraPlan
 * Combines live Gemini LLM calls with an expert rule-based heuristic generation engine.
 */

import { callGemini } from './geminiClient.js';
import { safeJSONParse } from '../utils/sanitizer.js';
import { generateId } from '../utils/formatters.js';

export class AIService {
  constructor(store) {
    this.store = store;
  }

  /**
   * Generates a complete comprehensive Event Blueprint
   * @param {object} params 
   * @returns {Promise<object>}
   */
  async generateEventBlueprint(params) {
    const { title, type, date, guestCount, totalBudget, vibe, location } = params;
    const apiKey = this.store.getApiKey();

    if (apiKey) {
      try {
        const prompt = `You are an elite master event planner with 20 years of experience organizing luxury weddings, high-energy birthdays, and large-scale community festivals.
Create a complete, realistic, professional blueprint for this event in STRICT JSON format:
Event Details:
- Title: ${title}
- Type: ${type}
- Target Date: ${date}
- Guest Count: ${guestCount}
- Total Budget: $${totalBudget}
- Vibe / Theme: ${vibe || 'Sophisticated and unforgettable'}
- Location: ${location || 'Metropolitan Area'}

Return ONLY a valid JSON object matching this exact schema:
{
  "recommendedColorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "budgetItems": [
    { "category": "Venue|Catering|Photography|Entertainment|Decor|Attire|Contingency Reserve", "name": "string", "estimatedCost": number, "notes": "string" }
  ],
  "timeline": [
    { "phase": "pre-event|day-of|post-event", "time": "HH:MM", "title": "string", "description": "string", "assignee": "string" }
  ],
  "vendors": [
    { "name": "string", "category": "Venue|Catering|Photography|Florals|Music|AV", "notes": "string", "backupPlan": "string" }
  ],
  "ideas": [
    { "category": "Decor|Cocktails|Entertainment|Guest Experience", "title": "string", "description": "string" }
  ],
  "accessibilityNeeds": [
    { "title": "string", "notes": "string" }
  ]
}`;

        const rawResponse = await callGemini(apiKey, prompt, { jsonMode: true, temperature: 0.6 });
        const parsed = safeJSONParse(rawResponse, null);
        if (parsed && Array.isArray(parsed.budgetItems) && parsed.budgetItems.length > 0) {
          return this.normalizeBlueprint(parsed, totalBudget);
        }
      } catch (err) {
        console.warn('Gemini API call failed, switching to expert heuristic generator:', err);
      }
    }

    // Expert Fallback Engine
    return this.generateHeuristicBlueprint(params);
  }

  /**
   * Crisis & Emergency Problem Solver
   * @param {object} params 
   * @returns {Promise<object>}
   */
  async solveCrisis(params) {
    const { problem, eventType, guestCount, location } = params;
    const apiKey = this.store.getApiKey();

    if (apiKey) {
      try {
        const prompt = `You are a world-class Event Crisis Management Director. An emergency has occurred during an event:
Problem Description: "${problem}"
Event Type: ${eventType}
Guest Count: ${guestCount || 100}
Location: ${location || 'Venue'}

Provide an immediate, authoritative action plan in STRICT JSON format:
{
  "summary": "One sentence summary of the crisis strategy",
  "severity": "Low|Medium|High|Critical",
  "immediateActions": ["Action 1 within 5 minutes", "Action 2 within 15 minutes", "Action 3", "Action 4"],
  "contingencySteps": ["Contingency step 1", "Contingency step 2", "Contingency step 3"],
  "communicationScript": "Verbatim calm script or announcement text for the host to say to guests or vendors",
  "preventativeAdvice": ["Lesson learned 1", "Lesson learned 2"]
}`;

        const raw = await callGemini(apiKey, prompt, { jsonMode: true, temperature: 0.4 });
        const parsed = safeJSONParse(raw, null);
        if (parsed && parsed.immediateActions) {
          return parsed;
        }
      } catch (err) {
        console.warn('Gemini call failed for crisis solver, falling back to heuristic engine:', err);
      }
    }

    return this.generateHeuristicCrisisSolution(params);
  }

  /**
   * Budget Optimization & Cost Triage
   * @param {object} params 
   * @returns {Promise<object>}
   */
  async optimizeBudget(params) {
    const { totalBudget, effectiveSpend, budgetItems, eventType, savingsGoal } = params;
    const apiKey = this.store.getApiKey();

    if (apiKey) {
      try {
        const prompt = `Analyze this ${eventType} budget and provide tactical cost reduction suggestions to save $${savingsGoal || 1500}:
Total Budget: $${totalBudget}
Current Spend: $${effectiveSpend}
Items: ${JSON.stringify(budgetItems.map(i => ({ cat: i.category, name: i.name, est: i.estimatedCost, act: i.actualCost })))}

Respond in STRICT JSON format:
{
  "overallVerdict": "string assessment of financial health",
  "recommendedCuts": [
    { "category": "string", "item": "string", "strategy": "string", "estimatedSavings": number }
  ],
  "vendorNegotiationTips": ["string tip 1", "string tip 2", "string tip 3"],
  "projectedNewTotal": number
}`;

        const raw = await callGemini(apiKey, prompt, { jsonMode: true, temperature: 0.5 });
        const parsed = safeJSONParse(raw, null);
        if (parsed && Array.isArray(parsed.recommendedCuts)) {
          return parsed;
        }
      } catch (err) {
        console.warn('Gemini budget optimization failed, falling back to heuristics:', err);
      }
    }

    return this.generateHeuristicBudgetOptimization(params);
  }

  /**
   * Personalized Creative Ideas Generator
   * @param {object} params 
   * @returns {Promise<Array<object>>}
   */
  async generatePersonalizedIdeas(params) {
    const { eventType, vibe, guestCount, budgetTier, categoryFocus } = params;
    const apiKey = this.store.getApiKey();

    if (apiKey) {
      try {
        const prompt = `Generate 4 deeply original, viral, high-touch ideas for a ${eventType}.
Vibe / Aesthetics: ${vibe || 'Creative & Memorable'}
Guest Count: ${guestCount || 80}
Budget Tier: ${budgetTier || 'Mid-range'}
Focus Category: ${categoryFocus || 'All (Decor, Cocktails, Entertainment, Keepsakes)'}

Respond in STRICT JSON format:
{
  "ideas": [
    { "category": "Decor|Cocktails|Entertainment|Guest Keepsake|Interactive", "title": "string", "description": "detailed actionable description", "estimatedCostTier": "$|$|$$$", "difficulty": "Easy|Moderate|Advanced" }
  ]
}`;

        const raw = await callGemini(apiKey, prompt, { jsonMode: true });
        const parsed = safeJSONParse(raw, null);
        if (parsed && Array.isArray(parsed.ideas)) {
          return parsed.ideas;
        }
      } catch (err) {
        console.warn('Gemini ideas generator failed, using heuristic engine:', err);
      }
    }

    return this.generateHeuristicIdeas(params);
  }

  /**
   * Conversational Copilot Assistant
   * @param {string} question
   * @param {object} [eventContext]
   * @returns {Promise<string>}
   */
  async askCopilot(question, eventContext = null) {
    const apiKey = this.store.getApiKey();

    if (apiKey) {
      try {
        let systemPrompt = `You are PlanAura Copilot, an elite, warm, highly practical GenAI event planner.
Provide direct, inspiring, actionable advice. Use markdown bullet points and short punchy paragraphs.
Never be vague. Provide actual examples, timeline numbers, or creative specifics.`;

        if (eventContext) {
          systemPrompt += `\nActive Event Context:
- Event: "${eventContext.title}" (${eventContext.type})
- Date: ${eventContext.date || 'Upcoming'}
- Expected Guests: ${eventContext.guestCount || 80}
- Total Budget: ${eventContext.currency || '$'}${eventContext.totalBudget || 15000}
- Aesthetic Vibe: "${eventContext.vibe || 'Curated & Memorable'}"
- Location: ${eventContext.location || 'TBD'}`;
        }

        const prompt = `${systemPrompt}\n\nUser Question: ${question}\n\nAnswer:`;
        const raw = await callGemini(apiKey, prompt, { jsonMode: false, temperature: 0.7 });
        if (raw && raw.trim().length > 0) {
          return raw.trim();
        }
      } catch (err) {
        console.warn('Gemini Copilot chat error, using heuristic fallback:', err);
      }
    }

    return this.generateHeuristicChatAnswer(question, eventContext);
  }

  /**
   * GenAI Accessibility & Well-Being Audit
   * @param {object} event
   * @returns {Promise<object>}
   */
  async auditAccessibility(event) {
    const apiKey = this.store.getApiKey();

    if (apiKey) {
      try {
        const prompt = `You are an elite Accessibility, Diversity & Guest Care Director for live events.
Conduct an exhaustive accessibility and inclusion audit for this event:
- Title: "${event.title}"
- Type: ${event.type}
- Guest Count: ${event.guestCount}
- Location: ${event.location || 'Indoor / Outdoor Venue'}
- Vibe: "${event.vibe || ''}"

Provide an authoritative compliance and hospitality audit in STRICT JSON format:
{
  "score": 96,
  "summary": "One sentence evaluation of accessibility readiness",
  "pillars": [
    { "title": "Physical Mobility & ADA", "recommendations": ["Recommendation 1", "Recommendation 2"] },
    { "title": "Dietary & Allergen Safeguards", "recommendations": ["Recommendation 1", "Recommendation 2"] },
    { "title": "Sensory & Neurodivergent Comfort", "recommendations": ["Recommendation 1", "Recommendation 2"] },
    { "title": "Emergency Evacuation & Safety", "recommendations": ["Recommendation 1", "Recommendation 2"] }
  ],
  "proactiveActionItem": { "title": "Suggested requirement to add", "notes": "Operational notes for staff" }
}`;

        const raw = await callGemini(apiKey, prompt, { jsonMode: true, temperature: 0.4 });
        const parsed = safeJSONParse(raw, null);
        if (parsed && Array.isArray(parsed.pillars)) {
          return parsed;
        }
      } catch (err) {
        console.warn('Gemini Accessibility audit failed, using heuristic fallback:', err);
      }
    }

    return this.generateHeuristicAccessibilityAudit(event);
  }

  // ==========================================
  // EXPERT HEURISTIC ENGINE (100% OFFLINE / RESILIENT)
  // ==========================================

  generateHeuristicBlueprint(params) {
    const { title, type = 'wedding', totalBudget = 15000, guestCount = 80, vibe = '' } = params;
    const budget = Number(totalBudget) || 15000;
    const guests = Number(guestCount) || 80;

    if (type === 'wedding') {
      return {
        recommendedColorPalette: ['#3A506B', '#5BC0BE', '#F3F4F6', '#DDA7A5', '#1C2541'],
        budgetItems: [
          { id: generateId('b'), category: 'Venue', name: 'Ceremony & Reception Space Rental', estimatedCost: Math.round(budget * 0.28), notes: 'Includes tables, chairs & setup' },
          { id: generateId('b'), category: 'Catering', name: `Dinner & Open Bar for ${guests} Guests`, estimatedCost: Math.round(budget * 0.35), notes: 'Calculated at ~$65/guest food + bar' },
          { id: generateId('b'), category: 'Photography & Film', name: '8-Hour Professional Photo & Drone Video', estimatedCost: Math.round(budget * 0.12), notes: 'Dual photographer coverage & edited highlight reel' },
          { id: generateId('b'), category: 'Florals & Decor', name: 'Arbor Arch, Bouquets & Reception Centerpieces', estimatedCost: Math.round(budget * 0.09), notes: 'Seasonal sustainable stems & candles' },
          { id: generateId('b'), category: 'Music & Entertainment', name: 'Live Acoustic Duo & Reception DJ / MC', estimatedCost: Math.round(budget * 0.06), notes: 'Includes ceremony sound & dance lighting' },
          { id: generateId('b'), category: 'Attire & Beauty', name: 'Formal Attire, Accessories & Hair/Makeup', estimatedCost: Math.round(budget * 0.05), notes: 'Includes morning trial session' },
          { id: generateId('b'), category: 'Contingency Reserve', name: 'Emergency Contingency Fund (10%)', estimatedCost: Math.round(budget * 0.10), notes: 'Critical buffer for sudden weather or extra guests' }
        ],
        timeline: [
          { id: generateId('t'), phase: 'pre-event', time: '10:00', title: 'Hair, Makeup & VIP Getting Ready Suite', description: 'Morning breakfast and detail flat-lay photography', assignee: 'Bridal Party & Lead Stylist', completed: false },
          { id: generateId('t'), phase: 'pre-event', time: '13:30', title: 'First Look & Couple Portraits', description: 'Private moment before guests arrive for best natural light', assignee: 'Photographer', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '15:30', title: 'Guest Arrival & Welcome Music', description: 'Champagne / infused water and live acoustic preludes', assignee: 'Venue Coordinator', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '16:00', title: 'Wedding Ceremony Processional', description: 'Unplugged vows and ring exchange', assignee: 'Officiant', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '16:45', title: 'Cocktail Hour & Passed Hors d\'oeuvres', description: 'Lawn games, signature drinks, family portraits', assignee: 'Catering Captain', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '18:15', title: 'Grand Entrance & Plated Dinner', description: 'Toast by Best Man, Maid of Honor, and Hosts', assignee: 'DJ / MC', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '20:00', title: 'First Dance & Dance Floor Celebration', description: 'Cake cutting and dessert bar opens', assignee: 'DJ & Band', completed: false },
          { id: generateId('t'), phase: 'post-event', time: '23:00', title: 'Sparkler Grand Exit & Shuttle Dispatch', description: 'Safe guest transportation departures', assignee: 'Logistics Coordinator', completed: false }
        ],
        vendors: [
          { id: generateId('v'), name: 'Heritage Conservatory Estate', category: 'Venue', notes: 'Capacity for up to 180 guests. Sound curfew 23:00.', backupPlan: 'Enclosed veranda with radiant heaters.' },
          { id: generateId('v'), name: 'Artisan Culinary Group', category: 'Catering', notes: 'Dietary tasting confirmed 60 days prior.', backupPlan: 'Emergency mobile kitchen refrigeration truck.' },
          { id: generateId('v'), name: 'Evergreen Lens Studios', category: 'Photography', notes: 'Dual memory card simultaneous redundancy.', backupPlan: 'Associate photographer on retainable standby.' }
        ],
        ideas: [
          { id: generateId('id'), category: 'Cocktails', title: 'Bespoke Dual Signature Cocktails', description: 'Two specialty cocktails tailored to the couple\'s love story with edible botanical garnish.' },
          { id: generateId('id'), category: 'Keepsake', title: 'Vinyl Record Guestbook', description: 'Have guests sign customized vinyl records featuring the couple\'s favorite music album art.' },
          { id: generateId('id'), category: 'Decor', title: 'Warm Candlelight Canopy', description: 'Cluster hundreds of varied height glass hurricane pillar candles around the sweetheart table.' }
        ],
        accessibilityNeeds: [
          { id: generateId('acc'), title: 'Level ADA Ramp Access to Ceremony Area', notes: 'Check that gravel path is firm and wheel-friendly.' },
          { id: generateId('acc'), title: 'Dietary Allergy Color-Coded Place Cards', notes: 'Notify catering captain of all peanut, gluten, and dairy restrictions.' }
        ]
      };
    } else if (type === 'birthday') {
      return {
        recommendedColorPalette: ['#111827', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B'],
        budgetItems: [
          { id: generateId('b'), category: 'Venue', name: 'Private Lounge / Rooftop / Loft Rental', estimatedCost: Math.round(budget * 0.32), notes: '4-6 hour private hire' },
          { id: generateId('b'), category: 'Catering & Bar', name: 'Gourmet Sliders, Finger Foods & Craft Bar Tab', estimatedCost: Math.round(budget * 0.38), notes: `Targeting ~$40-$50 per guest for ${guests} guests` },
          { id: generateId('b'), category: 'Entertainment & DJ', name: 'DJ Sound Rig & Party Lighting Package', estimatedCost: Math.round(budget * 0.14), notes: 'Interactive playlist integration' },
          { id: generateId('b'), category: 'Decor & Cake', name: 'Custom Showstopper Cake & Themed Balloon/Neon Arch', estimatedCost: Math.round(budget * 0.10), notes: 'Photo-worthy centerpiece' },
          { id: generateId('b'), category: 'Contingency Reserve', name: 'Buffer for Bar Overages & Tips', estimatedCost: Math.round(budget * 0.06), notes: 'Overtime and staff gratuities' }
        ],
        timeline: [
          { id: generateId('t'), phase: 'pre-event', time: '17:30', title: 'Decor, Lighting & DJ Sound Check', description: 'Test mics, photo booth backdrop, and cake setup', assignee: 'Event Host', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '19:30', title: 'Doors Open & Welcome Signature Shots/Punch', description: 'Upbeat cocktail playlist, appetizer trays circulating', assignee: 'Bartender', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '21:00', title: 'Interactive Birthday Game or Toast Video', description: 'Fun slideshow or trivia quiz about the birthday star', assignee: 'Best Friend / MC', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '22:00', title: 'Cake Cutting, Sparklers & Main Dance Set', description: 'DJ drops peak party anthems with laser / haze effects', assignee: 'DJ', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '00:30', title: 'Wrap-up & Late-Night Snack Handout', description: 'Warm cookies or mini sliders for guests heading home', assignee: 'Coordinator', completed: false }
        ],
        vendors: [
          { id: generateId('v'), name: 'Skyline Terrace Loft', category: 'Venue', notes: 'Sound permitted until 01:00.', backupPlan: 'Covered indoor mezzanine.' },
          { id: generateId('v'), name: 'Rhythm & Beats Audio', category: 'DJ & Sound', notes: 'Providing custom lighting and wireless mic.', backupPlan: 'Pre-mixed backup playlist on dedicated iPad.' }
        ],
        ideas: [
          { id: generateId('id'), category: 'Entertainment', title: 'Interactive Retro Polaroid Photo Wall', description: 'Pegboard where guests snap instant photos, clip them with mini clothespins, and write birthday wishes.' },
          { id: generateId('id'), category: 'Cocktails', title: 'Age-Themed Specialty Cocktail', description: 'A custom cocktail named after the celebrant\'s milestone year with edible shimmer dust.' }
        ],
        accessibilityNeeds: [
          { id: generateId('acc'), title: 'Comfortable Seating Zone Away from Main Speakers', notes: 'Provide comfortable seating for older relatives or sound-sensitive guests.' }
        ]
      };
    } else {
      // Community Festival / Charity / 5K
      return {
        recommendedColorPalette: ['#1E3A8A', '#059669', '#F59E0B', '#DC2626', '#F3F4F6'],
        budgetItems: [
          { id: generateId('b'), category: 'Permits & City Logistics', name: 'Municipal Parks Permit, Police Traffic & Sanitation', estimatedCost: Math.round(budget * 0.25), notes: 'City inspections, dumpster drop, portable restrooms' },
          { id: generateId('b'), category: 'Staging & Audio', name: 'Covered Stage, Sound PA & Generator Power', estimatedCost: Math.round(budget * 0.25), notes: 'Two silent run generators + cable ramps' },
          { id: generateId('b'), category: 'Marketing & Signage', name: 'Street Banners, Flyers, Wayfinding & Volunteer T-shirts', estimatedCost: Math.round(budget * 0.15), notes: 'Directional signage and sponsor logos' },
          { id: generateId('b'), category: 'Safety & Volunteer Hospitality', name: 'First Aid Tent, Hydration Stations & Staff Meals', estimatedCost: Math.round(budget * 0.15), notes: 'Two registered nurses and emergency supplies' },
          { id: generateId('b'), category: 'Contingency Reserve', name: 'Weather Tents & Emergency Standby', estimatedCost: Math.round(budget * 0.20), notes: 'Rain date protection and equipment security' }
        ],
        timeline: [
          { id: generateId('t'), phase: 'pre-event', time: '06:00', title: 'Logistics Load-in & Street Closure Barriers', description: 'Place traffic cones, safety barriers, and deploy sanitation units', assignee: 'Logistics Director', completed: false },
          { id: generateId('t'), phase: 'pre-event', time: '08:00', title: 'Vendor & Food Truck Check-in', description: 'Verify health permits and electrical cords', assignee: 'Vendor Coordinator', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '10:00', title: 'Festival Gates Open & Opening Ceremony', description: 'Welcome address by community leaders and marching band', assignee: 'Stage MC', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '12:30', title: 'Midday Family Performances & Contests', description: 'Local dance academy, pie-eating contest, kids crafts', assignee: 'Activities Lead', completed: false },
          { id: generateId('t'), phase: 'day-of', time: '17:00', title: 'Main Headline Concert & Raffle Drawing', description: 'Community band performance and silent auction winner announcements', assignee: 'Stage Manager', completed: false },
          { id: generateId('t'), phase: 'post-event', time: '18:30', title: 'Event Wrap, Waste Triage & Street Reopening', description: 'Volunteer clean-up sweep and trash pack-out', assignee: 'Clean Team Lead', completed: false }
        ],
        vendors: [
          { id: generateId('v'), name: 'Metro Stage & Sound Co.', category: 'AV & Staging', notes: 'Delivers 20x16 covered mobile stage.', backupPlan: 'Indoor community center gymnasium holds overflow.' },
          { id: generateId('v'), name: 'CleanCity Portable Sanitation', category: 'Logistics', notes: 'Providing 10 standard + 3 wheelchair-accessible ADA units.', backupPlan: 'Emergency service pump truck on call.' }
        ],
        ideas: [
          { id: generateId('id'), category: 'Community', title: 'Interactive Community "Dream City" Art Wall', description: 'A 20-foot banner where kids and adults paint their vision for neighborhood parks.' },
          { id: generateId('id'), category: 'Eco', title: 'Zero Waste Compost & Hydration Station', description: 'Eliminate single-use plastic by giving branded refillable cups with local filtered spring water.' }
        ],
        accessibilityNeeds: [
          { id: generateId('acc'), title: 'Paved Wheelchair Pathways to All Booths', notes: 'Ensure no cable ramps or tents block wheelchair access.' },
          { id: generateId('acc'), title: 'ASL Interpreters for All Stage Announcements', notes: 'Coordinate stage lighting so interpreter is clearly visible.' },
          { id: generateId('acc'), title: 'Designated Low-Stimulation Quiet Area', notes: 'A shaded tent with chairs away from the main sound stage for sensory relief.' }
        ]
      };
    }
  }

  generateHeuristicCrisisSolution(params) {
    const { problem = '', eventType = 'wedding' } = params;
    const lower = problem.toLowerCase();

    if (lower.includes('rain') || lower.includes('weather') || lower.includes('storm')) {
      return {
        summary: 'Emergency Weather Pivot: Immediate transition to sheltered canopy/indoor layout with electrical isolation.',
        severity: 'High',
        immediateActions: [
          'Order immediate transfer of all vulnerable outdoor audio equipment and electrical cables into dry shelters.',
          'Reroute guest arrival to covered entrance walkway and deploy canopy umbrellas.',
          'Instruct venue staff to wipe down indoor banquet floors and distribute non-slip entrance mats.',
          'Shift cocktail hour and ceremony into pre-designated secondary covered atrium or tent.',
          'Coordinate with photo/video team to utilize covered porticos and indoor panoramic windows for portrait sessions.'
        ],
        contingencySteps: [
          'Verify HVAC and dehumidifiers are running in the backup room to handle increased guest humidity.',
          'Check with catering to ensure warming chafing dishes are shielded from gusts.',
          'Adjust timeline by 15-20 minutes if arrival traffic was slowed down by regional storms.'
        ],
        communicationScript: '"Attention honored guests: To keep everyone cozy, dry, and celebrating in comfort, we are smoothly shifting our festivities into the Grand Pavilion. Please follow our hospitality team through the covered terrace for welcome drinks!"',
        preventativeAdvice: [
          'Always secure a rain plan contract clause with guaranteed 3-hour indoor turnaround.',
          'Keep 50+ matching clear golf umbrellas stored on-site for any outdoor event.'
        ]
      };
    } else if (lower.includes('cater') || lower.includes('food') || lower.includes('chef')) {
      return {
        summary: 'Emergency Food Service Recovery: Fast-track replacement via commercial commissary partner and luxury grazing stations.',
        severity: 'Critical',
        immediateActions: [
          'Contact top 3 pre-vetted local high-volume restaurant catering partners for rapid hot-drop delivery.',
          'Extend cocktail hour by 30 minutes with double-passed charcuterie, artisan breads, dips, and gourmet appetizers.',
          'Brief service captains to keep wine, craft mocktails, and water flowing smoothly to keep guests delighted.',
          'Verify venue has commercial warming ovens and refrigeration ready for emergency food drop.',
          'Document all timestamps and cancel notices for immediate vendor deposit insurance claim.'
        ],
        contingencySteps: [
          'Switch formal plated 3-course service to an elegant, high-energy gourmet family-style or grazing buffet.',
          'Notify dietary restriction guests privately that their custom meals are being securely prioritized.',
          'Have DJ or musicians perform a high-energy transition set during the extended social hour.'
        ],
        communicationScript: '"Friends, while our culinary team is putting the finishing gourmet touches on dinner, please enjoy an extra round of signature cocktails and our chef\'s special artisan hors d\'oeuvres!"',
        preventativeAdvice: [
          'Never hire a caterer without confirming a backup commercial commissary or sister kitchen network.',
          'Include a liquidated damages clause in catering contracts for failure to deliver.'
        ]
      };
    } else if (lower.includes('dj') || lower.includes('music') || lower.includes('sound') || lower.includes('audio') || lower.includes('mic')) {
      return {
        summary: 'AV Sound Recovery: Instant switch to backup battery PA, offline acoustic redundancy, and tablet master mix.',
        severity: 'High',
        immediateActions: [
          'Power cycle audio interface and switch mixer input immediately to direct auxiliary cable on emergency tablet/phone.',
          'Deploy portable battery-powered stage monitor speaker (e.g. Bose S1 / JBL EON) to the stage center.',
          'Switch MC to hardwired XLR microphone instead of wireless RF channel to bypass frequency interference.',
          'Have master wedding party or host project acoustically with natural presence in an intimate circle if needed.',
          'If DJ fails to appear, launch pre-curated offline Spotify/Apple Music 320kbps lossless wedding reception playlist.'
        ],
        contingencySteps: [
          'Assign an AV-savvy wedding party member or volunteer to monitor volume levels.',
          'Re-test microphone batteries (always carry fresh 9V and AA Procell batteries in emergency kit).'
        ],
        communicationScript: '"We love an intimate unplugged moment! While we give our sound crew 60 seconds to switch channels, let\'s give a massive cheer for our stars of the evening!"',
        preventativeAdvice: [
          'Require DJ/Band contracts to specify secondary on-site backup amplifier and dual mixer.',
          'Always download a 6-hour offline event playlist on a dedicated device in airplane mode.'
        ]
      };
    } else {
      // General Emergency Problem Solver
      return {
        summary: `Rapid Event Triage: Systematic containment, delegation, and guest-first communication protocol for ${eventType}.`,
        severity: 'Medium',
        immediateActions: [
          `Assess direct impact on guest safety, comfort, and schedule; assign 1 dedicated lead to solve "${problem}".`,
          'Protect the guest experience: Keep entertainment, beverages, or socializing flowing so guests remain completely relaxed.',
          'Consult vendor contracts and backup vendor contact roster stored in AuraPlan.',
          'If monetary overage is required to solve the issue, deploy funds from the 10-15% Contingency Reserve.',
          'Update key stakeholders (officiant, MC, catering captain) via whisper or two-way radio without causing public alarm.'
        ],
        contingencySteps: [
          'Document incident details and receipts for post-event insurance or vendor reconciliation.',
          'Adjust run-of-show timestamps by 10-15 minutes if timeline compression is needed.'
        ],
        communicationScript: '"Thank you everyone for your wonderful energy! We are making a brief 10-minute adjustment to our flow to make this evening even more memorable. Grab a drink and enjoy the music!"',
        preventativeAdvice: [
          'Maintain a designated Day-Of Emergency Kit with extra adapters, gaff tape, first aid, and vendor rosters.',
          'Always rehearse transition cues with the venue manager 48 hours prior to start.'
        ]
      };
    }
  }

  generateHeuristicBudgetOptimization(params) {
    const { totalBudget = 15000, effectiveSpend = 16000, budgetItems = [] } = params;
    const overspend = Math.max(0, effectiveSpend - totalBudget);

    return {
      overallVerdict: overspend > 0
        ? `Currently running ${overspend > 0 ? '$' + overspend + ' over target budget' : 'on track'}. Tactical adjustments can reclaim 12-18% immediately.`
        : 'Budget is within healthy guardrails. Optimization will unlock extra contingency savings.',
      recommendedCuts: [
        {
          category: 'Florals & Decor',
          item: 'Floral Installations & Tall Centerpieces',
          strategy: 'Substitute high-cost imported floral stems with lush seasonal greenery, eucalyptus, and clustered romantic hurricane pillar candles. Rental candles cost 70% less than floral blooms.',
          estimatedSavings: Math.round(totalBudget * 0.04)
        },
        {
          category: 'Bar & Beverage',
          item: 'Full Premium Spirits Open Bar',
          strategy: 'Transition from full 5-hour unlimited hard spirits to a high-end "Signature Cocktails (2 custom recipes) + Curated Wine & Craft Beer" package. Guests love custom drinks and it reduces distributor markup by ~25%.',
          estimatedSavings: Math.round(totalBudget * 0.05)
        },
        {
          category: 'Print & Stationery',
          item: 'Paper Menus, Programs & Physical Signage',
          strategy: 'Replace individual paper printed menus and bulky programs with elegant mirrored or acrylic chalkboard signage at table entrances and digital QR live schedules.',
          estimatedSavings: Math.round(totalBudget * 0.02)
        },
        {
          category: 'Late Night Extras',
          item: 'Secondary Food Trucks / Overtime Hours',
          strategy: 'Pre-package late night snack boxes directly with current caterer (e.g. gourmet slider sliders or warm donuts) rather than hiring separate food truck minimums.',
          estimatedSavings: Math.round(totalBudget * 0.03)
        }
      ],
      vendorNegotiationTips: [
        'Ask vendors for "off-peak payment discount" (2-5% cash or early ACH settlement reduction).',
        'Bundle audio, lighting, and DJ under a single production vendor to eliminate redundant delivery and tech setup fees.',
        'Supply your own alcohol with a modest venue corkage fee if your venue permits outside licensed distribution.'
      ],
      projectedNewTotal: Math.round(effectiveSpend * 0.88)
    };
  }

  generateHeuristicIdeas(params) {
    const { eventType = 'wedding', vibe = '' } = params;

    if (eventType === 'wedding') {
      return [
        {
          category: 'Interactive Experience',
          title: 'Retro Audio Guestbook Telephone',
          description: 'A refurbished 1960s rotary phone where guests lift the receiver, hear a personalized recorded greeting from the couple, and record hilarious and emotional voice memos throughout the night.',
          estimatedCostTier: '$$',
          difficulty: 'Easy'
        },
        {
          category: 'Cocktails & Dining',
          title: 'Living Herbal Garnish Cocktail Station',
          description: 'A rustic wooden cart with living potted rosemary, mint, basil, and dehydrated citrus slices where guests customize their artisan gin or mocktail sprigs with golden tweezers.',
          estimatedCostTier: '$',
          difficulty: 'Easy'
        },
        {
          category: 'Decor & Vibe',
          title: 'Suspended Fairy Light & Greenery Cloud',
          description: 'Delicate fairy lights woven through suspended dried baby\'s breath and silver dollar eucalyptus directly above the dance floor, creating an enchanted starlight canopy effect.',
          estimatedCostTier: '$$$',
          difficulty: 'Moderate'
        },
        {
          category: 'Guest Keepsake',
          title: 'Custom Screen-Printed Tote Bags with Local Map',
          description: 'Eco-friendly organic canvas welcome totes printed with an illustrated watercolor map of the couple\'s favorite weekend coffee shops, parks, and pastry spots.',
          estimatedCostTier: '$$',
          difficulty: 'Moderate'
        }
      ];
    } else if (eventType === 'birthday') {
      return [
        {
          category: 'Entertainment',
          title: 'Curated Milestone Video Roast & Toast Reel',
          description: 'A cinematic 4-minute montage edited with childhood clips, video messages from friends across the world who could not attend, and funny bloopers shown on a portable projector.',
          estimatedCostTier: '$',
          difficulty: 'Easy'
        },
        {
          category: 'Interactive',
          title: 'Custom Neon Slogan & Photo Oasis',
          description: 'A bespoke neon sign featuring the birthday celebrant\'s favorite life motto mounted on a hedge wall or shimmering fringe curtain with instant cameras for guests.',
          estimatedCostTier: '$$',
          difficulty: 'Easy'
        },
        {
          category: 'Dining & Dessert',
          title: 'Midnight Gourmet Fry & Slider Flight',
          description: 'Surprise the dance floor at 23:30 with mini paper cones of truffle parmesan fries, waffle fries, and sliders served hot on silver platters.',
          estimatedCostTier: '$$',
          difficulty: 'Moderate'
        },
        {
          category: 'Music & Vibe',
          title: 'Crowdsourced Live Song Request QR Code',
          description: 'Place mini wooden cards on tables with a QR code linked to a shared collaborative queue where guests vote on the final hour dance tunes.',
          estimatedCostTier: '$',
          difficulty: 'Easy'
        }
      ];
    } else {
      // Community Festival
      return [
        {
          category: 'Community Engagement',
          title: 'Giant Interactive Neighborhood String Map',
          description: 'A huge wooden silhouette map of the town with colored yarn reels where residents connect pins showing where they grew up, went to school, and met their partners.',
          estimatedCostTier: '$',
          difficulty: 'Easy'
        },
        {
          category: 'Sustainability',
          title: 'Commemorative Stainless Steel Cup & Refill Stations',
          description: 'Eliminate single-use plastics completely by partnering with local craft breweries and beverage vendors to offer $5 reusable festival cups with free water refill taps.',
          estimatedCostTier: '$$',
          difficulty: 'Moderate'
        },
        {
          category: 'Kids & Family',
          title: 'Pop-Up Musical Instrument Petting Zoo',
          description: 'An interactive pavilion partnered with local music schools where kids and adults can try violins, djembes, ukuleles, and electronic synthesizers guided by music mentors.',
          estimatedCostTier: '$',
          difficulty: 'Easy'
        },
        {
          category: 'Inclusion',
          title: 'Sensory Relief & Quiet Reflection Pavilion',
          description: 'A dedicated canopy equipped with soft seating, noise-dampening earmuffs, weighted lap pads, and calming tactile sensory toys for neurodivergent attendees.',
          estimatedCostTier: '$',
          difficulty: 'Easy'
        }
      ];
    }
  }

  normalizeBlueprint(parsed, targetBudget) {
    return {
      recommendedColorPalette: Array.isArray(parsed.recommendedColorPalette) ? parsed.recommendedColorPalette : ['#2563EB', '#38BDF8', '#F1F5F9'],
      budgetItems: (parsed.budgetItems || []).map(b => ({
        id: generateId('b'),
        category: b.category || 'General',
        name: b.name || 'Expense',
        estimatedCost: Number(b.estimatedCost) || Math.round(targetBudget * 0.1),
        actualCost: 0,
        paidCost: 0,
        status: 'pending',
        notes: b.notes || ''
      })),
      timeline: (parsed.timeline || []).map(t => ({
        id: generateId('t'),
        phase: t.phase || 'day-of',
        time: t.time || '12:00',
        title: t.title || 'Milestone',
        description: t.description || '',
        assignee: t.assignee || 'Team Lead',
        completed: false
      })),
      vendors: (parsed.vendors || []).map(v => ({
        id: generateId('v'),
        name: v.name || 'Vendor',
        category: v.category || 'General',
        notes: v.notes || '',
        backupPlan: v.backupPlan || '',
        status: 'researching',
        contractSigned: false,
        insuranceVerified: false
      })),
      ideas: (parsed.ideas || []).map(i => ({
        id: generateId('id'),
        category: i.category || 'Theme',
        title: i.title || 'Idea',
        description: i.description || ''
      })),
      accessibilityNeeds: (parsed.accessibilityNeeds || []).map(a => ({
        id: generateId('acc'),
        title: a.title || 'Accessibility Need',
        status: 'in-progress',
        notes: a.notes || ''
      }))
    };
  }

  generateHeuristicChatAnswer(question, eventContext) {
    const q = (question || '').toLowerCase();
    const eventType = eventContext?.type || 'event';
    const title = eventContext?.title || 'your gathering';

    if (q.includes('timeline') || q.includes('schedule') || q.includes('hour')) {
      return `### Recommended Flow of Events for ${eventContext?.title || 'Your Event'}\n\nHere is an optimized, crowd-pleasing run-of-show:\n\n- **T-0:00 (Arrival & Preludes):** Welcome station open, signature drinks or infused mocktails served, ambient background music at 65dB.\n- **T+0:45 (Main Feature / Ceremony):** Transition guests to focal seating. Program kicks off with focused attention.\n- **T+1:30 (Dinner / Food & Socializing):** Food stations or plated service begins. Keeps lines moving within 20 minutes.\n- **T+2:30 (Celebrations & Toasts):** Spotlight remarks and interactive program moments.\n- **T+3:00 to Finish (Dancing & High Energy):** Floor open with dynamic party transitions.`;
    }

    if (q.includes('cocktail') || q.includes('drink') || q.includes('food') || q.includes('menu')) {
      return `### Curated Food & Beverage Concepts for ${title}\n\nHere are 3 distinct, high-impact options:\n\n1. **The Signature Dual Concept:** Pair an elevated cocktail (e.g. Lavender Botanical Gin & Tonic) with an artisanal zero-proof mocktail (Blood Orange Sparkling Rosemary Smash) so all guests feel equally celebrated.\n2. **Passed Petite Pairings:** Miniature gourmet street bites (truffle sliders, ahi tuna crisps) paired with mini craft beer or cider samplers.\n3. **Late-Night Snack Surprise:** 45 minutes before departure, roll out fresh warm churros with spiced chocolate or artisan wood-fired flatbreads.`;
    }

    if (q.includes('budget') || q.includes('cost') || q.includes('save') || q.includes('money')) {
      return `### Tactical Budget Optimization for ${title}\n\n- **Target 10% Emergency Contingency:** Ensure you protect a dedicated rainy-day fund so unexpected vendor overtime doesn't derail finances.\n- **Vendor Bundle Negotiation:** Ask your photo/video or DJ/lighting vendors for combined single-contract bundling for 10-15% discount.\n- **Repurposing Florals & Decor:** Move ceremony arches or focal installations to behind the dessert table or sweetheart table during the reception transition.`;
    }

    return `### Strategic Event Planning Recommendation\n\nFor **${title}** (${eventType}), here are the essential action items:\n\n- **Guest Comfort Priority:** Keep high-traffic walkways at least 36-48 inches wide, provide clear hydration stations, and ensure seating is available for at least 85% of guests.\n- **Vendor Alignment:** Confirm vendor insurance (COI) and load-in timing 14 days before the event.\n- **Audio-Visual Balance:** Test microphones and acoustics 90 minutes before doors open, and maintain designated quiet conversational zones away from main speakers.`;
  }

  generateHeuristicAccessibilityAudit(event) {
    const type = event?.type || 'wedding';
    const count = event?.guestCount || 80;

    return {
      score: 95,
      summary: `High accessibility readiness for ${event?.title || 'your event'}. Physical paths, allergen controls, and quiet zones are well-mapped.`,
      pillars: [
        {
          title: 'Physical Mobility & ADA Circulation',
          recommendations: [
            'Maintain at least 36-inch clear pathways between all dining tables and outdoor transitions.',
            'Ensure all steps or elevation changes have ramps with maximum 1:12 slope and sturdy dual handrails.',
            'Reserve dedicated front-row seating zones with clear sightlines for wheelchair users and companions.'
          ]
        },
        {
          title: 'Dietary & Severe Allergen Protection',
          recommendations: [
            'Demand strict cross-contamination segregation in the catering prep area for peanut, tree nut, and celiac safety.',
            'Label all buffet food items clearly with prominent FDA Top-9 allergen identification tags.',
            'Ensure banquet captain personally checks in with guests who RSVP’d with life-threatening allergies.'
          ]
        },
        {
          title: 'Sensory & Neurodivergent Inclusion',
          recommendations: [
            'Designate a low-stimulation quiet room away from loud subwoofers with dim warm lighting and seating.',
            'Avoid sudden strobe effects or haze without advance announcements for photosensitive attendees.'
          ]
        },
        {
          title: 'Emergency Evacuation & First Aid',
          recommendations: [
            `For ${count} guests, ensure primary and secondary emergency exits are fully unlocked and well-illuminated.`,
            'Ensure lead venue coordinator has a fully stocked first aid kit and accessible AED defibrillator on site.'
          ]
        }
      ],
      proactiveActionItem: {
        title: 'Sensory Comfort & Dimmable Quiet Zone',
        notes: 'Designate a clearly marked quiet space stocked with water and soft seating away from main dance floor.'
      }
    };
  }
}
