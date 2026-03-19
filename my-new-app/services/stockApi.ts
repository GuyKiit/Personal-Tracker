export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
}

export interface ChartPoint {
  date: string;
  timestamp: number;
  close: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y';

const RANGE_INTERVALS: Record<TimeRange, string> = {
  '1d': '1m',
  '5d': '15m',
  '1mo': '1d',
  '3mo': '1d',
  '6mo': '1d',
  '1y': '1wk',
  '5y': '1mo',
};

const BASE_URL = 'https://query1.finance.yahoo.com';

/**
 * Search for stock symbols via Yahoo Finance
 */
export async function searchSymbols(query: string): Promise<StockSearchResult[]> {
  if (!query.trim()) return [];

  const url = `${BASE_URL}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&listsCount=0`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    
    const parsed = await res.json();
    if (!parsed.quotes) return [];

    return parsed.quotes
      .filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        type: q.quoteType,
        exchange: q.exchDisp || q.exchange,
      }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

/**
 * Fetch stock chart data + quote from Yahoo Finance
 */
export async function fetchStockChart(
  symbol: string,
  range: TimeRange = '3mo'
): Promise<{ quote: StockQuote; chart: ChartPoint[] }> {
  const interval = RANGE_INTERVALS[range];
  const url = `${BASE_URL}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Network response was not ok');
  
  const parsed = await res.json();

  const result = parsed.chart?.result?.[0];
  if (!result) throw new Error('No data found for this symbol');

  const meta = result.meta;
  const timestamps: number[] = result.timestamp || [];
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || [];

  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
  const currentPrice = meta.regularMarketPrice ?? closes[closes.length - 1] ?? 0;
  const change = currentPrice - previousClose;
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

  const quote: StockQuote = {
    symbol: meta.symbol,
    name: meta.shortName || meta.longName || meta.symbol,
    price: currentPrice,
    previousClose,
    change,
    changePercent,
    currency: meta.currency || 'USD',
    marketState: meta.marketState || 'CLOSED',
  };

  const chart: ChartPoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (closes[i] != null) {
      const d = new Date(timestamps[i] * 1000);
      const dateStr =
        range === '1d' || range === '5d'
          ? d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: range === '5y' || range === '1y' ? 'numeric' : undefined });

      chart.push({
        date: dateStr,
        timestamp: timestamps[i],
        close: closes[i]!,
      });
    }
  }

  return { quote, chart };
}
