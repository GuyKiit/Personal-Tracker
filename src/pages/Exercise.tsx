import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

export default function Exercise() {
  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
          }}
        >
          Exercise Tracker
        </Typography>
        <Typography variant="body2" color="text.secondary">
          บันทึกการออกกำลังกาย
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 6,
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.1))',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <FitnessCenterIcon sx={{ color: '#f59e0b', fontSize: 36 }} />
        </Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ฟีเจอร์นี้กำลังพัฒนา...
        </Typography>
      </Paper>
    </Box>
  );
}
