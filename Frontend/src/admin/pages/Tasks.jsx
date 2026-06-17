import React, { useState } from 'react';

export default function Tasks() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Task Management</div>
          <div className="page-sub">Assign and track agricultural tasks</div>
        </div>
        <button className="btn-primary"><i className="ti ti-plus" aria-hidden="true"></i> Assign Task</button>
      </div>

      <div className="section-card">
        <div className="tab-bar">
          <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All (10)</div>
          <div className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending (5)</div>
          <div className={`tab ${activeTab === 'inprog' ? 'active' : ''}`} onClick={() => setActiveTab('inprog')}>In Progress (2)</div>
          <div className={`tab ${activeTab === 'done' ? 'active' : ''}`} onClick={() => setActiveTab('done')}>Completed (3)</div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <input className="form-input" placeholder="Search tasks by title or assignee..." aria-label="Search tasks" style={{ width: '100%' }} />
        </div>

        <table>
          <thead>
            <tr><th>Task</th><th>Assigned to</th><th>Farm</th><th>Type</th><th>Priority</th><th>Due date</th><th>Action</th></tr>
          </thead>
          <tbody>
            {(activeTab === 'all' || activeTab === 'pending') && (
              <>
                <tr><td><strong>Water wheat fields</strong></td><td>John Smith</td><td>Green Valley Farm</td><td><span className="pill irr">Irrigation</span></td><td><span className="pill offline">High</span></td><td>2026-04-09</td><td><button className="btn-sm">Complete</button></td></tr>
                <tr><td><strong>Apply nitrogen fertilizer</strong></td><td>Michael Brown</td><td>Golden Harvest</td><td><span className="pill fert">Fertilizer</span></td><td><span className="pill idle">Medium</span></td><td>2026-04-10</td><td><button className="btn-sm">Start</button></td></tr>
              </>
            )}
            {(activeTab === 'all' || activeTab === 'inprog') && (
              <tr><td><strong>Inspect apple trees</strong></td><td>Sarah Johnson</td><td>Sunrise Orchards</td><td><span className="pill insp">Inspection</span></td><td><span className="pill active">Low</span></td><td>2026-04-07</td><td><button className="btn-sm">Start</button></td></tr>
            )}
            {activeTab === 'done' && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>No newly completed tasks to show.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
