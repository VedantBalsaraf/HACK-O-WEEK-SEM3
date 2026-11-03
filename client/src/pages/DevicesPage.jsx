import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import TechPageTitle from '../components/TechPageTitle';
import DeviceTypeIcon from '../components/DeviceTypeIcon';

const CATEGORIES = [
  'laptop', 'mobile', 'tablet', 'appliance', 'wearable', 'audio', 'gaming', 'other'
];

export default function DevicesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState(initialFormState());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function initialFormState() {
    return {
      brand: '',
      model: '',
      category: 'laptop',
      purchaseDate: '',
      purchasePrice: '',
      warrantyExpiry: ''
    };
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await api.devices.list();
      setDevices(res.data);
    } catch (error) {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!formData.purchasePrice || Number(formData.purchasePrice) < 0) newErrors.purchasePrice = 'Valid purchase price is required';
    if (formData.warrantyExpiry && new Date(formData.warrantyExpiry) < new Date(formData.purchaseDate)) {
      newErrors.warrantyExpiry = 'Warranty expiry must be after purchase date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        category: formData.category,
        purchaseDate: formData.purchaseDate,
        purchasePrice: Number(formData.purchasePrice),
        warrantyExpiry: formData.warrantyExpiry || null
      };

      if (editingDevice) {
        await api.devices.update(editingDevice._id, payload);
        toast.success('Device updated successfully');
      } else {
        await api.devices.create(payload);
        toast.success('Device added to your passport');
      }
      closeModal();
      fetchDevices();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this device? All repair history will be lost.')) return;
    try {
      await api.devices.delete(deviceId);
      toast.success('Device deleted');
      fetchDevices();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openModal = (device = null) => {
    setEditingDevice(device);
    if (device) {
      setFormData({
        brand: device.brand,
        model: device.model,
        category: device.category,
        purchaseDate: device.purchaseDate?.split('T')[0] || '',
        purchasePrice: device.purchasePrice,
        warrantyExpiry: device.warrantyExpiry?.split('T')[0] || ''
      });
    } else {
      setFormData(initialFormState());
    }
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDevice(null);
    setFormData(initialFormState());
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  if (loading) {
    return (
      <div className="stagger-children">
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: 'var(--space-2)' }} />
          <div className="skeleton" style={{ height: '20px', width: '300px' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6">
              <div className="skeleton" style={{ height: '40px', width: '100px', marginBottom: 'var(--space-4)' }} />
              <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: 'var(--space-2)' }} />
              <div className="skeleton" style={{ height: '20px', width: '40%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stagger-children">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div>
          <TechPageTitle text="My Devices" />
          <p style={{ color: 'var(--color-text-secondary)' }}>Manage your device repair passports</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--space-2)' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Device
        </button>
      </div>

      {/* Devices Grid */}
      {devices.length === 0 ? (
        <div className="card p-12" style={{ textAlign: 'center' }}>
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
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="12" y1="10" x2="12" y2="18"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>No devices yet</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            Add your first device to start building its repair passport.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => openModal()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--space-2)' }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Your First Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
          {devices.map(device => (
            <DeviceCard key={device._id} device={device} onEdit={openModal} onDelete={handleDelete} onView={navigate} />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 id="modal-title" className="modal-title">
                {editingDevice ? 'Edit Device' : 'Add New Device'}
              </h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="brand" className="form-label">Brand <span className="required" aria-hidden="true">*</span></label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    className={`form-input ${errors.brand ? 'error' : ''}`}
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., Apple, Dell, Samsung"
                    disabled={submitting}
                    aria-invalid={errors.brand ? 'true' : 'false'}
                  />
                  {errors.brand && <p className="form-error" role="alert">{errors.brand}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="model" className="form-label">Model <span className="required" aria-hidden="true">*</span></label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    className={`form-input ${errors.model ? 'error' : ''}`}
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., MacBook Pro 14, Galaxy S23"
                    disabled={submitting}
                    aria-invalid={errors.model ? 'true' : 'false'}
                  />
                  {errors.model && <p className="form-error" role="alert">{errors.model}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label htmlFor="purchaseDate" className="form-label">Purchase Date <span className="required" aria-hidden="true">*</span></label>
                    <input
                      type="date"
                      id="purchaseDate"
                      name="purchaseDate"
                      className={`form-input ${errors.purchaseDate ? 'error' : ''}`}
                      value={formData.purchaseDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      disabled={submitting}
                      aria-invalid={errors.purchaseDate ? 'true' : 'false'}
                    />
                    {errors.purchaseDate && <p className="form-error" role="alert">{errors.purchaseDate}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="purchasePrice" className="form-label">Purchase Price (₹) <span className="required" aria-hidden="true">*</span></label>
                    <input
                      type="number"
                      id="purchasePrice"
                      name="purchasePrice"
                      className={`form-input ${errors.purchasePrice ? 'error' : ''}`}
                      value={formData.purchasePrice}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="1"
                      disabled={submitting}
                      aria-invalid={errors.purchasePrice ? 'true' : 'false'}
                    />
                    {errors.purchasePrice && <p className="form-error" role="alert">{errors.purchasePrice}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="warrantyExpiry" className="form-label">Warranty Expiry</label>
                  <input
                    type="date"
                    id="warrantyExpiry"
                    name="warrantyExpiry"
                    className={`form-input ${errors.warrantyExpiry ? 'error' : ''}`}
                    value={formData.warrantyExpiry}
                    onChange={handleChange}
                    min={formData.purchaseDate || undefined}
                    disabled={submitting}
                    aria-invalid={errors.warrantyExpiry ? 'true' : 'false'}
                  />
                  {errors.warrantyExpiry && <p className="form-error" role="alert">{errors.warrantyExpiry}</p>}
                  <p className="form-hint">Optional. Leave empty if no warranty or unknown.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingDevice ? 'Update Device' : 'Add Device')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DeviceCard({ device, onEdit, onDelete, onView }) {
  const isWarrantyExpired = device.warrantyExpiry && new Date(device.warrantyExpiry) < new Date();
  const isWarrantyExpiring = device.warrantyExpiry && !isWarrantyExpired && 
    (new Date(device.warrantyExpiry) - new Date()) / (1000 * 60 * 60 * 24) <= 30;

  const warrantyBadge = device.warrantyExpiry ? (
    isWarrantyExpired ? (
      <span className="badge badge-error">Warranty Expired</span>
    ) : isWarrantyExpiring ? (
      <span className="badge badge-warning">Expires Soon</span>
    ) : (
      <span className="badge badge-success">Under Warranty</span>
    )
  ) : (
    <span className="badge badge-neutral">No Warranty</span>
  );

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <article className="card p-6 card-elevated" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className="avatar" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}>
            {device.brand[0]}
          </span>
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{device.brand} {device.model}</h3>
            <p className="device-category-label">
              <DeviceTypeIcon category={device.category} size={16} />
              {device.category.charAt(0).toUpperCase() + device.category.slice(1)}
              {device.isDemo && <span className="device-demo-badge">Demo sample</span>}
            </p>
          </div>
        </div>
        <div className="dropdown">
          <button className="btn btn-ghost btn-icon" aria-label="More options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
          <div className="dropdown-menu" role="menu">
            <button className="dropdown-item" role="menuitem" onClick={() => onEdit(device)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
            <Link to={`/devices/${device._id}`} className="dropdown-item" role="menuitem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              View Passport
            </Link>
            <div className="dropdown-divider" />
            <button className="dropdown-item danger" role="menuitem" onClick={() => onDelete(device._id)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border-light)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-1)' }}>Purchased</p>
            <p style={{ fontWeight: 500 }}>{formatDate(device.purchaseDate)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-1)' }}>Price</p>
            <p style={{ fontWeight: 600, color: 'var(--color-primary-600)' }}>{formatCurrency(device.purchasePrice)}</p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-1)' }}>Total Repairs</p>
            <p style={{ fontWeight: 600 }}>{device.repairCount ?? device.repairHistory?.length ?? 0}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-1)' }}>Repair Cost</p>
            <p style={{ fontWeight: 600, color: device.totalRepairCost > 0 ? 'var(--color-error-500)' : 'var(--color-text-primary)' }}>
              {formatCurrency(device.totalRepairCost || 0)}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {warrantyBadge}
        <Link to={`/devices/${device._id}`} className="btn btn-primary btn-sm">
          View Passport
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
