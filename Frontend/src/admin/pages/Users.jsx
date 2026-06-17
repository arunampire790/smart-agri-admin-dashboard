import React from 'react';

export default function Users() {
  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">User Management</div>
          <div className="page-sub">Manage system users and permissions</div>
        </div>
        <button className="btn-primary"><i className="ti ti-plus" aria-hidden="true"></i> Add User</button>
      </div>
      <div className="section-card">
        <div className="section-header" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="section-title" style={{ marginBottom: '12px' }}>All Users (8)</div>
          <input className="form-input" placeholder="Search users by name or email…" aria-label="Search users" style={{ width: '100%' }} />
        </div>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Farms</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>John Smith</strong></td><td>john.smith@example.com</td><td>+1-555-0101</td><td>3</td><td><span className="pill active">Active</span></td><td>2025-12-15</td><td><div className="action-icons"><button className="icon-btn" title="View"><i className="ti ti-eye" aria-hidden="true"></i></button><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
            <tr><td><strong>Sarah Johnson</strong></td><td>sarah.j@example.com</td><td>+1-555-0102</td><td>2</td><td><span className="pill active">Active</span></td><td>2026-01-10</td><td><div className="action-icons"><button className="icon-btn" title="View"><i className="ti ti-eye" aria-hidden="true"></i></button><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
            <tr><td><strong>Michael Brown</strong></td><td>michael.b@example.com</td><td>+1-555-0103</td><td>5</td><td><span className="pill active">Active</span></td><td>2025-11-20</td><td><div className="action-icons"><button className="icon-btn" title="View"><i className="ti ti-eye" aria-hidden="true"></i></button><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
            <tr><td><strong>Emily Davis</strong></td><td>emily.davis@example.com</td><td>+1-555-0104</td><td>1</td><td><span className="pill offline">Inactive</span></td><td>2026-02-05</td><td><div className="action-icons"><button className="icon-btn" title="View"><i className="ti ti-eye" aria-hidden="true"></i></button><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
            <tr><td><strong>David Wilson</strong></td><td>david.w@example.com</td><td>+1-555-0105</td><td>4</td><td><span className="pill active">Active</span></td><td>2025-10-12</td><td><div className="action-icons"><button className="icon-btn" title="View"><i className="ti ti-eye" aria-hidden="true"></i></button><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
