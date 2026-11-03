import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import TechPageTitle from '../components/TechPageTitle';
import DeviceTypeIcon from '../components/DeviceTypeIcon';

const COLORS = ['#ea580c', '#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function CostInsightsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [device, setDevice] = useState(null);
  const [insights, setInsights] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      fetchDevices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deviceRes, insightsRes] = await Promise.all([
        api.devices.get(id),
        api.devices.costInsights(id)
      ]);
      setDevice(deviceRes.data);
      setInsights(insightsRes.data);
    } catch (error) {
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await api.devices.list();
      setDevices(res.data);
    } catch (error) {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  if (loading) {
    return (
      <div className="stagger-children">
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: 'var(--space-2)' }} />
          <div className="skeleton" style={{ height: '20px', width: '400px' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-6">
              <div className="skeleton" style={{ height: '32px', width: '60%', marginBottom: 'var(--space-2)' }} />
              <div className="skeleton" style={{ height: '48px', width: '80%' }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
          <div className="card p-6"><div className="skeleton" style={{ height: '300px' }} /></div>
          <div className="card p-6"><div className="skeleton" style={{ height: '300px' }} /></div>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="stagger-children">
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <TechPageTitle text="Cost Insights" />
          <p style={{ color: 'var(--color-text-secondary)' }}>Select a device to analyze repair costs</p>
        </div>
        {devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
            {devices.map(device => (
              <button
                key={device._id}
                className="card card-elevated p-6"
                style={{ textAlign: 'left', cursor: 'pointer', border: 'none', width: '100%' }}
                onClick={() => navigate(`/insights/${device._id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <span className="avatar" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}>
                    {device.brand[0]}
                  </span>
                  <div>
                    <p style={{ fontWeight: 600 }}>{device.brand} {device.model}</p>
                    <p className="device-category-label"><DeviceTypeIcon category={device.category} size={16} />{device.category}</p>
                  </div>
                </div>
                <span className="btn btn-secondary btn-sm">View Insights</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="card p-6" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>No devices yet</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              Add a device first to start analyzing repair costs.
            </p>
            <Link to="/devices" className="btn btn-primary">Go to My Devices</Link>
          </div>
        )}
      </div>
    );
  }

  if (!device || !insights) return null;

  const repairRatio = insights.repairToPurchaseRatio || 0;
  const monthlyData = insights.monthlyTrend.map((item, index) => ({
    month: formatMonth(item.month),
    amount: item.amount,
    color: COLORS[index % COLORS.length]
  }));

  const categoryData = insights.categoryBreakdown.map((item, index) => ({
    category: item.category,
    cost: item.cost,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="stagger-children">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link to="/devices" className="btn btn-ghost btn-icon" aria-label="Back to devices">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <TechPageTitle text="Cost Insights" />
            <p style={{ color: 'var(--color-text-secondary)' }}>{device.brand} {device.model}</p>
          </div>
        </div>
        <Link to="/insights" className="btn btn-secondary">All Devices</Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div className="card p-6 card-elevated">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>Purchase Price</p>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{formatCurrency(insights.purchasePrice)}</p>
        </div>
        <div className="card p-6 card-elevated">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>Total Repair Cost</p>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-error-500)' }}>{formatCurrency(insights.totalRepairCost)}</p>
        </div>
        <div className="card p-6 card-elevated">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>Repair vs Purchase</p>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', color: repairRatio > 50 ? 'var(--color-error-500)' : repairRatio > 25 ? 'var(--color-warning-500)' : 'var(--color-success-500)' }}>
            {repairRatio.toFixed(1)}%
          </p>
        </div>
        <div className="card p-6 card-elevated">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>Remaining Budget</p>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-primary-600)' }}>
            {formatCurrency(Math.max(0, insights.purchasePrice - insights.totalRepairCost))}
          </p>
        </div>
      </div>

      {/* Repair vs Replace Gauge */}
      <div className="card p-6 card-elevated" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Repair vs Replace Insight</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'center' }}>
          <div>
            <RepairGauge ratio={repairRatio} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
              {repairRatio >= 70 ? '⚠️ Consider Replacement' : repairRatio >= 40 ? '⚡ High Repair Costs' : repairRatio >= 20 ? '📊 Moderate Costs' : '✅ Cost-Effective'}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 'var(--leading-relaxed)' }}>
              This device has cost <strong>{repairRatio.toFixed(1)}%</strong> of its original purchase price in repairs.
              {repairRatio >= 70 && ' At this level, replacement may be more economical than continued repairs.'}
              {repairRatio >= 40 && repairRatio < 70 && ' Repair costs are significant. Monitor for recurring issues.'}
              {repairRatio >= 20 && repairRatio < 40 && ' Repair costs are moderate. Regular maintenance can extend device life.'}
              {repairRatio < 20 && ' Repair costs are low relative to purchase price. Device is cost-effective to maintain.'}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-neutral-100)', borderRadius: 'var(--radius-lg)', minWidth: '160px' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-1)' }}>Repair Cost</p>
                <p style={{ fontWeight: 600, color: 'var(--color-error-500)' }}>{formatCurrency(insights.totalRepairCost)}</p>
              </div>
              <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-neutral-100)', borderRadius: 'var(--radius-lg)', minWidth: '160px' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-1)' }}>Purchase Price</p>
                <p style={{ fontWeight: 600 }}>{formatCurrency(insights.purchasePrice)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Monthly Trend */}
        <div className="card p-6 card-elevated">
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>Monthly Repair Spending</h2>
          <div style={{ height: '300px' }}>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorInsight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
                    axisLine={{ stroke: 'var(--color-border-light)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={val => `₹${(val/1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-light)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Spending']}
                    labelFormatter={month => month}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-primary-600)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInsight)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-8)' }}>No monthly data available</p>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card p-6 card-elevated">
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>Cost by Part Category</h2>
          <div style={{ height: '300px' }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="cost"
                    nameKey="category"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-light)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Cost']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-8)' }}>No category data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recurring Issues */}
      {insights.recurringIssues && insights.recurringIssues.length > 0 && (
        <div className="card p-6 card-elevated" style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>⚠️ Recurring Issues Detected</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
            The following issues have appeared multiple times in this device's repair history:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {insights.recurringIssues.map((issue, index) => (
              <span key={issue.issue} className="badge badge-warning" style={{ fontSize: 'var(--text-sm)' }}>
                {issue.issue.charAt(0).toUpperCase() + issue.issue.slice(1)} ({issue.count}x)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RepairGauge({ ratio }) {
  const clampedRatio = Math.min(100, Math.max(0, ratio));
  const circumference = 2 * Math.PI * 90; // radius = 90
  const offset = circumference - (clampedRatio / 100) * circumference;

  const getColor = (ratio) => {
    if (ratio >= 70) return 'var(--color-error-500)';
    if (ratio >= 40) return 'var(--color-warning-500)';
    if (ratio >= 20) return 'var(--color-success-500)';
    return 'var(--color-primary-500)';
  };

  const color = getColor(ratio);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="var(--color-neutral-200)"
          strokeWidth="16"
        />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ 
            transition: 'stroke-dashoffset 1s var(--ease-out-quart)',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
          }}
        />
      </svg>
      <div style={{ 
        marginTop: '-140px', 
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, fontFamily: 'var(--font-display)', color: color }}>
          {ratio.toFixed(1)}%
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          of purchase price
        </p>
      </div>
    </div>
  );
}
