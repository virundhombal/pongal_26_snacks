import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PRICE_BASE = 40;
const PRICE_ROSE = 57;

const PAYEES = [
  { name: "Santhosh Nagaraj .m", vpa: "msanthoshnagaraj-2@okhdfcbank" },
  { name: "ARVIND M", vpa: "arvindms2017-2@okaxis" }
];

const BACKEND_URL = "http://localhost:4001"; 

// --- INLINE SVG ICONS ---
const Icon = ({ paths, size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths}</svg>
);

const UserIcon = (p) => <Icon {...p} paths={<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />;
const MailIcon = (p) => <Icon {...p} paths={<><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>} />;
const HashIcon = (p) => <Icon {...p} paths={<><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></>} />;
const CreditCardIcon = (p) => <Icon {...p} paths={<><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></>} />;
const PartyPopperIcon = (p) => <Icon {...p} paths={<><path d="M5.8 11.3 2 22l10.7-3.8Z" /><path d="m22 2-1.5 1.5" /><path d="m15 8.5-4.5 4.5" /></>} />;
const SwitchIcon = (p) => <Icon {...p} paths={<><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></>} />;
const ExternalLinkIcon = (p) => <Icon {...p} paths={<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>} />;

const App = () => {
  const [payeeIndex, setPayeeIndex] = useState(0);
  // Default set to true for Rosemilk selection
  const [hasRosemilk, setHasRosemilk] = useState(true); 
  const [formData, setFormData] = useState({ name: '', rollNumber: '', emailId: '', utrId: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [upiUrl, setUpiUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activePayee = PAYEES[payeeIndex];
  const totalAmount = hasRosemilk ? PRICE_ROSE : PRICE_BASE;

  useEffect(() => {
    const note = `Snacks for ${formData.name || 'Pongal'}`;
    const url = `upi://pay?pa=${activePayee.vpa}&pn=${encodeURIComponent(activePayee.name)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
    setUpiUrl(url);
  }, [formData.name, activePayee, totalAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (formData.name.trim().length > 20) { setErrorMsg("Name cannot exceed 20 characters!"); return; }
    if (formData.rollNumber.trim().length !== 7) { setErrorMsg("Roll Number must be exactly 7 characters!"); return; }
    const utrRegex = /^\d{12}$/;
    if (!utrRegex.test(formData.utrId)) { setErrorMsg("Transaction ID must be exactly 12 numeric digits!"); return; }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/submit`, { ...formData, payeeVpa: activePayee.vpa, hasRosemilk });
      setSubmitted(true);
    } catch (err) { setErrorMsg(err.response?.data?.error || "Error connecting to server."); } 
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-6 text-gray-900">
      <div className="bg-white rounded-[2.5rem] shadow-brutal p-8 text-center border-4 border-black max-w-md w-full relative z-10">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-orange-500 shadow-brutal-sm">
          <PartyPopperIcon className="w-10 h-10 text-orange-600" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black mb-2 uppercase italic">Success!</h2>
        <p className="text-lg font-bold text-gray-700 mb-8 leading-snug">Coupon sent to <span className="text-blue-600 underline font-black">{formData.emailId}</span>!</p>
        <button onClick={() => setSubmitted(false)} className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl border-4 border-black shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-lg">Book More</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-500 flex items-center justify-center p-3 md:p-8 relative overflow-hidden text-gray-900">
      <div className="max-w-6xl w-full bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-brutal-lg flex flex-col md:flex-row border-4 border-black relative z-10 overflow-hidden">
        
        {/* Left Section: Payment */}
        <div className="md:w-[42%] bg-yellow-400 p-6 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col justify-between text-black">
          <div>
            <h1 className="text-5xl md:text-7xl font-black leading-none uppercase mb-6 transform -skew-x-2 italic">
              Pongal <br/> <span className="text-orange-600">Snack</span> <br/> <span className="bg-white px-2">Feast.</span>
            </h1>

            <div className="mt-4 p-5 bg-white border-4 border-black shadow-brutal rounded-[2.5rem] text-center flex flex-col items-center mx-auto w-fit max-w-full">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest leading-none">Step 1: Choose & Pay</p>
              
              <div className="mb-4 w-full flex gap-2">
                <div className="flex bg-gray-100 p-1 border-4 border-black rounded-2xl flex-1">
                  <button type="button" onClick={() => setHasRosemilk(false)} className={`flex-1 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${!hasRosemilk ? 'bg-orange-500 text-white shadow-brutal-sm' : 'text-gray-500'}`}>Standard (₹40)</button>
                  <button type="button" onClick={() => setHasRosemilk(true)} className={`flex-1 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${hasRosemilk ? 'bg-pink-500 text-white shadow-brutal-sm' : 'text-gray-500'}`}>+ Rosemilk (₹57)</button>
                </div>
                <button type="button" onClick={() => setPayeeIndex(prev => prev === 0 ? 1 : 0)} title="Switch Recipient" className="px-3 bg-orange-500 text-white border-4 border-black rounded-xl shadow-brutal-sm hover:bg-orange-600 transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5">
                  <SwitchIcon size={16} />
                  <span className="text-[10px] font-black uppercase">Switch</span>
                </button>
              </div>

              <div className="text-4xl md:text-5xl font-black text-orange-600 mb-1 italic tracking-tighter leading-none">₹{totalAmount}</div>
              <p className="text-[9px] font-black text-gray-400 mb-4 uppercase tracking-tight italic">Payee: {activePayee.name}</p>
              
              <div className="bg-white p-1.5 border-4 border-black rounded-2xl mb-4 shadow-brutal-sm flex flex-col items-center justify-center overflow-hidden">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUrl)}`} className="w-44 h-44 sm:w-52 sm:h-52 md:w-64 md:h-64 object-contain" alt="QR" />
                <a 
                  href={upiUrl}
                  className="mt-2 mb-2 bg-orange-500 text-white font-black px-4 py-2 border-2 border-black rounded-lg text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2"
                >
                  <ExternalLinkIcon size={12} />
                  Open UPI App
                </a>
              </div>
              <p className="text-[11px] font-black text-gray-700 uppercase tracking-tight leading-none italic">Scan or Click above to pay</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center md:justify-start">
            <div className="bg-orange-500 text-white py-2.5 px-6 rounded-full border-4 border-black shadow-brutal-sm flex items-center gap-3 rotate-1 whitespace-nowrap">
              <PartyPopperIcon className="w-5 h-5 text-white" />
              <p className="text-sm font-black uppercase italic leading-none">Instant QR Code via Mail</p>
            </div>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="md:w-[58%] p-6 sm:p-10 lg:p-14 bg-white text-black">
          <div className="mb-8 relative">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic">Step 2: Register</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Fill details after scanning the QR code</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2"><UserIcon size={14}/> Student Name (Max 20 chars)</label>
                <input maxLength={20} placeholder="Enter your name" className="w-full px-5 py-4 bg-gray-100 font-bold outline-none border-4 border-black rounded-2xl focus:bg-white transition-colors text-black" value={formData.name} onChange={e => {setFormData({...formData, name: e.target.value}); setErrorMsg('');}} required />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2"><HashIcon size={14}/> Roll Number (7 chars)</label>
                <input maxLength={7} placeholder="23MS123" className="w-full px-5 py-4 bg-gray-100 font-bold outline-none border-4 border-black rounded-2xl focus:bg-white transition-colors text-black" value={formData.rollNumber} onChange={e => {setFormData({...formData, rollNumber: e.target.value}); setErrorMsg('');}} required />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2"><MailIcon size={14}/> Email ID</label>
                <input type="email" placeholder="xxx23ms123@iiserkol.ac.in" className="w-full px-5 py-4 bg-gray-100 font-bold outline-none border-4 border-black rounded-2xl focus:bg-white transition-colors text-black" value={formData.emailId} onChange={e => {setFormData({...formData, emailId: e.target.value}); setErrorMsg('');}} required />
              </div>

              <div className="md:col-span-2 space-y-1 p-5 bg-orange-50 border-4 border-dashed border-orange-300 rounded-3xl relative">
                <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2"><CreditCardIcon size={14}/> Payment UTR / Transaction ID</label>
                {errorMsg && <div className="text-red-600 font-black text-[10px] bg-white border-2 border-red-600 px-2 py-1 rounded-lg absolute right-5 top-5 animate-bounce z-20">{errorMsg}</div>}
                <input maxLength={12} placeholder="Paste the 12-digit ID" className={`w-full px-5 py-4 mt-2 bg-white border-4 rounded-2xl font-black text-orange-600 outline-none shadow-brutal-sm ${errorMsg.includes('Transaction') ? 'border-red-600' : 'border-black'}`} value={formData.utrId} onChange={e => {setFormData({...formData, utrId: e.target.value}); setErrorMsg('');}} required />
                <p className="text-[9px] font-bold text-gray-500 mt-2 uppercase">Must be exactly 12 numeric digits</p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-black py-6 rounded-3xl border-4 border-black shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-xl mt-4 disabled:bg-gray-400">
              {loading ? "Validating..." : "Get Snack Coupon!"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;