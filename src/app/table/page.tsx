"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

export default function TablePage() {
  const initialData = [
    { id: 1, name: "John Doe", email: "john@example.com", age: 28, department: "Engineering" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", age: 34, department: "Marketing" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", age: 45, department: "Sales" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", age: 29, department: "Design" },
    { id: 5, name: "Charlie Wilson", email: "charlie@example.com", age: 52, department: "HR" },
  ];

  const [data, setData] = useState(initialData);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filterText, setFilterText] = useState("");

  const filteredData = useMemo(() => {
    if (!filterText) return data;
    
    const searchLower = filterText.toLowerCase();
    return data.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.email.toLowerCase().includes(searchLower) ||
      item.department.toLowerCase().includes(searchLower)
    );
  }, [filterText, data]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(filteredData.map(item => item.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const isAllSelected = filteredData.length > 0 && filteredData.every(item => selectedRows.has(item.id));
  const isIndeterminate = filteredData.some(item => selectedRows.has(item.id)) && !isAllSelected;

  const handleRemoveSelected = () => {
    setData(prevData => prevData.filter(item => !selectedRows.has(item.id)));
    setSelectedRows(new Set());
  };

  const generateRandomRow = () => {
    const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William"];
    const lastNames = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez"];
    const departments = ["Engineering", "Marketing", "Sales", "Design", "HR", "Finance", "Operations", "Legal", "Support", "Product"];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const age = Math.floor(Math.random() * 40) + 22; // Age between 22-62
    const department = departments[Math.floor(Math.random() * departments.length)];
    const id = Math.max(...data.map(item => item.id), 0) + 1;
    
    return { id, name, email, age, department };
  };

  const handleAddRow = () => {
    const newRow = generateRandomRow();
    setData(prevData => [...prevData, newRow]);
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Table Demo</h1>
        
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Filter by name, email, or department..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={handleAddRow}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
          >
            Add Row
          </button>
          
          {selectedRows.size > 0 && (
            <button
              onClick={handleRemoveSelected}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 whitespace-nowrap"
            >
              Remove Selected ({selectedRows.size})
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(item.id)}
                      onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.department}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}