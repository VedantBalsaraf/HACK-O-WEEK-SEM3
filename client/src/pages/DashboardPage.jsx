import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import TechPageTitle from '../components/TechPageTitle';
import PixelCard from '../components/PixelCard';

const COLORS = ['#ea580c', '#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.devices.dashboardInsights();
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stagger-children">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-6">
              <div className="skeleton" style={{ height: '32px', width: '60%', marginBottom: 'var(--space-2)' }} />
              <div className="skeleton" style={{ height: '48px', width: '80%' }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
          <div className="card p-6">
            <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: 'var(--space-6)' }} />
            <div className="skeleton" style={{ height: '300px' }} />
          </div>
          <div className="card p-6">
            <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: 'var(--space-6)' }} />
            <div className="skeleton" style={{ height: '300px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card p-12" style={{ textAlign: 'center' }}>
        <p>Failed to load dashboard</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Devices', value: data.totalDevices, icon: DevicesIcon, color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)' },
    { label: 'Total Repair Spend', value: `₹${data.totalRepairSpending.toLocaleString()}`, icon: RupeeIcon, color: 'var(--color-success-600)', bg: 'oklch(0.92 0.08 150)' },
    { label: 'Warranty Expiring', value: data.upcomingWarrantyExpiry.length, icon: CalendarIcon, color: 'var(--color-warning-600)', bg: 'oklch(0.94 0.08 85)' },
    { label: 'Top Recurring Fault', value: data.topFaults[0]?.fault || 'None', icon: AlertIcon, color: 'var(--color-error-600)', bg: 'oklch(0.92 0.08 25)' }
  ];

  // Monthly trend chart data
  const monthlyData = data.monthlyTrend.map((item, index) => ({
    month: formatMonth(item.month),
    amount: item.amount,
    color: COLORS[index % COLORS.length]
  }));

  // Top faults chart data
  const faultsData = data.topFaults.map((item, index) => ({
    fault: item.fault.charAt(0).toUpperCase() + item.fault.slice(1),
    count: item.count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="stagger-children">
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <TechPageTitle text="Dashboard" />
        <p style={{ color: 'var(--color-text-secondary)' }}>Overview of your device repair passport</p>
      </div>

      {data.hasDemoData && (
        <div className="demo-data-notice" role="note">
          <span className="demo-data-notice-mark" aria-hidden="true">i</span>
          <span><strong>Demo data is showing.</strong> These sample devices and repair costs are examples; edit or delete them from My Devices.</span>
          <Link to="/devices">Manage samples <span aria-hidden="true">→</span></Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {stats.map((stat, index) => (
          <PixelCard
            key={stat.label}
            className="dashboard-pixel-card"
            colors={["#e0f2fe", "#7dd3fc", "#0284c7"]}
            glowColor="#38a6e8"
            shape="square"
            origin="center"
            gap={5}
            pixelSize={2}
            speed={35}
            revealDuration={600}
            spotlight={0.78}
            glow={0.82}
            opacity={0.88}
            fade={0.48}
            trigger="hover"
            radius={22}
            clickPulse
            intro
            noFocus
            theme="light"
            style={{ transitionDelay: `${index * 60}ms` }}
          >
            <Link to={stat.label === 'Warranty Expiring' ? '/devices' : '/dashboard'} className="dashboard-stat-link">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-lg)',
                  background: stat.bg,
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon />
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                {stat.value}
              </p>
            </Link>
          </PixelCard>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
        {/* Monthly Spending Trend */}
        <div className="card p-6 card-elevated">
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>Monthly Repair Spending</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData.length > 0 ? monthlyData : [{ month: 'No Data', amount: 0 }]}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {monthlyData.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-8)' }}>
              No repair data yet. Add repairs to see trends.
            </p>
          )}
        </div>

        {/* Top Recurring Faults */}
        <div className="card p-6 card-elevated">
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>Top Recurring Issues</h2>
          <div style={{ height: '300px' }}>
            {faultsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={faultsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis 
                    dataKey="fault" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 12, fill: 'var(--color-text-primary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-light)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                    formatter={(value) => [`${value} times`, 'Occurrences']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {faultsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-8)' }}>
                No recurring issues detected yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Warranty Expiring Soon */}
      {data.upcomingWarrantyExpiry.length > 0 && (
        <div className="card p-6 card-elevated" style={{ marginTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)' }}>Warranty Expiring Soon</h2>
            <Link to="/devices" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Warranty Expiry</th>
                  <th>Days Left</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingWarrantyExpiry.map(device => (
                  <tr key={device.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span className="avatar avatar-sm" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}>
                          {device.brand[0]}
                        </span>
                        <div>
                          <p style={{ fontWeight: 500 }}>{device.brand} {device.model}</p>
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(device.warrantyExpiry)}</td>
                    <td>
                      <span className="badge badge-warning">
                        {getDaysLeft(device.warrantyExpiry)} days
                      </span>
                    </td>
                    <td>
                      <Link to={`/devices/${device.id}`} className="btn btn-ghost btn-sm btn-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.totalDevices === 0 && (
        <div className="card p-12" style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: 'var(--radius-full)', 
            background: 'var(--color-primary-100)', 
            color: 'var(--color-primary-700)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
            fontSize: 'var(--text-2xl)'
          }}>
            <DevicesIcon />
          </div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>No devices yet</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            Start building your repair passport by adding your first device.
          </p>
          <Link to="/devices" className="btn btn-primary btn-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--space-2)' }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Your First Device
          </Link>
        </div>
      )}
    </div>
  );
}

/* ---- Icons ---- */
function DevicesIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="12" y1="10" x2="12" y2="18"/></svg>;
}
function RupeeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function CalendarIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function AlertIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDaysLeft(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  expiry.setHours(0, 0, 0, 0);
  const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}
