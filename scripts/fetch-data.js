// scripts/fetch-data.js
// Fetches real market data from Yahoo Finance and Finviz
// Calculates CANSLIM ratings with institutional/growth factors
// Runs daily via GitHub Actions

const fs = require('fs');
const path = require('path');

// Stock universe - Top CANSLIM candidates
const STOCK_UNIVERSE = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'AVGO', name: 'Broadcom Inc', sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'ARM', name: 'ARM Holdings', sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'MRVL', name: 'Marvell Technology', sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'MU', name: 'Micron Technology', sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'LRCX', name: 'Lam Research', sector: 'Technology', industry: 'Semicon Equipment' },
  { symbol: 'KLAC', name: 'KLA Corporation', sector: 'Technology', industry: 'Semicon Equipment' },
  { symbol: 'AMAT', name: 'Applied Materials', sector: 'Technology', industry: 'Semicon Equipment' },
  { symbol: 'SMCI', name: 'Super Micro Computer', sector: 'Technology', industry: 'Hardware' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Technology', industry: 'Internet' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', sector: 'Technology', industry: 'Internet' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software' },
  { symbol: 'AAPL', name: 'Apple Inc', sector: 'Technology', industry: 'Electronics' },
  { symbol: 'CRM', name: 'Salesforce Inc', sector: 'Technology', industry: 'Software' },
  { symbol: 'NOW', name: 'ServiceNow Inc', sector: 'Technology', industry: 'Software' },
  { symbol: 'PANW', name: 'Palo Alto Networks', sector: 'Technology', industry: 'Cybersecurity' },
  { symbol: 'CRWD', name: 'CrowdStrike', sector: 'Technology', industry: 'Cybersecurity' },
  { symbol: 'SNPS', name: 'Synopsys Inc', sector: 'Technology', industry: 'Software' },
  { symbol: 'CDNS', name: 'Cadence Design', sector: 'Technology', industry: 'Software' },
  { symbol: 'ANET', name: 'Arista Networks', sector: 'Technology', industry: 'Networking' },
  { symbol: 'PLTR', name: 'Palantir', sector: 'Technology', industry: 'Software' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor', sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'ASML', name: 'ASML Holding', sector: 'Technology', industry: 'Semicon Equipment' },
  { symbol: 'LLY', name: 'Eli Lilly', sector: 'Healthcare', industry: 'Pharma' },
  { symbol: 'NVO', name: 'Novo Nordisk', sector: 'Healthcare', industry: 'Pharma' },
  { symbol: 'UNH', name: 'UnitedHealth', sector: 'Healthcare', industry: 'Insurance' },
  { symbol: 'ISRG', name: 'Intuitive Surgical', sector: 'Healthcare', industry: 'Med Devices' },
  { symbol: 'VRTX', name: 'Vertex Pharma', sector: 'Healthcare', industry: 'Biotech' },
  { symbol: 'REGN', name: 'Regeneron', sector: 'Healthcare', industry: 'Biotech' },
  { symbol: 'BSX', name: 'Boston Scientific', sector: 'Healthcare', industry: 'Med Devices' },
  { symbol: 'SYK', name: 'Stryker Corp', sector: 'Healthcare', industry: 'Med Devices' },
  { symbol: 'COST', name: 'Costco', sector: 'Consumer', industry: 'Retail' },
  { symbol: 'WMT', name: 'Walmart', sector: 'Consumer', industry: 'Retail' },
  { symbol: 'DECK', name: 'Deckers Outdoor', sector: 'Consumer', industry: 'Footwear' },
  { symbol: 'LULU', name: 'Lululemon', sector: 'Consumer', industry: 'Apparel' },
  { symbol: 'CMG', name: 'Chipotle', sector: 'Consumer', industry: 'Restaurants' },
  { symbol: 'BKNG', name: 'Booking Holdings', sector: 'Consumer', industry: 'Travel' },
  { symbol: 'ABNB', name: 'Airbnb', sector: 'Consumer', industry: 'Travel' },
  { symbol: 'ORLY', name: "O'Reilly Auto", sector: 'Consumer', industry: 'Auto Parts' },
  { symbol: 'V', name: 'Visa Inc', sector: 'Financial', industry: 'Payments' },
  { symbol: 'MA', name: 'Mastercard', sector: 'Financial', industry: 'Payments' },
  { symbol: 'GS', name: 'Goldman Sachs', sector: 'Financial', industry: 'Banking' },
  { symbol: 'BLK', name: 'BlackRock', sector: 'Financial', industry: 'Asset Mgmt' },
  { symbol: 'SPGI', name: 'S&P Global', sector: 'Financial', industry: 'Data' },
  { symbol: 'ICE', name: 'ICE', sector: 'Financial', industry: 'Exchanges' },
  { symbol: 'CAT', name: 'Caterpillar', sector: 'Industrial', industry: 'Machinery' },
  { symbol: 'GE', name: 'GE Aerospace', sector: 'Industrial', industry: 'Aerospace' },
  { symbol: 'LMT', name: 'Lockheed Martin', sector: 'Industrial', industry: 'Defense' },
  { symbol: 'UBER', name: 'Uber', sector: 'Industrial', industry: 'Transport' },
  { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy', industry: 'Oil & Gas' },
  { symbol: 'CVX', name: 'Chevron', sector: 'Energy', industry: 'Oil & Gas' },
];

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

async function fetchYahooData(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.chart?.result?.[0] || null;
  } catch (error) {
    console.error(`Error fetching Yahoo data for ${symbol}:`, error.message);
    return null;
  }
}

async function fetchQuoteData(symbols) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.quoteResponse?.result || [];
  } catch (error) {
    console.error('Error fetching quotes:', error.message);
    return [];
  }
}

