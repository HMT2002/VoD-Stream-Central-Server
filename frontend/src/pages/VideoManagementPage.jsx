import { Download, ChevronDown, User } from 'lucide-react';
import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';

export default function SupportTicketTable() {
  const [selectedItems, setSelectedItems] = useState([]);
  // Add these states for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeStatus, setActiveStatus] = useState('all');

  const tickets = [
    {
      id: 1,
      customer: 'Erin Hyatt',
      time: '15:45',
      subject: 'No power',
      message: "Thanks for letting us know, Bob. I'm glad to hear that the problem is fixed. Have a nice day!",
      from: 'Agent',
      status: 'closed',
    },
    {
      id: 2,
      customer: 'Blair Schinner',
      time: '15:36',
      subject: 'My fridge stopped cooling down',
      message: 'Hello John, I see. This error code indicates a problem with the motherboard...',
      from: 'Agent',
      status: 'open',
    },
    {
      id: 3,
      customer: 'Ocie Turcotte',
      time: '14:34',
      subject: 'Light inside my fridge always on??',
      message: "I'm sorry, but I really need to know if the light turns off when the door is ...",
      from: 'Customer',
      status: 'open',
    },
    {
      id: 4,
      customer: 'Halle Johnston',
      time: '09:56',
      subject: 'Need invoice',
      message: "You're welcome!",
      from: 'Agent',
      status: 'closed',
    },
    {
      id: 5,
      customer: 'Pearline Kerluke',
      time: '08:53',
      subject: 'Connected fridge setup',
      message: 'Sure thing, Sarah. Can you tell me the exact model of your fridge?',
      from: 'Agent',
      status: 'pending',
    },
    {
      id: 6,
      customer: 'Wanda Weber',
      time: '08:53',
      subject: 'How to defrost the freezer',
      message: "You're welcome!",
      from: 'Agent',
      status: 'closed',
    },
    {
      id: 7,
      customer: 'Kylie Bins',
      time: '07:19',
      subject: 'Strange sound coming from SuperCooler',
      message: "In that case, it's possible that the compressor is faulty and needs ...",
      from: 'Agent',
      status: 'open',
    },
    {
      id: 8,
      customer: 'Wanda Weber',
      time: '02:04',
      subject: 'Warranty validity',
      message: "Oh, that's too bad. Let me think about it and I'll get back to you.",
      from: 'Customer',
      status: 'pending',
    },
    {
      id: 9,
      customer: 'Hyman Baumbach',
      date: 'May 12',
      subject: 'Fridge not working, food spoiled. Help!!',
      message: "Thanks for letting us know. I'm glad to hear that the problem is fixed...",
      from: 'Agent',
      status: 'closed',
    },
    {
      id: 10,
      customer: 'Halle Johnston',
      date: 'May 12',
      subject: 'Do you sell vacuum cleaners?',
      message: "Hi, thanks for reaching out to us. You must be mistaken, we don't sell vacuum...",
      from: 'Agent',
      status: 'closed',
    },
    {
      id: 11,
      customer: 'Floyd Feil',
      date: 'May 11',
      subject: 'I broke the thermostat',
      message: "Thanks, Bob. I've sent you an email with the link to the spare parts store. You can buy...",
      from: 'Agent',
      status: 'closed',
    },
    {
      id: 12,
      customer: 'Myra Marvin',
      date: 'May 11',
      subject: "Don't forget the milk",
      message: 'Hi Mitch, No worries, I sometimes write to my dog, too! Best, John',
      from: 'Agent',
      status: 'closed',
    },
    {
      id: 13,
      customer: 'Pearline Kerluke',
      date: 'May 11',
      subject: 'Lobster in the fridge',
      message: 'Oh, I see. Thanks anyway!',
      from: 'Customer',
      status: 'closed',
    },
    {
      id: 14,
      customer: 'Erin Hyatt',
      time: '15:45',
      subject: 'No power',
      message: "Thanks for letting us know, Bob. I'm glad to hear that the problem is fixed. Have a nice day!",
      from: 'Agent',
      status: 'closed',
    },
    {
      id: 15,
      customer: 'Blair Schinner',
      time: '15:36',
      subject: 'My fridge stopped cooling down',
      message: 'Hello John, I see. This error code indicates a problem with the motherboard...',
      from: 'Agent',
      status: 'open',
    },
    {
      id: 16,
      customer: 'Ocie Turcotte',
      time: '14:34',
      subject: 'Light inside my fridge always on??',
      message: "I'm sorry, but I really need to know if the light turns off when the door is ...",
      from: 'Customer',
      status: 'open',
    },
    {
      id: 17,
      customer: 'Halle Johnston',
      time: '09:56',
      subject: 'Need invoice',
      message: "You're welcome!",
      from: 'Agent',
      status: 'closed',
    },
    {
      id: 18,
      customer: 'Pearline Kerluke',
      time: '08:53',
      subject: 'Connected fridge setup',
      message: 'Sure thing, Sarah. Can you tell me the exact model of your fridge?',
      from: 'Agent',
      status: 'pending',
    },
    {
      id: 19,
      customer: 'Wanda Weber',
      time: '08:53',
      subject: 'How to defrost the freezer',
      message: "You're welcome!",
      from: 'Agent',
      status: 'closed',
    },
    {
      id: 20,
      customer: 'Kylie Bins',
      time: '07:19',
      subject: 'Strange sound coming from SuperCooler',
      message: "In that case, it's possible that the compressor is faulty and needs ...",
      from: 'Agent',
      status: 'open',
    },
    {
      id: 21,
      customer: 'Wanda Weber',
      time: '02:04',
      subject: 'Warranty validity',
      message: "Oh, that's too bad. Let me think about it and I'll get back to you.",
      from: 'Customer',
      status: 'pending',
    },
    {
      id: 22,
      customer: 'Hyman Baumbach',
      date: 'May 12',
      subject: 'Fridge not working, food spoiled. Help!!',
      message: "Thanks for letting us know. I'm glad to hear that the problem is fixed...",
      from: 'Agent',
      status: 'closed',
    },
    {
      id: 23,
      customer: 'Halle Johnston',
      date: 'May 12',
      subject: 'Do you sell vacuum cleaners?',
      message: "Hi, thanks for reaching out to us. You must be mistaken, we don't sell vacuum...",
      from: 'Agent',
      status: 'closed',
    },
  ];

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedItems(tickets.map((ticket) => ticket.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelect = (id) => {
    const selectedIndex = selectedItems.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedItems, id];
    } else {
      newSelected = selectedItems.filter((item) => item !== id);
    }

    setSelectedItems(newSelected);
  };

  const isSelected = (id) => selectedItems.indexOf(id) !== -1;

  // Function to get appropriate status chip color classes
  const getStatusClasses = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'closed':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Function to filter tickets based on activeStatus
  const getFilteredTickets = () => {
    if (activeStatus === 'all') return tickets;
    return tickets.filter((ticket) => ticket.status === activeStatus);
  };
  // Calculate pagination values
  const filteredTickets = getFilteredTickets();
  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const currentItems = filteredTickets.slice(startIndex, endIndex);
  console.log({ startIndex, endIndex });
  return (
    <React.Fragment>
      <div className="w-full font-sans">
        {/* Filter and Export Bar */}
        <div className="flex mb-4 gap-2">
          <div className="w-44">
            <div className="relative w-full">
              <select className="w-full p-2 border border-gray-300 rounded text-sm appearance-none">
                <option>Customer</option>
                <option>Agent</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronDown size={16} className="text-gray-500" />
              </div>
            </div>
          </div>

          <div className="w-44">
            <div className="relative w-full">
              <select className="w-full p-2 border border-gray-300 rounded text-sm appearance-none">
                <option>Product</option>
                <option>Fridge</option>
                <option>Freezer</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronDown size={16} className="text-gray-500" />
              </div>
            </div>
          </div>

          <div className="flex-grow"></div>

          <button className="flex items-center text-blue-600">
            <Download size={16} />
            <span className="ml-1 text-sm font-medium">EXPORT</span>
          </button>
        </div>

        <div className="flex">
          {/* Left Sidebar */}
          <div className="w-44 bg-blue-50 rounded p-2 ">
            <div
              className={`p-1 flex justify-between hover:bg-zinc-950 hover:text-green-500 ${
                activeStatus === 'all' ? 'text-green-500 bg-zinc-950' : ''
              }`}
              onClick={() => setActiveStatus('all')}
            >
              <span className="text-sm font-bold">All</span>
              <span className="text-sm ">13</span>
            </div>

            <div
              className={`p-1 flex justify-between hover:bg-zinc-950 hover:text-green-500 ${
                activeStatus === 'open' ? 'text-green-500 bg-zinc-950' : ''
              }`}
              onClick={() => setActiveStatus('open')}
            >
              <span className="text-sm">Open</span>
              <span className="text-sm ">3</span>
            </div>

            <div
              className={`p-1 flex justify-between hover:bg-zinc-950 hover:text-green-500 ${
                activeStatus === 'pending' ? 'text-green-500 bg-zinc-950' : ''
              }`}
              onClick={() => setActiveStatus('pending')}
            >
              <span className="text-sm">Pending</span>
              <span className="text-sm ">2</span>
            </div>

            <div
              className={`p-1 flex justify-between hover:bg-zinc-950 hover:text-green-500 ${
                activeStatus === 'closed' ? 'text-green-500 bg-zinc-950' : ''
              }`}
              onClick={() => setActiveStatus('closed')}
            >
              <span className="text-sm">Closed</span>
              <span className="text-sm ">8</span>
            </div>
          </div>

          {/* Main Table Section */}
          <div className="flex-grow ml-4">
            <div className="border border-gray-300 rounded">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300">
                    <th className="p-2 w-12">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={selectedItems.length === tickets.length && tickets.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-2 text-left text-sm font-medium">Customer</th>
                    <th className="p-2 text-left text-sm font-medium">
                      <div className="flex items-center">
                        <span>Date</span>
                        <ChevronDown size={16} className="ml-1" />
                      </div>
                    </th>
                    <th className="p-2 text-left text-sm font-medium">Subject</th>
                    <th className="p-2 text-left text-sm font-medium">From</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={isSelected(ticket.id)}
                          onChange={() => handleSelect(ticket.id)}
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                            <User size={16} className="text-gray-600" />
                          </div>
                          <span className="text-sm">{ticket.customer}</span>
                        </div>
                      </td>
                      <td className="p-2 text-sm">{ticket.time || ticket.date}</td>
                      <td className="p-2">
                        <div>
                          <div className="text-sm font-medium">{ticket.subject}</div>
                          <div className="text-sm text-gray-500 truncate max-w-md">- {ticket.message}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{ticket.from}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusClasses(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            // Replace your current pagination section with this
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <span className="text-sm mr-2">Rows per page:</span>
                <div className="relative">
                  <select
                    className="appearance-none border border-gray-300 rounded p-1 pr-8 text-sm"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing page size
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown size={14} className="text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-sm mr-4">
                  {startIndex + 1}-{endIndex} of {totalItems}
                </div>

                <div className="flex space-x-1">
                  <button
                    className="p-1 rounded border border-gray-300 disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                  >
                    &laquo;
                  </button>
                  <button
                    className="p-1 rounded border border-gray-300 disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    &lsaquo;
                  </button>

                  {/* You can add page numbers here if needed */}

                  <button
                    className="p-1 rounded border border-gray-300 disabled:opacity-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    &rsaquo;
                  </button>
                  <button
                    className="p-1 rounded border border-gray-300 disabled:opacity-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    &raquo;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
