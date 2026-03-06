import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

export default function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <Card sx={{
      borderRadius: 4,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: `0 16px 40px ${color}30`,
      },
    }}>
      <CardContent sx={{ p: 3.5 }}>
        {/* Top Row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{
            backgroundColor: `${color}15`,
            borderRadius: '14px', p: 1.5,
            border: `1px solid ${color}25`,
          }}>
            <Box sx={{ color, display: 'flex', fontSize: 28 }}>{icon}</Box>
          </Box>
          {/* Decorative circles */}
          <Box sx={{ position: 'relative', width: 60, height: 40 }}>
            <Box sx={{
              position: 'absolute', right: 0, top: 0,
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: `${color}10`,
              border: `2px solid ${color}20`,
            }} />
            <Box sx={{
              position: 'absolute', right: 16, top: 8,
              width: 24, height: 24, borderRadius: '50%',
              backgroundColor: `${color}15`,
            }} />
          </Box>
        </Box>

        {/* Value */}
        <Typography variant="h2" fontWeight={800} color="#1E1B4B" lineHeight={1} mb={0.5}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color={color} fontWeight={600} mt={0.5} display="block">
            {subtitle}
          </Typography>
        )}

        {/* Bottom bar */}
        <Box sx={{
          mt: 2.5, height: 5, borderRadius: 3,
          background: `linear-gradient(90deg, ${color}30, ${color})`,
        }} />
      </CardContent>
    </Card>
  );
}
