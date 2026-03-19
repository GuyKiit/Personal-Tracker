import { useState, useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';
import Collapse from '@mui/material/Collapse';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  searchSymbols,
  fetchStockChart,
  type StockQuote,
  type ChartPoint,
  type StockSearchResult,
  type TimeRange,
} from '../services/stockApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
];

export default function StockSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3mo');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced symbol search
  useEffect(() => {
    if (!query.trim() || query.length < 1) {
      setSuggestions([]);
      return;
    }

    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchSymbols(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(searchTimer.current);
  }, [query]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = useCallback(
    async (symbol: string, range: TimeRange) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStockChart(symbol, range);
        setQuote(data.quote);
        setChartData(data.chart);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch stock data. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSelectSymbol = useCallback(
    (symbol: string) => {
      setQuery(symbol);
      setShowSuggestions(false);
      fetchData(symbol, selectedRange);
    },
    [fetchData, selectedRange]
  );

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      setShowSuggestions(false);
      fetchData(query.trim().toUpperCase(), selectedRange);
    }
  }, [query, fetchData, selectedRange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch]
  );

  const handleRangeChange = useCallback(
    (range: TimeRange) => {
      setSelectedRange(range);
      if (quote) {
        fetchData(quote.symbol, range);
      }
    },
    [quote, fetchData]
  );

  const isPositive = quote ? quote.change >= 0 : true;
  const chartColor = isPositive ? '#10b981' : '#ef4444';
  const chartBgColor = isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)';

  const chartConfig = {
    labels: chartData.map((p) => p.date),
    datasets: [
      {
        label: quote?.symbol || 'Price',
        data: chartData.map((p) => p.close),
        borderColor: chartColor,
        backgroundColor: chartBgColor,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: chartColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 35, 0.95)',
        titleColor: '#94a3b8',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        bodyFont: { size: 14, weight: 600 },
        callbacks: {
          label: (context: any) => {
            return ` ${quote?.currency || ''} ${context.raw?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          maxTicksLimit: 8,
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (value: any) => value.toLocaleString(),
        },
        border: { display: false },
        position: 'right' as const,
      },
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        borderRadius: 3,
        position: 'relative',
        overflow: 'visible',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #06b6d4, #7c3aed, #f59e0b)',
          borderRadius: '12px 12px 0 0',
        },
      }}
    >
      {/* Search Input */}
      <Box sx={{ position: 'relative', mb: 2 }} ref={suggestionsRef}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search stock symbol (e.g. AAPL, GOOGL, PTT.BK)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          inputRef={inputRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchLoading ? (
                  <CircularProgress size={18} sx={{ color: '#7c3aed' }} />
                ) : (
                  <IconButton
                    size="small"
                    onClick={handleSearch}
                    sx={{
                      background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                      color: '#fff',
                      width: 30,
                      height: 30,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
                      },
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </InputAdornment>
            ),
            sx: { fontSize: '0.95rem' },
          }}
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1300,
              mt: 0.5,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(26, 26, 46, 0.98)',
              backdropFilter: 'blur(20px)',
              maxHeight: 320,
              overflowY: 'auto',
            }}
          >
            {suggestions.map((s) => (
              <Box
                key={s.symbol}
                onClick={() => handleSelectSymbol(s.symbol)}
                sx={{
                  px: 2,
                  py: 1.5,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s',
                  '&:hover': {
                    background: 'rgba(124, 58, 237, 0.12)',
                  },
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  '&:last-of-type': { borderBottom: 'none' },
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0' }}>
                    {s.symbol}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                    {s.name}
                  </Typography>
                </Box>
                <Chip
                  label={s.exchange}
                  size="small"
                  sx={{
                    fontSize: '0.65rem',
                    height: 20,
                    background: 'rgba(124, 58, 237, 0.15)',
                    color: '#a78bfa',
                    fontWeight: 600,
                  }}
                />
              </Box>
            ))}
          </Paper>
        )}
      </Box>

      {/* Error */}
      <Collapse in={!!error}>
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            mb: 2,
            borderRadius: 2,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          {error}
        </Alert>
      </Collapse>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#7c3aed' }} />
        </Box>
      )}

      {/* Stock Data */}
      {!loading && quote && (
        <Fade in timeout={400}>
          <Box>
            {/* Quote Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
                mb: 2,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.3rem' }}>
                    {quote.symbol}
                  </Typography>
                  <Chip
                    label={quote.marketState === 'REGULAR' ? 'LIVE' : quote.marketState}
                    size="small"
                    sx={{
                      fontSize: '0.6rem',
                      height: 18,
                      fontWeight: 700,
                      background:
                        quote.marketState === 'REGULAR'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(148, 163, 184, 0.15)',
                      color: quote.marketState === 'REGULAR' ? '#10b981' : '#94a3b8',
                      letterSpacing: '0.05em',
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {quote.name}
                </Typography>
              </Box>

              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: '2rem',
                    lineHeight: 1.1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {quote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.85rem', color: '#64748b', ml: 0.5, fontWeight: 500 }}
                  >
                    {quote.currency}
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                  {isPositive ? (
                    <ArrowDropUpIcon sx={{ color: '#10b981', fontSize: 22 }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ color: '#ef4444', fontSize: 22 }} />
                  )}
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: isPositive ? '#10b981' : '#ef4444',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {isPositive ? '+' : ''}
                    {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
                    {quote.changePercent.toFixed(2)}%)
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Time Range Selector */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <ButtonGroup size="small" variant="outlined">
                {TIME_RANGES.map((r) => (
                  <Button
                    key={r.value}
                    onClick={() => handleRangeChange(r.value)}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      px: 1.8,
                      color: selectedRange === r.value ? '#fff' : '#64748b',
                      borderColor: 'rgba(255,255,255,0.1)',
                      background:
                        selectedRange === r.value
                          ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))'
                          : 'transparent',
                      '&:hover': {
                        borderColor: 'rgba(124,58,237,0.4)',
                        background:
                          selectedRange === r.value
                            ? 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(6,182,212,0.3))'
                            : 'rgba(255,255,255,0.04)',
                      },
                    }}
                  >
                    {r.label}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>

            {/* Chart */}
            <Box
              sx={{
                height: { xs: 220, sm: 300 },
                p: 1,
                borderRadius: 2,
                background: 'rgba(15, 15, 35, 0.4)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <Line data={chartConfig} options={chartOptions} />
            </Box>

            {/* Quick Stats */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1.5,
                mt: 2,
              }}
            >
              {[
                {
                  label: 'Previous Close',
                  value: quote.previousClose.toLocaleString('en-US', { minimumFractionDigits: 2 }),
                  icon: <TrendingUpIcon sx={{ fontSize: 14 }} />,
                },
                {
                  label: 'High',
                  value: chartData.length > 0 ? Math.max(...chartData.map((d) => d.close)).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-',
                  icon: <ArrowDropUpIcon sx={{ fontSize: 16 }} />,
                },
                {
                  label: 'Low',
                  value: chartData.length > 0 ? Math.min(...chartData.map((d) => d.close)).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-',
                  icon: <ArrowDropDownIcon sx={{ fontSize: 16 }} />,
                },
              ].map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    textAlign: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3, mb: 0.5 }}>
                    {stat.icon}
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>
                    {stat.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>
      )}

      {/* Empty State */}
      {!loading && !quote && !error && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(124, 58, 237, 0.08))',
              border: '1px solid rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <TrendingUpIcon sx={{ color: '#06b6d4', fontSize: 28 }} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
            Search for a Stock
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
            ค้นหาหุ้นด้วยชื่อหรือสัญลักษณ์ เช่น AAPL, TSLA, PTT.BK
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
