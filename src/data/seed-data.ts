export interface Camper {
  id: number;
  name: string;
  membership: boolean;
  campFeePaid: boolean;
  email: string;
  phone: string;
  dietary: string;
  allergies: string;
  transport: string;
  spacingAdded: boolean;
  attendance: Record<string, 'confirmed' | 'maybe' | 'no'>;
}

export interface Shift {
  id: string;
  category: 'LNT' | 'Breakfast' | 'Dinner' | 'Pre-Dinner';
  name: string;
  days: Record<string, string[]>;
  points: number;
  slots: number | null;
  notes: string;
}

export interface SpacingEntry {
  who: string;
  size: string;
  type: string;
  notes: string;
}

export interface KitchenItem {
  item: string;
  size: string;
  provider: string;
  bringer: string;
  notes: string;
  confirmed: boolean;
}

export interface CamperPoints {
  name: string;
  total: number;
  onePoint: number;
  twoPoint: number;
  threePoint: number;
  additional: number;
  reason: string;
}

export interface CampRules {
  minPoints: number;
  minPointsNoBuildStrike: number;
  buildStrikeBonus: number;
  leadRoleBonus: number;
  friSatDinnerBonus: number;
}

export const campName = "Low Effort Leftovers";
export const eventName = "Borderland 2026";
export const dates = {
  buildStart: "2026-08-15",
  eventStart: "2026-08-20",
  strikeEnd: "2026-08-27",
};

export const dayLabels = [
  { key: "Wed15", label: "Wed 15", phase: "build" },
  { key: "Thu16", label: "Thu 16", phase: "build" },
  { key: "Fri17", label: "Fri 17", phase: "build" },
  { key: "Sat18", label: "Sat 18", phase: "build" },
  { key: "Sun19", label: "Sun 19", phase: "build" },
  { key: "Mon20", label: "Mon 20", phase: "event" },
  { key: "Tue21", label: "Tue 21", phase: "event" },
  { key: "Wed22", label: "Wed 22", phase: "event" },
  { key: "Thu23", label: "Thu 23", phase: "event" },
  { key: "Fri24", label: "Fri 24", phase: "event" },
  { key: "Sat25", label: "Sat 25", phase: "event" },
  { key: "Sun26", label: "Sun 26", phase: "event" },
  { key: "Mon27", label: "Mon 27", phase: "strike" },
];

export const shiftDayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const rules: CampRules = {
  minPoints: 3,
  minPointsNoBuildStrike: 5,
  buildStrikeBonus: 4,
  leadRoleBonus: 3,
  friSatDinnerBonus: 2,
};

