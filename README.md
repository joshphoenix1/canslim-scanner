# CANSLIM Stock Scanner

A real-time stock scanner based on William O'Neil's CANSLIM methodology, featuring live TradingView charts and automated daily data updates via GitHub Actions.

![CANSLIM Scanner](https://img.shields.io/badge/CANSLIM-Scanner-blue)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Daily%20Updates-green)
![TradingView](https://img.shields.io/badge/TradingView-Live%20Charts-orange)

## 🚀 Live Demo

**[View Live Scanner](https://joshphoenix1.github.io/canslim-scanner/)**

*(Replace YOUR_USERNAME with your GitHub username after setup)*

## ✨ Features

- **Real CANSLIM Ratings** calculated from actual market data:
  - **Composite Rating** - Weighted combination of all factors
  - **EPS Rating** - Earnings momentum (proxy from price data)
  - **RS Rating** - Relative Strength vs all stocks
  - **A/D Rating** - Accumulation/Distribution pattern
  - **SMR Rating** - Sales/Margins/ROE proxy
  - **Group Rank** - Industry group performance ranking

- **Live TradingView Charts** with:
  - Multiple timeframes (1m, 5m, 15m, 1H, 4H, 1D, 1W, 1M)
  - Moving averages (10, 21, 50-day)
  - Volume analysis
  - Technical indicators

- **Additional Widgets**:
  - Technical Analysis (Buy/Sell/Neutral signals)
  - Company Profile
  - Financial statements

- **Automated Updates**:
  - GitHub Actions fetches fresh data daily at 6:30 PM ET
  - Automatically deploys to GitHub Pages

## 📦 Setup Instructions

### 1. Fork or Clone This Repository

```bash
git clone https://github.com/YOUR_USERNAME/canslim-scanner.git
cd canslim-scanner
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. Save

### 3. Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. Click "I understand my workflows, go ahead and enable them"
3. The workflow will run automatically on:
   - Every push to `main` branch
   - Daily at 6:30 PM ET (weekdays)
   - Manual trigger via "Run workflow" button

### 4. Run Initial Data Fetch

1. Go to **Actions** → **Update CANSLIM Data**
2. Click **Run workflow** → **Run workflow**
3. Wait for completion (~2 minutes)

### 5. Access Your Scanner

Your scanner will be live at:
```
https://YOUR_USERNAME.github.io/canslim-scanner/
```

## 📁 Project Structure

```
canslim-scanner/
├── index.html              # Main scanner UI
├── data/
│   └── stocks.json         # Generated stock data (auto-updated)
├── scripts/
│   └── fetch-data.js       # Data fetching & rating calculations
├── .github/
│   └── workflows/
│       └── update-data.yml # GitHub Actions workflow
└── README.md
```

## 🔧 Customization

### Add/Remove Stocks

Edit `STOCK_UNIVERSE` array in `scripts/fetch-data.js`:

```javascript
const STOCK_UNIVERSE = [
  { symbol: 'AAPL', name: 'Apple Inc', sector: 'Technology', industry: 'Electronics' },
  // Add more stocks here...
];
```

### Change Update Schedule

Edit `.github/workflows/update-data.yml`:

```yaml
schedule:
  # Run at 6:30 PM ET (23:30 UTC) on weekdays
  - cron: '30 23 * * 1-5'
```

### Modify Rating Calculations

Edit the calculation functions in `scripts/fetch-data.js`:
- `calculateRSRating()` - Relative Strength
- `calculateEPSRating()` - EPS proxy
- `calculateAccDisRating()` - Accumulation/Distribution
- `calculateSMRRating()` - Sales/Margins/ROE
- `calculateCompositeRating()` - Overall composite

## ⚠️ Limitations

1. **EPS Rating** is approximated from price momentum since Yahoo Finance doesn't provide historical quarterly EPS. For true EPS ratings, you'd need a paid data source like:
   - IBD/MarketSmith ($150/month)
   - Financial Modeling Prep API
   - Polygon.io

2. **Rate Limits** - Yahoo Finance may rate limit requests. The script includes delays to mitigate this.

3. **Data Accuracy** - This is an approximation of the official IBD CANSLIM ratings. For professional trading, consider subscribing to official IBD services.

## 📊 Rating Methodology

| Rating | Description | Calculation |
|--------|-------------|-------------|
| **Composite** | Overall score (1-99) | Weighted average of all factors |
| **EPS** | Earnings strength (1-99) | Quarterly price momentum proxy |
| **RS** | Relative Strength (1-99) | 12-month return percentile vs all stocks |
| **A/D** | Accumulation/Distribution (A-E) | Price/volume relationship over 13 weeks |
| **SMR** | Sales/Margins/ROE (A-D) | P/E and profit margin analysis |
| **Group** | Industry Rank (1-197) | Sector performance ranking |

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## 📜 License

MIT License - feel free to use for personal or commercial purposes.

## 🙏 Acknowledgments

- [TradingView](https://www.tradingview.com/) for embedded chart widgets
- [Yahoo Finance](https://finance.yahoo.com/) for market data
- [William O'Neil](https://www.investors.com/) for the CANSLIM methodology
