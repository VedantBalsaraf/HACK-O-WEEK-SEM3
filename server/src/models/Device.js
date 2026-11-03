import mongoose from 'mongoose';

const repairSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Repair date is required'],
    default: Date.now
  },
  issueDescription: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    maxlength: [500, 'Issue description cannot exceed 500 characters']
  },
  replacedParts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    cost: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  laborCost: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  technicianNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Technician notes cannot exceed 1000 characters']
  },
  billImageUrl: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['user-reported', 'verified'],
    default: 'user-reported'
  }
}, {
  timestamps: true
});

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [50, 'Brand cannot exceed 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['laptop', 'mobile', 'tablet', 'appliance', 'wearable', 'audio', 'gaming', 'other'],
    default: 'other'
  },
  warrantyExpiry: {
    type: Date
  },
  isDemo: {
    type: Boolean,
    default: false
  },
  repairHistory: [repairSchema]
}, {
  timestamps: true
});

deviceSchema.index({ userId: 1, createdAt: -1 });

deviceSchema.virtual('totalRepairCost').get(function() {
  return (this.repairHistory || []).reduce((sum, repair) => sum + (repair.totalCost || 0), 0);
});

deviceSchema.virtual('repairToPurchaseRatio').get(function() {
  if (!this.purchasePrice || this.purchasePrice === 0) return 0;
  return (this.totalRepairCost / this.purchasePrice) * 100;
});

deviceSchema.virtual('isWarrantyExpiringSoon').get(function() {
  if (!this.warrantyExpiry) return false;
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return this.warrantyExpiry <= thirtyDays && this.warrantyExpiry >= now;
});

deviceSchema.virtual('isWarrantyExpired').get(function() {
  if (!this.warrantyExpiry) return false;
  return this.warrantyExpiry < new Date();
});

deviceSchema.set('toJSON', { virtuals: true });
deviceSchema.set('toObject', { virtuals: true });

export default mongoose.model('Device', deviceSchema);
