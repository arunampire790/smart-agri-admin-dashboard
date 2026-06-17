import React from 'react';

export default function Analytics() {
  return (
    <>
      <div className="page-header">
        <div className="page-title">Analytics</div>
        <div className="page-sub">System-wide performance metrics</div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ flex: 1 }}>
            <div className="stat-label">Avg farm productivity</div>
            <div className="stat-val">86.5%</div>
            <div className="stat-note" style={{ color: '#2B7A3E' }}>↑ +5.2% from last month</div>
          </div>
          <div className="stat-icon" style={{ background: '#E6F4EA', color: '#137333' }}>
            <i className="ti ti-chart-arrows-vertical" aria-hidden="true"></i>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ flex: 1 }}>
            <div className="stat-label">Task completion rate</div>
            <div className="stat-val">92.3%</div>
            <div className="stat-note" style={{ color: '#2B7A3E' }}>↑ +3.1% from last month</div>
          </div>
          <div className="stat-icon" style={{ background: '#E6F4EA', color: '#137333' }}>
            <i className="ti ti-check" aria-hidden="true"></i>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ flex: 1 }}>
            <div className="stat-label">Robot efficiency</div>
            <div className="stat-val">78.4%</div>
            <div className="stat-note" style={{ color: '#C5221F' }}>↓ -1.8% from last month</div>
          </div>
          <div className="stat-icon" style={{ background: '#FCE8E6', color: '#C5221F' }}>
            <i className="ti ti-activity" aria-hidden="true"></i>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-title">Crop distribution</div>
          <div style={{ marginBottom: '8px' }}>
            <div className="mini-bar-row"><div className="mini-bar-label">Wheat</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '25%', background: '#2B7A3E' }}></div></div><div className="mini-bar-val">25%</div></div>
            <div className="mini-bar-row"><div className="mini-bar-label">Others</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '22%', background: '#66bb6a' }}></div></div><div className="mini-bar-val">22%</div></div>
            <div className="mini-bar-row"><div className="mini-bar-label">Corn</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '20%', background: '#81c784' }}></div></div><div className="mini-bar-val">20%</div></div>
            <div className="mini-bar-row"><div className="mini-bar-label">Soybeans</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '18%', background: '#a5d6a7' }}></div></div><div className="mini-bar-val">18%</div></div>
            <div className="mini-bar-row"><div className="mini-bar-label">Rice</div><div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '15%', background: '#c8e6c9' }}></div></div><div className="mini-bar-val">15%</div></div>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Robot status</div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#137333', marginRight: '6px' }}></span>Active<span style={{ marginLeft: 'auto', fontWeight: '500', color: 'var(--color-text-primary)' }}>4</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#B06000', marginRight: '6px' }}></span>Idle<span style={{ marginLeft: 'auto', fontWeight: '500', color: 'var(--color-text-primary)' }}>3</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#C5221F', marginRight: '6px' }}></span>Offline<span style={{ marginLeft: 'auto', fontWeight: '500', color: 'var(--color-text-primary)' }}>1</span>
          </div>
          <div style={{ marginTop: '16px' }}>
            <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ background: '#137333', width: '50%' }}></div>
              <div style={{ background: '#B06000', width: '37.5%' }}></div>
              <div style={{ background: '#C5221F', width: '12.5%' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
              <span>Active 50%</span><span>Idle 37.5%</span><span>Offline 12.5%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
