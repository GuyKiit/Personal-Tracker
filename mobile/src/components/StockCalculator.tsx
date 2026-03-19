import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Surface,
  TextInput,
  IconButton,
  Button,
  useTheme,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PlusCircle,
  Trash2,
  RefreshCw,
  TrendingUp,
  Package,
  Wallet,
} from 'lucide-react-native';

interface TransactionRow {
  id: number;
  price: string;
  qty: string;
}

let nextId = 1;
function createRow(): TransactionRow {
  return { id: nextId++, price: '', qty: '' };
}

export default function StockCalculator() {
  const [rows, setRows] = useState<TransactionRow[]>([createRow(), createRow()]);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, createRow()]);
  }, []);

  const removeRow = useCallback((id: number) => {
    setRows((prev) => {
      if (prev.length <= 1) {
        return [createRow()];
      }
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const updateRow = useCallback((id: number, field: 'price' | 'qty', value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }, []);

  const clearAll = useCallback(() => {
    nextId = 1;
    setRows([createRow(), createRow()]);
  }, []);

  const results = useMemo(() => {
    let totalCost = 0;
    let totalQty = 0;

    rows.forEach((row) => {
      const price = parseFloat(row.price) || 0;
      const qty = parseFloat(row.qty) || 0;
      if (price > 0 && qty > 0) {
        totalCost += price * qty;
        totalQty += qty;
      }
    });

    const avgPrice = totalQty > 0 ? totalCost / totalQty : 0;
    return { totalCost, totalQty, avgPrice };
  }, [rows]);

  const formatCurrency = (num: number) =>
    num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Input Section */}
        <Surface style={styles.inputSurface} elevation={1}>
          <View style={styles.headerIndicator} />
          
          <View style={styles.rowHeader}>
            <Text style={styles.columnLabel}>PRICE</Text>
            <Text style={styles.columnLabel}>QTY</Text>
            <View style={{ width: 40 }} />
          </View>

          {rows.map((row) => (
            <View key={row.id} style={styles.row}>
              <TextInput
                mode="flat"
                placeholder="0.00"
                keyboardType="numeric"
                value={row.price}
                onChangeText={(val) => updateRow(row.id, 'price', val)}
                style={styles.textInput}
                dense
              />
              <TextInput
                mode="flat"
                placeholder="0"
                keyboardType="numeric"
                value={row.qty}
                onChangeText={(val) => updateRow(row.id, 'qty', val)}
                style={styles.textInput}
                dense
              />
              <IconButton
                icon={() => <Trash2 size={18} color="#ef4444" />}
                onPress={() => removeRow(row.id)}
                size={20}
              />
            </View>
          ))}

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={addRow}
              icon={() => <PlusCircle size={18} color="#fff" />}
              style={styles.addButton}
            >
              Add Row
            </Button>
            <Button
              mode="outlined"
              onPress={clearAll}
              icon={() => <RefreshCw size={18} color="#ef4444" />}
              textColor="#ef4444"
              style={styles.clearButton}
            >
              Clear
            </Button>
          </View>
        </Surface>

        {/* Results Section */}
        <Surface style={styles.resultSurface} elevation={2}>
          <View style={styles.resultHeader}>
            <View style={styles.iconCircle}>
              <TrendingUp size={24} color="#10b981" />
            </View>
            <Text style={styles.resultLabel}>AVERAGE PRICE</Text>
            <Text style={[styles.avgValue, { color: results.avgPrice > 0 ? '#10b981' : '#64748b' }]}>
              {formatCurrency(results.avgPrice)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <Package size={14} color="#a78bfa" />
                <Text style={styles.statLabelText}>TOTAL QTY</Text>
              </View>
              <Text style={styles.statValueText}>{results.totalQty.toLocaleString()}</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <Wallet size={14} color="#67e8f9" />
                <Text style={styles.statLabelText}>TOTAL COST</Text>
              </View>
              <Text style={styles.statValueText}>{formatCurrency(results.totalCost)}</Text>
            </View>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  inputSurface: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.5)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  rowHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  columnLabel: {
    flex: 1,
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  addButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
  },
  clearButton: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
  },
  resultSurface: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  resultHeader: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  avgValue: {
    fontSize: 40,
    fontWeight: '900',
    marginTop: 4,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 16,
    borderRadius: 12,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statLabelText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  statValueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
