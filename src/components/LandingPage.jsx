import React from 'react';
import { ArrowRight, TrendingDown, Clock, ShieldAlert, Activity, GitCommit } from 'lucide-react';

const LandingPage = ({ onLaunch }) => {
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in" style={{ minHeight: '80vh', padding: '2rem 0' }}>
      
      {/* Hero Section */}
      <div className="text-center" style={{ maxWidth: '800px', marginBottom: '4rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--border-glass)', padding: '0.5rem 1rem', borderRadius: '2rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          <Activity size={16} /> Bitget AI Hackathon S1
        </div>
        <h1 style={{ fontSize: '4rem', lineHeight: '1.1', marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Post-Mortem Intelligence <br/> for AI Trading Agents
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Most platforms help you build strategies. We tell you exactly why they fail. Upload your logs, and our Agent will cluster your losses by regime.
        </p>
        
        <div className="flex justify-center gap-4">
          <button onClick={onLaunch} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Launch App <ArrowRight size={20} />
          </button>
          <a href="https://github.com/BitgetLimited/agent_hub" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            <GitCommit size={20} /> View Agent Hub
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="flex gap-6 w-full justify-center" style={{ flexWrap: 'wrap', maxWidth: '1000px' }}>
        
        <div className="glass-panel" style={{ flex: '1 1 300px', padding: '2rem', textAlign: 'left' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <TrendingDown size={24} color="var(--danger)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#fff' }}>PnL Attribution</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5', fontSize: '0.95rem' }}>
            Identify if your tail-losses are caused by position sizing, extreme funding rates, or specific asset volatility expansion.
          </p>
        </div>

        <div className="glass-panel" style={{ flex: '1 1 300px', padding: '2rem', textAlign: 'left' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Clock size={24} color="var(--warning)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#fff' }}>Regime Clustering</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5', fontSize: '0.95rem' }}>
            Stop guessing. The Agent clusters drawdowns by market regimes (e.g. choppy/low-vol vs news-driven spikes).
          </p>
        </div>

        <div className="glass-panel" style={{ flex: '1 1 300px', padding: '2rem', textAlign: 'left' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <ShieldAlert size={24} color="var(--success)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#fff' }}>Actionable Insights</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5', fontSize: '0.95rem' }}>
            Get direct recommendations for your Agent builder—like adding ATR-based stops or disabling trading during low liquidity.
          </p>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
