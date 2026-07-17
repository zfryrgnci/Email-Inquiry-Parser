import React, { useState, useEffect } from "react";
import { 
  Mail, Phone, User, Building, Calendar, DollarSign, Flame, 
  CheckCircle, TrendingUp, Copy, Trash2, FileSpreadsheet, 
  Sparkles, Clock, ArrowRight, ChevronRight, X, AlertCircle, 
  RefreshCw, ClipboardCheck, Download, Inbox, Info, HelpCircle,
  FileText, Briefcase, Smile, Send, CheckSquare, Layers, AlignLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ParsedInquiry } from "./types";

const SAMPLE_EMAILS = [
  {
    id: "h1",
    label: "Healthcare App Inquiry",
    client: "Sarah Jenkins",
    company: "Acme Health",
    priority: "High",
    tag: "High Priority",
    subject: "Urgent: HIPAA-Compliant Patient Check-In Portal Quote",
    body: `Subject: HIPAA-Compliant Patient Portal App Request

Hi Team, 

My name is Sarah Jenkins, CTO at Acme Health.

We are looking to build a secure, HIPAA-compliant mobile portal for patient check-ins, medical chart viewing, and prescription refilling. We must launch this patient portal by October 15th to satisfy our quarterly compliance milestones and avoid upcoming policy fines.

Our board has allocated a strict capital expenditure budget of $150,000 for the full design, development, and auditing lifecycle. 

Could we set up a discovery call this Thursday at 2 PM EST to discuss your team's experience and obtain a preliminary quote?

Best regards,
Sarah Jenkins
CTO, Acme Health Inc.
sarah.jenkins@acmehealth.com | 555-019-2834`
  },
  {
    id: "m1",
    label: "SaaS Marketing Retainer",
    client: "Marcus Vance",
    company: "GreenGrowth Media",
    priority: "Medium",
    tag: "Medium Priority",
    subject: "Inquiry: Q4 SEO & Content Strategy Audit",
    body: `Hi Sales Team,

I'm Marcus Vance, VP of Growth over at GreenGrowth Media. We are a medium-scale SaaS enterprise looking to improve our organic search traffic footprint.

We're interested in booking a full technical SEO audit and a 6-month content calendar strategy. We don't have a rigid launch date, but we are hoping to kick off work sometime early next month so that our content engine is fully primed for the holiday season.

Our budget is capped at $8,000 per month for an ongoing retainer.

Let me know if you can send over your agency deck or case studies for similar SaaS brands.

Kind regards,
Marcus Vance
info@greengrowth.co | Office: (303) 555-0142`
  },
  {
    id: "l1",
    label: "Boutique Retail Request",
    client: "David Wood",
    company: "Velo Shoes",
    priority: "Low",
    tag: "Low Priority",
    subject: "General Inquiry: Retail Optimization Services",
    body: `Hello Support,

I was reading your published case studies regarding brick-and-mortar retail footprint optimization and was highly impressed by the results.

We are a boutique local shoe retailer based in Boston called Velo Shoes. We would love to eventually integrate some automatic inventory syncing and retail footprint optimization, though we are small-scale right now. 

We are just reaching out to get high-level pricing brochures and standard timelines for future planning. There is no rush at all on this, as we're planning for next fiscal year.

Could you send over some information?

Thank you!
David Wood
david@veloshoes.com`
  }
];

