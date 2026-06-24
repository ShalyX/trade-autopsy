export async function analyzeTrades(apiKey, provider, tradeDataSummary) {
  let url = '';
  let model = '';

  let headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  if (provider === 'bitget-qwen') {
    url = '/api/qwen/v1/chat/completions';
    model = 'qwen3.6-plus';
  } else if (provider === 'official-qwen') {
    url = '/api/dashscope/v1/chat/completions';
    model = 'qwen-plus';
  } else if (provider === 'openrouter') {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    model = 'qwen/qwen-2.5-72b-instruct'; // Solid Qwen model on OpenRouter
    headers['HTTP-Referer'] = 'http://localhost:5173';
    headers['X-Title'] = 'Trade Autopsy';
  } else {
    url = '/api/openai/v1/chat/completions';
    model = 'gpt-4o';
  }

  const systemPrompt = `You are an expert AI quantitative researcher and trading strategy auditor.
Your job is to analyze the trade logs of a Trading Agent and perform a 'Strategy Autopsy' to find out exactly why the strategy is losing money or underperforming.
Focus on understanding failure. Do not just summarize the trades.
Look for patterns: does it fail during high funding rates? low liquidity hours? specific market regimes? specific assets?
Generate a markdown report with:
1. Executive Summary
2. Key Failure Patterns (the exact reasons why it loses)
3. Regime Analysis (how it performs in trending vs ranging)
4. Actionable Recommendations for the Agent Builder

Here is the statistical summary of the recent trades grouped by regime and asset:
${tradeDataSummary}
`;

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Please perform the autopsy on this strategy data and provide the markdown report.' }
      ],
      temperature: 0.2,
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export function processCsvData(csvData) {
  if (!csvData || csvData.length === 0) return { rawStats: {}, promptSummary: "No data" };

  const sampleKeys = Object.keys(csvData[0]);
  const pnlKeywords = ['pnl', 'profit', 'loss', 'return', 'net', 'realized', 'gain'];
  let pnlKey = sampleKeys.find(k => pnlKeywords.some(kw => k.toLowerCase().includes(kw)));
  if (!pnlKey) pnlKey = sampleKeys.find(k => csvData.some(row => typeof row[k] === 'number' && row[k] < 0));
  if (!pnlKey) pnlKey = sampleKeys.reverse().find(k => typeof csvData[0][k] === 'number' && !k.toLowerCase().includes('price') && !k.toLowerCase().includes('id'));
  
  const assetKeywords = ['asset', 'symbol', 'coin', 'ticker', 'pair', 'market'];
  const assetKey = sampleKeys.find(k => assetKeywords.some(kw => k.toLowerCase().includes(kw)));
  
  const regimeKey = sampleKeys.find(k => k.toLowerCase().includes('regime'));
  const sideKey = sampleKeys.find(k => k.toLowerCase().includes('side') || k.toLowerCase().includes('direction') || k.toLowerCase().includes('type'));

  let totalTrades = 0;
  let winningTrades = 0;
  let totalPnL = 0;
  const regimeStats = {};
  const assetStats = {};

  csvData.forEach(row => {
    const asset = assetKey ? row[assetKey] : 'Unknown';
    if (!asset) return;
    
    totalTrades++;
    const pnl = pnlKey ? Number(row[pnlKey]) : 0;
    totalPnL += pnl;
    if (pnl > 0) winningTrades++;

    const regime = regimeKey ? String(row[regimeKey]).replace(/_/g, ' ') : 'Unknown';
    if (!regimeStats[regime]) regimeStats[regime] = { trades: 0, pnl: 0, wins: 0 };
    regimeStats[regime].trades++;
    regimeStats[regime].pnl += pnl;
    if (pnl > 0) regimeStats[regime].wins++;

    if (!assetStats[asset]) assetStats[asset] = { trades: 0, pnl: 0, wins: 0 };
    assetStats[asset].trades++;
    assetStats[asset].pnl += pnl;
    if (pnl > 0) assetStats[asset].wins++;
  });

  const winRate = ((winningTrades / totalTrades) * 100).toFixed(2);
  
  let summaryText = `Total Trades: ${totalTrades}\nWin Rate: ${winRate}%\nNet PnL: ${totalPnL.toFixed(2)}%\n\n### Regime Performance\n`;
  for (const [regime, stat] of Object.entries(regimeStats)) {
    summaryText += `- ${regime}: ${stat.trades} trades, ${(stat.wins/stat.trades*100).toFixed(1)}% win rate, Net PnL: ${stat.pnl.toFixed(2)}%\n`;
  }

  summaryText += `\n### Asset Performance\n`;
  for (const [asset, stat] of Object.entries(assetStats)) {
    summaryText += `- ${asset}: ${stat.trades} trades, ${(stat.wins/stat.trades*100).toFixed(1)}% win rate, Net PnL: ${stat.pnl.toFixed(2)}%\n`;
  }

  // Add Top 5 Worst Trades for deep analysis
  let worstTrades = [...csvData]
    .filter(row => (pnlKey ? Number(row[pnlKey]) : 0) < 0)
    .sort((a, b) => (pnlKey ? Number(a[pnlKey]) : 0) - (pnlKey ? Number(b[pnlKey]) : 0))
    .slice(0, 5);

  if (worstTrades.length > 0) {
    summaryText += `\n### Top 5 Worst Trades (Deep Dive)\n`;
    worstTrades.forEach((t, i) => {
      const asset = assetKey ? t[assetKey] : 'Unknown';
      const side = sideKey ? t[sideKey] : 'Unknown';
      const pnl = pnlKey ? Number(t[pnlKey]).toFixed(2) : 0;
      const regime = regimeKey ? String(t[regimeKey]).replace(/_/g, ' ') : 'Unknown';
      summaryText += `${i+1}. ${asset} ${side}: ${pnl}% loss (Regime: ${regime})\n`;
    });
  }

  return {
    rawStats: { totalTrades, winRate, totalPnL, regimeStats, assetStats },
    promptSummary: summaryText
  };
}
