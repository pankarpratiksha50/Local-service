
import React, { useState, useEffect } from "react";
import "./styles.css";
import { Wrench, Zap, Hammer, Paintbrush, Search, MapPin, ShieldCheck, Star, LogOut } from "lucide-react";
import api from "./api";

const categories = [
  { name: "Plumber", icon: Wrench, desc: "Leaks, taps and pipe repairs" },
  { name: "Electrician", icon: Zap, desc: "Wiring, switches and repairs" },
  { name: "Carpenter", icon: Hammer, desc: "Furniture and woodwork" },
  { name: "Painter", icon: Paintbrush, desc: "Walls, rooms and finishes" }
];

export default function App() {
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("lc_token") || "");
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("search");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "provider" });
  const [listing, setListing] = useState({
    title: "", category: "Plumber", description: "", price: "299", experienceYears: "1", serviceAreas: ""
  });

  async function loadServices() {
    try {
      const { data } = await api.get("/services", { params: { q: query, area, category } });
      setServices(data.services || []);
    } catch {
      setMessage("Could not load services. Make sure the backend and MongoDB are running.");
    }
  }

  useEffect(() => { loadServices(); }, []); // Search button refreshes filters.

  async function register(e) {
    e.preventDefault(); setMessage("");
    try {
      await api.post("/auth/register", form);
      setMessage("Account created. Now log in using your email and password.");
      setMode("login");
    } catch (err) { setMessage(err.response?.data?.message || "Registration failed."); }
  }

  async function login(e) {
    e.preventDefault(); setMessage("");
    try {
      const { data } = await api.post("/auth/login", { email: form.email, password: form.password });
      localStorage.setItem("lc_token", data.token);
      setToken(data.token); setUser(data.user); setMode("search");
      setMessage(`Welcome, ${data.user.name}!`);
    } catch (err) { setMessage(err.response?.data?.message || "Login failed."); }
  }

  function logout() {
    localStorage.removeItem("lc_token"); setToken(""); setUser(null); setMessage("Logged out.");
  }

  async function addListing(e) {
    e.preventDefault(); setMessage("");
    try {
      const payload = {
        ...listing,
        price: Number(listing.price),
        experienceYears: Number(listing.experienceYears),
        serviceAreas: listing.serviceAreas.split(",").map(s => s.trim()).filter(Boolean)
      };
      const { data } = await api.post("/services", payload);
      setMessage(data.message);
      setListing({ title: "", category: "Plumber", description: "", price: "299", experienceYears: "1", serviceAreas: "" });
    } catch (err) { setMessage(err.response?.data?.message || "Could not add listing. Log in as a provider."); }
  }

  async function analyzeReview() {
    const text = window.prompt("Enter sample review text to analyze:");
    if (!text) return;
    try {
      const { data } = await api.post("/ml/analyze-review", { text });
      setMessage(`Demo sentiment: ${data.sentiment}. Confidence: ${Math.round((data.confidence || 0) * 100)}%.`);
    } catch (err) { setMessage(err.response?.data?.message || "Start the Python ML service first."); }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-icon"><Wrench size={21}/></span>LocalConnect</a>
        <nav>
          <button className="nav-link" onClick={() => { setMode("search"); loadServices(); }}>Find Services</button>
          <button className="nav-link" onClick={() => setMode("register")}>Join as Professional</button>
          {token ? <button className="nav-link" onClick={logout}><LogOut size={15}/> Logout</button> : <button className="btn btn-small" onClick={() => setMode("login")}>Login</button>}
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot"/> LOCAL PROFESSIONALS, ONE PLACE</div>
            <h1>Good help is<br/><span>closer than you think.</span></h1>
            <p>Discover local professionals for the jobs that make a house feel like home.</p>
            <div className="search-panel">
              <label><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="What service do you need?"/></label>
              <label><MapPin size={18}/><input value={area} onChange={e => setArea(e.target.value)} placeholder="Area e.g. Pimpri"/></label>
              <button className="btn" onClick={loadServices}>Search</button>
            </div>
            <div className="trust-row"><ShieldCheck size={17}/> Listings are published after admin approval</div>
          </div>
          <div className="hero-art">
            <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
            <div className="hero-circle"><Wrench size={76}/></div>
            <div className="floating-card card-top"><span className="mini-icon"><Zap size={17}/></span><span><b>Local experts</b><small>Services near you</small></span></div>
            <div className="floating-card card-bottom"><span className="rating-stars"><Star size={15} fill="currentColor"/> 4.9</span><span><b>Quality matters</b><small>Reviews from customers</small></span></div>
          </div>
        </section>

        {message && <div className="message" role="status">{message}<button onClick={() => setMessage("")}>×</button></div>}

        {mode === "search" && <>
          <section className="section">
            <div className="section-heading"><div><span className="eyebrow">FIND YOUR EXPERT</span><h2>What can we help with?</h2></div></div>
            <div className="category-grid">
              {categories.map(({ name, icon: Icon, desc }) => <button key={name} className={`category-card ${category === name ? "selected" : ""}`} onClick={() => { setCategory(category === name ? "" : name); }}>
                <span className="category-icon"><Icon size={25}/></span><b>{name}</b><small>{desc}</small>
              </button>)}
            </div>
            <button className="text-button" onClick={loadServices}>Apply selected category →</button>
          </section>
          <section className="section listings-section">
            <div className="section-heading"><div><span className="eyebrow">AVAILABLE PROFESSIONALS</span><h2>Explore local services</h2></div><span className="result-count">{services.length} listings</span></div>
            {services.length === 0 ? <div className="empty-state"><Search size={28}/><h3>No approved listings yet</h3><p>Register as a provider, add a service and have an admin approve it. Approved listings will appear here.</p><button className="btn" onClick={() => setMode("register")}>Join as a provider</button></div> :
              <div className="listing-grid">{services.map(service => <article className="listing-card" key={service._id}>
                <div className="listing-visual"><span className="listing-category">{service.category}</span><Wrench size={42}/></div>
                <div className="listing-content"><h3>{service.title}</h3><p>{service.description}</p><div className="listing-meta"><span><MapPin size={14}/>{service.serviceAreas?.join(", ") || service.providerId?.area || "Local area"}</span><span><Star size={14}/> New listing</span></div><div className="listing-footer"><b>From ₹{service.price}</b><button onClick={() => setMessage("Booking module is the next build step. Contact details should only be shown with provider consent.")}>View / Book</button></div></div>
              </article>)}</div>}
          </section>
        </>}

        {(mode === "register" || mode === "login") && <section className="form-section">
          <div className="form-intro"><span className="eyebrow">JOIN LOCALCONNECT</span><h2>{mode === "register" ? "Create your account" : "Welcome back"}</h2><p>{mode === "register" ? "Professionals can create a profile and submit service listings for approval." : "Log in to manage your account and listings."}</p></div>
          <form className="panel-form" onSubmit={mode === "register" ? register : login}>
            {mode === "register" && <><label>Full name<input required minLength="2" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Your name"/></label><label>Account type<select value={form.role} onChange={e => setForm({...form, role:e.target.value})}><option value="provider">Service provider</option><option value="customer">Customer</option></select></label></>}
            <label>Email<input type="email" required value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com"/></label>
            <label>Password<input type="password" required minLength="8" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="At least 8 characters"/></label>
            <button className="btn" type="submit">{mode === "register" ? "Create account" : "Log in"}</button>
            <p className="form-switch">{mode === "register" ? "Already registered?" : "New to LocalConnect?"} <button type="button" onClick={() => setMode(mode === "register" ? "login" : "register")}>{mode === "register" ? "Log in" : "Create an account"}</button></p>
          </form>
        </section>}

        {token && mode === "search" && <section className="section provider-tools">
          <div className="section-heading"><div><span className="eyebrow">PROVIDER WORKSPACE</span><h2>Add a service listing</h2></div></div>
          <p className="helper-text">You must be logged in with a provider account. New or edited listings return to pending approval.</p>
          <form className="listing-form" onSubmit={addListing}>
            <label>Service title<input required maxLength="100" value={listing.title} onChange={e => setListing({...listing,title:e.target.value})} placeholder="e.g. Home plumbing repairs"/></label>
            <label>Category<select value={listing.category} onChange={e => setListing({...listing,category:e.target.value})}>{["Plumber","Electrician","Carpenter","Painter","Cleaner","AC Repair","Appliance Repair","Other"].map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Description<textarea required maxLength="1500" value={listing.description} onChange={e => setListing({...listing,description:e.target.value})} placeholder="Describe your services"/></label>
            <div className="two-fields"><label>Starting price (₹)<input required type="number" min="0" value={listing.price} onChange={e => setListing({...listing,price:e.target.value})}/></label><label>Experience (years)<input type="number" min="0" max="70" value={listing.experienceYears} onChange={e => setListing({...listing,experienceYears:e.target.value})}/></label></div>
            <label>Service areas (comma separated)<input value={listing.serviceAreas} onChange={e => setListing({...listing,serviceAreas:e.target.value})} placeholder="Pimpri, Chinchwad"/></label>
            <button className="btn" type="submit">Submit for approval</button>
          </form>
        </section>}

        <section className="ai-banner">
          <div className="ai-symbol">✳</div><div><span className="eyebrow">AI-POWERED FEATURES</span><h2>Smarter service discovery, coming into focus.</h2><p>LocalConnect includes a starter sentiment-analysis API. Train on a larger labeled dataset before using predictions in a real marketplace.</p></div><button className="btn btn-light" onClick={analyzeReview}>Try sentiment demo</button>
        </section>
      </main>
      <footer><a className="brand" href="#"><span className="brand-icon"><Wrench size={17}/></span>LocalConnect</a><span>Connecting neighborhoods with local skills.</span></footer>
    </div>
  );
}
