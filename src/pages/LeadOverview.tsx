import { useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const mockLeads = [
  { id: 1, name: 'John Doe', email: 'john@example.com', source: 'Make an Enquiry', date: '2024-03-15', status: 'Pending' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', source: 'Guides Downloads', date: '2024-03-14', status: 'Accepted' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', source: 'Talk to Us', date: '2024-03-13', status: 'Rejected' },
];

export default function LeadOverview() {
    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [leads, setLeads] = useState(mockLeads);
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const handleStatusChange = (leadId, newStatus) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
  };

  const handleFilterAndSort = () => {
    let filtered = [...mockLeads];
    
    if (selectedSource !== 'all') {
      filtered = filtered.filter(lead => lead.source === selectedSource);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === selectedStatus);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
       <Sidebar isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen} />
       <Header  sidebarOpen={sidebarIsOpen} setSidebarOpen={setSidebarIsOpen}/>
       <div class="sm:ml-64">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select 
            className="p-2 border rounded"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="Make an Enquiry">Make an Enquiry</option>
            <option value="Talk to Us">Talk to Us</option>
            <option value="Guides Downloads">Guides Downloads</option>
          </select>

          <select 
            className="p-2 border rounded"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Archived">Archived</option>
          </select>

          <select 
            className="p-2 border rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Leads Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {handleFilterAndSort().map(lead => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowReplyModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EnvelopeIcon className="h-5 w-5 inline" />
                    </button>
                    <div className="inline-block relative">
                      <button className="text-gray-400 hover:text-gray-600">
                        •••
                      </button>
                      <div className="hidden absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1">
                        <button 
                          onClick={() => handleStatusChange(lead.id, 'Accepted')}
                          className="block px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleStatusChange(lead.id, 'Rejected')}
                          className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleStatusChange(lead.id, 'Archived')}
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 w-full text-left"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reply Modal */}
        {showReplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-medium mb-4">Reply to {selectedLead?.name}</h3>
              <input 
                type="text" 
                placeholder="Subject" 
                className="w-full mb-4 p-2 border rounded"
              />
              <textarea 
                placeholder="Message" 
                className="w-full mb-4 p-2 border rounded h-32"
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}