import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Building2,
  Clock,
  Calendar,
  CreditCard,
  Plus,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Briefcase,
  FileText,
  DollarSign,
  UserCheck,
  UserPlus,
  ListFilter,
  Search,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  Mail,
  MapPin,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HRDashboardProps {
  userEmail: string;
  onSwitchModule?: (module: string) => void;
}

interface ActivityItem {
  id: string;
  time: string;
  type: "leave" | "attendance" | "hiring" | "system" | "department" | "employee";
  user: string;
  action: string;
  details: string;
}

interface NotificationItem {
  id: string;
  type: "warning" | "info" | "action";
  title: string;
  message: string;
  time: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface EmployeeItem {
  id: string;
  name: string;
  department: string;
  role: string;
  status: "Present" | "On Leave" | "Off Duty" | "Late";
  email: string;
  shift: string;
}

interface DepartmentItem {
  id: string;
  name: string;
  head: string;
  headcount: number;
  budget: string;
  location: string;
}

export default function HRDashboard({ userEmail, onSwitchModule }: HRDashboardProps) {
  // --- STATES ---
  const [employeeCount, setEmployeeCount] = useState(4620);
  const [departmentCount, setDepartmentCount] = useState(12);
  const [attendanceCount, setAttendanceCount] = useState(4242);
  const [interviewsCount, setInterviewsCount] = useState(34);
  const [payrollCount, setPayrollCount] = useState(4620);
  
  const [activeModal, setActiveModal] = useState<
    | null
    | "employees"
    | "departments"
    | "attendance"
    | "interviews"
    | "payroll"
    | "add-employee"
    | "create-department"
    | "view-reports"
  >(null);

  const [toast, setToast] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Dynamic Lists with initial simulated values
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "ACT-001",
      time: "10 mins ago",
      type: "leave",
      user: "CRISTER ALBERCA CANITAN",
      action: "filed a Vacation Leave request",
      details: "Request for Jul 22 - Jul 24 (3 days). Paid leave."
    },
    {
      id: "ACT-002",
      time: "45 mins ago",
      type: "employee",
      user: "ALENA MENDOZA BATACA",
      action: "onboarded 5 new employees",
      details: "Assigned to telecom and support accounts."
    },
    {
      id: "ACT-003",
      time: "2 hours ago",
      type: "attendance",
      user: "ROLAND JAMES LABUS",
      action: "completed biometric sync",
      details: "WFM database synced. 98.4% data consistency achieved."
    },
    {
      id: "ACT-004",
      time: "4 hours ago",
      type: "hiring",
      user: "Sourcing AI Agent",
      action: "matched 18 candidates",
      details: "Recommended candidates for open support engineer roles."
    },
    {
      id: "ACT-005",
      time: "1 day ago",
      type: "department",
      user: "Admin System",
      action: "created department",
      details: "Strategic Client Operations department initialized successfully."
    }
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "NOT-001",
      type: "action",
      title: "Pending Leave Requests",
      message: "4 new leave submissions require HR approval and alignment with scheduling.",
      time: "Just now",
      actionLabel: "Approve Leaves"
    },
    {
      id: "NOT-002",
      type: "warning",
      title: "Attendance Sync Anomaly",
      message: "Biometric clock-in delta mismatch detected on Verizon Tech account.",
      time: "2 hours ago",
      actionLabel: "Re-sync"
    },
    {
      id: "NOT-003",
      type: "info",
      title: "Hiring Milestone Completed",
      message: "95% of target headcount for the Telecom & Tech cluster has been met.",
      time: "4 hours ago",
      actionLabel: "View Analytics"
    }
  ]);

  const [employees, setEmployees] = useState<EmployeeItem[]>([
    { id: "EMP-6496", name: "CANITAN, CRISTER ALBERCA", department: "Telecom & Tech", role: "Software Engineer", status: "Present", email: "crister.canitan@thesiblings.com", shift: "08:00 AM - 05:00 PM" },
    { id: "EMP-6099", name: "LABUS, ROLAND JAMES DIAGBEL", department: "Management", role: "WFM Lead Director", status: "Present", email: "roland.labus@thesiblings.com", shift: "09:00 AM - 06:00 PM" },
    { id: "EMP-1024", name: "BATACAN, ALENA MENDOZA", department: "Core HR", role: "Operations Director", status: "Present", email: "alena.batacan@thesiblingssolutions.com", shift: "08:00 AM - 05:00 PM" },
    { id: "EMP-4112", name: "DELOS REYES, SHIELA MAE", department: "Talent Acquisition", role: "Senior Recruiter", status: "On Leave", email: "shiela.delosreyes@thesiblings.com", shift: "09:00 AM - 06:00 PM" },
    { id: "EMP-2354", name: "SARMIENTO, MARK GREGORY", department: "Financial Services", role: "Customer Solutions Rep", status: "Off Duty", email: "mark.sarmiento@thesiblings.com", shift: "10:00 PM - 07:00 AM" },
    { id: "EMP-3889", name: "VALENCIA, JESSICA MAE", department: "Healthcare & Ins.", role: "Insurance Claims Analyst", status: "Present", email: "jessica.valencia@thesiblings.com", shift: "08:00 AM - 05:00 PM" },
    { id: "EMP-1502", name: "TORRES, RENZ CHRISTOPHER", department: "Retail & E-Commerce", role: "Support Specialist", status: "Late", email: "renz.torres@thesiblings.com", shift: "09:00 AM - 06:00 PM" },
    { id: "EMP-5001", name: "RAMIREZ, PATRICIA ANN", department: "WFM & Compliance", role: "Compliance officer", status: "Present", email: "patricia.ramirez@thesiblings.com", shift: "08:00 AM - 05:00 PM" }
  ]);

  const [departments, setDepartments] = useState<DepartmentItem[]>([
    { id: "DEP-001", name: "Telecom & Tech Support", head: "Crister Alberca Canitan", headcount: 1450, budget: "$2.4M", location: "Building 3, Floor 4" },
    { id: "DEP-002", name: "Financial Services Group", head: "Mark Gregory Sarmiento", headcount: 1120, budget: "$1.8M", location: "Building 2, Floor 2" },
    { id: "DEP-003", name: "Healthcare & Insurance", head: "Jessica Mae Valencia", headcount: 950, budget: "$1.5M", location: "Building 1, Floor 3" },
    { id: "DEP-004", name: "Retail & E-Commerce", head: "Renz Christopher Torres", headcount: 780, budget: "$1.1M", location: "Building 3, Floor 2" },
    { id: "DEP-005", name: "Talent Acquisition", head: "Shiela Mae Delos Reyes", headcount: 45, budget: "$450K", location: "Building 1, Floor 1" },
    { id: "DEP-006", name: "Workforce & Compliance", head: "Patricia Ann Ramirez", headcount: 35, budget: "$320K", location: "Building 2, Floor 5" },
    { id: "DEP-007", name: "Core Administration", head: "Alena Mendoza Batacan", headcount: 24, budget: "$500K", location: "Building 1, Floor 5" }
  ]);

  const [interviews, setInterviews] = useState([
    { id: "INT-101", candidate: "Michael Jordan", time: "09:30 AM", position: "Telecom Support Engineer", interviewer: "Shiela Delos Reyes", status: "Scheduled" },
    { id: "INT-102", candidate: "Serena Williams", time: "11:00 AM", position: "WFM Planner", interviewer: "Roland James Labus", status: "In Progress" },
    { id: "INT-103", candidate: "Lionel Messi", time: "01:30 PM", position: "Finance Solutions Expert", interviewer: "Alena Batacan", status: "Scheduled" },
    { id: "INT-104", candidate: "LeBron James", time: "03:00 PM", position: "Retail Account Supervisor", interviewer: "Renz Christopher Torres", status: "Completed" },
    { id: "INT-105", candidate: "Taylor Swift", time: "04:30 PM", position: "Talent Branding Lead", interviewer: "Shiela Delos Reyes", status: "Scheduled" }
  ]);

  // Form states
  const [newEmp, setNewEmp] = useState({
    name: "",
    department: "Telecom & Tech",
    role: "",
    email: "",
    shift: "08:00 AM - 05:00 PM",
    status: "Present" as const
  });

  const [newDept, setNewDept] = useState({
    name: "",
    head: "",
    budget: "",
    location: "",
    headcount: 0
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- ACTIONS ---
  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.role || !newEmp.email) {
      setToast("Please fill in all required fields.");
      return;
    }

    const empId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdEmployee: EmployeeItem = {
      id: empId,
      name: newEmp.name.toUpperCase(),
      department: newEmp.department,
      role: newEmp.role,
      status: newEmp.status,
      email: newEmp.email.toLowerCase(),
      shift: newEmp.shift
    };

    setEmployees(prev => [createdEmployee, ...prev]);
    setEmployeeCount(prev => prev + 1);
    if (newEmp.status === "Present") setAttendanceCount(prev => prev + 1);

    // Log Activity
    const activityId = `ACT-${Math.floor(100 + Math.random() * 900)}`;
    setActivities(prev => [
      {
        id: activityId,
        time: "Just now",
        type: "employee",
        user: "ALENA MENDOZA BATACA",
        action: `added employee ${createdEmployee.name}`,
        details: `Assigned as ${createdEmployee.role} in ${createdEmployee.department}.`
      },
      ...prev
    ]);

    setToast(`Employee ${createdEmployee.name} added successfully!`);
    setActiveModal(null);
    setNewEmp({
      name: "",
      department: "Telecom & Tech",
      role: "",
      email: "",
      shift: "08:00 AM - 05:00 PM",
      status: "Present"
    });
  };

  const handleCreateDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !newDept.head || !newDept.budget || !newDept.location) {
      setToast("Please fill in all required fields.");
      return;
    }

    const deptId = `DEP-${Math.floor(100 + Math.random() * 900)}`;
    const createdDept: DepartmentItem = {
      id: deptId,
      name: newDept.name,
      head: newDept.head,
      budget: newDept.budget.startsWith("$") ? newDept.budget : `$${newDept.budget}`,
      location: newDept.location,
      headcount: newDept.headcount || 0
    };

    setDepartments(prev => [...prev, createdDept]);
    setDepartmentCount(prev => prev + 1);

    // Log Activity
    const activityId = `ACT-${Math.floor(100 + Math.random() * 900)}`;
    setActivities(prev => [
      {
        id: activityId,
        time: "Just now",
        type: "department",
        user: "ALENA MENDOZA BATACA",
        action: `created department ${createdDept.name}`,
        details: `Led by ${createdDept.head}, budget assigned: ${createdDept.budget}.`
      },
      ...prev
    ]);

    setToast(`Department "${createdDept.name}" created successfully!`);
    setActiveModal(null);
    setNewDept({
      name: "",
      head: "",
      budget: "",
      location: "",
      headcount: 0
    });
  };

  const handleNotificationAction = (notification: NotificationItem) => {
    if (notification.id === "NOT-001") {
      // Approve leaves
      if (onSwitchModule) {
        onSwitchModule("Leaves & Time Off");
      } else {
        setToast("Navigating to Leaves & Time Off management...");
      }
    } else if (notification.id === "NOT-002") {
      // Re-sync
      setToast("Performing hot re-sync of biometric attendance databases...");
      setAttendanceCount(4245);
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      const activityId = `ACT-${Math.floor(100 + Math.random() * 900)}`;
      setActivities(prev => [
        {
          id: activityId,
          time: "Just now",
          type: "system",
          user: "Biometric DB",
          action: "Hot Sync Completed",
          details: "Recalculated clock logs for 1,250 personnel. Mismatch settled."
        },
        ...prev
      ]);
    } else {
      setToast(`Executed action: ${notification.title}`);
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setToast("Notification dismissed.");
  };

  const handleQuickAction = (action: string) => {
    if (action === "add-employee") {
      setActiveModal("add-employee");
    } else if (action === "create-department") {
      setActiveModal("create-department");
    } else if (action === "attendance") {
      if (onSwitchModule) {
        onSwitchModule("Time & Attendance");
      } else {
        setToast("Navigating to Time & Attendance tracker...");
      }
    } else if (action === "view-reports") {
      setActiveModal("view-reports");
    }
  };

  // Filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || emp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, statusFilter]);

  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  return (
    <div className="flex-1 flex flex-col space-y-6 select-none relative" id="hr-admin-dashboard-root">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 bg-[#042C51] border-l-4 border-[#FF5C28] text-white px-5 py-3 rounded-r-xl shadow-2xl z-50 flex items-center gap-3 text-xs"
          >
            <Sparkles className="w-4.5 h-4.5 text-[#FF5C28] animate-spin" />
            <span className="font-bold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. HEADER & WELCOME AREA ==================== */}
      <section className="bg-white rounded-2xl border border-[#E6ECF2] shadow-sm overflow-hidden flex flex-col">
        {/* Top Accent Gradient Bar: Deep Navy to Vivid Orange */}
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />

        <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF2FA] border border-[#D5E3F5] text-[#042C51] text-[10.5px] font-bold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C28]" />
              HR ADMIN VIEW
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#042C51] tracking-tight">HR Admin Dashboard</h1>
            <p className="text-xs text-[#667085] leading-normal">
              Welcome back, <span className="font-extrabold text-[#042C51]">BATACAN, ALENA MENDOZA</span>. You have administrative permissions.
            </p>
          </div>

          {/* Action shortcuts */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSwitchModule?.("Employee Directory")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F7F9FC] text-[#042C51] text-xs font-bold rounded-xl border border-[#BECBDA] transition-all cursor-pointer shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-[#042C51]" />
              <span>Launch Employee Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSwitchModule?.("Workforce Hiring")}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Personnel Requisition</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 2. DASHBOARD SUMMARY (METRICS CARDS) ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Employees Metric */}
        <div
          onClick={() => { setActiveModal("employees"); setSearchTerm(""); setStatusFilter("All"); }}
          className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm hover:border-[#FF5C28] cursor-pointer transition-all duration-150 relative overflow-hidden h-[115px] hover:shadow-md flex flex-col justify-between group select-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-wider">Employees</span>
            <div className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center text-[#FF5C28]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-extrabold text-[#042C51] tracking-tight">{employeeCount.toLocaleString()}</div>
            <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Total employees active</div>
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
            <ChevronRight className="w-3.5 h-3.5 text-[#FF5C28]" />
          </div>
        </div>

        {/* Departments Metric */}
        <div
          onClick={() => { setActiveModal("departments"); setSearchTerm(""); }}
          className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm hover:border-[#FF5C28] cursor-pointer transition-all duration-150 relative overflow-hidden h-[115px] hover:shadow-md flex flex-col justify-between group select-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#042C51] tracking-wider">Departments</span>
            <div className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center text-[#042C51]">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-extrabold text-[#042C51] tracking-tight">{departmentCount}</div>
            <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Active departments</div>
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
            <ChevronRight className="w-3.5 h-3.5 text-[#FF5C28]" />
          </div>
        </div>

        {/* Attendance Metric */}
        <div
          onClick={() => { setActiveModal("attendance"); setSearchTerm(""); }}
          className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm hover:border-[#FF5C28] cursor-pointer transition-all duration-150 relative overflow-hidden h-[115px] hover:shadow-md flex flex-col justify-between group select-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Attendance</span>
            <div className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-[#042C51] tracking-tight">{attendanceCount.toLocaleString()}</span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">91.8%</span>
            </div>
            <div className="text-[9px] text-emerald-600/80 font-bold mt-1 uppercase tracking-wide">Today records present</div>
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
            <ChevronRight className="w-3.5 h-3.5 text-[#FF5C28]" />
          </div>
        </div>

        {/* Interviews Metric */}
        <div
          onClick={() => setActiveModal("interviews")}
          className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm hover:border-[#FF5C28] cursor-pointer transition-all duration-150 relative overflow-hidden h-[115px] hover:shadow-md flex flex-col justify-between group select-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider">Interviews Today</span>
            <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-extrabold text-[#042C51] tracking-tight">{interviewsCount}</div>
            <div className="text-[9px] text-indigo-600/80 font-bold mt-1 uppercase tracking-wide">Scheduled interviews</div>
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
            <ChevronRight className="w-3.5 h-3.5 text-[#FF5C28]" />
          </div>
        </div>

        {/* Payroll Metric */}
        <div
          onClick={() => setActiveModal("payroll")}
          className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm hover:border-[#FF5C28] cursor-pointer transition-all duration-150 relative overflow-hidden h-[115px] hover:shadow-md flex flex-col justify-between group col-span-2 lg:col-span-1 select-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Payroll</span>
            <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-extrabold text-[#042C51] tracking-tight">{payrollCount.toLocaleString()}</div>
            <div className="text-[9px] text-amber-600/80 font-bold mt-1 uppercase tracking-wide">Payroll records total</div>
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
            <ChevronRight className="w-3.5 h-3.5 text-[#FF5C28]" />
          </div>
        </div>

      </div>

      {/* ==================== 3. MAIN DASHBOARD PANELS & 4. QUICK ACTIONS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Recent Activity & Notifications */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Recent Activity Panel */}
          <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#042C51]">Recent Activity</h3>
                <p className="text-[10px] text-[#667085]">Latest system and employee activity logs</p>
              </div>
              <button
                onClick={() => {
                  setToast("Refreshed all activity logs successfully.");
                }}
                className="px-2.5 py-1 text-[10px] font-bold text-[#042C51] bg-[#F1F5F9] rounded hover:bg-[#FFE0D5] hover:text-[#FF5C28] transition-colors border border-transparent"
              >
                Sync Activity
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {activities.map((act) => (
                <div key={act.id} className="py-3 flex items-start gap-3.5 group hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    act.type === "leave" ? "bg-amber-400" :
                    act.type === "employee" ? "bg-blue-400" :
                    act.type === "attendance" ? "bg-emerald-400" :
                    act.type === "hiring" ? "bg-indigo-400" : "bg-slate-400"
                  }`} />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs text-[#042C51] leading-relaxed">
                      <span className="font-extrabold">{act.user}</span> <span className="text-[#344054]">{act.action}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">{act.details}</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 shrink-0">{act.time}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setToast("Loading full system audit logs trail...");
                }}
                className="text-[11px] font-extrabold text-[#FF5C28] hover:text-[#042C51] flex items-center gap-1 cursor-pointer"
              >
                <span>View all activity</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black text-[#042C51]">Notifications</h3>
              <p className="text-[10px] text-[#667085]">Important updates and pending items requiring attention</p>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#042C51]">All caught up!</p>
                  <p className="text-[10px] text-[#667085] mt-0.5">No new administrative notifications</p>
                </div>
              ) : (
                notifications.map((not) => (
                  <div 
                    key={not.id} 
                    className={`p-3.5 rounded-xl border flex items-start gap-3.5 justify-between transition-all ${
                      not.type === "warning" ? "bg-amber-50/70 border-amber-200/50" :
                      not.type === "action" ? "bg-blue-50/70 border-blue-200/50" :
                      "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {not.type === "warning" ? (
                          <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                        ) : not.type === "action" ? (
                          <ShieldAlert className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                        ) : (
                          <Info className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400">{not.time}</span>
                        <h4 className="text-xs font-extrabold text-[#042C51] leading-tight">{not.title}</h4>
                        <p className="text-[10.5px] text-[#344054] leading-relaxed max-w-xl">{not.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 justify-between shrink-0 self-stretch">
                      <button 
                        onClick={() => dismissNotification(not.id)}
                        className="text-slate-400 hover:text-[#FF5C28] p-1 rounded-md transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      
                      {not.actionLabel && (
                        <button
                          onClick={() => handleNotificationAction(not)}
                          className={`px-2.5 py-1 text-[9px] font-black rounded uppercase tracking-wider transition-all cursor-pointer ${
                            not.type === "warning" ? "bg-amber-100 hover:bg-amber-200 text-amber-800" :
                            not.type === "action" ? "bg-[#FF5C28] text-white hover:bg-[#FF5C28]/90 hover:shadow" :
                            "bg-slate-200 hover:bg-slate-300 text-slate-700"
                          }`}
                        >
                          {not.actionLabel}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setToast("All notifications retrieved and synchronized.");
                  }}
                  className="text-[11px] font-extrabold text-[#FF5C28] hover:text-[#042C51] flex items-center gap-1 cursor-pointer"
                >
                  <span>View all notifications</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Quick Actions & Help Area */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black text-[#042C51]">Quick Actions</h3>
              <p className="text-[10px] text-[#667085]">Instant shortcuts for common admin tasks</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              
              {/* Add Employee */}
              <button
                onClick={() => handleQuickAction("add-employee")}
                className="w-full p-3 bg-slate-50 hover:bg-[#FFF0EB] hover:border-[#FF5C28]/50 border border-slate-200 rounded-xl flex items-center gap-3.5 text-left transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-50 group-hover:bg-[#FF5C28] text-[#FF5C28] group-hover:text-white flex items-center justify-center transition-colors">
                  <UserPlus className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#042C51] block group-hover:text-[#FF5C28] transition-colors">Add Employee</span>
                  <span className="text-[10px] text-[#667085] truncate block">Create employee profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF5C28] group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Create Department */}
              <button
                onClick={() => handleQuickAction("create-department")}
                className="w-full p-3 bg-slate-50 hover:bg-[#FFF0EB] hover:border-[#FF5C28]/50 border border-slate-200 rounded-xl flex items-center gap-3.5 text-left transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-50 group-hover:bg-[#FF5C28] text-[#FF5C28] group-hover:text-white flex items-center justify-center transition-colors">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#042C51] block group-hover:text-[#FF5C28] transition-colors">Create Department</span>
                  <span className="text-[10px] text-[#667085] truncate block">Manage departments</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF5C28] group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Attendance Tracker */}
              <button
                onClick={() => handleQuickAction("attendance")}
                className="w-full p-3 bg-slate-50 hover:bg-[#FFF0EB] hover:border-[#FF5C28]/50 border border-slate-200 rounded-xl flex items-center gap-3.5 text-left transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-50 group-hover:bg-[#FF5C28] text-[#FF5C28] group-hover:text-white flex items-center justify-center transition-colors">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#042C51] block group-hover:text-[#FF5C28] transition-colors">Attendance Dashboard</span>
                  <span className="text-[10px] text-[#667085] truncate block">Track attendance</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF5C28] group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* View Reports */}
              <button
                onClick={() => handleQuickAction("view-reports")}
                className="w-full p-3 bg-slate-50 hover:bg-[#FFF0EB] hover:border-[#FF5C28]/50 border border-slate-200 rounded-xl flex items-center gap-3.5 text-left transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-50 group-hover:bg-[#FF5C28] text-[#FF5C28] group-hover:text-white flex items-center justify-center transition-colors">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#042C51] block group-hover:text-[#FF5C28] transition-colors">View Reports</span>
                  <span className="text-[10px] text-[#667085] truncate block">Analytics and insights</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF5C28] group-hover:translate-x-0.5 transition-all" />
              </button>

            </div>
          </div>

          {/* HR Analytics Card mini visual */}
          <div className="bg-gradient-to-br from-[#042C51] to-[#031d36] text-white p-5 rounded-2xl border border-blue-400/20 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 text-slate-200 px-2 py-0.5 rounded">
                Realtime KPI
              </span>
              <Sparkles className="w-4 h-4 text-[#FF5C28]" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-300 block">Workforce Utilization</span>
              <span className="text-2xl font-black text-[#FF5C28] tracking-tight">95.4%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF5C28] rounded-full" style={{ width: "95.4%" }} />
            </div>
            <p className="text-[10px] text-slate-300/80 leading-relaxed">
              Active manpower allocation aligned with operational goals. Absenteeism buffer is stable at <span className="text-[#FF5C28] font-bold">-4.7%</span>.
            </p>
          </div>

        </div>

      </div>

      {/* ==================== MODALS IN CONTEXT ==================== */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-[#042C51]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              
              {/* Modal Header */}
              <div className="p-4 bg-[#042C51] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#FF5C28] rounded-lg">
                    {activeModal === "employees" || activeModal === "add-employee" ? <Users className="w-4.5 h-4.5 text-white" /> :
                     activeModal === "departments" || activeModal === "create-department" ? <Building2 className="w-4.5 h-4.5 text-white" /> :
                     activeModal === "attendance" ? <Clock className="w-4.5 h-4.5 text-white" /> :
                     activeModal === "interviews" ? <Calendar className="w-4.5 h-4.5 text-white" /> :
                     activeModal === "payroll" ? <CreditCard className="w-4.5 h-4.5 text-white" /> :
                     <FileText className="w-4.5 h-4.5 text-white" />}
                  </span>
                  <div>
                    <h2 className="text-sm font-black capitalize">
                      {activeModal === "employees" ? "Employee Roster Ledger" :
                       activeModal === "departments" ? "Active Departments Portfolio" :
                       activeModal === "attendance" ? "Attendance Logs Tracker" :
                       activeModal === "interviews" ? "Interviews Schedule Planner" :
                       activeModal === "payroll" ? "Payroll Administration Console" :
                       activeModal === "add-employee" ? "Add Employee Record Form" :
                       activeModal === "create-department" ? "Create New Department Structure" :
                       "HR Intelligence & KPI Report"}
                    </h2>
                    <p className="text-[10px] text-slate-300">
                      {activeModal === "employees" ? "Interactive directory log with real-time status" :
                       activeModal === "departments" ? "Review departments and budget limits" :
                       activeModal === "attendance" ? "Analyze today's clock-in metrics" :
                       activeModal === "interviews" ? "Pending applicant interviews" :
                       activeModal === "payroll" ? "Financial disbursement verification details" :
                       activeModal === "add-employee" ? "Register a new profile in the database" :
                       activeModal === "create-department" ? "Deploy a new departmental unit" :
                       "Visual representation of workforce parameters"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setActiveModal(null); setSearchTerm(""); }}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 text-[#101828]">
                
                {/* ---------------- EMPLOYEES ROSTER LIST ---------------- */}
                {activeModal === "employees" && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search employees by name, role or ID..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-slate-100 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Present">Present</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Off Duty">Off Duty</option>
                        <option value="Late">Late</option>
                      </select>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                            <th className="p-3">ID</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Department</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Shift</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredEmployees.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">
                                No employees match this search criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredEmployees.map(emp => (
                              <tr key={emp.id} className="hover:bg-slate-50/50">
                                <td className="p-3 font-mono font-bold text-slate-500">{emp.id}</td>
                                <td className="p-3 font-bold text-[#042C51]">{emp.name}</td>
                                <td className="p-3">{emp.department}</td>
                                <td className="p-3 text-slate-600">{emp.role}</td>
                                <td className="p-3 text-slate-500 font-medium">{emp.shift}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    emp.status === "Present" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                    emp.status === "On Leave" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                    emp.status === "Late" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                    "bg-slate-50 text-slate-600 border border-slate-200"
                                  }`}>
                                    {emp.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ---------------- DEPARTMENTS LIST ---------------- */}
                {activeModal === "departments" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search departments or managers..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#042C51]"
                        />
                      </div>
                      {onSwitchModule && (
                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                          <button
                            onClick={() => {
                              setActiveModal(null);
                              onSwitchModule("Departments");
                            }}
                            className="bg-[#042C51] text-white hover:bg-[#031e38] text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
                          >
                            <Building2 className="w-3.5 h-3.5 text-[#FF5C28]" />
                            <span>Open Full Departments Directory</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveModal(null);
                              onSwitchModule("Office Locations");
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-[#042C51] text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#FF5C28]" />
                            <span>Office Locations</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                            <th className="p-3">ID</th>
                            <th className="p-3">Department Unit</th>
                            <th className="p-3">Lead Manager</th>
                            <th className="p-3">Total Staff</th>
                            <th className="p-3">Annual Budget</th>
                            <th className="p-3">Location Floor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDepartments.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">
                                No departments match this search criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredDepartments.map(dept => (
                              <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="p-3 font-mono font-black text-slate-400">{dept.id}</td>
                                <td className="p-3">
                                  <div className="font-extrabold text-[#042C51]">{dept.name}</div>
                                  <span className="text-[10px] text-slate-400 font-medium">Operational Unit</span>
                                </td>
                                <td className="p-3">
                                  <div className="font-bold text-slate-800">{dept.head}</div>
                                  <span className="text-[10px] text-slate-400">Department Lead</span>
                                </td>
                                <td className="p-3 font-bold text-[#042C51]">
                                  {dept.headcount.toLocaleString()} Staff
                                </td>
                                <td className="p-3 text-emerald-700 font-black">{dept.budget}</td>
                                <td className="p-3 text-slate-600 font-medium">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-[#FF5C28] shrink-0" />
                                    <span>{dept.location}</span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ---------------- ATTENDANCE ANALYTICS LOGS ---------------- */}
                {activeModal === "attendance" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <span className="text-[10px] uppercase font-bold text-emerald-600">Present</span>
                        <p className="text-xl font-black text-emerald-700 mt-1">{attendanceCount}</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <span className="text-[10px] uppercase font-bold text-amber-600">On Leave</span>
                        <p className="text-xl font-black text-amber-700 mt-1">215</p>
                      </div>
                      <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                        <span className="text-[10px] uppercase font-bold text-rose-600">Late</span>
                        <p className="text-xl font-black text-rose-700 mt-1">68</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Absent</span>
                        <p className="text-xl font-black text-slate-700 mt-1">95</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-[#042C51] flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#FF5C28]" />
                        <span>Biometric Integration Stats</span>
                      </h4>
                      <p className="text-xs text-[#667085] leading-relaxed">
                        Biometric scanner sync is <span className="text-emerald-600 font-bold">ACTIVE</span> and processing records continuously.
                        Last synchronization completed: <span className="font-bold text-[#042C51]">Today, 05:45 AM</span>.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Shift Coverage Details</span>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Morning Shift Present:</span>
                          <span className="text-[#042C51]">2,350 Employees</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Afternoon Shift Present:</span>
                          <span className="text-[#042C51]">1,100 Employees</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Night/Graveyard Shift Present:</span>
                          <span className="text-[#042C51]">792 Employees</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Standby Coverage Reserves:</span>
                          <span className="text-[#042C51]">120 Employees</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- INTERVIEWS SCHEDULER ---------------- */}
                {activeModal === "interviews" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-indigo-50 border border-indigo-200 p-3 rounded-xl">
                      <div className="flex gap-2">
                        <Calendar className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-900 leading-normal">
                          Scheduled interviews with candidates synced with the <span className="font-bold">Workforce Hiring Pipeline</span>.
                        </p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                            <th className="p-3">Time</th>
                            <th className="p-3">Candidate</th>
                            <th className="p-3">Position</th>
                            <th className="p-3">Interviewer</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {interviews.map((int) => (
                            <tr key={int.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-indigo-600">{int.time}</td>
                              <td className="p-3 font-bold text-[#042C51]">{int.candidate}</td>
                              <td className="p-3 text-slate-700">{int.position}</td>
                              <td className="p-3 text-slate-500 font-medium">{int.interviewer}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  int.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                  int.status === "In Progress" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                  "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                }`}>
                                  {int.status}
                                </span>
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => {
                                    setInterviews(prev => prev.map(i => i.id === int.id ? { ...i, status: "Completed" } : i));
                                    setToast(`Marked ${int.candidate} interview as completed.`);
                                  }}
                                  disabled={int.status === "Completed"}
                                  className="text-[10px] font-bold text-[#FF5C28] hover:text-[#042C51] disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                                >
                                  Complete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ---------------- PAYROLL ADMINISTRATION ---------------- */}
                {activeModal === "payroll" && (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 block">Monthly Disbursement</span>
                        <span className="text-2xl font-black text-[#042C51]">$14,250,450.00</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block font-medium">Status</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded uppercase tracking-wider">
                          Funded & Cleared
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <h4 className="font-extrabold text-[#042C51]">Disbursement Details per Cluster</h4>
                      
                      <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50 font-semibold">
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">Telecom & Tech Cluster (1,450 staff):</span>
                          <span className="text-[#042C51] font-bold">$4,850,000</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">Financial Services Cluster (1,120 staff):</span>
                          <span className="text-[#042C51] font-bold">$3,950,000</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">Healthcare & Insurance Cluster (950 staff):</span>
                          <span className="text-[#042C51] font-bold">$3,120,000</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500">Retail & E-Commerce Cluster (780 staff):</span>
                          <span className="text-[#042C51] font-bold">$2,330,450</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                      <div className="flex gap-2">
                        <Info className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                        <p className="text-[10.5px] text-blue-900 leading-normal font-semibold">
                          Next scheduled run: <span className="font-black text-blue-950">July 31, 2026</span>. Bank channels are linked and validated.
                        </p>
                      </div>
                      <button
                        onClick={() => setToast("Payroll ledger exported as CSV!")}
                        className="px-2.5 py-1 bg-[#042C51] hover:bg-[#FF5C28] text-white text-[10px] font-black uppercase tracking-wider rounded transition-colors"
                      >
                        Export
                      </button>
                    </div>
                  </div>
                )}

                {/* ---------------- ADD EMPLOYEE FORM ---------------- */}
                {activeModal === "add-employee" && (
                  <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. DOE, JOHN SMITH"
                          value={newEmp.name}
                          onChange={e => setNewEmp(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#FF5C28]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="john.doe@thesiblings.com"
                          value={newEmp.email}
                          onChange={e => setNewEmp(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#FF5C28]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Department/Cluster *</label>
                        <select
                          value={newEmp.department}
                          onChange={e => setNewEmp(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold focus:outline-none focus:border-[#FF5C28]"
                        >
                          <option value="Telecom & Tech">Telecom & Tech</option>
                          <option value="Financial Services">Financial Services</option>
                          <option value="Healthcare & Ins.">Healthcare & Ins.</option>
                          <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                          <option value="Management">Management</option>
                          <option value="Core HR">Core HR</option>
                          <option value="Talent Acquisition">Talent Acquisition</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Role / Designation *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Support Specialist"
                          value={newEmp.role}
                          onChange={e => setNewEmp(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#FF5C28]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Assigned Work Shift *</label>
                        <select
                          value={newEmp.shift}
                          onChange={e => setNewEmp(prev => ({ ...prev, shift: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold focus:outline-none focus:border-[#FF5C28]"
                        >
                          <option value="08:00 AM - 05:00 PM">08:00 AM - 05:00 PM (Morning)</option>
                          <option value="09:00 AM - 06:00 PM">09:00 AM - 06:00 PM (Regular)</option>
                          <option value="01:00 PM - 10:00 PM">01:00 PM - 10:00 PM (Mid Shift)</option>
                          <option value="10:00 PM - 07:00 AM">10:00 PM - 07:00 AM (Graveyard)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Status *</label>
                        <select
                          value={newEmp.status}
                          onChange={e => setNewEmp(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold focus:outline-none focus:border-[#FF5C28]"
                        >
                          <option value="Present">Active & Present Today</option>
                          <option value="On Leave">Active & On Leave</option>
                          <option value="Off Duty">Active & Off Duty</option>
                          <option value="Late">Active & Late Today</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold bg-[#FF5C28] hover:bg-[#FF5C28]/90 text-white rounded-lg hover:shadow-lg hover:shadow-[#ff5c28]/15 transition-all"
                      >
                        Create Employee Record
                      </button>
                    </div>
                  </form>
                )}

                {/* ---------------- CREATE DEPARTMENT FORM ---------------- */}
                {activeModal === "create-department" && (
                  <form onSubmit={handleCreateDepartmentSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Department Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Quality Assurance Unit"
                          value={newDept.name}
                          onChange={e => setNewDept(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#FF5C28]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Lead Manager *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ALENA BATACAN"
                          value={newDept.head}
                          onChange={e => setNewDept(prev => ({ ...prev, head: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#FF5C28]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Annual Operating Budget ($) *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 450000"
                          value={newDept.budget}
                          onChange={e => setNewDept(prev => ({ ...prev, budget: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#FF5C28]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Office Location Floor *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Building 2, Floor 3"
                          value={newDept.location}
                          onChange={e => setNewDept(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#FF5C28]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Initial Staff Headcount</label>
                      <input
                        type="number"
                        placeholder="e.g. 15"
                        value={newDept.headcount || ""}
                        onChange={e => setNewDept(prev => ({ ...prev, headcount: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#FF5C28]"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold bg-[#FF5C28] hover:bg-[#FF5C28]/90 text-white rounded-lg hover:shadow-lg hover:shadow-[#ff5c28]/15 transition-all"
                      >
                        DeploY Department Unit
                      </button>
                    </div>
                  </form>
                )}

                {/* ---------------- REPORTS & STATISTICS PANEL ---------------- */}
                {activeModal === "view-reports" ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Department distribution */}
                      <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-[10px] uppercase font-black tracking-wide text-slate-400">Headcount Share per Cluster</span>
                        <div className="space-y-2 text-xs font-semibold text-[#042C51]">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Telecom & Tech Support</span>
                              <span>31.3%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-full" style={{ width: "31.3%" }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Financial Services Group</span>
                              <span>24.2%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: "24.2%" }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Healthcare & Insurance</span>
                              <span>20.5%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF5C28] rounded-full" style={{ width: "20.5%" }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Retail & E-Commerce</span>
                              <span>16.8%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: "16.8%" }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recruitment Yield Funnel */}
                      <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-[10px] uppercase font-black tracking-wide text-slate-400">Yield Conversion Stats</span>
                        <div className="space-y-2 text-xs font-semibold text-[#042C51]">
                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-500">Accepted Job Offers:</span>
                            <span className="font-extrabold text-[#042C51]">420 Candidates</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-500">NHO Conversion Rate:</span>
                            <span className="font-extrabold text-[#FF5C28]">94.0%</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-500">FST Graduation Yield:</span>
                            <span className="font-extrabold text-[#042C51]">83.3%</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-slate-500">Graveyard Attrition Factor:</span>
                            <span className="font-extrabold text-rose-600">Low (3.2%)</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <div className="flex gap-2 text-xs font-semibold text-indigo-900 leading-relaxed">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
                        <p>
                          Our machine learning forecasting model indicates stable headcount buffers throughout Q3 2026. Weekly hiring plans should focus on ramping telecom support roles to offset seasonal demand.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
