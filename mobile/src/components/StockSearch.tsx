import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {
  Text,
  Surface,
  Searchbar,
  IconButton,
  Card,
  Chip,
  MD3Colors,
  useTheme,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { LineChart } from 'react-native-wagmi-charts';
import {
  TrendingUp,
  TrendingDown,
  Search,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import {
  searchSymbols,
  fetchStockChart,
  type StockQuote,
  type ChartPoint,
  type StockSearchResult,
  type TimeRange,
} from '../services/stockApi';

const { width } = Dimensions.get('window');

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
];

export default function StockSearch() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [chartData, setChartData] = useState<{ timestamp: number; value: number }[]>([]);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3mo');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);
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

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query]);

  const fetchData = useCallback(async (symbol: string, range: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStockChart(symbol, range);
      setQuote(data.quote);
      setChartData(data.chart.map(p => ({ timestamp: p.timestamp * 1000, value: p.close })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectSymbol = (symbol: string) => {
    setQuery(symbol);
    setShowSuggestions(false);
    fetchData(symbol, selectedRange);
  };

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    if (quote) {
      fetchData(quote.symbol, range);
    }
  };

  const isPositive = quote ? quote.change >= 0 : true;
  const chartColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <View style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="เช่น (AAPL, NVDA)"
          onChangeText={setQuery}
          value={query}
          loading={searchLoading}
          style={styles.searchBar}
          placeholderTextColor="#94a3b8"
          iconColor="#94a3b8"
          onFocus={() => setShowSuggestions(true)}
        />

        {showSuggestions && suggestions.length > 0 && (
          <Surface style={styles.suggestions} elevation={4}>
            {suggestions.map((s) => (
              <TouchableOpacity
                key={s.symbol}
                onPress={() => handleSelectSymbol(s.symbol)}
                style={styles.suggestionItem}
              >
                <View>
                  <Text style={styles.suggestionSymbol}>{s.symbol}</Text>
                  <Text style={styles.suggestionName} numberOfLines={1}>{s.name}</Text>
                </View>
                <Chip textStyle={{ fontSize: 10 }} style={styles.exchangeChip}>
                  {s.exchange}
                </Chip>
              </TouchableOpacity>
            ))}
          </Surface>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color="#7c3aed" size="large" />
          </View>
        ) : error ? (
          <Surface style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </Surface>
        ) : quote ? (
          <View>
            {/* Header Card */}
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.9)']}
              style={styles.headerCard}
            >
              <View style={styles.headerTop}>
                <View>
                  <View style={styles.symbolRow}>
                    <Text style={styles.symbolText}>{quote.symbol}</Text>
                    <Surface style={[styles.marketBadge, { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239,68,68,0.1)' }]}>
                      <Text style={{ color: chartColor, fontSize: 10, fontWeight: 'bold' }}>LIVE</Text>
                    </Surface>
                  </View>
                  <Text style={styles.nameText}>{quote.name}</Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.priceText}>
                    {quote.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                  <View style={styles.changeRow}>
                    {isPositive ? <ChevronUp size={16} color={chartColor} /> : <ChevronDown size={16} color={chartColor} />}
                    <Text style={[styles.changeText, { color: chartColor }]}>
                      {quote.changePercent.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* Time Range Selector */}
              <View style={styles.rangeContainer}>
                {TIME_RANGES.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => handleRangeChange(r.value)}
                    style={[
                      styles.rangeButton,
                      selectedRange === r.value && styles.rangeButtonActive,
                    ]}
                  >
                    <Text style={[
                      styles.rangeButtonText,
                      selectedRange === r.value && styles.rangeButtonTextActive
                    ]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Chart */}
              <View style={styles.chartWrapper}>
                {chartData.length > 0 && (
                  <LineChart.Provider data={chartData}>
                    <LineChart height={200} width={width - 48}>
                      <LineChart.Path color={chartColor} width={2}>
                        <LineChart.Gradient color={chartColor} opacity={0.2} />
                      </LineChart.Path>
                      <LineChart.CursorCrosshair color={chartColor}>
                        <LineChart.Tooltip />
                      </LineChart.CursorCrosshair>
                    </LineChart>
                  </LineChart.Provider>
                )}
              </View>
            </LinearGradient>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <StatItem label="PREV CLOSE" value={quote.previousClose.toLocaleString()} icon={<TrendingUp size={14} color="#64748b" />} />
              <StatItem
                label="HIGH"
                value={Math.max(...chartData.map(d => d.value)).toLocaleString()}
                icon={<ChevronUp size={14} color="#64748b" />}
              />
              <StatItem
                label="LOW"
                value={Math.min(...chartData.map(d => d.value)).toLocaleString()}
                icon={<ChevronDown size={14} color="#64748b" />}
              />
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Search size={32} color="#06b6d4" />
            </View>
            <Text style={styles.emptyTitle}>Search for a Stock</Text>
            <Text style={styles.emptySubtitle}>ค้นหาหุ้นเช่น AAPL, TSLA, NVDA</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Surface style={styles.statItem} elevation={1}>
      <View style={styles.statHeader}>
        {icon}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    zIndex: 100,
    marginBottom: 16,
    position: 'relative',
  },
  searchBar: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  suggestions: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  suggestionSymbol: {
    color: '#e2e8f0',
    fontWeight: 'bold',
  },
  suggestionName: {
    color: '#64748b',
    fontSize: 12,
    maxWidth: 180,
  },
  exchangeChip: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  centerBox: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: '#ef4444',
  },
  headerCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbolText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  marketBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nameText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 4,
    borderRadius: 10,
  },
  rangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rangeButtonActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
  },
  rangeButtonText: {
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  rangeButtonTextActive: {
    color: '#fff',
  },
  chartWrapper: {
    height: 200,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  statValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#64748b',
  },
});
