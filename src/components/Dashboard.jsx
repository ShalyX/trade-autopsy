import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { ArrowLeft, ShieldAlert, TrendingDown, TrendingUp, Clock, Activity, Copy, Download, Check } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

// Super basic markdown parser for the mock report
const parseMarkdown = (md) => {
  let html = md
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d\. (.*$)/gim, '<li>$1</li>');

  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  // Remove duplicate ul tags wrapping adjacent lis
  html = html.replace(/<\/ul>\n<ul>/gim, '\n');

  return { __html: html };
};

const Dashboard = ({ data, report, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_autopsy_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { pnl: [], regimes: [] };
    
    // 1. Robust PnL Column Detection
    const sampleKeys = Object.keys(data[0]);
    const pnlKeywords = ['pnl', 'profit', 'loss', 'return', 'net', 'realized', 'gain'];
    
    // Try to find by keyword
    let pnlKey = sampleKeys.find(k => pnlKeywords.some(kw => k.toLowerCase().includes(kw)));
    
    // Fallback 1: Find any column that actually contains negative numbers (very likely to be PnL)
    if (!pnlKey) {
      pnlKey = sampleKeys.find(k => data.some(row => typeof row[k] === 'number' && row[k] < 0));
    }
    
    // Fallback 2: Just grab the last column that contains numbers (ignoring IDs/Prices)
    if (!pnlKey) {
      pnlKey = sampleKeys.reverse().find(k => typeof data[0][k] === 'number' && !k.toLowerCase().includes('price') && !k.toLowerCase().includes('id'));
    }

    // 2. Asset Column Detection
    const assetKeywords = ['asset', 'symbol', 'coin', 'ticker', 'pair', 'market'];
    const assetKey = sampleKeys.find(k => assetKeywords.some(kw => k.toLowerCase().includes(kw)));

    // Calculate cumulative PnL
    let cumPnL = 0;
    let winningTrades = 0;
    
    const pnlData = data.map((d, i) => {
      const pnlVal = pnlKey ? Number(d[pnlKey]) : 0;
      
      cumPnL += pnlVal;
      if (pnlVal > 0) winningTrades++;
      
      return {
        trade: i + 1,
        pnl: pnlVal,
        cumulative: Number(cumPnL.toFixed(2)),
        asset: assetKey ? d[assetKey] : 'Unknown'
      };
    });

    const winRate = data.length > 0 ? ((winningTrades / data.length) * 100).toFixed(1) : 0;
    const totalPnL = cumPnL.toFixed(2);

    // 3. Dynamic Regime Data (Losses by Market Regime)
    const regimeKey = sampleKeys.find(k => k.toLowerCase().includes('regime'));
    const regimeMap = {};
    
    if (regimeKey) {
      data.forEach(d => {
        const pnlVal = pnlKey ? Number(d[pnlKey]) : 0;
        if (pnlVal < 0) {
          const r = d[regimeKey] || 'Unknown';
          // Clean up string like "ranging_high_vol" -> "ranging high vol"
          const cleanName = String(r).replace(/_/g, ' ');
          regimeMap[cleanName] = (regimeMap[cleanName] || 0) + Math.abs(pnlVal);
        }
      });
    }

    let regimes = Object.keys(regimeMap).map(k => ({
      name: k, 
      value: Number(regimeMap[k].toFixed(2))
    }));

    // Fallback if no regime column exists
    if (regimes.length === 0) {
      regimes = [
        { name: 'Unknown Regime', value: 100 }
      ];
    }

    return { pnl: pnlData, regimes, winRate, totalPnL, totalTrades: data.length };
  }, [data]);

  return (
    <div className="animate-fade-in">
      <button onClick={onReset} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Analyze Another Log
      </button>

      {/* KPI Stats Row */}
      <div className="flex gap-4" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="glass-panel flex-1" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '200px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
            <Activity color="var(--primary)" size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Trades</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{chartData.totalTrades}</div>
          </div>
        </div>
        
        <div className="glass-panel flex-1" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '200px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
            <TrendingUp color="#10b981" size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Win Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{chartData.winRate}%</div>
          </div>
        </div>

        <div className="glass-panel flex-1" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '200px' }}>
          <div style={{ background: Number(chartData.totalPnL) >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
            {Number(chartData.totalPnL) >= 0 ? <TrendingUp color="#10b981" size={24} /> : <TrendingDown color="var(--danger)" size={24} />}
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Net PnL</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: Number(chartData.totalPnL) >= 0 ? '#10b981' : 'var(--danger)' }}>
              {Number(chartData.totalPnL) > 0 ? '+' : ''}{chartData.totalPnL}%
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6" style={{ marginBottom: '2rem', flexWrap: 'wrap' }}>
        
        {/* Report Panel */}
        <div className="glass-panel" style={{ flex: '1 1 500px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center justify-between" style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-glass)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <Activity size={20} />
              <h2 style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>AGENT_AUTOPSY_REPORT.md</h2>
            </div>
            
            <div className="flex gap-2">
              <button onClick={handleCopy} className="btn btn-secondary flex items-center gap-2" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>
                {copied ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />} 
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={handleDownload} className="btn btn-secondary flex items-center gap-2" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>
                <Download size={14} /> Export .md
              </button>
            </div>
          </div>
          <div 
            className="markdown-body" 
            style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}
            dangerouslySetInnerHTML={parseMarkdown(report)}
          />
        </div>

        {/* Charts Panel */}
        <div className="flex flex-col gap-6" style={{ flex: '1 1 400px' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingDown size={18} color="var(--danger)" /> 
              Cumulative PnL
            </h3>
            <div style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.pnl}>
                  <defs>
                    <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="trade" stroke="var(--text-muted)" tickLine={false} axisLine={false} height={40} label={{ value: 'Trade Sequence', position: 'insideBottom', fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} width={60} label={{ value: 'Cumulative PnL (%)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11, style: { textAnchor: 'middle' } }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'var(--border-glass)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                    formatter={(value) => [`${value}%`, 'Cumulative']}
                    labelFormatter={(label) => `Trade #${label}`}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPnl)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--warning)" /> 
              Losses by Market Regime
            </h3>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                        data={chartData.regimes}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                      {chartData.regimes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'var(--border-glass)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--text-main)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4" style={{ paddingBottom: '1rem', flexWrap: 'wrap' }}>
                {chartData.regimes.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
