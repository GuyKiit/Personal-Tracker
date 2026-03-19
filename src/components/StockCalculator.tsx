import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InventoryIcon from '@mui/icons-material/Inventory';

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
    num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  const formatNumber = (num: number) =>
    num.toLocaleString('en-US', { maximumFractionDigits: 4 });

  return (
    <>
      {/* Input Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #10b981)',
          },
        }}
      >
        {/* Column Headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr 40px', sm: '1fr 1fr 48px' },
            gap: { xs: 1, sm: 2 },
            mb: 2,
            px: 0.5,
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            ราคา (Price)
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            จำนวน (Qty)
          </Typography>
          <Box />
        </Box>

        {/* Transaction Rows */}
        {rows.map((row) => (
          <Fade in key={row.id} timeout={300}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr 40px', sm: '1fr 1fr 48px' },
                gap: { xs: 1, sm: 2 },
                mb: 1.5,
                alignItems: 'center',
                p: 1,
                borderRadius: 2,
                transition: 'background 0.2s',
                '&:hover': { background: 'rgba(255, 255, 255, 0.02)' },
              }}
            >
              <TextField
                type="number"
                placeholder="0.00"
                size="small"
                value={row.price}
                onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                inputProps={{ min: 0, step: '0.01' }}
                InputProps={{
                  sx: {
                    fontSize: '0.95rem',
                    '& input': {
                      '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0,
                      },
                      MozAppearance: 'textfield',
                    },
                  },
                }}
              />
              <TextField
                type="number"
                placeholder="0"
                size="small"
                value={row.qty}
                onChange={(e) => updateRow(row.id, 'qty', e.target.value)}
                inputProps={{ min: 0 }}
                InputProps={{
                  sx: {
                    fontSize: '0.95rem',
                    '& input': {
                      '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0,
                      },
                      MozAppearance: 'textfield',
                    },
                  },
                }}
              />
              <Tooltip title={rows.length <= 1 ? 'Clear' : 'Remove'} arrow>
                <IconButton
                  size="small"
                  onClick={() => removeRow(row.id)}
                  sx={{
                    color: '#94a3b8',
                    transition: 'all 0.2s',
                    '&:hover': { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Fade>
        ))}

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2.5,
            pt: 2,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={addRow}
            sx={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
              },
              transition: 'all 0.3s',
            }}
          >
            Add Row
          </Button>
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={clearAll}
            sx={{
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              '&:hover': { borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.08)' },
            }}
          >
            Clear All
          </Button>
        </Box>
      </Paper>

      {/* Results Card */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
        {/* Average Price */}
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <TrendingUpIcon sx={{ color: '#10b981', fontSize: 28 }} />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: 600, mb: 1 }}
          >
            ราคาเฉลี่ย (Average Price)
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.2rem', sm: '3rem' },
              lineHeight: 1.1,
              color: results.avgPrice > 0 ? '#10b981' : '#475569',
              textShadow: results.avgPrice > 0 ? '0 0 30px rgba(16, 185, 129, 0.2)' : 'none',
              transition: 'all 0.3s ease',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatCurrency(results.avgPrice)}
          </Typography>
        </Box>

        {/* Divider */}
        <Box sx={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', my: 1 }} />

        {/* Sub-stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 2 }}>
          <Box
            sx={{
              textAlign: 'center',
              p: 2,
              borderRadius: 2,
              background: 'rgba(124, 58, 237, 0.06)',
              border: '1px solid rgba(124, 58, 237, 0.1)',
              transition: 'all 0.2s',
              '&:hover': { background: 'rgba(124, 58, 237, 0.1)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
              <InventoryIcon sx={{ fontSize: 16, color: '#a78bfa' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                จำนวนหุ้นรวม
              </Typography>
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.5rem',
                color: results.totalQty > 0 ? '#a78bfa' : '#475569',
                fontVariantNumeric: 'tabular-nums',
                transition: 'color 0.3s',
              }}
            >
              {formatNumber(results.totalQty)}
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              p: 2,
              borderRadius: 2,
              background: 'rgba(6, 182, 212, 0.06)',
              border: '1px solid rgba(6, 182, 212, 0.1)',
              transition: 'all 0.2s',
              '&:hover': { background: 'rgba(6, 182, 212, 0.1)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 16, color: '#67e8f9' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                มูลค่ารวม
              </Typography>
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.5rem',
                color: results.totalCost > 0 ? '#67e8f9' : '#475569',
                fontVariantNumeric: 'tabular-nums',
                transition: 'color 0.3s',
              }}
            >
              {formatCurrency(results.totalCost)}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </>
  );
}
