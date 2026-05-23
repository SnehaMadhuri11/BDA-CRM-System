import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import { 
  BarChart3, TrendingUp, DollarSign, Trophy, Users, Download, 
  AlertCircle, PieChart, Target, Calendar, Activity,
  CheckCircle, XCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allLeads, setAllLeads] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalLeads: 0,
    wonDeals: 0,
    lostDeals: 0,
    conversionRate: 0,
    totalRevenue: 0,
    avgDealValue: 0,
    pipelineValue: 0
  });
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [leadsByStage, setLeadsByStage] = useState([]);
  const [leadsBySource, setLeadsBySource] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  
  const hasFetched = useRef(false);

  // Colors for charts
  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#6366F1'];
  
  const PRIORITY_COLORS = {
    'High': '#EF4444',
    'Medium': '#F59E0B',
    'Low': '#10B981'
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchReportsData();
    }
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const leadsRes = await api.get('/leads');
      const leads = leadsRes.data || [];
      setAllLeads(leads);
      
      // Calculate analytics
      const totalLeads = leads.length;
      const wonDeals = leads.filter(lead => lead.stage === 'Won').length;
      const lostDeals = leads.filter(lead => lead.stage === 'Lost').length;
      const totalRevenue = leads
        .filter(lead => lead.stage === 'Won')
        .reduce((sum, lead) => sum + (lead.value || 0), 0);
      const pipelineValue = leads
        .filter(lead => lead.stage !== 'Won' && lead.stage !== 'Lost')
        .reduce((sum, lead) => sum + (lead.value || 0), 0);
      const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;
      const avgDealValue = wonDeals > 0 ? totalRevenue / wonDeals : 0;
      
      setAnalytics({
        totalLeads,
        wonDeals,
        lostDeals,
        conversionRate: Math.round(conversionRate * 10) / 10,
        totalRevenue,
        avgDealValue: Math.round(avgDealValue),
        pipelineValue
      });
      
      // Calculate leads by stage
      const stageMap = {};
      leads.forEach(lead => {
        stageMap[lead.stage] = (stageMap[lead.stage] || 0) + 1;
      });
      const stageData = Object.entries(stageMap).map(([stage, count]) => ({
        stage,
        count
      }));
      setLeadsByStage(stageData);
      
      // Calculate leads by source
      const sourceMap = {};
      leads.forEach(lead => {
        if (lead.source) {
          sourceMap[lead.source] = (sourceMap[lead.source] || 0) + 1;
        }
      });
      const sourceData = Object.entries(sourceMap).map(([source, count]) => ({
        source,
        count
      }));
      setLeadsBySource(sourceData);
      
      // Calculate leads by priority
      const priorityMap = { High: 0, Medium: 0, Low: 0 };
      leads.forEach(lead => {
        if (lead.priority) {
          priorityMap[lead.priority] = (priorityMap[lead.priority] || 0) + 1;
        }
      });
      const priorityArray = Object.entries(priorityMap).map(([priority, count]) => ({
        priority,
        count
      }));
      setPriorityData(priorityArray);
      
      // Calculate monthly trends (last 6 months)
      const months = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        months[monthKey] = { month: monthKey, created: 0, won: 0, value: 0 };
      }
      
      leads.forEach(lead => {
        const date = new Date(lead.createdAt);
        const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        if (months[monthKey]) {
          months[monthKey].created++;
          if (lead.stage === 'Won') {
            months[monthKey].won++;
            months[monthKey].value += lead.value || 0;
          }
        }
      });
      
      setMonthlyData(Object.values(months));
      
      // Fetch team performance (admin only)
      if (user?.role === 'admin') {
        try {
          const teamRes = await api.get('/reports/team-performance');
          setTeamPerformance(teamRes.data || []);
        } catch (err) {
          setTeamPerformance([]);
        }
      }
      
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Unable to load reports data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ['Lead Title', 'Company', 'Stage', 'Priority', 'Value', 'Source', 'Created Date'];
      const data = allLeads.map(lead => [
        lead.title || '',
        lead.company || '',
        lead.stage || '',
        lead.priority || '',
        lead.value || 0,
        lead.source || '',
        new Date(lead.createdAt).toLocaleDateString()
      ]);
      
      const csvContent = [headers, ...data]
        .map(row => row.join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${allLeads.length} leads successfully!`);
    } catch (err) {
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {allLeads.length} leads • {analytics.wonDeals} won • ${analytics.totalRevenue.toLocaleString()} revenue
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={allLeads.length === 0}
          >
            <Download size={20} />
            Export Report
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button onClick={fetchReportsData} className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 text-sm font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{analytics.totalLeads}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Pipeline: ${analytics.pipelineValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <BarChart3 size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Won Deals</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.wonDeals}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Lost: {analytics.lostDeals}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <Trophy size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analytics.conversionRate}%</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{analytics.wonDeals}/{analytics.totalLeads} won</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Avg: ${analytics.avgDealValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Distribution - Bar Chart */}
        {leadsByStage.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Pipeline Distribution</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsByStage} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="stage" tick={{ fill: '#9CA3AF' }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    formatter={(value) => [`${value} leads`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    {leadsByStage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Two Column Layout for Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Lead Sources Pie Chart */}
          {leadsBySource.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChart size={20} className="text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Leads by Source</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={leadsBySource}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percent }) => `${source}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {leadsBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                      formatter={(value) => [`${value} leads`, 'Count']}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Priority Distribution Pie Chart */}
          {priorityData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={20} className="text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Leads by Priority</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ priority, percent }) => `${priority}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {priorityData.map((entry) => (
                        <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                      formatter={(value) => [`${value} leads`, 'Count']}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Trends - Bar Chart */}
        {monthlyData.length > 0 && monthlyData.some(m => m.created > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Calendar size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Monthly Performance</h2>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last 6 months
              </div>
            </div>
            
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#9CA3AF' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    formatter={(value, name) => {
                      if (name === 'Revenue') return [`$${value.toLocaleString()}`, name];
                      return [`${value} leads`, name];
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#9CA3AF' }}
                    formatter={(value) => <span className="text-gray-600 dark:text-gray-400">{value}</span>}
                  />
                  <Bar yAxisId="left" dataKey="created" name="Leads Created" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="won" name="Leads Won" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="value" name="Revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Monthly Summary Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <tr className="text-left text-gray-600 dark:text-gray-400">
                    <th className="px-3 py-2">Month</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2">Won</th>
                    <th className="px-3 py-2">Conversion</th>
                    <th className="px-3 py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month, idx) => {
                    const conversion = month.created > 0 ? (month.won / month.created * 100).toFixed(0) : 0;
                    return (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="px-3 py-2 font-medium text-gray-800 dark:text-white">{month.month}</td>
                        <td className="px-3 py-2 text-blue-600 dark:text-blue-400">{month.created}</td>
                        <td className="px-3 py-2 text-green-600 dark:text-green-400">{month.won}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            conversion >= 50 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                            conversion >= 25 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {conversion}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-purple-600 dark:text-purple-400">${month.value.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Win/Loss Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Win Rate</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{analytics.conversionRate}%</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">{analytics.wonDeals} won out of {analytics.totalLeads} total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <XCircle size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Loss Rate</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {analytics.totalLeads > 0 ? Math.round((analytics.lostDeals / analytics.totalLeads) * 100) : 0}%
                </p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">{analytics.lostDeals} lost out of {analytics.totalLeads} total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance Table (Admin Only) */}
        {user?.role === 'admin' && teamPerformance.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Team Performance</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr className="text-left text-sm text-gray-600 dark:text-gray-300">
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Leads</th>
                    <th className="px-6 py-3">Won</th>
                    <th className="px-6 py-3">Revenue</th>
                    <th className="px-6 py-3">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((member) => (
                    <tr key={member.employeeId} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{member.name}</td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{member.leadsAssigned}</td>
                      <td className="px-6 py-3 text-green-600 dark:text-green-400 font-medium">{member.dealsWon}</td>
                      <td className="px-6 py-3 text-purple-600 dark:text-purple-400 font-medium">${member.revenue.toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${member.performanceRate}%` }} />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{member.performanceRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {analytics.totalLeads === 0 && !error && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-12 text-center border-2 border-dashed border-blue-200 dark:border-gray-600">
            <Target size={48} className="mx-auto text-blue-400 dark:text-blue-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Data Available</h3>
            <p className="text-gray-600 dark:text-gray-400">Start adding leads to see beautiful analytics and charts</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Reports;