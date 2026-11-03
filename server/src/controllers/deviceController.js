import Device from '../models/Device.js';
import User from '../models/User.js';

const ensureDemoDevices = async (userId) => {
  const existingCount = await Device.countDocuments({ userId });
  if (existingCount > 0) return false;

  // Claim the one-time seed so parallel dashboard/device requests cannot duplicate the samples.
  const claimed = await User.findOneAndUpdate(
    { _id: userId, demoSeededAt: { $exists: false } },
    { $set: { demoSeededAt: new Date() } },
    { new: true }
  );
  if (!claimed) return false;

  const now = new Date();
  const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    await Device.create([
      {
        userId,
        brand: 'Apple',
        model: 'MacBook Pro 14',
        category: 'laptop',
        purchaseDate: daysAgo(520),
        purchasePrice: 189990,
        warrantyExpiry: daysFromNow(18),
        isDemo: true,
        repairHistory: [
          {
            date: daysAgo(170),
            issueDescription: 'Battery drains quickly and needs replacement',
            replacedParts: [{ name: 'Battery', cost: 12500 }],
            laborCost: 1800,
            totalCost: 14300,
            technicianNotes: 'Battery replaced and health checked'
          },
          {
            date: daysAgo(58),
            issueDescription: 'Keyboard keys intermittently unresponsive',
            replacedParts: [{ name: 'Keyboard Assembly', cost: 9800 }],
            laborCost: 2200,
            totalCost: 12000,
            technicianNotes: 'Keyboard assembly replaced'
          }
        ]
      },
      {
        userId,
        brand: 'Samsung',
        model: 'Galaxy S24',
        category: 'mobile',
        purchaseDate: daysAgo(430),
        purchasePrice: 84999,
        warrantyExpiry: daysAgo(65),
        isDemo: true,
        repairHistory: [
          {
            date: daysAgo(95),
            issueDescription: 'Charging port loose and charging intermittently',
            replacedParts: [{ name: 'USB-C Charging Port', cost: 4200 }],
            laborCost: 1200,
            totalCost: 5400,
            technicianNotes: 'Port replaced and charging tested'
          }
        ]
      },
      {
        userId,
        brand: 'Sony',
        model: 'WH-1000XM5',
        category: 'audio',
        purchaseDate: daysAgo(300),
        purchasePrice: 34990,
        isDemo: true,
        repairHistory: []
      }
    ]);
    return true;
  } catch (error) {
    await User.updateOne({ _id: userId }, { $unset: { demoSeededAt: 1 } });
    throw error;
  }
};

export const getDevices = async (req, res, next) => {
  try {
    await ensureDemoDevices(req.user.id);
    const devices = await Device.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    const devicesWithoutRepairs = devices.map(device => {
      const obj = device.toObject();
      obj.repairCount = device.repairHistory.length;
      delete obj.repairHistory;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: devicesWithoutRepairs.length,
      data: devicesWithoutRepairs
    });
  } catch (error) {
    next(error);
  }
};

export const getDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    next(error);
  }
};

export const createDevice = async (req, res, next) => {
  try {
    const deviceData = {
      ...req.body,
      userId: req.user.id
    };

    const device = await Device.create(deviceData);

    res.status(201).json({
      success: true,
      data: device
    });
  } catch (error) {
    next(error);
  }
};

export const updateDevice = async (req, res, next) => {
  try {
    let device = await Device.findOne({ _id: req.params.id, userId: req.user.id });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    device = await Device.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    await device.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addRepair = async (req, res, next) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const repair = {
      ...req.body,
      totalCost: (req.body.replacedParts || []).reduce((sum, part) => sum + part.cost, 0) + (req.body.laborCost || 0)
    };

    device.repairHistory.push(repair);
    await device.save();

    const newRepair = device.repairHistory[device.repairHistory.length - 1];

    res.status(201).json({
      success: true,
      data: newRepair
    });
  } catch (error) {
    next(error);
  }
};

export const updateRepair = async (req, res, next) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const repair = device.repairHistory.id(req.params.repairId);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair entry not found'
      });
    }

    Object.assign(repair, req.body);
    repair.totalCost = (req.body.replacedParts || []).reduce((sum, part) => sum + part.cost, 0) + (req.body.laborCost || 0);

    await device.save();

    res.status(200).json({
      success: true,
      data: repair
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRepair = async (req, res, next) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    device.repairHistory.pull(req.params.repairId);
    await device.save();

    res.status(200).json({
      success: true,
      message: 'Repair entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardInsights = async (req, res, next) => {
  try {
    await ensureDemoDevices(req.user.id);
    const devices = await Device.find({ userId: req.user.id });

    const totalDevices = devices.length;
    const totalRepairSpending = devices.reduce((sum, d) => sum + d.totalRepairCost, 0);

    const upcomingWarrantyExpiry = devices
      .filter(d => d.isWarrantyExpiringSoon)
      .sort((a, b) => a.warrantyExpiry - b.warrantyExpiry)
      .slice(0, 5)
      .map(d => ({
        id: d._id,
        brand: d.brand,
        model: d.model,
        warrantyExpiry: d.warrantyExpiry
      }));

    const faultCounts = {};
    devices.forEach(device => {
      device.repairHistory.forEach(repair => {
        const keywords = repair.issueDescription.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        keywords.forEach(keyword => {
          faultCounts[keyword] = (faultCounts[keyword] || 0) + 1;
        });
      });
    });

    const topFaults = Object.entries(faultCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([fault, count]) => ({ fault, count }));

    const monthlySpending = {};
    devices.forEach(device => {
      device.repairHistory.forEach(repair => {
        const monthKey = repair.date.toISOString().slice(0, 7);
        monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + repair.totalCost;
      });
    });

    const monthlyTrend = Object.entries(monthlySpending)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, amount]) => ({ month, amount }));

    res.status(200).json({
      success: true,
      data: {
        totalDevices,
        totalRepairSpending,
        hasDemoData: devices.some(device => device.isDemo),
        upcomingWarrantyExpiry,
        topFaults,
        monthlyTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCostInsights = async (req, res, next) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const monthlyCosts = {};
    device.repairHistory.forEach(repair => {
      const monthKey = repair.date.toISOString().slice(0, 7);
      monthlyCosts[monthKey] = (monthlyCosts[monthKey] || 0) + repair.totalCost;
    });

    const monthlyTrend = Object.entries(monthlyCosts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount }));

    const repairCategories = {};
    device.repairHistory.forEach(repair => {
      repair.replacedParts.forEach(part => {
        repairCategories[part.name] = (repairCategories[part.name] || 0) + part.cost;
      });
    });

    const categoryBreakdown = Object.entries(repairCategories)
      .sort((a, b) => b[1] - a[1])
      .map(([category, cost]) => ({ category, cost }));

    const recurringIssues = {};
    device.repairHistory.forEach(repair => {
      const keywords = repair.issueDescription.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      keywords.forEach(keyword => {
        recurringIssues[keyword] = (recurringIssues[keyword] || 0) + 1;
      });
    });

    const recurring = Object.entries(recurringIssues)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([issue, count]) => ({ issue, count }));

    res.status(200).json({
      success: true,
      data: {
        purchasePrice: device.purchasePrice,
        totalRepairCost: device.totalRepairCost,
        repairToPurchaseRatio: device.repairToPurchaseRatio,
        monthlyTrend,
        categoryBreakdown,
        recurringIssues: recurring
      }
    });
  } catch (error) {
    next(error);
  }
};
