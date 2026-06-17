import React from 'react';

export default function Farms() {
  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Farm Management</div>
          <div className="page-sub">View and manage agricultural properties</div>
        </div>
      </div>
      <div className="section-card">
        <div className="section-header" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="section-title" style={{ marginBottom: '12px' }}>All Farms (8)</div>
          <input className="form-input" placeholder="Search farms by name, owner, or location…" aria-label="Search farms" style={{ width: '100%' }} />
        </div>
        <table>
          <thead>
            <tr><th>Farm name</th><th>Owner</th><th>Crop</th><th>Soil</th><th>Location</th><th>Robot</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Green Valley Farm</strong></td><td>John Smith</td><td>Wheat</td><td>Clay</td><td>California, USA</td><td>AgriBot-001</td><td><span className="pill active">Active</span></td><td><div className="action-icons"><button className="icon-btn" title="View"><i className="ti ti-eye" aria-hidden="true"></i></button><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
            <tr><td><strong>Sunrise Orchards</strong></td><td>Sarah Johnson</td><td>Apples</td><td>Loam</td><td>Washington, USA</td><td>AgriBot-002</td><td><span className="pill active">Active</span></td><td><div className="action-icons"><button className="icon-btn" title="View"><i className="ti ti-eye" aria-hidden="true"></i></button><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
            <tr><td><strong>Golden Harvest</strong></td><td>Michael Brown</td><td>Corn</td><td>Sandy</td><td>Iowa, USA</td><td>AgriBot-003</td><td><span className="pill active">Active</span></td><td><div className="action-icons"><button className="icon-btn" title="View"><i className="ti ti-eye" aria-hidden="true"></i></button><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
            <tr><td><strong>Maple Ridge Farm</strong></td><td>John Smith</td><td>Soybeans</td><td>Loam</td><td>Illinois, USA</td><td>AgriBot-004</td><td><span className="pill active">Active</span></td><td><div className="action-icons"><button className="icon-btn" title="View"><i className="ti ti-eye" aria-hidden="true"></i></button><button className="icon-btn" title="Edit"><i className="ti ti-edit" aria-hidden="true"></i></button><button className="icon-btn del" title="Delete"><i className="ti ti-trash" aria-hidden="true"></i></button></div></td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
