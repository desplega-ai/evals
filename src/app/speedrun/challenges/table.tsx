"use client";

import { useState, useEffect } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function TableChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [filterText, setFilterText] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [data, setData] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", age: 28, department: "Engineering" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", age: 34, department: "Design" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", age: 45, department: "Sales" },
    { id: 4, name: "Alice Williams", email: "alice@example.com", age: 29, department: "Engineering" },
    { id: 5, name: "Charlie Brown", email: "charlie@example.com", age: 38, department: "Marketing" },
  ]);

  const filteredData = data.filter((row) =>
    `${row.name} ${row.email} ${row.department}`.toLowerCase().includes(filterText.toLowerCase())
  );

  const hasFiltered = filterText.length > 0;
  const hasSelected = selectedRows.size > 0;
  const hasAddedRow = data.length > 5;

  useEffect(() => {
    if (!challenge.completed && hasFiltered && hasSelected && hasAddedRow) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFiltered, hasSelected, hasAddedRow, onComplete]);

  const toggleRowSelection = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const addRow = () => {
    setData([...data, {
      id: data.length + 1,
      name: "New Employee",
      email: "new@example.com",
      age: 25,
      department: "Engineering"
    }]);
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Filter the table", completed: hasFiltered },
        { text: "Select a row", completed: hasSelected },
        { text: "Add a new row", completed: hasAddedRow },
      ]}
    >
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Filter by name, email, or department..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="border p-2 text-left">
                  <input type="checkbox" className="w-4 h-4" readOnly />
                </th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Age</th>
                <th className="border p-2 text-left">Department</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                    />
                  </td>
                  <td className="border p-2">{row.name}</td>
                  <td className="border p-2">{row.email}</td>
                  <td className="border p-2">{row.age}</td>
                  <td className="border p-2">{row.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={addRow}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
        >
          + Add New Row
        </button>
      </div>
    </ChallengeCard>
  );
}
