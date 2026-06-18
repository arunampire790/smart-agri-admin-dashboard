import React from 'react';

export default function Analytics() {
  return (
    <>
      <div className="page-header">
        <div className="page-title">Analytics</div>
        <div className="page-sub">System-wide performance metrics</div>
      </div>
      
      <div className="analytics-metrics">
        <div className="amcard"><i className="ti ti-chart-arrows-vertical am-icon" style={{ background: '#E6F4EA', color: '#137333' }}></i><div className="am-body"><div className="am-val">86.5%</div><div className="am-label">Avg Farm Productivity</div><div className="am-change up">↑ +5.2%</div></div></div>
        <div className="amcard"><i className="ti ti-checklist am-icon" style={{ background: '#E6F4EA', color: '#137333' }}></i><div className="am-body"><div className="am-val">92.3%</div><div className="am-label">Task Completion Rate</div><div className="am-change up">↑ +3.1%</div></div></div>
        <div className="amcard"><i className="ti ti-activity am-icon" style={{ background: '#FCE8E6', color: '#C5221F' }}></i><div className="am-body"><div className="am-val">78.4%</div><div className="am-label">Robot Efficiency</div><div className="am-change down">↓ -1.8%</div></div></div>
        <div className="amcard"><i className="ti ti-plant-2 am-icon" style={{ background: '#E6F4EA', color: '#137333' }}></i><div className="am-body"><div className="am-val">24</div><div className="am-label">Crop Yield (t/ha)</div><div className="am-change up">↑ +2.1%</div></div></div>
      </div>

      <div className="donut-row">
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
          <div className="legend-item"><span className="dot dot-active"></span>Active<span className="legend-val">4</span></div>
          <div className="legend-item"><span className="dot dot-idle"></span>Idle<span className="legend-val">3</span></div>
          <div className="legend-item"><span className="dot dot-offline"></span>Offline<span className="legend-val">1</span></div>
          <div className="stacked-bar">
            <div className="stacked-bar-track">
              <div className="stacked-bar-fill fill-active" style={{ width: '50%' }}></div>
              <div className="stacked-bar-fill fill-idle" style={{ width: '37.5%' }}></div>
              <div className="stacked-bar-fill fill-offline" style={{ width: '12.5%' }}></div>
            </div>
            <div className="stacked-bar-labels"><span>Active 50%</span><span>Idle 37.5%</span><span>Offline 12.5%</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
