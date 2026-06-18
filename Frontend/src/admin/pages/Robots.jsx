import React from 'react';

export default function Robots() {
  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Robot Management</div>
          <div className="page-sub">Monitor and control agricultural robots</div>
        </div>
        <button className="btn-primary"><i className="ti ti-plus" aria-hidden="true"></i> Add Robot</button>
      </div>

      <div className="robot-status-cards">
        <div className="rscard">
          <div className="rscard-main">
            <div className="rscard-icon rscard-online"><i className="ti ti-robot" aria-hidden="true"></i></div>
            <div className="rscard-info">
              <div className="rscard-val">4</div>
              <div className="rscard-label">Online</div>
            </div>
          </div>
          <div className="rscard-foot">85–100% battery</div>
        </div>
        <div className="rscard">
          <div className="rscard-main">
            <div className="rscard-icon rscard-idle"><i className="ti ti-player-pause" aria-hidden="true"></i></div>
            <div className="rscard-info">
              <div className="rscard-val">3</div>
              <div className="rscard-label">Idle</div>
            </div>
          </div>
          <div className="rscard-foot">45–62% battery</div>
        </div>
        <div className="rscard">
          <div className="rscard-main">
            <div className="rscard-icon rscard-maint"><i className="ti ti-tool" aria-hidden="true"></i></div>
            <div className="rscard-info">
              <div className="rscard-val">0</div>
              <div className="rscard-label">Maintenance</div>
            </div>
          </div>
          <div className="rscard-foot">N/A</div>
        </div>
        <div className="rscard">
          <div className="rscard-main">
            <div className="rscard-icon rscard-offline"><i className="ti ti-plug-off" aria-hidden="true"></i></div>
            <div className="rscard-info">
              <div className="rscard-val">1</div>
              <div className="rscard-label">Offline</div>
            </div>
          </div>
          <div className="rscard-foot">12% battery last seen</div>
        </div>
      </div>
      
      <div className="section-card">
        <div className="section-header" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="section-title" style={{ marginBottom: '12px' }}>All Robots (8)</div>
          <input className="form-input" placeholder="Search robots by ID or model..." aria-label="Search robots" style={{ width: '100%' }} />
        </div>
        <table>
          <thead>
            <tr><th>Name</th><th>ID</th><th>Farm</th><th>Model</th><th>Battery</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>AgriBot Alpha</strong></td><td><code>AgriBot-001</code></td><td>Green Valley Farm</td><td>AB-X1000</td><td><div className="battery"><div className="battery-track"><div className="battery-fill" style={{ width: '85%', background: '#137333' }}></div></div><div className="pct">85%</div></div></td><td><span className="pill active">Active</span></td><td><div className="action-icons"><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
            <tr><td><strong>AgriBot Beta</strong></td><td><code>AgriBot-002</code></td><td>Sunrise Orchards</td><td>AB-X1000</td><td><div className="battery"><div className="battery-track"><div className="battery-fill" style={{ width: '62%', background: '#137333' }}></div></div><div className="pct">62%</div></div></td><td><span className="pill active">Active</span></td><td><div className="action-icons"><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
            <tr><td><strong>AgriBot Gamma</strong></td><td><code>AgriBot-003</code></td><td>Golden Harvest</td><td>AB-X2000</td><td><div className="battery"><div className="battery-track"><div className="battery-fill" style={{ width: '45%', background: '#B06000' }}></div></div><div className="pct">45%</div></div></td><td><span className="pill idle">Idle</span></td><td><div className="action-icons"><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
            <tr><td><strong>AgriBot Delta</strong></td><td><code>AgriBot-004</code></td><td>Maple Ridge Farm</td><td>AB-X1000</td><td><div className="battery"><div className="battery-track"><div className="battery-fill" style={{ width: '12%', background: '#C5221F' }}></div></div><div className="pct">12%</div></div></td><td><span className="pill offline">Offline</span></td><td><div className="action-icons"><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
