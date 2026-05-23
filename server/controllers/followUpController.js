const FollowUp = require('../models/FollowUp');

const getFollowUps = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'bda') {
      query.employeeId = req.user._id;
    }
    
    const followUps = await FollowUp.find(query)
      .populate('leadId', 'title company email phone value stage')
      .populate('employeeId', 'name email')
      .sort({ reminderDate: 1 });
    
    res.json(followUps);
  } catch (error) {
    console.error('Get followups error:', error);
    res.status(500).json({ message: error.message });
  }
};

const createFollowUp = async (req, res) => {
  try {
    const followUp = new FollowUp({
      ...req.body,
      employeeId: req.user._id
    });
    await followUp.save();
    
    const populatedFollowUp = await FollowUp.findById(followUp._id)
      .populate('leadId', 'title company email phone');
    
    res.status(201).json(populatedFollowUp);
  } catch (error) {
    console.error('Create followup error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('leadId', 'title company email phone');
    
    res.json(followUp);
  } catch (error) {
    console.error('Update followup error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }
    await followUp.deleteOne();
    res.json({ message: 'Follow-up removed' });
  } catch (error) {
    console.error('Delete followup error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFollowUps, createFollowUp, updateFollowUp, deleteFollowUp };