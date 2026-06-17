import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Welcome back — here's what's happening today</div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ flex: 1 }}>
            <div className="stat-label">Total Users</div>
            <div className="stat-val">8</div>
            <div className="stat-note" style={{ color: '#2B7A3E' }}>↑ +12% from last month</div>
          </div>
          <div className="stat-icon" style={{ background: '#E6F4EA', color: '#137333' }}>
            <i className="ti ti-users" aria-hidden="true"></i>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ flex: 1 }}>
            <div className="stat-label">Total Farms</div>
            <div className="stat-val">8</div>
            <div className="stat-note" style={{ color: '#2B7A3E' }}>↑ +8% from last month</div>
          </div>
          <div className="stat-icon" style={{ background: '#E6F4EA', color: '#137333' }}>
            <i className="ti ti-building-cottage" aria-hidden="true"></i>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ flex: 1 }}>
            <div className="stat-label">Total Robots</div>
            <div className="stat-val">8</div>
            <div className="stat-note" style={{ color: '#C5221F' }}>3 offline</div>
          </div>
          <div className="stat-icon" style={{ background: '#FCE8E6', color: '#C5221F' }}>
            <i className="ti ti-robot" aria-hidden="true"></i>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ flex: 1 }}>
            <div className="stat-label">Active Robots</div>
            <div className="stat-val">4</div>
            <div className="stat-note">Currently operating</div>
          </div>
          <div className="stat-icon" style={{ background: '#E6F4EA', color: '#137333' }}>
            <i className="ti ti-activity" aria-hidden="true"></i>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ flex: 1 }}>
            <div className="stat-label">Active Tasks</div>
            <div className="stat-val">7</div>
            <div className="stat-note" style={{ color: '#B06000' }}>5 high priority</div>
          </div>
          <div className="stat-icon" style={{ background: '#FEF7E0', color: '#B06000' }}>
            <i className="ti ti-clock" aria-hidden="true"></i>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ flex: 1 }}>
            <div className="stat-label">Completed Tasks</div>
            <div className="stat-val">3</div>
            <div className="stat-note">This week</div>
          </div>
          <div className="stat-icon" style={{ background: '#E6F4EA', color: '#137333' }}>
            <i className="ti ti-circle-check" aria-hidden="true"></i>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-title">User Growth Over Time</div>
          <div className="mini-bar-row"><div className="mini-bar-label">Jan</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '50%' }}></div></div><div className="mini-bar-val">40</div></div>
          <div className="mini-bar-row"><div className="mini-bar-label">Feb</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '56%' }}></div></div><div className="mini-bar-val">45</div></div>
          <div className="mini-bar-row"><div className="mini-bar-label">Mar</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '63%' }}></div></div><div className="mini-bar-val">52</div></div>
          <div className="mini-bar-row"><div className="mini-bar-label">Apr</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '72%' }}></div></div><div className="mini-bar-val">58</div></div>
          <div className="mini-bar-row"><div className="mini-bar-label">May</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '84%' }}></div></div><div className="mini-bar-val">67</div></div>
          <div className="mini-bar-row"><div className="mini-bar-label">Jun</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '100%' }}></div></div><div className="mini-bar-val">80</div></div>
        </div>
        
        <div className="chart-card">
          <div className="chart-title">Farm Registrations</div>
          <div className="mini-bar-row"><div className="mini-bar-label">Jan</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '28%' }}></div></div><div className="mini-bar-val">10</div></div>
          <div className="mini-bar-row"><div className="mini-bar-label">Feb</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '33%' }}></div></div><div className="mini-bar-val">12</div></div>
          <div className="mini-bar-row"><div className="mini-bar-label">Mar</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '44%' }}></div></div><div className="mini-bar-val">16</div></div>
          <div className="mini-bar-row"><div className="mini-bar-label">Apr</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '61%' }}></div></div><div className="mini-bar-val">22</div></div>
          <div className="mini-bar-row"><div className="mini-bar-label">May</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '75%' }}></div></div><div className="mini-bar-val">27</div></div>
          <div className="mini-bar-row"><div className="mini-bar-label">Jun</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '100%' }}></div></div><div className="mini-bar-val">36</div></div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div className="section-title">Recent Tasks</div>
          <button className="btn-sm" onClick={() => navigate('/admin/tasks')}>
            <i className="ti ti-arrow-right" aria-hidden="true"></i> View all
          </button>
        </div>
        <table>
          <thead>
            <tr><th>Task</th><th>User</th><th>Farm</th><th>Priority</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Water wheat fields</strong></td><td>John Smith</td><td>Green Valley Farm</td>
              <td><span className="pill offline">High</span></td><td><span className="pill idle">Pending</span></td>
            </tr>
            <tr>
              <td><strong>Apply nitrogen fertilizer</strong></td><td>Michael Brown</td><td>Golden Harvest</td>
              <td><span className="pill idle">Medium</span></td><td><span className="pill idle">Pending</span></td>
            </tr>
            <tr>
              <td><strong>Inspect apple trees</strong></td><td>Sarah Johnson</td><td>Sunrise Orchards</td>
              <td><span className="pill active">Low</span></td><td><span className="pill idle">In progress</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
