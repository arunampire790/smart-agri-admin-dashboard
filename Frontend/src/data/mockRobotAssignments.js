// TODO: Replace with real backend API data
export const mockRobots = [
  { id: "ROB-0001", model: "AB-X1000", farmer: "John Smith", status: "Active", registered: "2025-12-15" },
  { id: "ROB-0002", model: "AB-X1000", farmer: "Sarah Johnson", status: "Assigned", registered: "2026-01-10" },
  { id: "ROB-0003", model: "AB-X2000", farmer: "Michael Brown", status: "Maintenance", registered: "2025-11-20" },
  { id: "ROB-0004", model: "AB-X1000", farmer: "John Smith", status: "Active", registered: "2025-10-12" },
  { id: "ROB-0005", model: "AB-X1000", farmer: null, status: "Available", registered: "2026-03-01" },
  { id: "ROB-0006", model: "AB-X2000", farmer: null, status: "Available", registered: "2026-03-15" },
  { id: "ROB-0007", model: "AB-X1000", farmer: "Emily Davis", status: "Inactive", registered: "2026-02-05" },
  { id: "ROB-0008", model: "AB-X2000", farmer: null, status: "Lost", registered: "2025-09-30" },
];

// TODO: Replace with real audit log data from backend
export const mockHistory = [
  { robotId: "ROB-0001", action: "Assigned", farmer: "John Smith", by: "Admin User", date: "2025-12-15" },
  { robotId: "ROB-0002", action: "Assigned", farmer: "Sarah Johnson", by: "Admin User", date: "2026-01-10" },
  { robotId: "ROB-0003", action: "Assigned", farmer: "Michael Brown", by: "Admin User", date: "2025-11-20" },
  { robotId: "ROB-0003", action: "Maintenance", farmer: "Michael Brown", by: "Admin User", date: "2026-03-01" },
  { robotId: "ROB-0007", action: "Assigned", farmer: "Emily Davis", by: "Admin User", date: "2026-02-05" },
  { robotId: "ROB-0007", action: "Deactivated", farmer: "Emily Davis", by: "Admin User", date: "2026-04-01" },
];

export const modelOptions = ['AB-X1000', 'AB-X2000'];
export const statusOptions = ['Available', 'Assigned', 'Active', 'Maintenance', 'Inactive', 'Lost'];
