import { useState } from 'react';
import { UploadCloud, Settings, ChevronRight, Activity, TrendingDown, Clock, ShieldAlert, FileText, Circle, AlertTriangle, Play } from 'lucide-react';
import Papa from 'papaparse';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Footer from './components/Footer';
import './index.css';

function App() {
  const [isAppLaunched, setIsAppLaunched] = useState(false);
  const [tradeData, setTradeData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('trade_autopsy_key') || '');
  const [provider, setProvider] = useState(localStorage.getItem('trade_autopsy_provider') || 'bitget-qwen');

  const saveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('trade_autopsy_key', apiKey);
    localStorage.setItem('trade_autopsy_provider', provider);
    setShowSettings(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnalyzing(true);
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        processData(results.data);
      }
    });
  };

  const processData = async (data) => {
    setAnalyzing(true);
    setTradeData(data);
    
    try {
      if (apiKey && apiKey.length > 5) {
        const { processCsvData, analyzeTrades } = await import('./lib/api.js');
        const { promptSummary } = processCsvData(data);
        const mdReport = await analyzeTrades(apiKey, provider, promptSummary);
        setReport(mdReport);
      } else {
        // Fallback mock report if no key
        setReport(`# Autopsy Report\n\n## Core Findings\n* **This bot loses mostly during high funding + low liquidity hours.** Our clustering shows a 73% concentration of drawdowns between 02:00 and 04:00 UTC.\n* **Win rate is fine, but position sizing causes tail losses.** The average winning trade is +$120, while the average losing trade is -$450.\n* **The agent enters correctly but exits too late.** Analysis of price candles post-entry shows the signal was profitable for an average of 45 minutes before reverting.\n* **Signal works on BTC but fails on SOL during volatility expansion.** SOL trades account for 60% of the total drawdown despite being only 20% of the trade volume.\n\n## Regime Clustering\nWe identified 3 distinct market regimes where this strategy fails:\n1. **Low Volume, High Volatility (Choppy)**\n2. **Trend Reversal on High Funding Rate**\n3. **News-Driven Spikes (Macro events)**\n\n## Recommendations\n- Implement a hard stop-loss based on ATR rather than fixed percentage.\n- Disable trading on SOL during top 10% volatility periods.\n- Add a time-in-trade exit condition (e.g. exit if PnL < 0 after 60 mins).\n\n*(Note: This is a mock report. Enter your Qwen API key in the settings to generate a real analysis of your uploaded CSV!)*`);
      }
    } catch (err) {
      setReport(`## Analysis Failed\n\n**Error:** ${err.message}\n\nPlease check your Qwen API key and internet connection, then try again.`);
    }
    
    setAnalyzing(false);
  };

  return (
    <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
      {/* Animated Background Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <header className="flex justify-between items-center" style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-glass)', background: '#0a0d14', position: 'sticky', top: 0, zIndex: 10 }}>
        {/* Left: Logo & Titles */}
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => setIsAppLaunched(false)}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
            <Activity color="var(--primary)" size={24} />
          </div>
          <div className="flex flex-col">
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.2' }}>Trade Autopsy</h1>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              POST-MORTEM INTELLIGENCE · BITGET
            </span>
          </div>
        </div>

        {/* Right: Badges & Buttons */}
        <div className="flex items-center gap-3">
          <div className="badge badge-warning">
            <FileText size={12} /> CSV ANALYSIS
          </div>
          
          <div className="badge badge-neutral">
            <Circle size={10} fill="currentColor" /> {apiKey ? 'AGENT READY' : 'AGENT IDLE'}
          </div>

          <button onClick={() => setShowSettings(true)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            <Settings size={14} /> Settings
          </button>

          <button className="btn btn-primary" style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setIsAppLaunched(true)}>
            <Play size={14} fill="currentColor" /> Launch App
          </button>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '2rem' }}>
        
        {/* API Key Missing Banner */}
        {isAppLaunched && (!apiKey || apiKey.length < 5) && !showSettings && (
          <div className="banner-warning animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              <span><strong>Setup Required:</strong> API Credentials (Bitget or Qwen) are missing. Please configure them in the Settings tab to enable live LLM analysis.</span>
            </div>
            <button className="btn" onClick={() => setShowSettings(true)}>Go to Settings</button>
          </div>
        )}

        {showSettings && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative', zIndex: 20 }}>
            <h2 style={{ marginBottom: '1rem' }}>LLM Agent Settings</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Select your API provider and enter your API key to enable live AI analysis. (A mock report is generated if no key is used).</p>
            <form onSubmit={saveKey} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <select 
                  value={provider} 
                  onChange={(e) => setProvider(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', color: '#fff' }}
                >
                  <option value="bitget-qwen">Bitget Hackathon Qwen Key</option>
                  <option value="official-qwen">Official Alibaba DashScope Key</option>
                  <option value="openrouter">OpenRouter (Qwen 72B)</option>
                  <option value="openai">OpenAI GPT-4o</option>
                </select>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>
              <button type="submit" className="btn btn-primary w-fit">Save Settings</button>
            </form>
          </div>
        )}

        {!isAppLaunched ? (
          <LandingPage onLaunch={() => setIsAppLaunched(true)} />
        ) : (
          <>
            {!tradeData && !analyzing && (
              <div className="flex flex-col items-center justify-center animate-fade-in" style={{ minHeight: '60vh' }}>
                <div className="glass-panel text-center" style={{ padding: '4rem 3rem', maxWidth: '600px', width: '100%' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UploadCloud size={40} color="var(--primary)" />
                  </div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Upload Trade Logs</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    Upload your strategy's failed trade CSV logs to begin the autopsy.
                  </p>
                  
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={handleFileUpload}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                    />
                    <div className="btn btn-primary w-full" style={{ padding: '1rem' }}>
                      Select CSV Log File <ChevronRight size={20} />
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>
                    Don't have a log? <a href="/sample_logs.csv" download className="text-primary" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 500 }}>Download sample_logs.csv</a>
                  </div>
                </div>
              </div>
            )}

            {analyzing && (
              <div className="flex flex-col items-center justify-center animate-fade-in" style={{ minHeight: '60vh' }}>
                <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', width: '48px', height: '48px', animation: 'spin 1s linear infinite', marginBottom: '2rem' }}></div>
                <h2>Agent is performing autopsy...</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Clustering by market regime and correlating with funding rates.</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {tradeData && !analyzing && (
              <Dashboard data={tradeData} report={report} onReset={() => setTradeData(null)} />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
