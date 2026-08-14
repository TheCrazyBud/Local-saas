export default function BarChart({ data, color = '#fff', height = '120px', highlightLast = false }: { data: number[], color?: string, height?: string, highlightLast?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height, width: '100%' }}>
      {data.map((h, i) => {
        const isLast = i === data.length - 1;
        const isNeon = highlightLast && isLast;
        return (
          <div key={i} style={{ 
            flex: 1, 
            height: `${Math.max(2, Math.min(100, h))}%`, 
            background: isNeon ? '#39ff14' : color, 
            boxShadow: isNeon ? '0 0 12px rgba(57, 255, 20, 0.6)' : 'none',
            borderRadius: '2px',
            transition: 'height 0.5s ease, background 0.3s ease'
          }}></div>
        );
      })}
    </div>
  );
}