export const initialCampers: Camper[] = [
  { id: 1, name: "Fredrik Fl\u00f8gstad", membership: true, campFeePaid: false, email: "fredrik.flogstad@gmail.com", phone: "97540823", dietary: "", allergies: "", transport: "WV Golf", spacingAdded: true, attendance: { Wed15: "maybe", Thu16: "maybe", Fri17: "maybe", Sat18: "confirmed", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 2, name: "Lise Heng", membership: true, campFeePaid: false, email: "liseheng1986@gmail.com", phone: "", dietary: "", allergies: "", transport: "VW Golf", spacingAdded: true, attendance: { Wed15: "maybe", Thu16: "maybe", Fri17: "maybe", Sat18: "confirmed", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 3, name: "Hampus Bremberg", membership: true, campFeePaid: false, email: "chbremberg@gmail.com", phone: "", dietary: "", allergies: "", transport: "", spacingAdded: false, attendance: { Wed15: "confirmed", Thu16: "confirmed", Fri17: "confirmed", Sat18: "confirmed", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 4, name: "Nino Hadzad", membership: true, campFeePaid: false, email: "Nino81@gmail.com", phone: "41046963", dietary: "", allergies: "", transport: "Need a ride", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "maybe", Sat18: "confirmed", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 5, name: "Ralph Zeller", membership: true, campFeePaid: false, email: "Ralph.jo.zeller@gmail.com", phone: "46937450", dietary: "", allergies: "No raw onions", transport: "RV", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "confirmed", Sat18: "confirmed", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "confirmed" } },
  { id: 6, name: "Linn Zeller", membership: true, campFeePaid: false, email: "Linn.norendal@gmail.com", phone: "98634830", dietary: "", allergies: "", transport: "RV", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "maybe", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 7, name: "Erling Rosted Furseth", membership: true, campFeePaid: false, email: "Mr.fargerik@gmail.com", phone: "41007804", dietary: "", allergies: "", transport: "Toyota hiace", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "maybe", Sat18: "maybe", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 8, name: "Romy Boettger", membership: true, campFeePaid: false, email: "romyboettger@hotmail.com", phone: "46295400", dietary: "pescetarian", allergies: "no raw celery", transport: "", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "maybe", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 9, name: "Miriam Odden", membership: true, campFeePaid: false, email: "oddenmiriam@gmail.com", phone: "93682437", dietary: "", allergies: "Gluten", transport: "Anybody want to rent a car?", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 10, name: "Erik Seglem B\u00f8", membership: true, campFeePaid: false, email: "seglembo@gmail.com", phone: "47365415", dietary: "", allergies: "", transport: "Anybody want to rent a car?", spacingAdded: true, attendance: { Wed15: "maybe", Thu16: "maybe", Fri17: "maybe", Sat18: "confirmed", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 11, name: "Tomas Ainasoja", membership: true, campFeePaid: false, email: "tomai@tuta.com", phone: "93277041", dietary: "", allergies: "", transport: "Some van from Getaround", spacingAdded: true, attendance: { Wed15: "no", Thu16: "maybe", Fri17: "maybe", Sat18: "confirmed", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 12, name: "Carlotta Vollmar", membership: true, campFeePaid: false, email: "Voll.charly@gmx.de", phone: "92533932", dietary: "", allergies: "No raw onions, garlic", transport: "Some van from Getaround", spacingAdded: true, attendance: { Wed15: "no", Thu16: "maybe", Fri17: "maybe", Sat18: "confirmed", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 13, name: "AB", membership: true, campFeePaid: false, email: "Ablothe@gmail.com", phone: "93844839", dietary: "", allergies: "Nuts and fish", transport: "Van or car?", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "confirmed", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 14, name: "Sigurd", membership: true, campFeePaid: false, email: "sigurd.bratberg@gmail.com", phone: "93020543", dietary: "", allergies: "Gluten", transport: "Harley Davidson Super Glide Sport", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "no", Mon20: "no", Tue21: "no", Wed22: "no", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 15, name: "J\u00f8rgen", membership: true, campFeePaid: false, email: "sundalryan@gmail.com", phone: "47620121", dietary: "", allergies: "", transport: "", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "no", Mon20: "no", Tue21: "no", Wed22: "no", Thu23: "no", Fri24: "no", Sat25: "no", Sun26: "no", Mon27: "no" } },
  { id: 16, name: "Katarina", membership: true, campFeePaid: false, email: "ck.bonnevie@gmail.com", phone: "92045930", dietary: "", allergies: "", transport: "", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "no", Mon20: "no", Tue21: "no", Wed22: "no", Thu23: "no", Fri24: "no", Sat25: "no", Sun26: "no", Mon27: "no" } },
  { id: 17, name: "Linda", membership: true, campFeePaid: false, email: "Wikenlinda@gmail.com", phone: "95990390", dietary: "", allergies: "", transport: "Rental car - Miriam, lets team up?", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 18, name: "Brad", membership: true, campFeePaid: false, email: "bradvearncombe@hotmail.com", phone: "+44 7939 672276", dietary: "vegetarian/ but ok to eat meat", allergies: "", transport: "fly Copenhagen then need rideshare", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "maybe", Sun19: "maybe", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "maybe" } },
  { id: 19, name: "Robin", membership: true, campFeePaid: false, email: "robin.sverd@gmail.com", phone: "93812345", dietary: "", allergies: "", transport: "Car", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 20, name: "Ania", membership: true, campFeePaid: false, email: "aniajohansen@gmail.com", phone: "93614894", dietary: "", allergies: "", transport: "Car", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 21, name: "Hilde Rognlien", membership: true, campFeePaid: false, email: "Hil.rogn@gmail.com", phone: "45209977", dietary: "Vegetarian/flex", allergies: "", transport: "Car, possibly rental", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 22, name: "Fredrik Pfeil", membership: true, campFeePaid: false, email: "Fredrik.pfeil@gmail.com", phone: "47845787", dietary: "Vegan", allergies: "", transport: "Car, possibly rental", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 23, name: "Rany", membership: true, campFeePaid: false, email: "ranytb@gmail.com", phone: "98866114", dietary: "", allergies: "", transport: "Car, possibly rental", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 24, name: "Anders Kose Nervold", membership: true, campFeePaid: false, email: "andersnervold@gmail.com", phone: "98479958", dietary: "", allergies: "", transport: "Car", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 25, name: "Ruben", membership: false, campFeePaid: false, email: "", phone: "", dietary: "", allergies: "", transport: "", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "no", Mon20: "no", Tue21: "no", Wed22: "no", Thu23: "no", Fri24: "no", Sat25: "no", Sun26: "no", Mon27: "no" } },
  { id: 26, name: "Kine", membership: true, campFeePaid: false, email: "smule84@hotmail.com", phone: "92281117", dietary: "", allergies: "", transport: "", spacingAdded: true, attendance: { Wed15: "no", Thu16: "no", Fri17: "no", Sat18: "no", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 27, name: "Henriette T. Osnes", membership: true, campFeePaid: false, email: "henosnes@gmail.com", phone: "41595597", dietary: "", allergies: "Milk protein", transport: "Van (camping another place like last time)", spacingAdded: false, attendance: { Wed15: "no", Thu16: "maybe", Fri17: "maybe", Sat18: "maybe", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
  { id: 28, name: "Fredrik Sundf\u00f8r", membership: true, campFeePaid: false, email: "fredriksundfoer@gmail.com", phone: "93882071", dietary: "", allergies: "", transport: "Van (camping another place like last time)", spacingAdded: false, attendance: { Wed15: "no", Thu16: "maybe", Fri17: "maybe", Sat18: "maybe", Sun19: "confirmed", Mon20: "confirmed", Tue21: "confirmed", Wed22: "confirmed", Thu23: "confirmed", Fri24: "confirmed", Sat25: "confirmed", Sun26: "confirmed", Mon27: "no" } },
];

export const initialShifts: Shift[] = [
  {
    id: "morning-cleanup",
    category: "LNT",
    name: "Morning Cleanup",
    days: { Monday: [], Tuesday: ["Erling"], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 1,
    slots: 6,
    notes: "Have a round on the kitchen and common area before 09.00 to make sure everything is at its place and is clean. This can also be done when coming back from a party early in the morning.",
  },
  {
    id: "garbage-1",
    category: "LNT",
    name: "Garbage Collector/organizer 1",
    days: { Monday: [], Tuesday: ["Erling"], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 1,
    slots: 6,
    notes: "Bring full bags to trash collection all days before noon. Make sure trash is being seperated properly/nothing is full/our camp isn't dirty as fuck",
  },
  {
    id: "garbage-2",
    category: "LNT",
    name: "Garbage Collector/organizer 2",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 1,
    slots: 6,
    notes: "",
  },
  {
    id: "water-1",
    category: "LNT",
    name: "Water run 1",
    days: { Monday: [], Tuesday: [], Wednesday: ["Erling"], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 1,
    slots: 6,
    notes: "All days before noon",
  },
  {
    id: "water-2",
    category: "LNT",
    name: "Water run 2",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 1,
    slots: 6,
    notes: "Fill all containers",
  },
  {
    id: "breakfast-1",
    category: "Breakfast",
    name: "Breakfast 1",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 2,
    slots: null,
    notes: "starts at 9, clean up at 12",
  },
  {
    id: "breakfast-2",
    category: "Breakfast",
    name: "Breakfast 2",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 2,
    slots: null,
    notes: "",
  },
  {
    id: "cleanup-1",
    category: "Breakfast",
    name: "Clean up 1",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 1,
    slots: null,
    notes: "The clean up shift starts around 11 a.m. keeps everything tidy, maybe help the breakfast shift. makes sure the kitchen is all clean and everything is picked up for dinner.",
  },
  {
    id: "cleanup-2",
    category: "Breakfast",
    name: "Clean up 2",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 1,
    slots: null,
    notes: "",
  },
  {
    id: "pre-dinner-1",
    category: "Pre-Dinner",
    name: "PRE-DINNER CLEAN 1",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 1,
    slots: 5,
    notes: "Make sure that the kitchen is ready to go for dinner shift",
  },
  {
    id: "pre-dinner-2",
    category: "Pre-Dinner",
    name: "PRE-DINNER CLEAN 2",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 1,
    slots: 5,
    notes: "",
  },
  {
    id: "chef-1",
    category: "Dinner",
    name: "CHEF 1",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: ["Erling"], Friday: [], Saturday: [], Sunday: [] },
    points: 2,
    slots: 10,
    notes: "You are responsible for planning one meal. You are responsible in coming up with the recipe and sorting out how much and what ingredients you need. We will do the shopping but you will be the lead for your meal. Friday and Saturday Dinner/Cleaning shifts are worth +1 points",
  },
  {
    id: "minion-1",
    category: "Dinner",
    name: "MINION 1",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: ["Erling"], Sunday: [] },
    points: 2,
    slots: 10,
    notes: "Do whatever the chefs tell you ;)",
  },
  {
    id: "minion-2",
    category: "Dinner",
    name: "MINION 2",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 2,
    slots: 10,
    notes: "Do whatever the chefs tell you ;)",
  },
  {
    id: "cleaner-1",
    category: "Dinner",
    name: "CLEANER 1",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 1,
    slots: 5,
    notes: "Tidy up after dinner",
  },
  {
    id: "cleaner-2",
    category: "Dinner",
    name: "CLEANER 2",
    days: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    points: 1,
    slots: 5,
    notes: "Each wash their own plate and cuttlery",
  },
];

export const initialSpacing: SpacingEntry[] = [
  { who: "Lise / Fredrik F", size: "2,6x4,6", type: "tent", notes: "" },
  { who: "Tomas / Carlotta", size: "3x6m", type: "tent", notes: "" },
  { who: "Linn/Ralph", size: "2.5m x 8m", type: "RV / Bobil", notes: "Vehicles need more space between it and other structures; 4m to each side" },
  { who: "Erling", size: "2 x 5,5", type: "Toyota hiace", notes: "Since I don't have a kitchen in my van. It can be treated as a tent or a car." },
  { who: "Brad", size: "2 x 3.25", type: "tent", notes: "" },
  { who: "AB", size: "2,6 by 4,6", type: "Tent", notes: "" },
  { who: "Romy", size: "5,5 x 5,5", type: "round tent", notes: "it depends on how far away from the Foxhole we will be. If close enough I won't need tent space" },
  { who: "Erik", size: "3.2x4.6", type: "tent", notes: "" },
  { who: "Miriam", size: "3 x 3", type: "Tipi", notes: "" },
  { who: "Hilde / Fredrik P", size: "3,3 m x 2,1 m", type: "Tent", notes: "" },
  { who: "Nino", size: "3.25 x3. 5", type: "", notes: "" },
  { who: "J\u00f8rgen / Katarina", size: "2.5m x 5.5m", type: "Tent", notes: "Is it too big?" },
];

export const initialKitchen: KitchenItem[] = [
  { item: "kitchen tent", size: "6x3", provider: "Fleur", bringer: "Tomas/Carlotta to, AB/Sigurd from", notes: "It is stored at Miriams place, Uelands Gate 10.", confirmed: false },
  { item: "trolley to collect water", size: "", provider: "Linda ?", bringer: "", notes: "needed, maybe we can borrow from Burn Library?", confirmed: false },
  { item: "chairs", size: "3", provider: "Ralph", bringer: "Erling has 3 chairs", notes: "", confirmed: false },
  { item: "chairs", size: "3", provider: "Romy", bringer: "", notes: "folding camping chairs, Condor may be able to bring, if not, pickup from marselis gate needed", confirmed: false },
  { item: "table", size: "1,5m x 1m", provider: "Fredrik/Lise", bringer: "", notes: "", confirmed: false },
  { item: "table", size: "1,5m x 1m", provider: "Romy", bringer: "", notes: "Condor may be able to bring, if not, pickup from marselis gate needed", confirmed: false },
  { item: "Stove", size: "1 small gas camping stove", provider: "Tomas/Carlotta", bringer: "", notes: "Tiny camping stove for boiling water", confirmed: false },
  { item: "stove", size: "1 rectangualr, takes regular gas cans", provider: "Romy", bringer: "", notes: "Condor may be able to bring, if not, pickup from marselis gate needed", confirmed: false },
  { item: "French press", size: "", provider: "Ralph", bringer: "", notes: "FUCK YEAH", confirmed: false },
  { item: "Water canisters", size: "2x 5l", provider: "Ralph", bringer: "", notes: "", confirmed: false },
  { item: "Water canister", size: "20L with a tap", provider: "Romy", bringer: "", notes: "Condor may be able to bring, if not, pickup from marselis gate needed", confirmed: false },
  { item: "Gas grill Weber", size: "1", provider: "Ralph", bringer: "", notes: "", confirmed: false },
  { item: "Toastie maker", size: "1", provider: "Romy", bringer: "", notes: "makes 2 toasties at the time", confirmed: false },
];

export const initialPoints: CamperPoints[] = [
  { name: "Erling", total: 7, onePoint: 3, twoPoint: 2, threePoint: 0, additional: 0, reason: "" },
];