async function fetchEarningsData(symbol) {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=earningsHistory,earningsTrend,financialData`;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.quoteSummary?.result?.[0] || null;
  } catch (error) {
    console.error(`Error fetching earnings for ${symbol}:`, error.message);
    return null;
  }
}

async function fetchFinvizData(symbol) {
  const url = `https://finviz.com/quote.ashx?t=${symbol}&p=d`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    
    return {
      instTrans: parseFinvizValue(html, 'Inst Trans'),
      epsQoQ: parseFinvizValue(html, 'EPS Q/Q'),
      epsNextY: parseFinvizValue(html, 'EPS next Y'),
      epsNext5Y: parseFinvizValue(html, 'EPS next 5Y'),
      epsPast5Y: parseFinvizValue(html, 'EPS past 5Y'),
      shortFloat: parseFinvizValue(html, 'Short Float'),
      shortRatio: parseFinvizValue(html, 'Short Ratio'),
      instOwn: parseFinvizValue(html, 'Inst Own'),
      insiderTrans: parseFinvizValue(html, 'Insider Trans'),
      insiderOwn: parseFinvizValue(html, 'Insider Own'),
      roe: parseFinvizValue(html, 'ROE'),
      roi: parseFinvizValue(html, 'ROI'),
      salesQoQ: parseFinvizValue(html, 'Sales Q/Q'),
      grossMargin: parseFinvizValue(html, 'Gross Margin'),
      profitMargin: parseFinvizValue(html, 'Profit Margin'),
      perfWeek: parseFinvizValue(html, 'Perf Week'),
      perfMonth: parseFinvizValue(html, 'Perf Month'),
      perfQuarter: parseFinvizValue(html, 'Perf Quarter'),
      perfHalfY: parseFinvizValue(html, 'Perf Half Y'),
      perfYear: parseFinvizValue(html, 'Perf Year'),
      perfYTD: parseFinvizValue(html, 'Perf YTD'),
    };
  } catch (error) {
    console.error(`Error fetching Finviz data for ${symbol}:`, error.message);
    return null;
  }
}

