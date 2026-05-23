import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/Card/StatCard';
import { Briefcase, Trophy, DollarSign, TrendingUp, Target } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    wonDeals: 0,
    lostDeals: 0,
    conversionRate: 0,
    totalRevenue: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch leads directly (more reliable)
      const leadsRes = await api.get('/leads');
      const allLeads = leadsRes.data || [];
      
      // Calculate stats from leads data
      const totalLeads = allLeads.length;
      const wonDeals = allLeads.filter(lead => lead.stage === 'Won').length;
      const lostDeals = allLeads.filter(lead => lead.stage === 'Lost').length;
      const totalRevenue = allLeads
        .filter(lead => lead.stage === 'Won')
        .reduce((sum, lead) => sum + (lead.value || 0), 0);
      const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;
      
      setStats({
        totalLeads,
        wonDeals,
        lostDeals,
        conversionRate: Math.round(conversionRate * 10) / 10,
        totalRevenue
      });
      
      // Get recent leads (last 5)
      setRecentLeads(allLeads.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get stage color with dark mode support
  const getStageColor = (stage) => {
    const colors = {
      'Won': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      'Lost': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      'Negotiation': 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      'Proposal Sent': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
      'Qualified': 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300',
      'Contacted': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
      'New Lead': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
    };
    return colors[stage] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-blue-100 mt-1">
            {user?.role === 'admin' 
              ? 'Here\'s an overview of your team\'s sales performance'
              : 'Track your leads and sales performance'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Leads Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Leads</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{stats.totalLeads}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">All time leads</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase size={24} className="text-white" />
              </div>
            </div>
          </div>

          {/* Won Deals Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Won Deals</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.wonDeals}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Closed successfully</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Trophy size={24} className="text-white" />
              </div>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">{stats.conversionRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{stats.wonDeals}/{stats.totalLeads} leads won</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">From won deals</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Leads Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Leads</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your latest 5 leads</p>
              </div>
              <Link to="/leads" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                View All Leads →
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {recentLeads.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No leads added yet</p>
                <Link to="/leads" className="mt-2 inline-block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  Add your first lead →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-medium text-gray-800 dark:text-white">{lead.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStageColor(lead.stage)}`}>
                          {lead.stage}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          lead.priority === 'High' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                          lead.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                          'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        }`}>
                          {lead.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{lead.company}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 dark:text-white">${lead.value?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Summary */}
        {recentLeads.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Pipeline Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'].map((stage) => {
                const count = recentLeads.filter(l => l.stage === stage).length;
                return (
                  <div key={stage} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{stage}</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Get Started Call to Action */}
        {stats.totalLeads === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 text-center border-2 border-dashed border-blue-200 dark:border-gray-600">
            <Target size={48} className="mx-auto text-blue-400 dark:text-blue-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Welcome to BDA CRM!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Start by adding your first lead to see analytics here</p>
            <div className="flex gap-4 justify-center">
              <Link to="/leads" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Your First Lead
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;