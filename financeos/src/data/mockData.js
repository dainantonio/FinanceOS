import { C } from "../constants/colors";
export const USER = { name:"Dain",netWorth:47820,cash:3240,score:74,monthlyIncome:8500 };
export const SPENDING = [
  { cat:"Housing",amount:1850,icon:"🏠",pct:38,color:C.blue },
  { cat:"Food",amount:620,icon:"🍽️",pct:13,color:C.green },
  { cat:"Transport",amount:310,icon:"🚗",pct:6,color:C.purple },
  { cat:"Entertainment",amount:185,icon:"🎬",pct:4,color:C.gold },
  { cat:"Subscriptions",amount:168,icon:"📱",pct:3,color:C.rose },
  { cat:"Shopping",amount:412,icon:"🛍️",pct:8,color:"#F97316" },
  { cat:"Giving",amount:850,icon:"🤲",pct:10,color:C.accent },
  { cat:"Savings",amount:800,icon:"💰",pct:16,color:"#06B6D4" },
];
export const GOALS = [
  { name:"Emergency Fund",target:15000,saved:9200,icon:"🛡️",color:C.blue,eta:"4 mo" },
  { name:"Vacation Fund",target:5000,saved:2800,icon:"✈️",color:C.gold,eta:"3 mo" },
  { name:"House Down Pmt",target:60000,saved:18400,icon:"🏡",color:C.accent,eta:"2.5 yr" },
  { name:"Debt Payoff",target:8000,saved:5200,icon:"⛓️",color:C.rose,eta:"6 mo" },
];
export const SUBS = [
  { name:"Netflix",monthly:15.99,used:true,lastUsed:"2d ago",icon:"🎬" },
  { name:"Spotify",monthly:9.99,used:true,lastUsed:"1d ago",icon:"🎵" },
  { name:"Audible",monthly:14.99,used:false,lastUsed:"40d ago",icon:"🎧" },
  { name:"Gym",monthly:49.99,used:false,lastUsed:"22d ago",icon:"🏋️" },
  { name:"Adobe CC",monthly:54.99,used:true,lastUsed:"3d ago",icon:"🎨" },
  { name:"Hulu",monthly:17.99,used:false,lastUsed:"18d ago",icon:"📺" },
];
export const INVESTMENTS = [
  { name:"S&P 500 ETF",ticker:"VOO",value:18420,change:1.24,type:"ETF",color:C.green },
  { name:"Apple Inc.",ticker:"AAPL",value:6340,change:-0.38,type:"Stock",color:C.blue },
  { name:"Bitcoin",ticker:"BTC",value:4210,change:3.87,type:"Crypto",color:C.gold },
  { name:"Roth IRA",ticker:"IRA",value:12800,change:0.91,type:"Retire",color:C.purple },
];
export const GIVING = [
  { name:"Church Tithe",amount:680,date:"Mar 1" },
  { name:"Food Bank",amount:100,date:"Mar 5" },
  { name:"Missions Fund",amount:70,date:"Mar 8" },
];
export const SCRIPTURES = [
  { ref:"Proverbs 21:5",text:"The plans of the diligent lead surely to abundance.",reflection:"Consistent financial planning builds long-term stability.",action:"Review your spending plan today." },
  { ref:"Luke 16:10",text:"Whoever is faithful in small things will be faithful in large ones.",reflection:"Small daily habits compound into lasting wealth.",action:"Track every transaction this week." },
  { ref:"Proverbs 22:7",text:"The borrower is servant to the lender.",reflection:"Debt reduces your freedom. Reducing it restores it.",action:"Make an extra payment toward your highest-interest debt." },
  { ref:"Malachi 3:10",text:"Bring the full tithe into the storehouse.",reflection:"Generosity is not just spiritual, it builds a giving identity.",action:"Log your giving for this month." },
  { ref:"Matthew 6:24",text:"You cannot serve both God and money.",reflection:"Money is a tool, not a master. Keep it in its proper place.",action:"Audit one subscription you do not truly need." },
];
export const AI_INSIGHTS = [
  "🔴 You spent 31% more on food delivery than last month. Cooking 3 meals at home saves ~$140.",
  "🟡 Audible unused for 40 days. Cancelling saves $179.88/year.",
  "🟢 Your emergency fund reaches 6 months in just 4 months at current pace. Great work!",
  "🔴 Gym membership unused for 22 days. Pause or cancel to save $599/year.",
  "🟡 Investment portfolio is 68% in equities. Consider adding bonds for stability.",
  "🟢 Stewardship Score up 4 points this month! Giving consistency is your strongest metric.",
];
export const WEEKLY_SPEND = [
  { day:"Mon",amt:42 },{ day:"Tue",amt:128 },{ day:"Wed",amt:67 },
  { day:"Thu",amt:310 },{ day:"Fri",amt:185 },{ day:"Sat",amt:224 },{ day:"Sun",amt:38 },
];