function parseFinvizValue(html, label) {
  try {
    // Multiple patterns to match Finviz table structure
    const patterns = [
      new RegExp(`<td[^>]*>\\s*${label}\\s*</td>\\s*<td[^>]*class="snapshot-td2"[^>]*>([^<]+)<`, 'i'),
      new RegExp(`>${label}</td>\\s*<td[^>]*>([^<]+)<`, 'i'),
      new RegExp(`${label}</td><td[^>]*><b>([^<]+)</b>`, 'i'),
    ];
    
    for (const regex of patterns) {
      const match = html.match(regex);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value === '-' || value === '') return null;
        
        // Handle percentage
        if (value.endsWith('%')) {
          return parseFloat(value.replace('%', ''));
        }
        // Handle negative in parentheses
        if (value.startsWith('(') && value.endsWith(')')) {
          return -parseFloat(value.slice(1, -1).replace('%', ''));
        }
        return parseFloat(value) || null;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

// ============================================================================
// CANSLIM RATING CALCULATIONS
// ============================================================================

function calculateEPSRating(earningsData, finvizData, priceData) {
  let score = 50;
  
  // Use actual earnings history if available
  if (earningsData) {
    const history = earningsData.earningsHistory?.history || [];
    if (history.length >= 4) {
      let growthQuarters = 0;
      let totalSurprise = 0;
      
      for (let i = 0; i < Math.min(history.length, 4); i++) {
        const quarter = history[i];
        const actual = quarter?.epsActual?.raw || 0;
        const estimate = quarter?.epsEstimate?.raw || 0;
        
        // Check for positive surprise (beat)
        if (estimate > 0 && actual > estimate) {
          growthQuarters++;
          totalSurprise += ((actual - estimate) / Math.abs(estimate)) * 100;
        }
      }
      
      score += growthQuarters * 6;
      score += Math.min(15, totalSurprise / 4);
    }
    
    // Future earnings growth from Yahoo
    const trend = earningsData.earningsTrend?.trend || [];
    const nextYear = trend.find(t => t.period === '+1y');
    if (nextYear?.growth?.raw > 0) {
      score += Math.min(15, nextYear.growth.raw * 0.3);
    }
  }
  
  // Add Finviz EPS data
  if (finvizData) {
    // EPS Q/Q growth
    if (finvizData.epsQoQ !== null && finvizData.epsQoQ > 0) {
      score += Math.min(15, finvizData.epsQoQ * 0.3);
    }
    
    // EPS Next Year growth
    if (finvizData.epsNextY !== null && finvizData.epsNextY > 0) {
      score += Math.min(10, finvizData.epsNextY * 0.2);
    }
    
    // EPS Past 5Y growth
    if (finvizData.epsPast5Y !== null && finvizData.epsPast5Y > 10) {
      score += 5;
    }
  }
  
  return Math.min(99, Math.max(1, Math.round(score)));
}

function calculateRSRating(priceData, allReturns) {
  if (!priceData || priceData.length < 200) return 50;
  
  const currentPrice = priceData[priceData.length - 1];
  const yearAgoPrice = priceData[0];
  
  if (!yearAgoPrice || yearAgoPrice === 0) return 50;
  
  const stockReturn = ((currentPrice - yearAgoPrice) / yearAgoPrice) * 100;
  const betterThan = allReturns.filter(r => stockReturn > r).length;
  
  return Math.min(99, Math.max(1, Math.round((betterThan / allReturns.length) * 99) + 1));
}

function calculateAccDisRating(chartData) {
  if (!chartData?.indicators?.quote?.[0]) return 'C';
  
  const quote = chartData.indicators.quote[0];
  const closes = quote.close || [];
  const volumes = quote.volume || [];
  
  if (closes.length < 65) return 'C';
  
  const recentCloses = closes.slice(-65);
  const recentVolumes = volumes.slice(-65);
  const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  
  let accDays = 0, disDays = 0;
  
  for (let i = 1; i < recentCloses.length; i++) {
    const priceUp = recentCloses[i] > recentCloses[i - 1];
    const highVol = recentVolumes[i] > avgVolume;
    
    if (priceUp && highVol) accDays += 2;
    else if (priceUp) accDays += 1;
    else if (!priceUp && highVol) disDays += 2;
    else disDays += 1;
  }
  
  const ratio = accDays / (accDays + disDays);
  
  if (ratio >= 0.65) return 'A';
  if (ratio >= 0.55) return 'B+';
  if (ratio >= 0.48) return 'B';
  if (ratio >= 0.42) return 'B-';
  if (ratio >= 0.35) return 'C+';
  if (ratio >= 0.30) return 'C';
  if (ratio >= 0.25) return 'C-';
  if (ratio >= 0.20) return 'D';
  return 'E';
}

function calculateSMRRating(quoteData, finvizData) {
  let score = 0;
  
  const pe = quoteData?.trailingPE || 0;
  if (pe > 0 && pe < 25) score += 2;
  else if (pe >= 25 && pe < 40) score += 1;
  
  if (finvizData?.roe && finvizData.roe > 15) score += 2;
  else if (finvizData?.roe && finvizData.roe > 8) score += 1;
  
  if (finvizData?.profitMargin && finvizData.profitMargin > 15) score += 2;
  else if (finvizData?.profitMargin && finvizData.profitMargin > 8) score += 1;
  
  if (finvizData?.salesQoQ && finvizData.salesQoQ > 10) score += 1;
  
  if (score >= 6) return 'A';
  if (score >= 4) return 'B';
  if (score >= 2) return 'C';
  return 'D';
}

function calculateGroupRanks(stocksWithReturns) {
  const sectors = {};
  stocksWithReturns.forEach(stock => {
    if (!sectors[stock.sector]) sectors[stock.sector] = [];
    sectors[stock.sector].push(stock);
  });
  
  const sectorReturns = Object.entries(sectors).map(([sector, stocks]) => ({
    sector,
    avgReturn: stocks.reduce((sum, s) => sum + (s.yearReturn || 0), 0) / stocks.length,
    stocks
  }));
  
  sectorReturns.sort((a, b) => b.avgReturn - a.avgReturn);
  
  const groupRanks = {};
  let rank = 1;
  sectorReturns.forEach(({ stocks }) => {
    stocks.sort((a, b) => (b.yearReturn || 0) - (a.yearReturn || 0));
    stocks.forEach((stock, idx) => { groupRanks[stock.symbol] = rank + idx; });
    rank += stocks.length;
  });
  
  return groupRanks;
}

// ============================================================================
// FINVIZ INSTITUTIONAL/GROWTH SCORE (NEW COLUMN)
// ============================================================================

function calculateInstGrowthScore(finvizData, earningsData) {
  if (!finvizData) return { score: 0, grade: 'N/A', criteria: {} };
  
  let score = 0;
  const criteria = {
    instTrans: { value: finvizData.instTrans, threshold: 5, pass: false },
    epsQoQ: { value: finvizData.epsQoQ, threshold: 0, pass: false },
    shortFloat: { value: finvizData.shortFloat, threshold: 5, pass: false },
    epsNextY: { value: finvizData.epsNextY, threshold: 0, pass: false },
  };
  
  // 1. Institutional Transactions > 5%
  if (finvizData.instTrans !== null) {
    if (finvizData.instTrans > 5) {
      score += 25;
      criteria.instTrans.pass = true;
      if (finvizData.instTrans > 10) score += 5;
    } else if (finvizData.instTrans > 0) {
      score += 10;
    }
  }
  
  // 2. EPS Growth QoQ > 0%
  if (finvizData.epsQoQ !== null) {
    if (finvizData.epsQoQ > 0) {
      score += 25;
      criteria.epsQoQ.pass = true;
      if (finvizData.epsQoQ > 50) score += 10;
      else if (finvizData.epsQoQ > 20) score += 5;
    }
  }
  
  // 3. Short Float > 5%
  if (finvizData.shortFloat !== null) {
    if (finvizData.shortFloat > 5) {
      score += 15;
      criteria.shortFloat.pass = true;
      if (finvizData.shortFloat > 20) score += 10;
      else if (finvizData.shortFloat > 10) score += 5;
    }
  }
  
  // 4. EPS Growth Next Year > 0%
  if (finvizData.epsNextY !== null) {
    if (finvizData.epsNextY > 0) {
      score += 25;
      criteria.epsNextY.pass = true;
      if (finvizData.epsNextY > 30) score += 10;
      else if (finvizData.epsNextY > 15) score += 5;
    }
  }
  
  // Bonus: Use Yahoo earnings trend if Finviz epsNextY missing
  if (criteria.epsNextY.value === null && earningsData?.earningsTrend?.trend) {
    const nextYear = earningsData.earningsTrend.trend.find(t => t.period === '+1y');
    if (nextYear?.growth?.raw > 0) {
      score += 15;
      criteria.epsNextY.value = nextYear.growth.raw;
      criteria.epsNextY.pass = true;
      criteria.epsNextY.source = 'Yahoo';
    }
  }
  
  // Calculate grade
  let grade;
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'A-';
  else if (score >= 60) grade = 'B+';
  else if (score >= 50) grade = 'B';
  else if (score >= 40) grade = 'B-';
  else if (score >= 30) grade = 'C+';
  else if (score >= 20) grade = 'C';
  else if (score >= 10) grade = 'C-';
  else grade = 'D';
  
  // Count criteria passed
  const passed = Object.values(criteria).filter(c => c.pass).length;
  
  return { 
    score: Math.min(99, score), 
    grade, 
    criteria,
    passed,
    total: 4
  };
}

// ============================================================================
// COMPOSITE RATING
// ============================================================================

function calculateCompositeRating(epsRating, rsRating, accDisRating, smrRating, groupRank, instGrowthScore) {
  const accDisScore = { 'A': 99, 'B+': 85, 'B': 75, 'B-': 65, 'C+': 55, 'C': 45, 'C-': 35, 'D': 25, 'E': 15 };
  const smrScore = { 'A': 99, 'B': 75, 'C': 50, 'D': 25 };
  const groupScore = Math.max(1, 99 - (groupRank / 2));
  
  const composite = (
    (epsRating * 0.20) +
    (rsRating * 0.20) +
    ((accDisScore[accDisRating] || 50) * 0.15) +
    ((smrScore[smrRating] || 50) * 0.10) +
    (groupScore * 0.10) +
    (instGrowthScore * 0.25)
  );
  
  return Math.min(99, Math.max(1, Math.round(composite)));
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 CANSLIM Scanner - Data Fetch Started');
  console.log(`📅 ${new Date().toISOString()}\n`);
  console.log('Data Sources: Yahoo Finance (prices, earnings) + Finviz (institutional/growth)\n');
  
  // Step 1: Yahoo price data
  console.log('📊 [1/4] Fetching Yahoo Finance price history...');
  const chartDataMap = {};
  const allReturns = [];
  
  for (const stock of STOCK_UNIVERSE) {
    const data = await fetchYahooData(stock.symbol);
    if (data) {
      chartDataMap[stock.symbol] = data;
      const closes = data.indicators?.quote?.[0]?.close || [];
      if (closes.length >= 200) {
        allReturns.push(((closes[closes.length - 1] - closes[0]) / closes[0]) * 100);
      }
    }
    await new Promise(r => setTimeout(r, 100));
    process.stdout.write('.');
  }
  console.log(' ✓\n');
  
  // Step 2: Yahoo quotes
  console.log('📈 [2/4] Fetching Yahoo Finance quotes...');
  const quoteData = await fetchQuoteData(STOCK_UNIVERSE.map(s => s.symbol));
  const quoteMap = {};
  quoteData.forEach(q => { quoteMap[q.symbol] = q; });
  console.log(` ✓ (${quoteData.length} quotes)\n`);
  
  // Step 3: Yahoo earnings
  console.log('💰 [3/4] Fetching Yahoo Finance earnings data...');
  const earningsMap = {};
  for (const stock of STOCK_UNIVERSE) {
    earningsMap[stock.symbol] = await fetchEarningsData(stock.symbol);
    await new Promise(r => setTimeout(r, 150));
    process.stdout.write('.');
  }
  console.log(' ✓\n');
  
  // Step 4: Finviz data
  console.log('📋 [4/4] Fetching Finviz institutional/growth data...');
  const finvizMap = {};
  for (const stock of STOCK_UNIVERSE) {
    finvizMap[stock.symbol] = await fetchFinvizData(stock.symbol);
    await new Promise(r => setTimeout(r, 250));
    process.stdout.write('.');
  }
  console.log(' ✓\n');
  
  // Calculate ratings
  console.log('🔢 Calculating CANSLIM ratings...\n');
  
  const stocksWithData = STOCK_UNIVERSE.map(stock => {
    const chartData = chartDataMap[stock.symbol];
    const closes = chartData?.indicators?.quote?.[0]?.close || [];
    const yearReturn = closes.length >= 200 
      ? ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100 
      : 0;
    
    return {
      ...stock,
      yearReturn,
      priceData: closes,
      chartData,
      quoteData: quoteMap[stock.symbol],
      earningsData: earningsMap[stock.symbol],
      finvizData: finvizMap[stock.symbol],
    };
  }).filter(s => s.chartData);
  
  const groupRanks = calculateGroupRanks(stocksWithData);
  
  const finalStocks = stocksWithData.map(stock => {
    const rsRating = calculateRSRating(stock.priceData, allReturns);
    const epsRating = calculateEPSRating(stock.earningsData, stock.finvizData, stock.priceData);
    const accDisRating = calculateAccDisRating(stock.chartData);
    const smrRating = calculateSMRRating(stock.quoteData, stock.finvizData);
    const groupRank = groupRanks[stock.symbol] || 99;
    
    const instGrowth = calculateInstGrowthScore(stock.finvizData, stock.earningsData);
    
    const compositeRating = calculateCompositeRating(
      epsRating, rsRating, accDisRating, smrRating, groupRank, instGrowth.score
    );
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      industry: stock.industry,
      // CANSLIM Ratings
      compositeRating,
      epsRating,
      rsRating,
      accDisRating,
      smrRating,
      groupRank,
      // NEW: Institutional/Growth Score
      instGrowthScore: instGrowth.score,
      instGrowthGrade: instGrowth.grade,
      instGrowthPassed: instGrowth.passed,
      // Finviz criteria details
      instTrans: stock.finvizData?.instTrans,
      epsQoQ: stock.finvizData?.epsQoQ,
      shortFloat: stock.finvizData?.shortFloat,
      epsNextY: stock.finvizData?.epsNextY,
      // Additional Finviz data
      instOwn: stock.finvizData?.instOwn,
      insiderTrans: stock.finvizData?.insiderTrans,
      roe: stock.finvizData?.roe,
      perfWeek: stock.finvizData?.perfWeek,
      perfMonth: stock.finvizData?.perfMonth,
      perfYTD: stock.finvizData?.perfYTD,
      // Price data
      price: stock.quoteData?.regularMarketPrice || 0,
      change: stock.quoteData?.regularMarketChangePercent || 0,
      marketCap: (stock.quoteData?.marketCap || 0) / 1e9,
      pe: stock.quoteData?.trailingPE || 0,
      yearHigh: stock.quoteData?.fiftyTwoWeekHigh || 0,
      yearLow: stock.quoteData?.fiftyTwoWeekLow || 0,
      avgVolume: (stock.quoteData?.averageDailyVolume3Month || 0) / 1e6,
    };
  });
  
  finalStocks.sort((a, b) => b.compositeRating - a.compositeRating);
  
  // Save output
  const output = {
    lastUpdated: new Date().toISOString(),
    dataSources: ['Yahoo Finance', 'Finviz'],
    finvizCriteria: {
      instTrans: '> 5% (Institutional buying)',
      epsQoQ: '> 0% (Quarter over quarter EPS growth)',
      shortFloat: '> 5% (Short interest)',
      epsNextY: '> 0% (Projected next year EPS growth)',
    },
    ratingWeights: {
      epsRating: '20%',
      rsRating: '20%',
      accDisRating: '15%',
      smrRating: '10%',
      groupRank: '10%',
      instGrowthScore: '25%',
    },
    stocks: finalStocks.slice(0, 50),
  };
  
  const outputPath = path.join(__dirname, '..', 'data', 'stocks.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  // Print results
  console.log('═'.repeat(100));
  console.log('📊 TOP 15 CANSLIM LEADERS WITH INSTITUTIONAL/GROWTH SCORES');
  console.log('═'.repeat(100));
  console.log('Rank | Symbol | Comp | EPS | RS  | A/D | SMR | Grp | I/G Grade | InstTr% | EPSq% | Short% | EPSnxtY%');
  console.log('─'.repeat(100));
  
  finalStocks.slice(0, 15).forEach((s, i) => {
    const fmt = (v) => v !== null && v !== undefined ? v.toFixed(1).padStart(6) : '   N/A';
    console.log(
      `${String(i + 1).padStart(4)} | ${s.symbol.padEnd(6)} | ${String(s.compositeRating).padStart(4)} | ${String(s.epsRating).padStart(3)} | ${String(s.rsRating).padStart(3)} | ${s.accDisRating.padStart(3)} | ${s.smrRating.padStart(3)} | ${String(s.groupRank).padStart(3)} | ${s.instGrowthGrade.padStart(5)} (${String(s.instGrowthPassed)}/4) |${fmt(s.instTrans)} |${fmt(s.epsQoQ)} |${fmt(s.shortFloat)} |${fmt(s.epsNextY)}`
    );
  });
  
  console.log('═'.repeat(100));
  console.log(`\n✅ Saved ${finalStocks.length} stocks to ${outputPath}\n`);
}

main().catch(console.error);
