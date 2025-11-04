import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";


import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const initialData = {
  sales: {
    property: 125000,
    addOns: 12500,
    services: 8750,
    total: 146250
  },
  invoices: [
    { id: "INV-001", customer: "John Doe", date: "2025-02-15", amount: 12500, status: "paid", type: "Property" },
    { id: "INV-002", customer: "Jane Smith", date: "2025-02-20", amount: 8750, status: "unpaid", type: "Service" },
    { id: "INV-003", customer: "Bob Johnson", date: "2025-02-25", amount: 3500, status: "paid", type: "Add-On" },
    { id: "INV-004", customer: "Alice Brown", date: "2025-02-28", amount: 15000, status: "unpaid", type: "Property" }
  ],
  refunds: [
    { id: "REF-001", invoiceId: "INV-001", customer: "John Doe", amount: 1500, reason: "Partial service cancellation", status: "pending" },
    { id: "REF-002", invoiceId: "INV-003", customer: "Bob Johnson", amount: 500, reason: "Overcharge", status: "approved" },
    { id: "REF-003", invoiceId: "INV-002", customer: "Jane Smith", amount: 8750, reason: "Service not rendered", status: "rejected" }
  ]
};

export default function PaymentDashboard() {
   const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [newInvoice, setNewInvoice] = useState({
    id: `INV-${String(data.invoices.length + 1).padStart(3, '0')}`,
    customer: "",
    customerAddress: "",
    date: new Date().toISOString().split("T")[0],
    type: "Property",
    items: [{ description: "", quantity: 1, price: 0 }],
    taxRate: 5,
    status: "unpaid"
  });
  const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundResponse, setRefundResponse] = useState("");

  const calculateInvoiceTotal = (invoice) => {
    const subtotal = invoice.items.reduce(
      (acc, item) => acc + item.quantity * item.price, 0
    );
    const tax = (subtotal * invoice.taxRate) / 100;
    return subtotal + tax;
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...newInvoice.items];
    newItems[index][field] = value;
    setNewInvoice({ ...newInvoice, items: newItems });
  };

  const addItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: "", quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items: newItems });
  };

  const handleSaveInvoice = () => {
    const invoiceTotal = calculateInvoiceTotal(newInvoice);
    const invoiceToAdd = {
      ...newInvoice,
      amount: invoiceTotal
    };
    
    setData({
      ...data,
      invoices: [...data.invoices, invoiceToAdd],
      sales: {
        ...data.sales,
        [newInvoice.type.toLowerCase().replace('-', '')]: 
          data.sales[newInvoice.type.toLowerCase().replace('-', '')] + invoiceTotal,
        total: data.sales.total + invoiceTotal
      }
    });
    
    setShowNewInvoiceForm(false);
    setNewInvoice({
      id: `INV-${String(data.invoices.length + 2).padStart(3, '0')}`,
      customer: "",
      customerAddress: "",
      date: new Date().toISOString().split("T")[0],
      type: "Property",
      items: [{ description: "", quantity: 1, price: 0 }],
      taxRate: 5,
      status: "unpaid"
    });
  };

  const downloadInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    doc.text(`Invoice: ${invoice.id}`, 10, 10);
    doc.text(`Date: ${invoice.date}`, 10, 20);
    doc.text(`Customer: ${invoice.customer}`, 10, 30);
    doc.text(`Address: ${invoice.customerAddress || "N/A"}`, 10, 40);

    doc.autoTable({
      startY: 50,
      head: [["Description", "Quantity", "Price", "Total"]],
      body: invoice.items.map((item) => [
        item.description,
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${(item.quantity * item.price).toFixed(2)}`,
      ]),
    });

    const subtotal = invoice.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const tax = (subtotal * invoice.taxRate) / 100;
    const total = subtotal + tax;

    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Tax (${invoice.taxRate}%): $${tax.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 20);
    doc.text(`Total: $${total.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 30);
    doc.text(`Status: ${invoice.status}`, 10, doc.autoTable.previous.finalY + 40);
    doc.save(`invoice-${invoice.id}.pdf`);
  };

  const handleRefundAction = (refundId, action) => {
    const updatedRefunds = data.refunds.map(refund => {
      if (refund.id === refundId) {
        let updatedSales = {...data.sales};
        
        if (action === 'approved') {
          const invoiceToRefund = data.invoices.find(inv => inv.id === refund.invoiceId);
          if (invoiceToRefund) {
            const categoryKey = invoiceToRefund.type.toLowerCase().replace('-', '');
            updatedSales = {
              ...updatedSales,
              [categoryKey]: updatedSales[categoryKey] - refund.amount,
              total: updatedSales.total - refund.amount
            };
          }
        }
        
        setData({
          ...data,
          refunds: data.refunds.map(r => 
            r.id === refundId ? {...r, status: action, response: refundResponse} : r
          ),
          sales: action === 'approved' ? updatedSales : data.sales
        });
        
        return {...refund, status: action, response: refundResponse};
      }
      return refund;
    });
    
    setSelectedRefund(null);
    setRefundResponse("");
  };

  const filteredInvoices = data.invoices.filter(invoice => 
    filterStatus === "all" ? true : invoice.status === filterStatus
  );

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortField === "date") {
      return sortDirection === "asc" 
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    }
    return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount;
  });

  const totalRefunds = data.refunds
    .filter(refund => refund.status === "approved")
    .reduce((total, refund) => total + refund.amount, 0);

  return (
    <>
      <Sidebar isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen} />
      <Header  sidebarOpen={sidebarIsOpen} setSidebarOpen={setSidebarIsOpen}/>
      <div class="sm:ml-64">
      <div className="p-6 w-full  mx-auto rounded-lg mt-3">
        <div className="flex border-b mb-6">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === "overview" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("overview")}
          >
            Payment Overview
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === "invoices" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("invoices")}
          >
            Invoice List
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === "refunds" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("refunds")}
          >
            Refund List
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-700">Total Sales</h3>
              <p className="text-3xl font-bold">${data.sales.total.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-green-700">Property Sales</h3>
              <p className="text-3xl font-bold">${data.sales.property.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{((data.sales.property / data.sales.total) * 100).toFixed(1)}% of total</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-700">Add-Ons Sales</h3>
              <p className="text-3xl font-bold">${data.sales.addOns.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{((data.sales.addOns / data.sales.total) * 100).toFixed(1)}% of total</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-yellow-700">Services Sales</h3>
              <p className="text-3xl font-bold">${data.sales.services.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{((data.sales.services / data.sales.total) * 100).toFixed(1)}% of total</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-red-700">Total Refunds</h3>
              <p className="text-3xl font-bold">${totalRefunds.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{((totalRefunds / data.sales.total) * 100).toFixed(1)}% of total sales</p>
            </div>
          </div>
        )}

        {activeTab === "invoices" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Invoices</h2>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => setShowNewInvoiceForm(true)}
              >
                Raise New Invoice
              </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
                <select
                  className="border p-2 rounded"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  className="border p-2 rounded"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="id">Invoice ID</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Direction</label>
                <select
                  className="border p-2 rounded"
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {showNewInvoiceForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">Create New Invoice</h3>
                    <button
                      onClick={() => setShowNewInvoiceForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Invoice Number</label>
                        <input
                          className="border p-2 rounded w-full"
                          value={newInvoice.id}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                          type="date"
                          className="border p-2 rounded w-full"
                          value={newInvoice.date}
                          onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Customer Name *</label>
                        <input
                          className="border p-2 rounded w-full"
                          value={newInvoice.customer}
                          onChange={(e) => setNewInvoice({ ...newInvoice, customer: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Customer Address</label>
                        <input
                          className="border p-2 rounded w-full"
                          value={newInvoice.customerAddress}
                          onChange={(e) => setNewInvoice({ ...newInvoice, customerAddress: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                          className="border p-2 rounded w-full"
                          value={newInvoice.type}
                          onChange={(e) => setNewInvoice({ ...newInvoice, type: e.target.value })}
                        >
                          <option value="Property">Property</option>
                          <option value="Add-On">Add-On</option>
                          <option value="Service">Service</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                        <input
                          type="number"
                          className="border p-2 rounded w-full"
                          value={newInvoice.taxRate}
                          onChange={(e) => setNewInvoice({ ...newInvoice, taxRate: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <h4 className="font-medium mb-2">Items</h4>
                    <div className="space-y-2 mb-4">
                      {newInvoice.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 items-center">
                          <input
                            className="border p-2 rounded col-span-2"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            placeholder="Description"
                          />
                          <input
                            type="number"
                            className="border p-2 rounded"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                            min="1"
                          />
                          <input
                            type="number"
                            className="border p-2 rounded"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, "price", Number(e.target.value))}
                            min="0"
                          />
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded"
                            onClick={() => removeItem(index)}
                            disabled={newInvoice.items.length <= 1}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        className="mt-2 bg-blue-500 text-white px-4 py-1 rounded text-sm"
                        onClick={addItem}
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="mb-4">
                      <p className="text-lg font-semibold">
                        Total: ${calculateInvoiceTotal(newInvoice).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        className="bg-gray-300 px-4 py-2 rounded"
                        onClick={() => setShowNewInvoiceForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={handleSaveInvoice}
                        disabled={!newInvoice.customer}
                      >
                        Save & Create Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Invoice ID</th>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{invoice.id}</td>
                      <td className="p-3">{invoice.customer}</td>
                      <td className="p-3">{invoice.date}</td>
                      <td className="p-3">{invoice.type}</td>
                      <td className="p-3">${invoice.amount.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-500 hover:underline"
                            onClick={() => downloadInvoicePDF(invoice)}
                          >
                            Download
                          </button>
                          {invoice.status === "unpaid" && (
                            <button
                              className="text-green-500 hover:underline"
                              onClick={() => {
                                setData({
                                  ...data,
                                  invoices: data.invoices.map(inv => 
                                    inv.id === invoice.id ? {...inv, status: 'paid'} : inv
                                  )
                                });
                              }}
                            >
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sortedInvoices.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-3 text-center text-gray-500">No invoices found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "refunds" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Refund Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Refund ID</th>
                    <th className="p-3 text-left">Invoice ID</th>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Reason</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.refunds.map((refund) => (
                    <tr key={refund.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{refund.id}</td>
                      <td className="p-3">{refund.invoiceId}</td>
                      <td className="p-3">{refund.customer}</td>
                      <td className="p-3">${refund.amount.toFixed(2)}</td>
                      <td className="p-3">{refund.reason}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          refund.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          refund.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {refund.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          {refund.status === "pending" && (
                            <>
                              <button
                                className="text-blue-500 hover:underline"
                                onClick={() => setSelectedRefund(refund)}
                              >
                                Reply
                              </button>
                              <button
                                className="text-green-500 hover:underline"
                                onClick={() => handleRefundAction(refund.id, 'approved')}
                              >
                                Approve
                              </button>
                              <button
                                className="text-red-500 hover:underline"
                                onClick={() => handleRefundAction(refund.id, 'rejected')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            className="text-gray-500 hover:underline"
                            onClick={() => handleRefundAction(refund.id, 'archived')}
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.refunds.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-3 text-center text-gray-500">No refund requests found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {selectedRefund && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Reply to Refund Request: {selectedRefund.id}</h3>
                  <div className="mb-4">
                    <p><strong>Customer:</strong> {selectedRefund.customer}</p>
                    <p><strong>Invoice:</strong> {selectedRefund.invoiceId}</p>
                    <p><strong>Amount:</strong> ${selectedRefund.amount.toFixed(2)}</p>
                    <p><strong>Reason:</strong> {selectedRefund.reason}</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Response</label>
                    <textarea
                      className="w-full border p-2 rounded h-32"
                      value={refundResponse}
                      onChange={(e) => setRefundResponse(e.target.value)}
                      placeholder="Enter your response to the customer..."
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      className="bg-gray-300 px-4 py-2 rounded"
                      onClick={() => {
                        setSelectedRefund(null);
                        setRefundResponse("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded"
                      onClick={() => handleRefundAction(selectedRefund.id, 'approved')}
                    >
                      Approve & Send
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      onClick={() => handleRefundAction(selectedRefund.id, 'rejected')}
                    >
                      Reject & Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    
    </>
  );
}