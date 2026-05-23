import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { HelpCircle, Mail, Phone, MessageCircle, FileText, Users, Briefcase, Calendar, Settings, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Help = () => {
  const helpTopics = [
    {
      icon: Briefcase,
      title: "Managing Leads",
      description: "Learn how to add, edit, and manage your sales leads",
      link: "/leads",
      color: "bg-blue-100 dark:bg-blue-900"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Admin guide to managing BDA employees",
      link: "/team",
      color: "bg-green-100 dark:bg-green-900"
    },
    {
      icon: Calendar,
      title: "Follow-ups",
      description: "Schedule and track follow-up activities",
      link: "/followups",
      color: "bg-purple-100 dark:bg-purple-900"
    },
    {
      icon: FileText,
      title: "Reports & Analytics",
      description: "Understanding your sales reports",
      link: "/reports",
      color: "bg-orange-100 dark:bg-orange-900"
    },
    {
      icon: Settings,
      title: "Account Settings",
      description: "Update your profile and preferences",
      link: "/settings",
      color: "bg-gray-100 dark:bg-gray-700"
    }
  ];

  const faqs = [
    {
      question: "How do I add a new lead?",
      answer: "Go to the Leads page and click the 'Add Lead' button. Fill in the lead details including title, company, contact information, and value."
    },
    {
      question: "How do I assign a lead to a BDA employee?",
      answer: "Admins can assign leads by editing the lead and selecting an employee from the 'Assigned To' dropdown."
    },
    {
      question: "What do the different lead stages mean?",
      answer: "Leads move through stages: New Lead → Contacted → Qualified → Proposal Sent → Negotiation → Won/Lost. This tracks your sales pipeline."
    },
    {
      question: "How do I schedule a follow-up?",
      answer: "Go to the Follow-ups page, click 'Schedule Follow-up', select a lead, choose date/time, and add notes."
    },
    {
      question: "How do I generate reports?",
      answer: "Visit the Reports page to view analytics, lead distribution, and export data to CSV."
    },
    {
      question: "Can BDA employees see all leads?",
      answer: "No, BDAs can only see leads assigned to them. Admins have full visibility."
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <HelpCircle size={32} />
            <div>
              <h1 className="text-2xl font-bold">Help & Support</h1>
              <p className="text-blue-100 mt-1">Learn how to use the BDA CRM effectively</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {helpTopics.map((topic, index) => (
              <Link
                key={index}
                to={topic.link}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${topic.color} rounded-lg flex items-center justify-center`}>
                    <topic.icon size={22} className="text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{topic.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{topic.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 text-sm">
                      Go to {topic.title} <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Still need help?</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Contact our support team for assistance</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail size={18} />
                <span>vakkalagaddasneha@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Tutorials Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Video Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">How to Manage Leads</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coming soon</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Scheduling Follow-ups</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coming soon</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Generating Reports</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coming soon</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-500">
          <p>BDA CRM v1.0 | Last updated: December 2024</p>
          <p className="mt-1">Need immediate assistance? Email us at vakkalagaddasneha@gmail.com</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Help;