export default function App() {
  const [emailBody, setEmailBody] = useState("");
  const [data, setData] = useState<ParsedInquiry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [history, setHistory] = useState<ParsedInquiry[]>([]);
  const [activeTab, setActiveTab] = useState<"summary" | "blueprint" | "actions">("summary");
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("email_parser_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history from localStorage", e);
      }
    }
  }, []);

  const saveHistory = (newHistory: ParsedInquiry[]) => {
    setHistory(newHistory);
    localStorage.setItem("email_parser_history", JSON.stringify(newHistory));
  };

  const parseEmail = async () => {
    if (!emailBody.trim()) {
      setError("Please write or paste an email into the drafting table first.");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailBody }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || "API call failed.");
      }

      const result: ParsedInquiry = await res.json();
      
      const itemWithId: ParsedInquiry = {
        ...result,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        parsedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString(),
      };
      
      setData(itemWithId);
      saveHistory([itemWithId, ...history]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during parsing.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
    if (data?.id === id) {
      setData(null);
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your saved extraction history?")) {
      saveHistory([]);
      setData(null);
    }
  };

  const exportHistoryToCSV = () => {
    if (history.length === 0) return;
    
    const headers = [
      "Client Name", "Company", "Email", "Phone", "Service Requested", 
      "Budget", "Deadline", "Priority", "Sentiment", "Summary"
    ];
    
    const rows = history.map(item => [
      item.client_name,
      item.company,
      item.email_address,
      item.phone_number,
      item.service_requested,
      item.budget,
      item.deadline,
      item.priority,
      item.sentiment,
      item.summary
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${(val || "").replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `extracted_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCurrentToCSV = () => {
    if (!data) return;
    
    const headers = [
      "Client Name", "Company", "Email", "Phone", "Service Requested", 
      "Budget", "Deadline", "Priority", "Sentiment", "Summary"
    ];
    
    const row = [
      data.client_name,
      data.company,
      data.email_address,
      data.phone_number,
      data.service_requested,
      data.budget,
      data.deadline,
      data.priority,
      data.sentiment,
      data.summary
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), row.map(val => `"${(val || "").replace(/"/g, '""')}"`).join(",")].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inquiry_${data.client_name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to generate bespoke follow-up email drafts based on parsed terms
  const getFollowUpDraft = (item: ParsedInquiry) => {
    const timePhrase = item.deadline !== "Not Specified" ? `by your target date of ${item.deadline}` : "on your preferred timeline";
    const budgetPhrase = item.budget !== "Not Specified" ? `with respect to your stated budget of ${item.budget}` : "";
    return `Subject: Re: Inquiry regarding ${item.service_requested}

Dear ${item.client_name.split(' ')[0] || "there"},

Thank you for reaching out. We received your request regarding "${item.service_requested}" for ${item.company !== "Not Specified" ? item.company : "your organization"}.

We can absolutely support this project, especially aligning ${timePhrase} ${budgetPhrase}.

Let's schedule a brief 15-minute alignment call to map out the technical milestones and secure your timeline. What times work best for you this week?

Warm regards,
[Your Name]`;
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1e2022] font-sans flex flex-col selection:bg-stone-200 selection:text-stone-900">
      
      {/* Premium Minimalist Masthead Grid */}
      <header id="editorial-header" className="border-b border-stone-200 bg-[#fbfaf8] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-900 animate-pulse" />
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-stone-500">
                AI Intelligence Lab &bull; Ledger v2.0
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-stone-900">
              EMAIL INQUIRY PARSER
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-serif italic max-w-xl">
              A high-precision semantic synthesizer that translates unstructured client correspondence into verified structured business records instantly.
            </p>
          </div>

          {/* Quick Metrics & System Status */}
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            <div className="bg-[#f2efe9] rounded-xl border border-stone-200/60 p-3 flex flex-col gap-0.5 min-w-[120px]">
              <span className="text-[9px] tracking-wider font-mono text-stone-500 uppercase">ARCHIVE VOLUMES</span>
              <span className="text-lg font-bold font-display text-stone-800">{history.length} Saved</span>
            </div>

            <div className="bg-[#f2efe9] rounded-xl border border-stone-200/60 p-3 flex flex-col gap-0.5 min-w-[120px]">
              <span className="text-[9px] tracking-wider font-mono text-stone-500 uppercase">ACTIVE COGNITION</span>
              <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-stone-700 animate-pulse" />
                <span>gemini-3.5-flash</span>
              </span>
            </div>

            {history.length > 0 && (
              <button 
                onClick={exportHistoryToCSV}
                className="px-4 py-3 bg-stone-900 hover:bg-stone-800 text-[#faf9f6] text-xs font-bold rounded-xl transition-all shadow-md shadow-stone-900/10 flex items-center gap-2 cursor-pointer h-full"
              >
                <FileSpreadsheet className="w-4 h-4 text-stone-300" />
                <span>EXPORT LEDGER</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Primary Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: The Drafting & Input Table (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-[0_4px_24px_rgba(40,40,40,0.03)] p-5 sm:p-6 flex flex-col gap-6">
            
            {/* Header segment of input panel */}
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-stone-100 rounded-lg flex items-center justify-center border border-stone-200">
                  <FileText className="w-4 h-4 text-stone-700" />
                </div>
                <h2 className="text-sm font-bold tracking-wider uppercase font-display text-stone-800">
                  Source Feed
                </h2>
              </div>
              <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                Step 1: Input text
              </span>
            </div>

            {/* Interactive Scenario Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  PRESET SCENARIOS
                </span>
                {emailBody && (
                  <button 
                    onClick={() => { setEmailBody(""); setError(null); }}
                    className="text-[11px] text-stone-400 hover:text-stone-900 underline transition-all"
                  >
                    Clear Slate
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {SAMPLE_EMAILS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setEmailBody(sample.body);
                      setError(null);
                    }}
                    className={`group text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      emailBody === sample.body
                        ? "bg-[#f5f3ed] border-stone-400 text-stone-900 font-medium"
                        : "bg-stone-50/50 border-stone-200 text-stone-600 hover:bg-stone-100/70 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
                        emailBody === sample.body
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-white text-stone-700 border-stone-200 group-hover:bg-stone-50"
                      }`}>
                        {sample.client.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-stone-800 group-hover:text-stone-950">{sample.client}</span>
                        <span className="text-[10px] text-stone-400 font-serif italic truncate max-w-[180px]">
                          {sample.company} &bull; {sample.subject}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border tracking-wide uppercase ${
                      sample.priority === "High" 
                        ? "bg-rose-50 border-rose-100 text-rose-700" 
                        : sample.priority === "Medium"
                          ? "bg-amber-50 border-amber-100 text-amber-700"
                          : "bg-emerald-50 border-emerald-100 text-emerald-700"
                    }`}>
                      {sample.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea drafting sheet */}
            <div className="relative rounded-xl border border-stone-200 bg-[#fdfdfc] p-2 focus-within:ring-2 focus-within:ring-stone-400/20 focus-within:border-stone-400 transition-all">
              <div className="flex items-center justify-between px-2 py-1 border-b border-stone-100 text-[10px] text-stone-400 font-mono">
                <span>DRAFT_LEDGER_SHEET.txt</span>
                <span>{emailBody.length} characters</span>
              </div>
              <textarea
                id="email-textarea"
                value={emailBody}
                onChange={(e) => { setEmailBody(e.target.value); if (error) setError(null); }}
                placeholder="Paste the unstructured correspondence or business inquiry here..."
                className="w-full h-80 p-3 bg-transparent text-stone-800 text-xs focus:outline-none placeholder:text-stone-300 resize-y font-mono leading-relaxed"
              />
            </div>

            {/* Error messaging */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-red-900 block">Parsing Exception Raised</span>
                  <p className="text-red-700/90">{error}</p>
                </div>
              </div>
            )}

            {/* Extractor trigger */}
            <button
              id="extract-data-btn"
              onClick={parseEmail}
              disabled={loading || !emailBody.trim()}
              className="w-full py-4 px-4 rounded-xl font-bold text-xs tracking-[0.1em] uppercase transition-all shadow-lg flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-[#faf9f6] disabled:bg-stone-100 disabled:text-stone-300 disabled:shadow-none cursor-pointer border border-stone-900"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-400" />
                  <span>Synthesizing Semantics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>SYNTHESIZE STRUCTURED DATA</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* RIGHT COLUMN: The Curated Intel Ledger (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Navigation Tab bar for Results */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-1">
            <div className="flex gap-1.5">
              {[
                { id: "summary", label: "Ledger Card", icon: <Layers className="w-3.5 h-3.5" /> },
                { id: "blueprint", label: "Cognitive Blueprint", icon: <AlignLeft className="w-3.5 h-3.5" /> },
                { id: "actions", label: "Action & Drafts", icon: <CheckSquare className="w-3.5 h-3.5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider font-display transition-all border-b-2 flex items-center gap-1.5 -mb-[3px] ${
                    activeTab === tab.id
                      ? "border-stone-900 text-stone-900"
                      : "border-transparent text-stone-400 hover:text-stone-700"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {data && (
              <span className="text-[9px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                Ready &bull; Verified
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              /* High-End Skeleton Loader */
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col gap-6 shadow-sm"
              >
                <div className="h-10 bg-stone-100 rounded-xl animate-pulse w-1/3" />
                <div className="h-24 bg-stone-50 rounded-xl animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-stone-50 rounded-xl animate-pulse" />
                  <div className="h-20 bg-stone-50 rounded-xl animate-pulse" />
                </div>
                <div className="h-32 bg-stone-50 rounded-xl animate-pulse" />
              </motion.div>
            ) : data ? (
              /* Animated Multi-view Container */
              <motion.div
                key="resolved-data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                
                {/* VIEW 1: Ledger Card */}
                {activeTab === "summary" && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-[0_4px_30px_rgba(40,40,40,0.02)] flex flex-col gap-6">
                    
                    {/* Upper Summary Meta Box */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-100">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">INQUIRY SUBJECT</span>
                        <h3 className="text-base font-bold text-stone-900 mt-0.5">{data.service_requested}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Dynamic Priority Stamp */}
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border flex items-center gap-1.5 ${
                          data.priority.toLowerCase().includes("high") 
                            ? "bg-rose-50 text-rose-700 border-rose-200/60" 
                            : data.priority.toLowerCase().includes("med")
                              ? "bg-amber-50 text-amber-700 border-amber-200/60"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                        }`}>
                          <Flame className="w-3.5 h-3.5" />
                          <span>{data.priority} Priority</span>
                        </div>
                        
                        <div className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-stone-50 border border-stone-200 text-stone-600">
                          Mood: {data.sentiment}
                        </div>
                      </div>
                    </div>

                    {/* Briefing Text Quote block */}
                    <div className="bg-[#fcfbfa] rounded-xl p-4 border border-stone-200/80 relative">
                      <div className="absolute top-2.5 left-2.5">
                        <Sparkles className="w-4 h-4 text-stone-400" />
                      </div>
                      <div className="pl-6 space-y-1">
                        <span className="text-[9px] text-stone-400 font-mono uppercase tracking-wider">AI Generated Synthesis</span>
                        <p className="text-xs sm:text-sm text-stone-800 italic leading-relaxed font-serif">
                          "{data.summary}"
                        </p>
                      </div>
                    </div>

                    {/* Highly Clean Grid for fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* CLIENT META CARD */}
                      <div className="border border-stone-200 rounded-xl p-4 flex flex-col gap-3.5 bg-[#fdfdfd]">
                        <span className="text-[10px] font-mono uppercase text-stone-500 tracking-wider border-b border-stone-100 pb-1.5">
                          Sender Profile
                        </span>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-400 flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-stone-400" /> Contact Name
                            </span>
                            <span className="font-semibold text-stone-900 truncate max-w-[160px]">{data.client_name}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-400 flex items-center gap-2">
                              <Building className="w-3.5 h-3.5 text-stone-400" /> Corporation
                            </span>
                            <span className="font-semibold text-stone-900 truncate max-w-[160px]">{data.company}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-400 flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-stone-400" /> Email Address
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-stone-800 truncate max-w-[120px]">{data.email_address}</span>
                              {data.email_address !== "Not Specified" && (
                                <button 
                                  onClick={() => copyToClipboard(data.email_address, "email")}
                                  className="text-stone-400 hover:text-stone-900 transition-all"
                                >
                                  {copiedField === "email" ? <ClipboardCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-400 flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-stone-400" /> Direct Line
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-stone-800">{data.phone_number}</span>
                              {data.phone_number !== "Not Specified" && (
                                <button 
                                  onClick={() => copyToClipboard(data.phone_number, "phone")}
                                  className="text-stone-400 hover:text-stone-900 transition-all"
                                >
                                  {copiedField === "phone" ? <ClipboardCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* TERMS & COMMERCIAL DETAILS */}
                      <div className="border border-stone-200 rounded-xl p-4 flex flex-col gap-3.5 bg-[#fdfdfd]">
                        <span className="text-[10px] font-mono uppercase text-stone-500 tracking-wider border-b border-stone-100 pb-1.5">
                          Extracted Scope & Budget
                        </span>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-400 flex items-center gap-2">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Allocated Budget
                            </span>
                            <span className="font-mono font-bold text-emerald-700 text-sm">{data.budget}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-400 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" /> Target Deadline
                            </span>
                            <span className="font-semibold text-stone-900 font-mono text-[11px]">{data.deadline}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-400 flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5 text-stone-400" /> Core Need
                            </span>
                            <span className="font-semibold text-stone-900 truncate max-w-[140px]" title={data.service_requested}>
                              {data.service_requested}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-400 flex items-center gap-2">
                              <Smile className="w-3.5 h-3.5 text-stone-400" /> Mood Spectrum
                            </span>
                            <span className="font-semibold text-stone-900 font-mono text-[11px] uppercase tracking-wider">{data.sentiment}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Staggered Bullet details of extracted items */}
                    {data.key_points && data.key_points.length > 0 && (
                      <div className="space-y-2 border-t border-stone-100 pt-4">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                          Key Project Requirements Extracted
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {data.key_points.map((pt, i) => (
                            <div key={i} className="p-3 rounded-lg border border-stone-100 bg-stone-50/50 flex items-start gap-2 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                              <span className="text-stone-700 font-medium">{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Single export option */}
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={exportCurrentToCSV}
                        className="text-xs text-stone-500 hover:text-stone-900 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Single Record (.csv)</span>
                      </button>
                    </div>

                  </div>
                )}

                {/* VIEW 2: Cognitive Blueprint Mapping */}
                {activeTab === "blueprint" && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-[0_4px_30px_rgba(40,40,40,0.02)] flex flex-col gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 font-display uppercase tracking-wider">Semantic Node Blueprint</h3>
                      <p className="text-xs text-stone-500 italic font-serif">
                        A real-time mapping schematic illustrating how raw email paragraph nodes are translated into structured schema endpoints.
                      </p>
                    </div>

                    {/* Schematic Visualization Panel */}
                    <div className="bg-[#fcfbfa] border border-stone-200 rounded-xl p-4 space-y-4">
                      
                      {/* Interactive Schema Keys */}
                      <div className="flex flex-wrap gap-2 pb-3 border-b border-stone-200/60">
                        {Object.entries(data).filter(([key]) => typeof data[key as keyof ParsedInquiry] === "string" && key !== "id" && key !== "parsedAt").map(([key, value]) => (
                          <button
                            key={key}
                            onMouseEnter={() => setHighlightedField(key)}
                            onMouseLeave={() => setHighlightedField(null)}
                            className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1 ${
                              highlightedField === key 
                                ? "bg-stone-900 border-stone-900 text-white shadow-sm" 
                                : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>{key.replace("_", " ")}</span>
                          </button>
                        ))}
                      </div>

                      {/* Map flow */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Active Data Nodes</span>
                        
                        <div className="space-y-2">
                          {[
                            { key: "client_name", label: "Client Name Node", val: data.client_name, color: "stone-800" },
                            { key: "company", label: "Corporate Node", val: data.company, color: "indigo-600" },
                            { key: "service_requested", label: "Intent Scope Node", val: data.service_requested, color: "amber-700" },
                            { key: "budget", label: "Commercial Node", val: data.budget, color: "emerald-700" },
                            { key: "deadline", label: "Milestone Node", val: data.deadline, color: "rose-700" }
                          ].map((node) => (
                            <div 
                              key={node.key}
                              className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                highlightedField === node.key 
                                  ? "bg-stone-100 border-stone-400 shadow-sm" 
                                  : "bg-white border-stone-200/70"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-stone-400 uppercase">
                                  {node.label}
                                </span>
                                <ArrowRight className="w-3 h-3 text-stone-300" />
                                <span className="font-mono text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-200">
                                  {node.key}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-stone-800 truncate max-w-[240px]">
                                {node.val}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* VIEW 3: Actions & Auto Follow-Up Drafting */}
                {activeTab === "actions" && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-[0_4px_30px_rgba(40,40,40,0.02)] flex flex-col gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 font-display uppercase tracking-wider">Automated Sales Workstation</h3>
                      <p className="text-xs text-stone-500 italic font-serif">
                        Review calculated action points and instantly copy a high-converting, personalized response template.
                      </p>
                    </div>

                    {/* Recommended Action Steps */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Recommended Actions</span>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs flex gap-2.5 items-start">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-emerald-900 block">Lead Priority Identified</span>
                            <span className="text-emerald-700/90">
                              Calculated priority is <strong className="font-semibold uppercase">{data.priority}</strong> based on email urgency metrics. Schedule outreach within 4 hours.
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs flex gap-2.5 items-start">
                          <Clock className="w-4 h-4 text-stone-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-stone-900 block">Milestone Tracking</span>
                            <span className="text-stone-700">
                              Target deadline of <strong className="font-mono text-[11px]">{data.deadline}</strong> extracted. Add this node to your active CRM roadmap pipeline.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email Draft Section */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Generated Follow-Up Template</span>
                        <button
                          onClick={() => copyToClipboard(getFollowUpDraft(data), "draft")}
                          className="px-2.5 py-1 text-[11px] font-mono text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg bg-stone-50 hover:bg-stone-100 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {copiedField === "draft" ? (
                            <>
                              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                              <span>COPIED DRAFT</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>COPY OUTREACH DRAFT</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-[#fdfdfd] border border-stone-200 rounded-xl p-4">
                        <pre className="text-xs text-stone-700 font-mono whitespace-pre-wrap leading-relaxed select-all">
                          {getFollowUpDraft(data)}
                        </pre>
                      </div>
                    </div>

                  </div>
                )}

              </motion.div>
            ) : (
              /* Elevated Empty Slate Placeholder */
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-12 shadow-[0_4px_24px_rgba(40,40,40,0.01)] flex flex-col items-center justify-center text-center gap-5 h-[580px]"
              >
                <div className="w-14 h-14 bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-center relative shadow-sm">
                  <Inbox className="w-6 h-6 text-stone-600" />
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-stone-600"></span>
                  </span>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-display text-stone-900 uppercase tracking-wider">Awaiting Source Syntheses</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto font-serif italic">
                    Paste raw customer inquiries on the left panel. Gemini will build high-fidelity data objects, calculate follow-ups, and catalog details automatically.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
                  <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-1 rounded bg-stone-100 text-stone-500 border border-stone-200/60">
                    Auto-Schema Generation
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-1 rounded bg-stone-100 text-stone-500 border border-stone-200/60">
                    Follow-Up outreach
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-1 rounded bg-stone-100 text-stone-500 border border-stone-200/60">
                    Format Protection
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </main>

      {/* SECTION: History Ledger Table & Archive Grid */}
      <section id="historical-vault" className="border-t border-stone-200 bg-[#f9f8f4] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-stone-700" />
                <h2 className="text-lg font-bold font-display text-stone-900 tracking-tight uppercase">
                  Historical Archive Ledger
                </h2>
              </div>
              <p className="text-xs text-stone-500 font-serif italic">
                Locally cached transcripts from the current intelligence session.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-[11px] font-bold font-mono uppercase text-stone-400 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>PURGE VAULT ARCHIVE</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-12 bg-white rounded-xl border border-stone-200 text-center text-xs text-stone-400 font-mono italic">
              [The ledger database is currently empty. Run a synthesis above to create the first record.]
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-mono tracking-wider text-stone-400 uppercase">
                      <th className="p-4">Contact / Client</th>
                      <th className="p-4">Extracted Intent Scope</th>
                      <th className="p-4">Budget Stated</th>
                      <th className="p-4">Priority & Sentiment</th>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {history.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => {
                          setData(item);
                          window.scrollTo({ top: 120, behavior: "smooth" });
                        }}
                        className={`hover:bg-stone-50/75 transition-all cursor-pointer ${
                          data?.id === item.id ? "bg-[#f5f3ed]/60" : ""
                        }`}
                      >
                        <td className="p-4 font-semibold text-stone-900">
                          <div>{item.client_name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{item.company}</div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="truncate text-stone-800 font-medium">{item.service_requested}</div>
                          <div className="text-[10px] text-stone-400 truncate font-serif italic">{item.summary}</div>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-700">
                          {item.budget}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold ${
                              item.priority.toLowerCase().includes("high") 
                                ? "bg-rose-50 text-rose-700 border border-rose-100" 
                                : item.priority.toLowerCase().includes("med")
                                  ? "bg-amber-50 text-amber-700 border border-amber-100" 
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}>
                              {item.priority}
                            </span>
                            <span className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[9px] text-stone-600 font-mono uppercase">
                              {item.sentiment}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-[10px] text-stone-400 font-mono">
                          {item.parsedAt || "N/A"}
                        </td>
                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => deleteHistoryItem(item.id!, e)}
                            className="p-1.5 bg-transparent hover:bg-red-50 rounded-md border border-transparent hover:border-red-100 text-stone-400 hover:text-red-600 transition-all cursor-pointer"
                            title="Delete this record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 px-6 text-center text-xs text-stone-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Email Inquiry Parser &copy; 2026. Custom Designed Workstation.</p>
          <div className="flex gap-4">
            <span className="text-stone-500 font-mono text-[10px]">Zero Leak Client Auditing</span>
            <span>&bull;</span>
            <span className="text-stone-500 font-mono text-[10px]">Dual-Schema Synthesizer</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
