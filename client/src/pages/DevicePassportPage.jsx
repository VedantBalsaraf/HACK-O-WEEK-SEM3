import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import TechPageTitle from '../components/TechPageTitle';
import DeviceTypeIcon from '../components/DeviceTypeIcon';

const CATEGORIES = ['laptop', 'mobile', 'tablet', 'appliance', 'wearable', 'audio', 'gaming', 'other'];

export default function DevicePassportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [repairForm, setRepairForm] = useState(initialRepairState());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [parts, setParts] = useState([{ name: '', cost: '' }]);

  function initialRepairState() {
    return {
      date: new Date().toISOString().split('T')[0],
      issueDescription: '',
      laborCost: '',
      technicianNotes: '',
      source: 'user-reported'
    };
  }

  useEffect(() => {
    fetchDevice();
  }, [id]);

  const fetchDevice = async () => {
    try {
      const res = await api.devices.get(id);
      setDevice(res.data);
    } catch (error) {
      toast.error('Failed to load device');
      navigate('/devices');
    } finally {
      setLoading(false);
    }
  };

  const validateRepairForm = () => {
    const newErrors = {};
    if (!repairForm.date) newErrors.date = 'Repair date is required';
    if (!repairForm.issueDescription.trim()) newErrors.issueDescription = 'Issue description is required';
    if (parts.some(p => !p.name.trim() || !p.cost || Number(p.cost) < 0)) {
      newErrors.parts = 'All parts must have a name and valid cost';
    }
    if (repairForm.laborCost && Number(repairForm.laborCost) < 0) newErrors.laborCost = 'Labor cost must be positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalCost = () => {
    const partsCost = parts.reduce((sum, p) => sum + (Number(p.cost) || 0), 0);
    return partsCost + (Number(repairForm.laborCost) || 0);
  };

  const handleAddRepair = async (e) => {
    e.preventDefault();
    if (!validateRepairForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...repairForm,
        replacedParts: parts.filter(p => p.name.trim()).map(p => ({
          name: p.name.trim(),
          cost: Number(p.cost)
        })),
        laborCost: Number(repairForm.laborCost) || 0,
        totalCost: calculateTotalCost()
      };

      if (editingRepair) {
        await api.devices.updateRepair(id, editingRepair._id, payload);
        toast.success('Repair updated');
      } else {
        await api.devices.addRepair(id, payload);
        toast.success('Repair added to passport');
      }
      closeRepairModal();
      fetchDevice();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRepair = async (repairId) => {
    if (!window.confirm('Delete this repair entry?')) return;
    try {
      await api.devices.deleteRepair(id, repairId);
      toast.success('Repair deleted');
      fetchDevice();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openRepairModal = (repair = null) => {
    setEditingRepair(repair);
    if (repair) {
      setRepairForm({
        date: repair.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        issueDescription: repair.issueDescription,
        laborCost: repair.laborCost || '',
        technicianNotes: repair.technicianNotes || '',
        source: repair.source
      });
      setParts(repair.replacedParts?.map(p => ({ name: p.name, cost: p.cost })) || [{ name: '', cost: '' }]);
    } else {
      setRepairForm(initialRepairState());
      setParts([{ name: '', cost: '' }]);
    }
    setErrors({});
    setShowRepairModal(true);
  };

  const closeRepairModal = () => {
    setShowRepairModal(false);
    setEditingRepair(null);
    setRepairForm(initialRepairState());
    setParts([{ name: '', cost: '' }]);
    setErrors({});
  };

  const handleRepairChange = (e) => {
    const { name, value } = e.target;
    setRepairForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePartChange = (index, field, value) => {
    setParts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const addPart = () => setParts(prev => [...prev, { name: '', cost: '' }]);
  const removePart = (index) => setParts(prev => prev.filter((_, i) => i !== index));

  if (loading) {
    return (
      <div className="stagger-children">
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: 'var(--space-2)' }} />
          <div className="skeleton" style={{ height: '20px', width: '400px' }} />
        </div>
        <div className="card p-6">
          <div className="skeleton" style={{ height: '300px' }} />
        </div>
      </div>
    );
  }

  if (!device) return null;

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const repairRatio = device.purchasePrice > 0 ? ((device.totalRepairCost / device.purchasePrice) * 100).toFixed(1) : 0;

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
          <div className="passport-device-heading">
            <span className="passport-device-icon"><DeviceTypeIcon category={device.category} size={20} /></span>
            <div>
            <TechPageTitle text={`${device.brand} ${device.model}`} />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {device.category.charAt(0).toUpperCase() + device.category.slice(1)} • Purchased {formatDate(device.purchaseDate)}
            </p>
            </div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => openRepairModal()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--space-2)' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Repair
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div className="card p-6">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>Purchase Price</p>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{formatCurrency(device.purchasePrice)}</p>
        </div>
        <div className="card p-6">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>Total Repair Cost</p>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-error-500)' }}>{formatCurrency(device.totalRepairCost)}</p>
        </div>
        <div className="card p-6">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>Repair vs Purchase</p>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', color: repairRatio > 50 ? 'var(--color-error-500)' : repairRatio > 25 ? 'var(--color-warning-500)' : 'var(--color-success-500)' }}>
            {repairRatio}%
          </p>
        </div>
        <div className="card p-6">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>Repairs Logged</p>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{device.repairHistory?.length || 0}</p>
        </div>
      </div>

      {/* Warranty Status */}
      {device.warrantyExpiry && (
        <div className="card p-4" style={{ marginBottom: 'var(--space-8)', borderLeft: `4px solid ${device.isWarrantyExpired ? 'var(--color-error-500)' : device.isWarrantyExpiringSoon ? 'var(--color-warning-500)' : 'var(--color-success-500)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className="avatar" style={{ 
                background: device.isWarrantyExpired ? 'oklch(0.92 0.08 25)' : device.isWarrantyExpiringSoon ? 'oklch(0.94 0.08 85)' : 'oklch(0.92 0.08 150)',
                color: device.isWarrantyExpired ? 'var(--color-error-600)' : device.isWarrantyExpiringSoon ? 'var(--color-warning-600)' : 'var(--color-success-600)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              <div>
                <p style={{ fontWeight: 500 }}>
                  {device.isWarrantyExpired ? 'Warranty Expired' : device.isWarrantyExpiringSoon ? 'Warranty Expiring Soon' : 'Under Warranty'}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  Expires on {formatDate(device.warrantyExpiry)} {device.isWarrantyExpiringSoon && `(${Math.ceil((new Date(device.warrantyExpiry) - new Date()) / (1000*60*60*24))} days left)`}
                </p>
              </div>
            </div>
            <Link to={`/insights/${device._id}`} className="btn btn-ghost btn-sm">View Cost Insights</Link>
          </div>
        </div>
      )}

      {/* Repair Timeline */}
      <div className="card card-elevated">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border-light)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>Repair Timeline</h2>
          <span className="badge badge-primary">{device.repairHistory?.length || 0} entries</span>
        </div>

        {device.repairHistory && device.repairHistory.length > 0 ? (
          <div style={{ position: 'relative' }}>
            {/* Timeline Line */}
            <div style={{ position: 'absolute', left: '22px', top: 0, bottom: 0, width: '2px', background: 'var(--color-border-light)' }} />
            
            {device.repairHistory
              .slice()
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((repair, index) => (
                <RepairTimelineItem
                  key={repair._id}
                  repair={repair}
                  index={index}
                  isLast={index === device.repairHistory.length - 1}
                  onEdit={openRepairModal}
                  onDelete={handleDeleteRepair}
                />
              ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: 'var(--radius-full)', 
              background: 'var(--color-neutral-100)', 
              color: 'var(--color-neutral-500)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>No repairs logged yet</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              Add your first repair entry to start building this device's history.
            </p>
            <button className="btn btn-primary" onClick={() => openRepairModal()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--space-2)' }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add First Repair
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Repair Modal */}
      {showRepairModal && (
        <div className="modal-overlay" onClick={closeRepairModal} role="dialog" aria-modal="true" aria-labelledby="repair-modal-title">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 id="repair-modal-title" className="modal-title">
                {editingRepair ? 'Edit Repair' : 'Add Repair'}
              </h2>
              <button className="modal-close" onClick={closeRepairModal} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddRepair}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="repair-date" className="form-label">Repair Date <span className="required" aria-hidden="true">*</span></label>
                  <input
                    type="date"
                    id="repair-date"
                    name="date"
                    className={`form-input ${errors.date ? 'error' : ''}`}
                    value={repairForm.date}
                    onChange={handleRepairChange}
                    disabled={submitting}
                    aria-invalid={errors.date ? 'true' : 'false'}
                  />
                  {errors.date && <p className="form-error" role="alert">{errors.date}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="issueDescription" className="form-label">Issue Description <span className="required" aria-hidden="true">*</span></label>
                  <textarea
                    id="issueDescription"
                    name="issueDescription"
                    rows="3"
                    className={`form-input ${errors.issueDescription ? 'error' : ''}`}
                    value={repairForm.issueDescription}
                    onChange={handleRepairChange}
                    placeholder="e.g., Screen cracked after drop"
                    disabled={submitting}
                    aria-invalid={errors.issueDescription ? 'true' : 'false'}
                  />
                  {errors.issueDescription && <p className="form-error" role="alert">{errors.issueDescription}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Parts Replaced</label>
                  {parts.map((part, index) => (
                    <div key={index} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Part name (e.g., Display Assembly)"
                        value={part.name}
                        onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                        disabled={submitting}
                      />
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Cost (₹)"
                        min="0"
                        step="1"
                        value={part.cost}
                        onChange={(e) => handlePartChange(index, 'cost', e.target.value)}
                        disabled={submitting}
                      />
                      {parts.length > 1 && (
                        <button type="button" className="btn btn-ghost btn-icon" onClick={() => removePart(index)} aria-label="Remove part">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addPart}>
                    + Add Part
                  </button>
                  {errors.parts && <p className="form-error" role="alert">{errors.parts}</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label htmlFor="laborCost" className="form-label">Labor Cost (₹)</label>
                    <input
                      type="number"
                      id="laborCost"
                      name="laborCost"
                      className={`form-input ${errors.laborCost ? 'error' : ''}`}
                      value={repairForm.laborCost}
                      onChange={handleRepairChange}
                      placeholder="0"
                      min="0"
                      step="1"
                      disabled={submitting}
                      aria-invalid={errors.laborCost ? 'true' : 'false'}
                    />
                    {errors.laborCost && <p className="form-error" role="alert">{errors.laborCost}</p>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="source" className="form-label">Source</label>
                    <select
                      id="source"
                      name="source"
                      className="form-select"
                      value={repairForm.source}
                      onChange={handleRepairChange}
                      disabled={submitting}
                    >
                      <option value="user-reported">User-Reported</option>
                      <option value="verified">Verified</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="technicianNotes" className="form-label">Technician Notes</label>
                  <textarea
                    id="technicianNotes"
                    name="technicianNotes"
                    rows="2"
                    className="form-input"
                    value={repairForm.technicianNotes}
                    onChange={handleRepairChange}
                    placeholder="Optional notes"
                    disabled={submitting}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  Total: <strong style={{ color: 'var(--color-primary-600)', marginLeft: 'var(--space-1)' }}>{formatCurrency(calculateTotalCost())}</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeRepairModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingRepair ? 'Update Repair' : 'Add Repair')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RepairTimelineItem({ repair, index, isLast, onEdit, onDelete }) {
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const sourceBadge = repair.source === 'verified' ? (
    <span className="badge badge-success">Verified</span>
  ) : (
    <span className="badge badge-neutral">User-Reported</span>
  );

  return (
    <div style={{ 
      display: 'flex', 
      gap: 'var(--space-4)', 
      padding: 'var(--space-4) 0',
      paddingLeft: 'var(--space-10)',
      position: 'relative'
    }}>
      {/* Timeline Dot */}
      <div style={{ 
        position: 'absolute', 
        left: '14px', 
        top: 'var(--space-4)',
        width: '16px', 
        height: '16px', 
        borderRadius: 'var(--radius-full)', 
        background: 'var(--color-primary-500)',
        border: '3px solid var(--color-bg-secondary)',
        boxShadow: 'var(--shadow-sm)',
        zIndex: 1,
        flexShrink: 0
      }} />

      {/* Content */}
      <div style={{ flex: 1, background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{formatDate(repair.date)}</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {sourceBadge}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEdit(repair)} aria-label="Edit repair">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onDelete(repair._id)} aria-label="Delete repair">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        <p style={{ marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-relaxed)' }}>{repair.issueDescription}</p>

        {repair.replacedParts && repair.replacedParts.length > 0 && (
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Parts Replaced</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {repair.replacedParts.map((part, i) => (
                <span key={i} className="badge badge-primary" style={{ fontSize: 'var(--text-xs)' }}>
                  {part.name} — {formatCurrency(part.cost)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-light)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            {repair.laborCost > 0 && (
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Labor: <strong>{formatCurrency(repair.laborCost)}</strong>
              </span>
            )}
            <span style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
              Total: {formatCurrency(repair.totalCost)}
            </span>
          </div>
          {repair.technicianNotes && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              📝 {repair.technicianNotes}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
