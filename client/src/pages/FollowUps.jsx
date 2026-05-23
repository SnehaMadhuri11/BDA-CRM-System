import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Calendar, Clock, CheckCircle, Plus, Edit2, Trash2, Bell, Phone, Mail, Building } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FollowUps = () => {
  const [followups, setFollowups] = useState([]);
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Separate date and time for easier input
  const [formData, setFormData] = useState({
    leadId: '',
    date: '',
    time: '10:00',
    ampm: 'AM',
    notes: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch leads first
      const leadsRes = await api.get('/leads');
      setLeads(leadsRes.data || []);
      
      // Fetch followups (should have populated lead data)
      const followupsRes = await api.get('/followups');
      setFollowups(followupsRes.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Convert date + time + ampm to ISO string for backend
  const convertToDateTime = (date, time, ampm) => {
    let hours = parseInt(time.split(':')[0]);
    const minutes = time.split(':')[1];
    
    // Convert to 24-hour format
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes}`;
    return new Date(`${date}T${timeString}`);
  };

  // Convert ISO date to display format with AM/PM
  const formatDisplayDate = (isoDate) => {
    if (!isoDate) return 'No date set';
    const date = new Date(isoDate);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Get date part for input
  const getDatePart = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0];
  };

  // Get time part with AM/PM from ISO date
  const getTimeParts = (isoDate) => {
    if (!isoDate) return { time: '10:00', ampm: 'AM' };
    const date = new Date(isoDate);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const time = `${hours.toString().padStart(2, '0')}:${minutes}`;
    return { time, ampm };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leadId || !formData.date || !formData.notes) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      // Convert to proper datetime for backend
      const reminderDateTime = convertToDateTime(formData.date, formData.time, formData.ampm);
      
      const submitData = {
        leadId: formData.leadId,
        reminderDate: reminderDateTime.toISOString(),
        notes: formData.notes,
        status: formData.status
      };
      
      if (editingFollowup) {
        await api.put(`/followups/${editingFollowup._id}`, submitData);
        toast.success('Follow-up updated successfully');
      } else {
        await api.post('/followups', submitData);
        toast.success('Follow-up scheduled successfully');
      }
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this follow-up?')) {
      try {
        await api.delete(`/followups/${id}`);
        toast.success('Follow-up deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const handleComplete = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      await api.put(`/followups/${id}`, { status: newStatus });
      toast.success(`Follow-up marked as ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const resetForm = () => {
    setFormData({
      leadId: '',
      date: '',
      time: '10:00',
      ampm: 'AM',
      notes: '',
      status: 'Pending'
    });
    setEditingFollowup(null);
  };

  const getFilteredFollowups = () => {
    let filtered = [...followups];
    const now = new Date();
    
    if (filter === 'pending') {
      filtered = filtered.filter(f => f.status === 'Pending');
    } else if (filter === 'completed') {
      filtered = filtered.filter(f => f.status === 'Completed');
    } else if (filter === 'overdue') {
      filtered = filtered.filter(f => f.status === 'Pending' && new Date(f.reminderDate) < now);
    }
    
    // Sort by date (closest first)
    filtered.sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
    
    return filtered;
  };

  const getTimeStatus = (reminderDate) => {
    const now = new Date();
    const reminder = new Date(reminderDate);
    const diffTime = reminder - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffTime < 0) {
      const overdueDays = Math.abs(diffDays);
      return `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
    }
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  // Get lead details - handles both populated and unpopulated data
  const getLeadDetails = (followup) => {
    // If leadId is populated (has _id and title)
    if (followup.leadId && typeof followup.leadId === 'object') {
      return followup.leadId;
    }
    // If leadId is just an ID, find in leads array
    if (followup.leadId && typeof followup.leadId === 'string') {
      return leads.find(l => l._id === followup.leadId);
    }
    return null;
  };

  const stats = {
    total: followups.length,
    pending: followups.filter(f => f.status === 'Pending' && new Date(f.reminderDate) >= new Date()).length,
    completed: followups.filter(f => f.status === 'Completed').length,
    overdue: followups.filter(f => f.status === 'Pending' && new Date(f.reminderDate) < new Date()).length,
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading follow-ups...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Follow-ups</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage follow-ups with your leads</p>
          </div>
          <button
            onClick={() => {
              if (leads.length === 0) {
                toast.error('Please add leads before scheduling follow-ups');
                return;
              }
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Schedule Follow-up
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Follow-ups</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'overdue'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Overdue ({stats.overdue})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Completed ({stats.completed})
          </button>
        </div>

        {/* Follow-ups List */}
        <div className="space-y-3">
          {getFilteredFollowups().length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <Bell size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No follow-ups scheduled yet</p>
              <button
                onClick={() => {
                  if (leads.length === 0) {
                    toast.error('Please add leads first');
                    return;
                  }
                  setShowModal(true);
                }}
                className="mt-3 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Schedule your first follow-up
              </button>
            </div>
          ) : (
            getFilteredFollowups().map((followup) => {
              const lead = getLeadDetails(followup);
              const isOverdue = followup.status === 'Pending' && new Date(followup.reminderDate) < new Date();
              
              return (
                <div
                  key={followup._id}
                  className={`rounded-lg border p-4 transition-all hover:shadow-md ${
                    isOverdue ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : 
                    followup.status === 'Completed' ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' :
                    'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {lead?.title || 'Unknown Lead'}
                        </h3>
                        {lead?.company && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Building size={12} />
                            {lead.company}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            followup.status === 'Completed'
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : isOverdue
                              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                          }`}
                        >
                          {followup.status === 'Completed'
                            ? 'Completed'
                            : isOverdue
                            ? 'Overdue'
                            : 'Pending'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{followup.notes}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDisplayDate(followup.reminderDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                            {getTimeStatus(followup.reminderDate)}
                          </span>
                        </div>
                        {lead?.email && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Mail size={12} />
                              <span className="text-xs">{lead.email}</span>
                            </div>
                          </>
                        )}
                        {lead?.phone && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Phone size={12} />
                              <span className="text-xs">{lead.phone}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {followup.status !== 'Completed' && !isOverdue && (
                        <button
                          onClick={() => handleComplete(followup._id, followup.status)}
                          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                          title="Mark as completed"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {followup.status === 'Completed' && (
                        <button
                          onClick={() => handleComplete(followup._id, followup.status)}
                          className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded transition-colors"
                          title="Reopen"
                        >
                          <Clock size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingFollowup(followup);
                          const leadId = followup.leadId?._id || followup.leadId;
                          const datePart = getDatePart(followup.reminderDate);
                          const { time, ampm } = getTimeParts(followup.reminderDate);
                          setFormData({
                            leadId: leadId,
                            date: datePart,
                            time: time,
                            ampm: ampm,
                            notes: followup.notes,
                            status: followup.status
                          });
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(followup._id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Form with AM/PM Selection and Dark Mode */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingFollowup ? 'Edit Follow-up' : 'Schedule Follow-up'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingFollowup ? 'Update follow-up details' : 'Schedule when to follow up with your lead'}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Lead *
                  </label>
                  <select
                    value={formData.leadId}
                    onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select a lead</option>
                    {leads.map((lead) => (
                      <option key={lead._id} value={lead._id}>
                        {lead.title} - {lead.company} (${lead.value?.toLocaleString() || 0})
                      </option>
                    ))}
                  </select>
                  {leads.length === 0 && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      No leads available. Please add leads first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time *
                  </label>
                  <div className="flex gap-3">
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="01:00">1:00</option>
                      <option value="01:30">1:30</option>
                      <option value="02:00">2:00</option>
                      <option value="02:30">2:30</option>
                      <option value="03:00">3:00</option>
                      <option value="03:30">3:30</option>
                      <option value="04:00">4:00</option>
                      <option value="04:30">4:30</option>
                      <option value="05:00">5:00</option>
                      <option value="05:30">5:30</option>
                      <option value="06:00">6:00</option>
                      <option value="06:30">6:30</option>
                      <option value="07:00">7:00</option>
                      <option value="07:30">7:30</option>
                      <option value="08:00">8:00</option>
                      <option value="08:30">8:30</option>
                      <option value="09:00">9:00</option>
                      <option value="09:30">9:30</option>
                      <option value="10:00">10:00</option>
                      <option value="10:30">10:30</option>
                      <option value="11:00">11:00</option>
                      <option value="11:30">11:30</option>
                    </select>
                    <select
                      value={formData.ampm}
                      onChange={(e) => setFormData({ ...formData, ampm: e.target.value })}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Select hour and AM/PM</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes *
                  </label>
                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="What needs to be discussed? Any specific points or questions?"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingFollowup ? 'Update Follow-up' : 'Schedule Follow-up'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FollowUps;