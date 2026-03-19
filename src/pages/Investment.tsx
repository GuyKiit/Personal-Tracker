import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StockSearch from '../components/StockSearch';
import StockCalculator from '../components/StockCalculator';

export default function Investment() {
  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
          }}
        >
          Stock Average Calculator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ค้นหาราคาหุ้นและคำนวณต้นทุนเฉลี่ยต่อหุ้น (DCA)
        </Typography>
      </Box>

      {/* Stock Search + Chart */}
      <StockSearch />

      {/* Stock Calculator */}
      <StockCalculator />

      {/* Tip */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
        >
          <ShowChartIcon sx={{ fontSize: 14 }} />
          กรอกราคาและจำนวนหุ้นที่ซื้อแต่ละครั้ง ระบบจะคำนวณต้นทุนเฉลี่ยให้อัตโนมัติ
        </Typography>
      </Box>
    </Box>
  );
}
