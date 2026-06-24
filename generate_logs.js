import fs from 'fs';

const numTrades = 100;
const assets = ['BTC-USDT', 'SOL-USDT', 'ETH-USDT'];
const regimes = ['trending_up', 'trending_down', 'ranging_high_vol', 'ranging_low_vol'];

let csv = 'Trade ID,Asset,Entry Time,Exit Time,Side,Entry Price,Exit Price,PnL (%),Funding Rate,Market Regime\n';

for (let i = 1; i <= numTrades; i++) {
  const asset = assets[Math.floor(Math.random() * assets.length)];
  const side = Math.random() > 0.5 ? 'LONG' : 'SHORT';
  const regime = regimes[Math.floor(Math.random() * regimes.length)];
  
  let pnl;
  if (regime === 'ranging_high_vol') {
    pnl = (Math.random() * -15).toFixed(2);
  } else if (regime === 'trending_up' && side === 'LONG') {
    pnl = (Math.random() * 20 + 2).toFixed(2);
  } else if (regime === 'trending_down' && side === 'SHORT') {
    pnl = (Math.random() * 20 + 2).toFixed(2);
  } else {
    pnl = (Math.random() * 10 - 5).toFixed(2);
  }

  let fundingRate = (Math.random() * 0.05).toFixed(4);
  if (pnl < -5 && side === 'LONG') {
    fundingRate = (Math.random() * 0.05 + 0.02).toFixed(4); 
  }

  let entryPrice = asset === 'BTC-USDT' ? 65000 + Math.random() * 5000 : asset === 'ETH-USDT' ? 3500 + Math.random() * 500 : 150 + Math.random() * 50;
  let exitPrice = side === 'LONG' ? entryPrice * (1 + pnl/100) : entryPrice * (1 - pnl/100);

  entryPrice = entryPrice.toFixed(2);
  exitPrice = exitPrice.toFixed(2);

  const entryTime = new Date(Date.now() - (numTrades - i) * 86400000).toISOString();
  const exitTime = new Date(new Date(entryTime).getTime() + Math.random() * 86400000).toISOString();

  csv += `${i},${asset},${entryTime},${exitTime},${side},${entryPrice},${exitPrice},${pnl},${fundingRate},${regime}\n`;
}

fs.writeFileSync('public/sample_logs.csv', csv);
console.log('Sample logs generated in public/sample_logs.csv');
