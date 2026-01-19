'use client';

interface SummaryTableProps {
  type?: string;
  data?: any[];
  topProducts?: any[];
  loading?: boolean;
}

export default function SummaryTable({ type, data, topProducts, loading }: SummaryTableProps) {
  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
      <p style={{ color: '#64748b' }}>Summary Table Component</p>
    </div>
  );
}
