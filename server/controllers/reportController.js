const Lead = require('../models/Lead');
const User = require('../models/User');

const getAnalytics = async (req, res) => {
  try {
    console.log('Fetching analytics for user:', req.user._id);
    
    // Build query based on user role
    let query = {};
    if (req.user.role === 'bda') {
      query.assignedTo = req.user._id;
    }
    
    // Get all leads based on query
    const allLeads = await Lead.find(query);
    console.log(`Found ${allLeads.length} leads`);
    
    // Calculate statistics
    const totalLeads = allLeads.length;
    const wonDeals = allLeads.filter(lead => lead.stage === 'Won').length;
    const lostDeals = allLeads.filter(lead => lead.stage === 'Lost').length;
    
    // Calculate total revenue from won deals
    const totalRevenue = allLeads
      .filter(lead => lead.stage === 'Won')
      .reduce((sum, lead) => sum + (lead.value || 0), 0);
    
    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;
    
    // Send response
    res.json({
      success: true,
      totalLeads,
      wonDeals,
      lostDeals,
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalRevenue
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getTeamPerformance = async (req, res) => {
  try {
    console.log('Fetching team performance');
    
    // Only admin can access team performance
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }
    
    // Get all BDA employees
    const employees = await User.find({ role: 'bda' }).select('-password');
    
    if (employees.length === 0) {
      return res.json([]);
    }
    
    // Calculate performance for each employee
    const performance = await Promise.all(employees.map(async (emp) => {
      const leadsAssigned = await Lead.countDocuments({ assignedTo: emp._id });
      const dealsWon = await Lead.countDocuments({ assignedTo: emp._id, stage: 'Won' });
      
      const revenueResult = await Lead.aggregate([
        { $match: { assignedTo: emp._id, stage: 'Won' } },
        { $group: { _id: null, total: { $sum: '$value' } } }
      ]);
      
      const revenue = revenueResult[0]?.total || 0;
      const performanceRate = leadsAssigned > 0 ? (dealsWon / leadsAssigned) * 100 : 0;
      
      return {
        employeeId: emp._id,
        name: emp.name,
        email: emp.email,
        leadsAssigned,
        dealsWon,
        revenue,
        performanceRate: Math.round(performanceRate * 10) / 10
      };
    }));
    
    res.json(performance);
    
  } catch (error) {
    console.error('Team performance error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { getAnalytics, getTeamPerformance };