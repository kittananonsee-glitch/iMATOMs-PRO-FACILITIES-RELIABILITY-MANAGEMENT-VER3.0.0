
import React, { useState, useEffect, useRef } from 'react';
import { WorkOrder, MasterData } from '../types';

interface WorkOrderManagerProps {
  onBack: () => void;
}

const WorkOrderManager: React.FC<WorkOrderManagerProps> = ({ onBack }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [orders, setOrders] = useState<WorkOrder[]>([
    {
      work_request_no: 'RM24-00125', date: '2024-05-20', notification_time: '10:30',
      building_name: 'ViMUT', main_floor: '2', main_area: 'OPD Floor 2', main_department: 'OPD',
      type_area: 'Clinic-OPD', room_no: '201', job_detail: 'Air Condition Leakage',
      code_emergency: 'No Code', period_time: 'Normal time', priority_work: 'High<5min',
      staff_notification_name: 'Admin', phone_number: '088-xxx-xxxx', work_progress: 'Pending'
    },
    {
      work_request_no: 'RM24-00124', date: '2024-05-19', notification_time: '14:20',
      building_name: 'ViMUT', main_floor: '5', main_area: 'Ward 501', main_department: 'Nursing',
      type_area: 'Clinic-IPD', room_no: '501', job_detail: 'Electric Socket Repair',
      code_emergency: 'No Code', period_time: 'Normal time', priority_work: 'Medium<15min',
      staff_notification_name: 'Staff B', phone_number: '088-xxx-xxxx', work_progress: 'On Process',
      technician_name: 'นายประเสริฐ แก้วมณี'
    }
  ]);

  const [masterData] = useState<MasterData>({
    floors: ['B4', 'B3', 'B2', 'B1', '1M', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    mainAreas: ['ที่จอดรถB4', 'คลังพัสดุB3', 'OPD Floor 2', 'Ward 501', 'Common Area G'],
    typeAreas: ['Clinic-IPD', 'Clinic-OPD', 'Toilet', 'Common Area', 'Office', 'Technical Room'],
    staff: ['นายสุทธิพงศ์ ทุมภา', 'นายพีรพัฒน์ หงษ์คงคา', 'นายวิชัย สมบูรณ์', 'นายประเสริฐ แก้วมณี'],
    groups: [
      { code: 'RM', name: 'Reactive Maintenance', desc: 'งานซ่อมแซมฉุกเฉิน' },
      { code: 'BD', name: 'Breakdown', desc: 'งานเครื่องเสีย' }
    ],
    systems: [
      { code: 'AC', name: 'Air Conditioning' }, { code: 'SN', name: 'Sanitary' },
      { code: 'EL', name: 'Electrical' }, { code: 'OTH', name: 'Others' }
    ],
    emergencyCodes: [
      { code: 'No Code', desc: 'ไม่มี Emergency', color: 'green' },
      { code: 'Code_3', desc: 'เพลิงไหม้', color: 'red' }
    ],
    separateDetail: [
      { code: 'Replacement', name: 'Replacement', desc: 'เปลี่ยนอะไหล่' },
      { code: 'Adjustment', name: 'Adjustment', desc: 'ปรับแต่ง' }
    ]
  });

  const [assigningWO, setAssigningWO] = useState<WorkOrder | null>(null);
  const [completingWO, setCompletingWO] = useState<WorkOrder | null>(null);

  const chartRefs = {
    status: useRef<HTMLCanvasElement>(null),
    system: useRef<HTMLCanvasElement>(null),
    staff: useRef<HTMLCanvasElement>(null)
  };

  useEffect(() => {
    if (activePage === 'dashboard' || activePage === 'staff-util') {
      renderCharts();
    }
  }, [activePage, orders]);

  const renderCharts = () => {
    if (activePage === 'dashboard' && chartRefs.status.current && chartRefs.system.current) {
      const pending = orders.filter(o => o.work_progress === 'Pending').length;
      const process = orders.filter(o => o.work_progress === 'On Process').length;
      const complete = orders.filter(o => o.work_progress === 'Complete').length;

      // @ts-ignore
      new Chart(chartRefs.status.current, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'On Process', 'Complete'],
          datasets: [{ data: [pending, process, complete], backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'white' } } } }
      });

      // @ts-ignore
      new Chart(chartRefs.system.current, {
        type: 'bar',
        data: {
          labels: ['AC', 'SN', 'EL', 'OTH'],
          datasets: [{ label: 'Work Orders', data: [5, 3, 8, 2], backgroundColor: 'rgba(0,245,255,0.6)', borderRadius: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { color: 'white' } }, x: { ticks: { color: 'white' } } } }
      });
    }

    if (activePage === 'staff-util' && chartRefs.staff.current) {
      // @ts-ignore
      new Chart(chartRefs.staff.current, {
        type: 'bar',
        data: {
          labels: masterData.staff.map(s => s.split(' ')[0]),
          datasets: [{ label: 'Jobs Completed', data: [5, 8, 3, 12], backgroundColor: 'rgba(168,85,247,0.6)', borderRadius: 8 }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { color: 'white' } }, x: { ticks: { color: 'white' } } } }
      });
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newWO: WorkOrder = {
      work_request_no: `RM24-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`,
      date: formData.get('date') as string,
      notification_time: formData.get('time') as string,
      building_name: formData.get('building') as string,
      main_floor: formData.get('floor') as string,
      main_area: formData.get('area') as string,
      main_department: formData.get('department') as string,
      type_area: formData.get('type_area') as string,
      room_no: formData.get('room') as string,
      job_detail: formData.get('job_detail') as string,
      code_emergency: formData.get('emergency') as string,
      period_time: formData.get('period') as string,
      priority_work: formData.get('priority') as string,
      staff_notification_name: formData.get('staff_name') as string,
      phone_number: formData.get('phone') as string,
      work_progress: 'Pending'
    };
    setOrders([...orders, newWO]);
    setActivePage('dashboard');
  };

  const assignWO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningWO) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const updated = orders.map(o => o.work_request_no === assigningWO.work_request_no ? {
      ...o,
      work_progress: 'On Process' as const,
      technician_name: formData.get('technician') as string,
      helpdesk_name: formData.get('helpdesk') as string,
      technician_time: formData.get('time') as string
    } : o);
    setOrders(updated);
    setAssigningWO(null);
  };

  const completeWO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingWO) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const updated = orders.map(o => o.work_request_no === completingWO.work_request_no ? {
      ...o,
      work_progress: 'Complete' as const,
      job_detail_fixed: formData.get('detail_fixed') as string,
      customer_satisfy: formData.get('satisfy') as string,
      total_convert_time: 45 // Sample value
    } : o);
    setOrders(updated);
    setCompletingWO(null);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <SummaryCard label="Total WO" value={orders.length.toString()} color="cyan" icon="fa-list" />
              <SummaryCard label="Pending" value={orders.filter(o => o.work_progress === 'Pending').length.toString()} color="orange" icon="fa-clock" />
              <SummaryCard label="Processing" value={orders.filter(o => o.work_progress === 'On Process').length.toString()} color="blue" icon="fa-tools" />
              <SummaryCard label="Complete" value={orders.filter(o => o.work_progress === 'Complete').length.toString()} color="green" icon="fa-check-circle" />
              <SummaryCard label="Urgent" value={orders.filter(o => o.priority_work.includes('High')).length.toString()} color="red" icon="fa-fire" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="cyber-card p-6 rounded-2xl h-80">
                <h3 className="font-display text-sm uppercase mb-4 text-cyan-400">Status Overview</h3>
                <canvas ref={chartRefs.status}></canvas>
              </div>
              <div className="cyber-card p-6 rounded-2xl h-80">
                <h3 className="font-display text-sm uppercase mb-4 text-cyan-400">By System</h3>
                <canvas ref={chartRefs.system}></canvas>
              </div>
            </div>
          </div>
        );
      case 'request':
        return (
          <div className="cyber-card p-8 rounded-2xl max-w-4xl mx-auto">
            <h3 className="font-display text-xl text-orange-400 mb-6 uppercase italic">แจ้งซ่อม (User Request)</h3>
            <form onSubmit={handleCreateRequest} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormInput label="วันที่แจ้ง *" name="date" type="date" required />
                <FormInput label="เวลาแจ้ง *" name="time" type="time" required />
                <FormSelect label="อาคาร *" name="building" required options={['ViMUT', 'ViMUT Phahonyothin', 'Theptarin']} />
                <FormSelect label="ชั้น *" name="floor" required options={masterData.floors} />
                <FormSelect label="พื้นที่ *" name="area" required options={masterData.mainAreas} />
              </div>
              <div className="space-y-4">
                <FormInput label="แผนก" name="department" placeholder="Auto-filled" />
                <FormSelect label="ประเภทพื้นที่ *" name="type_area" required options={masterData.typeAreas} />
                <FormInput label="ห้อง / รายละเอียดเพิ่ม" name="room" placeholder="ระบุเลขห้อง" />
                <FormSelect label="ความสำคัญ *" name="priority" required options={['Low>15min', 'Medium<15min', 'High<5min', 'Critical']} />
                <FormInput label="ชื่อผู้แจ้ง *" name="staff_name" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] text-white/40 uppercase font-black mb-2 tracking-widest">รายละเอียดปัญหา *</label>
                <textarea name="job_detail" required className="w-full cyber-input rounded-xl p-4 h-32 resize-none" placeholder="อธิบายปัญหาที่พบ..."></textarea>
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-500 transition-all uppercase tracking-widest text-xs">ส่งใบแจ้งซ่อม</button>
                <button type="button" onClick={() => setActivePage('dashboard')} className="px-8 py-4 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">ยกเลิก</button>
              </div>
            </form>
          </div>
        );
      case 'helpdesk':
        const pending = orders.filter(o => o.work_progress === 'Pending');
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="font-display text-lg text-orange-400 uppercase italic">งานรอรับ (Pending)</h3>
               <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">{pending.length} Tasks</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pending.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-20">
                  <i className="fa-solid fa-inbox text-6xl mb-4"></i>
                  <p className="font-display uppercase tracking-widest">No pending orders</p>
                </div>
              ) : (
                pending.map(wo => (
                  <WOCard key={wo.work_request_no} wo={wo} action="Assign" onClick={() => setAssigningWO(wo)} />
                ))
              )}
            </div>
          </div>
        );
      case 'technician':
        const onProcess = orders.filter(o => o.work_progress === 'On Process');
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="font-display text-lg text-blue-400 uppercase italic">งานดำเนินการ (On Process)</h3>
               <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">{onProcess.length} Tasks</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {onProcess.map(wo => (
                <WOCard key={wo.work_request_no} wo={wo} action="Complete" onClick={() => setCompletingWO(wo)} />
              ))}
            </div>
          </div>
        );
      case 'staff-util':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Active Staff" value="4" color="cyan" />
              <StatCard label="Avg Efficiency" value="92%" color="green" />
              <StatCard label="Total Hours" value="156h" color="purple" />
              <StatCard label="KPI Target" value="90%" color="orange" />
            </div>
            <div className="cyber-card p-6 rounded-2xl h-[500px]">
               <h3 className="font-display text-sm uppercase mb-6 text-cyan-400">Staff Workload Distribution</h3>
               <canvas ref={chartRefs.staff}></canvas>
            </div>
          </div>
        );
      default:
        return (
          <div className="py-20 text-center opacity-30">
            <i className="fa-solid fa-code text-6xl mb-4"></i>
            <h3 className="font-display uppercase tracking-widest">Section under development</h3>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <nav className="w-64 border-r border-red-500/20 bg-black/40 flex flex-col p-4 shrink-0">
        <div className="mb-10 p-4">
          <h1 className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 uppercase italic">Ver35</h1>
          <p className="text-[10px] text-white/40 tracking-widest uppercase italic">Work Order Management</p>
        </div>
        <div className="flex-1 space-y-1">
          <SideNavItem icon="fa-chart-pie" label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <SideNavItem icon="fa-plus-circle" label="แจ้งซ่อม" active={activePage === 'request'} onClick={() => setActivePage('request')} />
          <SideNavItem icon="fa-headset" label="รับงาน/มอบหมาย" active={activePage === 'helpdesk'} onClick={() => setActivePage('helpdesk')} />
          <SideNavItem icon="fa-wrench" label="ปิดงาน/ส่งมอบ" active={activePage === 'technician'} onClick={() => setActivePage('technician')} />
          <SideNavItem icon="fa-columns" label="Kanban" active={activePage === 'kanban'} onClick={() => setActivePage('kanban')} />
          <SideNavItem icon="fa-user-clock" label="Staff Utilization" active={activePage === 'staff-util'} onClick={() => setActivePage('staff-util')} />
          <SideNavItem icon="fa-database" label="Master Data" active={activePage === 'database'} onClick={() => setActivePage('database')} />
        </div>
        <div className="pt-4 border-t border-white/5 mt-auto">
          <button onClick={onBack} className="flex items-center gap-3 p-3 w-full text-white/60 hover:text-white hover:bg-red-500/10 rounded-xl transition-all">
            <i className="fa-solid fa-home text-xs"></i>
            <span className="text-[10px] font-black uppercase italic tracking-widest">Main Menu</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-[#0a0e17] to-[#0f172a]">
        {renderActivePage()}
      </main>

      {/* Assignment Modal */}
      {assigningWO && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="cyber-card p-8 rounded-2xl w-full max-w-lg border-orange-500/40">
            <h3 className="font-display text-lg text-orange-400 mb-6 uppercase italic">มอบหมายงาน</h3>
            <div className="mb-6 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <p className="text-xs font-bold text-orange-400 font-mono mb-1">{assigningWO.work_request_no}</p>
              <p className="text-sm font-semibold">{assigningWO.job_detail}</p>
            </div>
            <form onSubmit={assignWO} className="space-y-4">
               <FormSelect label="ผู้รับแจ้ง (Helpdesk)" name="helpdesk" options={masterData.staff} required />
               <FormSelect label="มอบหมายช่าง" name="technician" options={masterData.staff} required />
               <FormInput label="เวลาส่งมอบ" name="time" type="time" defaultValue="10:00" required />
               <div className="flex gap-4 pt-4">
                 <button type="submit" className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg uppercase text-xs tracking-widest">ยืนยันการมอบหมาย</button>
                 <button type="button" onClick={() => setAssigningWO(null)} className="px-6 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest">ยกเลิก</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completingWO && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="cyber-card p-8 rounded-2xl w-full max-w-lg border-blue-500/40">
            <h3 className="font-display text-lg text-blue-400 mb-6 uppercase italic">ปิดงานซ่อม</h3>
            <form onSubmit={completeWO} className="space-y-4">
              <FormInput label="ผลการซ่อม/แก้ไข *" name="detail_fixed" required />
              <FormSelect label="ระดับความพึงพอใจ" name="satisfy" options={['Excellent', 'Good', 'Fair', 'Poor']} />
              <div className="flex gap-4 pt-4">
                 <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg uppercase text-xs tracking-widest">ยืนยันการปิดงาน</button>
                 <button type="button" onClick={() => setCompletingWO(null)} className="px-6 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest">ยกเลิก</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const SummaryCard: React.FC<{ label: string; value: string; color: string; icon: string }> = ({ label, value, color, icon }) => {
  const colors: any = {
    cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
    orange: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    green: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    red: 'border-red-500/30 bg-red-500/5 text-red-400'
  };
  return (
    <div className={`cyber-card p-5 rounded-2xl border ${colors[color]} hover:scale-[1.05] transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <i className={`fa-solid ${icon} opacity-60`}></i>
        <span className="text-[8px] font-black uppercase opacity-40">Live Tracking</span>
      </div>
      <p className="text-2xl font-display font-black">{value}</p>
      <p className="text-[10px] uppercase font-bold text-white/40">{label}</p>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => {
  const colors: any = {
    cyan: 'text-cyan-400 border-cyan-500/20',
    green: 'text-emerald-400 border-emerald-500/20',
    purple: 'text-purple-400 border-purple-500/20',
    orange: 'text-orange-400 border-orange-500/20'
  };
  return (
    <div className={`cyber-card p-6 rounded-2xl border ${colors[color]}`}>
      <p className="text-2xl font-display font-black mb-1">{value}</p>
      <p className="text-[10px] uppercase font-bold text-white/40">{label}</p>
    </div>
  );
};

const SideNavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-red-500/10 text-red-400 border border-red-400/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
    <i className={`fa-solid ${icon} w-5 text-center`}></i>
    <span className="text-[10px] font-black uppercase italic tracking-widest">{label}</span>
  </div>
);

const WOCard: React.FC<{ wo: WorkOrder; action: string; onClick: () => void }> = ({ wo, action, onClick }) => (
  <div className={`cyber-card p-6 rounded-2xl border-white/5 hover:border-red-500/30 transition-all hover:translate-y-[-4px] group`}>
    <div className="flex items-center justify-between mb-4">
       <span className="font-mono text-xs font-bold text-red-400">{wo.work_request_no}</span>
       <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${wo.priority_work.includes('High') ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white/60'}`}>
         {wo.priority_work.split('<')[0]}
       </span>
    </div>
    <p className="text-sm font-semibold mb-2 line-clamp-2 h-10">{wo.job_detail}</p>
    <div className="space-y-1 mb-4">
      <div className="flex items-center gap-2 text-[10px] text-white/40"><i className="fa-solid fa-building w-3"></i> {wo.building_name} ({wo.main_floor})</div>
      <div className="flex items-center gap-2 text-[10px] text-white/40"><i className="fa-solid fa-map-marker-alt w-3"></i> {wo.main_area}</div>
    </div>
    <button onClick={onClick} className="w-full py-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
      {action}
    </button>
  </div>
);

const FormInput: React.FC<any> = ({ label, ...props }) => (
  <div>
    <label className="block text-[10px] text-white/40 uppercase font-black mb-2 tracking-widest">{label}</label>
    <input className="w-full cyber-input rounded-xl p-3 text-sm" {...props} />
  </div>
);

const FormSelect: React.FC<any> = ({ label, options, ...props }) => (
  <div>
    <label className="block text-[10px] text-white/40 uppercase font-black mb-2 tracking-widest">{label}</label>
    <select className="w-full cyber-input rounded-xl p-3 text-sm appearance-none" {...props}>
      <option value="">-- เลือก --</option>
      {options.map((o: any) => (
        <option key={typeof o === 'string' ? o : o.code} value={typeof o === 'string' ? o : o.code}>
          {typeof o === 'string' ? o : o.name}
        </option>
      ))}
    </select>
  </div>
);

export default WorkOrderManager;
