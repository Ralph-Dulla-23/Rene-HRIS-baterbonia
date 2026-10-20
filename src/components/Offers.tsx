import React, { useState, useMemo, useEffect } from "react";
import {
  CheckSquare,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  Check,
  X,
  FileText,
  DollarSign,
  Briefcase,
  Users,
  Percent,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Mail,
  Download,
  CheckCircle,
  AlertTriangle,
  User,
  ChevronRight,
  Info,
  Calendar,
  Phone,
  Printer,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock3,
  Building2,
  Layers,
  Send,
  ThumbsUp,
  ThumbsDown,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Local Storage Keys for Pipeline Synchronization
export const PIPELINE_CANDIDATES_STORAGE_KEY = "pipeline_candidates_data";
export const PIPELINE_SYNC_EVENTS_KEY = "pipeline_sync_events";
export const OFFERS_STORAGE_KEY = "offers_management_data";

interface OffersProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}

export interface ApproverVote {
  id: string;
  name: string;
  role: "Attorney / Legal Approver" | "TA Manager" | "Finance Approver" | "Operations Director" | "HR Lead" | string;
  email: string;
  status: "Approved" | "Rejected" | "Pending";
  votedAt?: string;
  notes?: string;
}

export interface OfferRecord {
  id: string;
  candidateId: string;
  requisitionId: string;
  name: string;
  email: string;
  phone: string;
  appliedPosition: string;
  finalAccount: string;
  department: string;
  basicSalary: number;
  allowance: number;
  benefits: string[];
  status: "For Review" | "Approved" | "Contract Sent" | "Accepted" | "Declined";
  approvalStatus: "For Review" | "Approved" | "Rejected";
  approvers: ApproverVote[];
  owner: string;
  dateCreated: string;
  declineReason?: string;
  declineNotes?: string;
  approvedBy?: string;
  dateResponded?: string;
  contractDraftedBy?: string;
}

const DEFAULT_APPROVERS_TEMPLATE: ApproverVote[] = [
  {
    id: "APP-001",
    name: "Atty. Patricia Ramos",
    role: "Attorney / Legal Approver",
    email: "patricia.ramos@thesiblingssolutions.com",
    status: "Pending"
  },
  {
    id: "APP-002",
    name: "Alena Batacan",
    role: "TA Manager (HR)",
    email: "alena.batacan@thesiblingssolutions.com",
    status: "Approved",
    votedAt: "Package Prepared"
  },
  {
    id: "APP-003",
    name: "Marco Valenzuela",
    role: "Finance Approver",
    email: "marco.v@thesiblingssolutions.com",
    status: "Approved",
    votedAt: "Budget Cleared"
  }
];

export function calculateConsensusStatus(approvers: ApproverVote[]): "For Review" | "Approved" | "Rejected" {
  if (!approvers || approvers.length === 0) return "Approved";
  if (approvers.some(a => a.status === "Rejected")) return "Rejected";
  if (approvers.every(a => a.status === "Approved")) return "Approved";
  return "For Review";
}

const INITIAL_OFFERS: OfferRecord[] = [
  {
    id: "OFF-2026-001",
    candidateId: "CAN-8791",
    requisitionId: "PR-2026-004",
    name: "Theresa Mae Santos",
    email: "theresa.mae@outlook.com",
    phone: "+63 917 554 1234",
    appliedPosition: "Healthcare Support Specialist",
    finalAccount: "Elevance Health",
    department: "Healthcare Operations",
    basicSalary: 26500,
    allowance: 3500,
    benefits: ["HMO Day 1 + 1 Dependent", "15% Night Differential", "Performance Bonus up to 10%"],
    status: "For Review",
    approvalStatus: "For Review",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-16 10:15 AM",
        notes: "Salary package aligns with client budget matrix."
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Pending"
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Pending"
      }
    ],
    owner: "Alena Batacan",
    dateCreated: "2026-07-16",
    contractDraftedBy: "Alena Batacan"
  },
  {
    id: "OFF-2026-002",
    candidateId: "CAN-5421",
    requisitionId: "PR-2026-002",
    name: "Kenji Sato",
    email: "kenji.sato@gmail.com",
    phone: "+63 908 443 8910",
    appliedPosition: "Customer Service Representative",
    finalAccount: "Chevron Support",
    department: "Customer Operations",
    basicSalary: 21000,
    allowance: 2500,
    benefits: ["HMO from Day 90", "Rice Subsidy Php 1,500/mo", "Transportation Allowance"],
    status: "Approved",
    approvalStatus: "Approved",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-15 09:30 AM",
        notes: "Qualified candidate, recommended for hire."
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-15 11:45 AM",
        notes: "Approved under standard CSR budget."
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-15 02:00 PM",
        notes: "Campaign headcount allocation confirmed."
      }
    ],
    owner: "Juan dela Cruz",
    dateCreated: "2026-07-15",
    contractDraftedBy: "Juan dela Cruz",
    approvedBy: "Alena Batacan, Marco Valenzuela, Sofia Rodriguez"
  },
  {
    id: "OFF-2026-003",
    candidateId: "CAN-1192",
    requisitionId: "PR-2026-008",
    name: "Sarah Lopez",
    email: "sarah_lopez2026@yahoo.com",
    phone: "+63 922 887 6533",
    appliedPosition: "Technical Support Associate",
    finalAccount: "Comcast Technical",
    department: "Technical Services",
    basicSalary: 24500,
    allowance: 3000,
    benefits: ["HMO Day 1", "Skill-based Allowance Php 2,000", "Internet Allowance Php 1,000/mo"],
    status: "Contract Sent",
    approvalStatus: "Approved",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-14 08:30 AM",
        notes: "Tier 2 candidate verified."
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-14 10:20 AM",
        notes: "Approved."
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-14 01:10 PM",
        notes: "Ready for contract dispatch."
      }
    ],
    owner: "Maria Santos",
    dateCreated: "2026-07-14",
    contractDraftedBy: "Maria Santos",
    approvedBy: "Consensus Approved"
  },
  {
    id: "OFF-2026-004",
    candidateId: "CAN-9812",
    requisitionId: "PR-2026-001",
    name: "John Raymond Doe",
    email: "jr.doe@gmail.com",
    phone: "+63 915 221 4590",
    appliedPosition: "Customer Service Representative",
    finalAccount: "Citi Global",
    department: "Financial Accounts",
    basicSalary: 22000,
    allowance: 2500,
    benefits: ["HMO Day 1", "Government Mandated Benefits", "Shuttle Service"],
    status: "Accepted",
    approvalStatus: "Approved",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-10 11:00 AM",
        notes: "Passed client interview."
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-10 02:30 PM",
        notes: "Approved."
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-10 04:15 PM",
        notes: "Contract signed by candidate."
      }
    ],
    owner: "Alena Batacan",
    dateCreated: "2026-07-10",
    dateResponded: "2026-07-12",
    contractDraftedBy: "Alena Batacan",
    approvedBy: "Consensus Approved"
  },
  {
    id: "OFF-2026-005",
    candidateId: "CAN-3041",
    requisitionId: "PR-2026-005",
    name: "Mary Cruz Alcantara",
    email: "mary_cruz99@outlook.ph",
    phone: "+63 918 332 7711",
    appliedPosition: "Customer Service Representative",
    finalAccount: "Capital One Help",
    department: "Customer Care",
    basicSalary: 23000,
    allowance: 2500,
    benefits: ["HMO Day 30", "Attendance Bonus Php 1,500/mo"],
    status: "Declined",
    approvalStatus: "Approved",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-08 09:00 AM"
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-08 10:15 AM"
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-08 01:00 PM"
      }
    ],
    owner: "Maria Santos",
    dateCreated: "2026-07-08",
    dateResponded: "2026-07-11",
    declineReason: "Better compensation package elsewhere",
    declineNotes: "Offered 28k basic with full remote option by a direct client.",
    contractDraftedBy: "Maria Santos",
    approvedBy: "Consensus Approved"
  },
  {
    id: "OFF-2026-006",
    candidateId: "CAN-2287",
    requisitionId: "PR-2026-009",
    name: "Daniel Padilla Flores",
    email: "daniel_flores@live.com",
    phone: "+63 920 448 9912",
    appliedPosition: "Healthcare Support Specialist",
    finalAccount: "Elevance Health",
    department: "Healthcare Operations",
    basicSalary: 28000,
    allowance: 4000,
    benefits: ["HMO Day 1 + 2 Dependents", "15% Night Differential", "Retention Bonus Php 15,000"],
    status: "Accepted",
    approvalStatus: "Approved",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-05 10:00 AM"
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-05 01:30 PM"
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-05 03:00 PM"
      }
    ],
    owner: "Juan dela Cruz",
    dateCreated: "2026-07-05",
    dateResponded: "2026-07-08",
    contractDraftedBy: "Juan dela Cruz",
    approvedBy: "Consensus Approved"
  },
  {
    id: "OFF-2026-007",
    candidateId: "CAN-4859",
    requisitionId: "PR-2026-003",
    name: "Fatima Al-Mansoor",
    email: "fatima.almansoor@gmail.com",
    phone: "+63 945 112 0049",
    appliedPosition: "Technical Support Associate",
    finalAccount: "RingCentral Team",
    department: "Technical Services",
    basicSalary: 25000,
    allowance: 3000,
    benefits: ["HMO Day 1", "Equipment Provided for WFH", "Gym Membership Subsidy"],
    status: "Declined",
    approvalStatus: "Approved",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-03 09:15 AM"
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-03 11:00 AM"
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-03 02:45 PM"
      }
    ],
    owner: "Alena Batacan",
    dateCreated: "2026-07-03",
    dateResponded: "2026-07-05",
    declineReason: "Commute distance is too far",
    declineNotes: "Prefers virtual/work-from-home because commute from Rizal takes 3 hours each way.",
    contractDraftedBy: "Alena Batacan",
    approvedBy: "Consensus Approved"
  },
  {
    id: "OFF-2026-008",
    candidateId: "CAN-6721",
    requisitionId: "PR-2026-010",
    name: "Samantha Reyes",
    email: "samantha.reyes@gmail.com",
    phone: "+63 917 889 2031",
    appliedPosition: "Team Leader - Customer Experience",
    finalAccount: "Amazon Retail",
    department: "Operations Leadership",
    basicSalary: 38000,
    allowance: 5000,
    benefits: ["HMO Day 1 + 2 Dependents", "Leadership Allowance Php 3,000/mo", "Annual Performance Bonus"],
    status: "For Review",
    approvalStatus: "For Review",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-21 09:30 AM",
        notes: "Candidate has 4 years BPO TL experience and excellent KPI record."
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-21 11:15 AM",
        notes: "Approved within salary cap for TL band."
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Pending"
      }
    ],
    owner: "Alena Batacan",
    dateCreated: "2026-07-21",
    contractDraftedBy: "Alena Batacan"
  },
  {
    id: "OFF-2026-009",
    candidateId: "CAN-9014",
    requisitionId: "PR-2026-012",
    name: "Paolo Gabriel Mendoza",
    email: "paolo.mendoza@yahoo.com",
    phone: "+63 919 451 0982",
    appliedPosition: "Quality Assurance Specialist",
    finalAccount: "Citi Global",
    department: "Quality & Compliance",
    basicSalary: 29000,
    allowance: 3500,
    benefits: ["HMO Day 1", "QA Certification Subsidy", "10% Night Shift Differential"],
    status: "Approved",
    approvalStatus: "Approved",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-20 08:45 AM",
        notes: "Passed technical QA exam with 96% score."
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-20 10:00 AM",
        notes: "Finance approval granted."
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-20 01:20 PM",
        notes: "Approved. Ready for contract dispatch."
      }
    ],
    owner: "Juan dela Cruz",
    dateCreated: "2026-07-20",
    contractDraftedBy: "Juan dela Cruz",
    approvedBy: "Alena Batacan, Marco Valenzuela, Sofia Rodriguez"
  },
  {
    id: "OFF-2026-010",
    candidateId: "CAN-4108",
    requisitionId: "PR-2026-015",
    name: "Bea Beatrice Soriano",
    email: "bea.soriano@outlook.com",
    phone: "+63 928 331 4452",
    appliedPosition: "Workforce Analyst",
    finalAccount: "Elevance Health",
    department: "Workforce Management",
    basicSalary: 32000,
    allowance: 4000,
    benefits: ["HMO Day 1 + 1 Dependent", "Flexible Working Hours", "Erlang C Certification Allowance"],
    status: "Contract Sent",
    approvalStatus: "Approved",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-19 10:30 AM"
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-19 01:00 PM"
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-19 03:45 PM"
      }
    ],
    owner: "Maria Santos",
    dateCreated: "2026-07-19",
    contractDraftedBy: "Maria Santos",
    approvedBy: "Consensus Approved"
  },
  {
    id: "OFF-2026-011",
    candidateId: "CAN-3319",
    requisitionId: "PR-2026-018",
    name: "Gabriel Vance",
    email: "gabriel.vance@gmail.com",
    phone: "+63 915 678 1234",
    appliedPosition: "Senior Software Engineer",
    finalAccount: "Internal Tech & Innovation",
    department: "Information Technology",
    basicSalary: 75000,
    allowance: 8000,
    benefits: ["HMO Day 1 + 3 Dependents", "Equipment Allowance Php 25,000", "Stock Options Eligibility"],
    status: "Accepted",
    approvalStatus: "Approved",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-17 09:00 AM"
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-17 11:30 AM"
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-17 02:15 PM"
      }
    ],
    owner: "Alena Batacan",
    dateCreated: "2026-07-17",
    dateResponded: "2026-07-19",
    contractDraftedBy: "Alena Batacan",
    approvedBy: "Consensus Approved"
  },
  {
    id: "OFF-2026-012",
    candidateId: "CAN-8120",
    requisitionId: "PR-2026-021",
    name: "Erika Jean Castillo",
    email: "erika.castillo@live.com",
    phone: "+63 906 112 5589",
    appliedPosition: "Human Resources Generalist",
    finalAccount: "Corporate Shared Services",
    department: "Human Capital & Culture",
    basicSalary: 30000,
    allowance: 3500,
    benefits: ["HMO Day 1", "Professional Certification Subsidy", "Hybrid Work Setup"],
    status: "Declined",
    approvalStatus: "Approved",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-12 10:00 AM"
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-12 01:15 PM"
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-12 04:00 PM"
      }
    ],
    owner: "Juan dela Cruz",
    dateCreated: "2026-07-12",
    dateResponded: "2026-07-15",
    declineReason: "Accepted internal promotion at current company",
    declineNotes: "Current employer matched offer with counter-promotion to HR Lead position.",
    contractDraftedBy: "Juan dela Cruz",
    approvedBy: "Consensus Approved"
  },
  {
    id: "OFF-2026-013",
    candidateId: "CAN-1593",
    requisitionId: "PR-2026-022",
    name: "Christian David Tan",
    email: "christian.tan@gmail.com",
    phone: "+63 917 223 9981",
    appliedPosition: "Customer Service Representative",
    finalAccount: "Chevron Support",
    department: "Customer Operations",
    basicSalary: 22500,
    allowance: 2500,
    benefits: ["HMO Day 90", "Free Meals on Shift", "Night Shift Differential"],
    status: "For Review",
    approvalStatus: "Rejected",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-22 09:00 AM",
        notes: "Passed interview rounds with satisfactory scores."
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Rejected",
        votedAt: "2026-07-22 11:30 AM",
        notes: "Proposed basic salary exceeds standard CSR band for entry-level tier. Please revise."
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Pending"
      }
    ],
    owner: "Maria Santos",
    dateCreated: "2026-07-22",
    contractDraftedBy: "Maria Santos"
  },
  {
    id: "OFF-2026-014",
    candidateId: "CAN-7301",
    requisitionId: "PR-2026-025",
    name: "Trisha Marie Dizon",
    email: "trisha.dizon@outlook.com",
    phone: "+63 908 554 1120",
    appliedPosition: "Financial Services Specialist",
    finalAccount: "Citi Global",
    department: "Financial Accounts",
    basicSalary: 34000,
    allowance: 4500,
    benefits: ["HMO Day 1 + 1 Dependent", "Banking Allowance Php 2,000/mo", "Quarterly Incentive Plan"],
    status: "Contract Sent",
    approvalStatus: "Approved",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-18 10:15 AM"
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-18 01:45 PM"
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Approved",
        votedAt: "2026-07-18 04:30 PM"
      }
    ],
    owner: "Alena Batacan",
    dateCreated: "2026-07-18",
    contractDraftedBy: "Alena Batacan",
    approvedBy: "Consensus Approved"
  },
  {
    id: "OFF-2026-015",
    candidateId: "CAN-6042",
    requisitionId: "PR-2026-028",
    name: "Mark Anthony Villanueva",
    email: "mark.villanueva@gmail.com",
    phone: "+63 920 887 3341",
    appliedPosition: "Technical Support Associate",
    finalAccount: "Comcast Technical",
    department: "Technical Services",
    basicSalary: 26000,
    allowance: 3000,
    benefits: ["HMO Day 1", "Internet Allowance Php 1,500/mo", "15% Night Shift Differential"],
    status: "For Review",
    approvalStatus: "For Review",
    approvers: [
      {
        id: "APP-001",
        name: "Alena Batacan",
        role: "TA Manager",
        email: "alena.batacan@thesiblingssolutions.com",
        status: "Pending"
      },
      {
        id: "APP-002",
        name: "Marco Valenzuela",
        role: "Finance Approver",
        email: "marco.v@thesiblingssolutions.com",
        status: "Pending"
      },
      {
        id: "APP-003",
        name: "Sofia Rodriguez",
        role: "Operations Director",
        email: "sofia.r@thesiblingssolutions.com",
        status: "Pending"
      }
    ],
    owner: "Juan dela Cruz",
    dateCreated: "2026-07-23",
    contractDraftedBy: "Juan dela Cruz"
  }
];

export default function Offers({ userEmail = "alena.batacan@thesiblingssolutions.com", onSwitchModule }: OffersProps) {
  // Initialize Offers from LocalStorage or Defaults
  const [offers, setOffers] = useState<OfferRecord[]>(() => {
    try {
      const saved = localStorage.getItem(OFFERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_OFFERS.length) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Could not read offers from localStorage", err);
    }
    return INITIAL_OFFERS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [accountFilter, setAccountFilter] = useState("All");

  // Selected Offer details Modal state
  const [selectedOffer, setSelectedOffer] = useState<OfferRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState<"breakdown" | "contract">("breakdown");

  // Voting state inside details modal
  const [actingRole, setActingRole] = useState<"HR Specialist (Offer View)" | "Attorney / Legal Counsel (Atty. Ramos)">("HR Specialist (Offer View)");
  const [voteNoteInput, setVoteNoteInput] = useState("");

  // New Offer Form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newOfferName, setNewOfferName] = useState("");
  const [newOfferEmail, setNewOfferEmail] = useState("");
  const [newOfferPhone, setNewOfferPhone] = useState("");
  const [newOfferRequisition, setNewOfferRequisition] = useState("PR-2026-010");
  const [newOfferPosition, setNewOfferPosition] = useState("Customer Service Representative");
  const [newOfferAccount, setNewOfferAccount] = useState("Elevance Health");
  const [newOfferDepartment, setNewOfferDepartment] = useState("Healthcare Operations");
  const [newOfferSalary, setNewOfferSalary] = useState(22000);
  const [newOfferAllowance, setNewOfferAllowance] = useState(2500);
  const [newOfferBenefit, setNewOfferBenefit] = useState("");
  const [newOfferBenefitsList, setNewOfferBenefitsList] = useState<string[]>([
    "HMO Day 1",
    "Performance Incentive",
    "Government Mandated Benefits"
  ]);

  // Decline Capture Modal state
  const [declineTargetOffer, setDeclineTargetOffer] = useState<OfferRecord | null>(null);
  const [declineReason, setDeclineReason] = useState("Better compensation package elsewhere");
  const [declineNotes, setDeclineNotes] = useState("");
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);

  // Contextual Approval Rules Modal & Banner state
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [showRulesBanner, setShowRulesBanner] = useState(true);

  // Confirmation Modal state
  const [confirmationData, setConfirmationData] = useState<{
    type: "approve" | "reject" | "send" | "mass-approve" | "reset";
    title: string;
    message: string;
    targetId?: string;
  } | null>(null);

  // Toast trigger helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync state to localStorage whenever `offers` updates
  useEffect(() => {
    try {
      localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
      // Notify other modules or tabs of pipeline sync event
      const eventPayload = {
        timestamp: Date.now(),
        source: "OffersModule",
        action: "UPDATE_OFFERS",
        offersCount: offers.length
      };
      localStorage.setItem(PIPELINE_SYNC_EVENTS_KEY, JSON.stringify(eventPayload));
      window.dispatchEvent(new CustomEvent("pipeline_sync", { detail: eventPayload }));
    } catch (err) {
      console.warn("Error persisting offers to localStorage:", err);
    }
  }, [offers]);

  // Listen for external updates from Candidate Pipeline (PIPELINE_CANDIDATES_STORAGE_KEY)
  useEffect(() => {
    const handlePipelineSync = () => {
      try {
        const rawCandidates = localStorage.getItem(PIPELINE_CANDIDATES_STORAGE_KEY);
        if (rawCandidates) {
          const candidates = JSON.parse(rawCandidates);
          if (Array.isArray(candidates)) {
            // Find candidates in 'Offered' or 'Offer' stage that aren't in `offers` list
            const offeredCandidates = candidates.filter(
              (c: any) =>
                c.stage && (c.stage.toLowerCase() === "offered" || c.stage.toLowerCase() === "offer stage")
            );

            let newAdded = false;
            setOffers(prevOffers => {
              const updated = [...prevOffers];
              offeredCandidates.forEach((cand: any) => {
                const exists = updated.some(
                  o => o.candidateId === cand.id || o.name.toLowerCase() === (cand.name || "").toLowerCase()
                );
                if (!exists) {
                  newAdded = true;
                  const newId = `OFF-2026-0${updated.length + 1}`;
                  updated.unshift({
                    id: newId,
                    candidateId: cand.id || `CAN-${Math.floor(1000 + Math.random() * 9000)}`,
                    requisitionId: cand.requisitionId || "PR-2026-011",
                    name: cand.name || "New Offered Candidate",
                    email: cand.email || "candidate@example.com",
                    phone: cand.phone || "+63 917 000 0000",
                    appliedPosition: cand.position || "Customer Service Representative",
                    finalAccount: cand.account || "Elevance Health",
                    department: cand.department || "Operations",
                    basicSalary: cand.proposedSalary || 22000,
                    allowance: cand.proposedAllowance || 2500,
                    benefits: ["HMO Day 1", "Government Mandated Benefits"],
                    status: "For Review",
                    approvalStatus: "For Review",
                    approvers: JSON.parse(JSON.stringify(DEFAULT_APPROVERS_TEMPLATE)),
                    owner: "Alena Batacan",
                    dateCreated: new Date().toISOString().split("T")[0],
                    contractDraftedBy: "System (Pipeline Sync)"
                  });
                }
              });
              return newAdded ? updated : prevOffers;
            });

            if (newAdded) {
              triggerToast("Synced new candidate(s) from Candidate Pipeline into Offered stage!");
            }
          }
        }
      } catch (e) {
        // Silently handle json parse errors
      }
    };

    handlePipelineSync();

    const storageListener = (e: StorageEvent) => {
      if (e.key === PIPELINE_CANDIDATES_STORAGE_KEY || e.key === PIPELINE_SYNC_EVENTS_KEY) {
        handlePipelineSync();
      }
    };

    window.addEventListener("storage", storageListener);
    window.addEventListener("pipeline_sync", handlePipelineSync);

    return () => {
      window.removeEventListener("storage", storageListener);
      window.removeEventListener("pipeline_sync", handlePipelineSync);
    };
  }, []);

  // Helper list of BPO Accounts for filtering dropdown
  const accountsList = useMemo(() => {
    const list = new Set<string>();
    offers.forEach(o => list.add(o.finalAccount));
    return ["All", ...Array.from(list)];
  }, [offers]);

  // Calculate 6 Summary Metrics Cards (as specified in prompt)
  const metrics = useMemo(() => {
    const total = offers.length;
    const forReview = offers.filter(o => o.status === "For Review" || o.approvalStatus === "For Review").length;
    const approved = offers.filter(o => o.status === "Approved" || o.approvalStatus === "Approved").length;
    const contractSent = offers.filter(o => o.status === "Contract Sent").length;
    const accepted = offers.filter(o => o.status === "Accepted").length;
    const declined = offers.filter(o => o.status === "Declined" || o.approvalStatus === "Rejected").length;

    // Calculated Acceptance Rate: Accepted / Total * 100
    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    return {
      total,
      forReview,
      approved,
      contractSent,
      accepted,
      declined,
      acceptanceRate
    };
  }, [offers]);

  // Decline Reasons Breakdown for hover popover
  const declineBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    offers.forEach(o => {
      if (o.status === "Declined" && o.declineReason) {
        counts[o.declineReason] = (counts[o.declineReason] || 0) + 1;
      }
    });
    return counts;
  }, [offers]);

  // Filtered Offer records
  const filteredOffers = useMemo(() => {
    return offers.filter(o => {
      const matchSearch =
        o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.requisitionId && o.requisitionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        o.appliedPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.finalAccount.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "All" ? true : o.status === statusFilter || o.approvalStatus === statusFilter;
      const matchAccount = accountFilter === "All" ? true : o.finalAccount === accountFilter;

      return matchSearch && matchStatus && matchAccount;
    });
  }, [offers, searchTerm, statusFilter, accountFilter]);

  // Handlers for Benefit Chips
  const handleAddBenefit = () => {
    if (newOfferBenefit.trim()) {
      setNewOfferBenefitsList([...newOfferBenefitsList, newOfferBenefit.trim()]);
      setNewOfferBenefit("");
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setNewOfferBenefitsList(newOfferBenefitsList.filter((_, i) => i !== index));
  };

  // Handler for creating a new offer
  const handleCreateOffer = () => {
    if (!newOfferName.trim() || !newOfferEmail.trim() || !newOfferPhone.trim()) {
      triggerToast("Please complete the candidate contact information first!");
      setCreateStep(1);
      return;
    }

    const newId = `OFF-2026-0${offers.length + 1}`;
    const newCandId = `CAN-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: OfferRecord = {
      id: newId,
      candidateId: newCandId,
      requisitionId: newOfferRequisition || "PR-2026-010",
      name: newOfferName.trim(),
      email: newOfferEmail.trim(),
      phone: newOfferPhone.trim(),
      appliedPosition: newOfferPosition,
      finalAccount: newOfferAccount,
      department: newOfferDepartment,
      basicSalary: newOfferSalary,
      allowance: newOfferAllowance,
      benefits: newOfferBenefitsList,
      status: "For Review",
      approvalStatus: "For Review",
      approvers: JSON.parse(JSON.stringify(DEFAULT_APPROVERS_TEMPLATE)),
      owner: "Alena Batacan",
      dateCreated: new Date().toISOString().split("T")[0],
      contractDraftedBy: "Alena Batacan"
    };

    setOffers([record, ...offers]);
    setIsCreateModalOpen(false);

    // Reset Form
    setNewOfferName("");
    setNewOfferEmail("");
    setNewOfferPhone("");
    setNewOfferPosition("Customer Service Representative");
    setNewOfferAccount("Elevance Health");
    setNewOfferSalary(22000);
    setNewOfferAllowance(2500);
    setNewOfferBenefitsList(["HMO Day 1", "Performance Incentive", "Government Mandated Benefits"]);
    setCreateStep(1);

    triggerToast(`Offer ${newId} created for ${record.name} and submitted for review!`);
  };

  // Approver Vote Handler (Exclusive Attorney Legal Approval Workflow)
  const handleVoteOnOffer = (offerId: string, roleToVote: string, voteType: "Approved" | "Rejected", notes?: string) => {
    // HR is restricted from approving or rejecting contracts
    if (actingRole.startsWith("HR Specialist")) {
      triggerToast("🔒 Action Restricted: HR can only see the Offer View. Only Attorney / Legal Counsel can approve or reject candidate contracts.");
      return;
    }

    const formattedDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    setOffers(prevOffers =>
      prevOffers.map(o => {
        if (o.id !== offerId) return o;

        const updatedApprovers = o.approvers.map(a => {
          if (a.role.includes("Attorney") || a.name.includes("Ramos") || a.id === "APP-001") {
            return {
              ...a,
              status: voteType,
              votedAt: formattedDate,
              notes: notes?.trim() || (voteType === "Approved" ? "Employment contract legally approved & executed by Attorney Ramos." : "Contract terms rejected by Legal Counsel.")
            };
          }
          return a;
        });

        const newConsensus = calculateConsensusStatus(updatedApprovers);

        let newStatus = o.status;
        let newApprovedBy = o.approvedBy;

        if (newConsensus === "Approved" || voteType === "Approved") {
          newStatus = "Approved";
          newApprovedBy = "Atty. Patricia Ramos (Legal Counsel)";
        } else if (voteType === "Rejected") {
          newStatus = "Declined";
        }

        const updatedOffer = {
          ...o,
          approvers: updatedApprovers,
          approvalStatus: (voteType === "Approved" ? "Approved" : "Rejected") as any,
          status: newStatus as any,
          approvedBy: newApprovedBy
        };

        if (selectedOffer && selectedOffer.id === offerId) {
          setSelectedOffer(updatedOffer);
        }

        return updatedOffer;
      })
    );

    setVoteNoteInput("");
    if (voteType === "Approved") {
      triggerToast("⚖️ Contract APPROVED by Attorney Patricia Ramos! Offer is now ready for HR contract dispatch.");
    } else {
      triggerToast("🚫 Contract REJECTED by Attorney Patricia Ramos! Returned to candidate pipeline for package term revisions.");
    }
  };

  // Dispatch Contract Handler
  const handleSendContract = (id: string) => {
    setOffers(prev =>
      prev.map(o =>
        o.id === id
          ? {
              ...o,
              status: "Contract Sent"
            }
          : o
      )
    );
    if (selectedOffer && selectedOffer.id === id) {
      setSelectedOffer(prev => (prev ? { ...prev, status: "Contract Sent" } : null));
    }
    triggerToast(`Offer contract sent to candidate for ${id}!`);
  };

  // Capture Candidate Decline
  const handleCaptureDecline = () => {
    if (!declineTargetOffer) return;
    setOffers(prev =>
      prev.map(o =>
        o.id === declineTargetOffer.id
          ? {
              ...o,
              status: "Declined",
              declineReason,
              declineNotes: declineNotes.trim() || "No detailed notes provided.",
              dateResponded: new Date().toISOString().split("T")[0]
            }
          : o
      )
    );
    setIsDeclineModalOpen(false);
    triggerToast(`Decline metrics logged for ${declineTargetOffer.name}.`);
    setDeclineNotes("");
  };

  // Simulate Candidate Signature Acceptance
  const handleSimulateSigning = (id: string) => {
    setOffers(prev =>
      prev.map(o =>
        o.id === id
          ? {
              ...o,
              status: "Accepted",
              dateResponded: new Date().toISOString().split("T")[0]
            }
          : o
      )
    );
    if (selectedOffer && selectedOffer.id === id) {
      setSelectedOffer(prev =>
        prev ? { ...prev, status: "Accepted", dateResponded: new Date().toISOString().split("T")[0] } : null
      );
    }
    triggerToast(`Candidate electronically signed offer ${id}! Syncing with pipeline.`);
  };

  // Batch Approval
  const handleMassApprove = () => {
    const formattedDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    setOffers(prev =>
      prev.map(o => {
        if (o.status === "For Review" || o.approvalStatus === "For Review") {
          const allApproved = o.approvers.map(a => ({
            ...a,
            status: "Approved" as const,
            votedAt: formattedDate,
            notes: a.notes || "Batch approved."
          }));
          return {
            ...o,
            approvers: allApproved,
            approvalStatus: "Approved",
            status: "Approved",
            approvedBy: "Batch Manager Consensus"
          };
        }
        return o;
      })
    );
    triggerToast("All pending offers have been batch approved!");
  };

  // Export Ledger
  const handleExportCSV = () => {
    triggerToast("Offers database exported. Downloading OFFERS_LEDGER_2026.csv...");
  };

  // Reset to initial
  const handleResetDatabase = () => {
    setOffers(INITIAL_OFFERS);
    localStorage.removeItem(OFFERS_STORAGE_KEY);
    triggerToast("Offers database restored to initial parameters.");
  };

  return (
    <div className="relative flex flex-1 select-none flex-col space-y-3.5 bg-transparent font-jakarta sm:space-y-4 2xl:space-y-5" id="offers-module-root">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed right-5 top-20 z-[13000] flex max-w-[420px] items-center gap-3 rounded-xl border border-white/10 border-l-4 border-l-[#FF5C28] bg-[#042C51] px-4 py-3 text-xs font-semibold text-white shadow-[0_18px_50px_rgba(4,44,81,0.28)] sm:right-6"
          >
            <CheckCircle className="w-4.5 h-4.5 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. HEADER & TOP ACTIONS ==================== */}
      <section className="relative overflow-hidden rounded-2xl border border-[#DCE6F1] bg-white shadow-[0_8px_24px_rgba(4,44,81,0.05)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#FF5C28] to-[#042C51]" />

        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between 2xl:px-7 2xl:py-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                Recruitment View
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD8C9] bg-[#FFF0EB] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#FF5C28]">
                <ShieldCheck className="h-3 w-3" />
                Pipeline Real-Time Sync
              </span>
            </div>

            <div className="mt-3 flex items-start gap-3">
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#042C51] text-white shadow-sm sm:inline-flex">
                <Briefcase className="h-5 w-5 text-[#FF5C28]" />
              </span>
              <div className="min-w-0">
                <h1 className="text-xl font-black tracking-tight text-[#042C51] sm:text-2xl 2xl:text-[28px]">
                  Offers
                </h1>
                <p className="mt-1 max-w-4xl text-xs font-medium leading-5 text-[#667085] 2xl:text-[13px]">
                  Review candidates currently in the Offered stage, track approval progress, and keep offer decisions synchronized with Candidate Pipeline.
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            <button
              type="button"
              onClick={() => {
                setConfirmationData({
                  type: "reset",
                  title: "Reset Offers Database",
                  message: "Are you sure you want to reset all offer records back to default parameters? Any custom entries will be restored to default."
                });
              }}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D7E0EA] bg-white text-[#475467] shadow-sm transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
              title="Reset Offers Demo State"
              aria-label="Reset offers data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-white px-3 text-xs font-extrabold text-[#475467] shadow-sm transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
            >
              <Download className="h-3.5 w-3.5" />
              Export Ledger
            </button>

            <button
              type="button"
              onClick={() => setIsRulesModalOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#D6E3F0] bg-[#F7FAFE] px-3 text-xs font-extrabold text-[#042C51] transition hover:border-[#FF5C28]/30 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Contextual Rules
            </button>

            {metrics.forReview > 0 && (
              <button
                type="button"
                onClick={() => {
                  setConfirmationData({
                    type: "mass-approve",
                    title: "Batch Approve Pending Offers",
                    message: `Are you sure you want to consensus approve all ${metrics.forReview} job offers currently awaiting approver review?`
                  });
                }}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-amber-500 bg-amber-500 px-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-amber-600"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Batch Approve ({metrics.forReview})
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setCreateStep(1);
                setIsCreateModalOpen(true);
              }}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C28] px-4 text-xs font-black text-white shadow-sm transition hover:bg-[#E95324] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Create Offer Draft
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#EEF2F6] bg-[#FBFCFE] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 2xl:px-7">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-wide text-[#98A2B3]">Active View Mode</p>
            <p className="mt-0.5 text-[11px] font-semibold text-[#667085]">
              Switch the prototype persona without changing any offer data or workflow state.
            </p>
          </div>

          <div className="flex w-full items-center rounded-lg border border-[#DCE3EC] bg-white p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActingRole("HR Specialist (Offer View)");
                triggerToast("Switched active persona to HR Specialist (Offer View Mode)");
              }}
              className={`inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-[10px] font-extrabold transition sm:flex-none ${
                actingRole.startsWith("HR")
                  ? "bg-[#042C51] text-white shadow-sm"
                  : "text-[#667085] hover:bg-[#F8FAFC] hover:text-[#042C51]"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              HR View
            </button>
            <button
              type="button"
              onClick={() => {
                setActingRole("Attorney / Legal Counsel (Atty. Ramos)");
                triggerToast("Switched active persona to Attorney / Legal Counsel (Atty. Patricia Ramos)");
              }}
              className={`inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-[10px] font-extrabold transition sm:flex-none ${
                actingRole.includes("Attorney")
                  ? "bg-purple-700 text-white shadow-sm"
                  : "text-[#667085] hover:bg-purple-50 hover:text-purple-700"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Attorney Mode
            </button>
          </div>
        </div>
      </section>

      {/* CONTEXTUAL GOVERNANCE POLICY BANNER */}
      <AnimatePresence>
        {showRulesBanner && (
          <motion.section
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative overflow-hidden rounded-2xl border border-[#0E3E69] bg-gradient-to-r from-[#031F39] via-[#042C51] to-[#031F39] px-4 py-4 text-white shadow-[0_10px_30px_rgba(4,44,81,0.14)] sm:px-5"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-[#FF5C28]" />
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#FF5C28]">
                  <ShieldCheck className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-white">Offers Governance Policy</h2>
                    <span className="rounded-full bg-[#FF5C28] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                      Legal Approval Rule
                    </span>
                  </div>
                  <p className="mt-1 max-w-5xl text-xs font-medium leading-5 text-slate-200">
                    <strong>HR Role Scope:</strong> HR users can review compensation, draft offers, dispatch approved contracts, and record candidate responses. <span className="font-bold text-emerald-300">Attorney / Legal Counsel (Atty. Patricia Ramos)</span> retains the prototype&apos;s legal approval and rejection authority.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(true)}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 text-[10px] font-extrabold uppercase tracking-wide text-slate-100 transition hover:bg-white/15"
                >
                  <Info className="h-3.5 w-3.5 text-[#FF5C28]" />
                  View Full Rule Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setShowRulesBanner(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  title="Dismiss Banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ==================== 2. OFFER SUMMARY CARDS (6 REAL-TIME METRICS) ==================== */}
      <section aria-label="Offer summary metrics" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <article className="relative flex h-[112px] min-h-[108px] flex-col justify-between overflow-hidden rounded-2xl border border-[#DCE6F1] bg-white p-3.5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 truncate text-[9px] font-black uppercase tracking-wider text-[#042C51]">Total Offers</p>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-[#042C51]">
              <FileText className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1.5">
            <p className="text-2xl font-extrabold leading-none tabular-nums tracking-tight text-[#042C51]">{metrics.total}</p>
            <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-wide text-[#98A2B3]">Pipeline Records</p>
          </div>
        </article>

        <article className="relative flex h-[112px] min-h-[108px] flex-col justify-between overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/20 p-3.5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 truncate text-[9px] font-black uppercase tracking-wider text-amber-800">For Review</p>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600">
              <Clock3 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1.5">
            <p className="text-2xl font-extrabold leading-none tabular-nums tracking-tight text-amber-800">{metrics.forReview}</p>
            <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-wide text-amber-700/75">Awaiting Approvers</p>
          </div>
        </article>

        <article className="relative flex h-[112px] min-h-[108px] flex-col justify-between overflow-hidden rounded-2xl border border-indigo-200/80 bg-indigo-50/20 p-3.5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 truncate text-[9px] font-black uppercase tracking-wider text-indigo-800">Approved</p>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1.5">
            <p className="text-2xl font-extrabold leading-none tabular-nums tracking-tight text-indigo-800">{metrics.approved}</p>
            <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-wide text-indigo-700/75">Ready for Delivery</p>
          </div>
        </article>

        <article className="relative flex h-[112px] min-h-[108px] flex-col justify-between overflow-hidden rounded-2xl border border-purple-200/80 bg-purple-50/20 p-3.5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 truncate text-[9px] font-black uppercase tracking-wider text-purple-800">Contract Sent</p>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-100 bg-purple-50 text-purple-600">
              <Send className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1.5">
            <p className="text-2xl font-extrabold leading-none tabular-nums tracking-tight text-purple-800">{metrics.contractSent}</p>
            <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-wide text-purple-700/75">Dispatched to Email</p>
          </div>
        </article>

        <article className="relative flex h-[112px] min-h-[108px] flex-col justify-between overflow-hidden rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-3.5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 truncate text-[9px] font-black uppercase tracking-wider text-emerald-800">Accepted</p>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1.5">
            <p className="text-2xl font-extrabold leading-none tabular-nums tracking-tight text-emerald-800">{metrics.accepted}</p>
            <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-wide text-emerald-700/75">{metrics.acceptanceRate}% Acceptance Rate</p>
          </div>
        </article>

        <article className="group relative flex h-[112px] min-h-[108px] flex-col justify-between overflow-visible rounded-2xl border border-rose-200/80 bg-rose-50/20 p-3.5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 truncate text-[9px] font-black uppercase tracking-wider text-rose-800">Declined</p>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600">
              <XCircle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1.5">
            <p className="text-2xl font-extrabold leading-none tabular-nums tracking-tight text-rose-800">{metrics.declined}</p>
            <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-wide text-rose-700/75 underline decoration-dotted">Reasons Logged</p>
          </div>

          <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-30 w-[260px] translate-y-1 rounded-xl border border-slate-800 bg-slate-900 p-3 text-[10px] text-white opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100">
            <p className="mb-2 border-b border-slate-700 pb-1 font-extrabold uppercase text-[#FF5C28]">Decline Reasons Log</p>
            {Object.keys(declineBreakdown).length === 0 ? (
              <p className="text-slate-400">No candidate declines recorded.</p>
            ) : (
              <div className="space-y-1.5">
                {Object.entries(declineBreakdown).map(([reason, count]) => {
                  const countVal = count as number;
                  return (
                    <div key={reason} className="flex items-center justify-between gap-2">
                      <span className="max-w-[165px] truncate text-slate-300">{reason}</span>
                      <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 font-mono font-bold text-white">
                        {countVal} ({metrics.declined > 0 ? Math.round((countVal / metrics.declined) * 100) : 0}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </article>
      </section>

      {/* ==================== 3. SEARCH & DROP-DOWN FILTERS ==================== */}
      <section className="relative z-[20] overflow-visible rounded-2xl border border-[#DCE6F1] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
        <div className="px-4 py-4 sm:px-5 2xl:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E9F0FC] text-[#042C51]">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-sm font-extrabold tracking-tight text-[#042C51] 2xl:text-base">Offer Records</h2>
              </div>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-[#667085]">
                Search and filter offered candidates by approval status and account.
              </p>
            </div>

            <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#042C51]">
              {filteredOffers.length} of {offers.length} Records
            </span>
          </div>

          <div className="mt-3.5 flex flex-col gap-3 overflow-visible sm:flex-row sm:items-center">
            <div className="group relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3] transition-colors group-focus-within:text-[#FF5C28]" />
              <input
                type="text"
                placeholder="Search candidate, offer ID, role, or account..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-[10px] border border-[#E6ECF2] bg-[#F8FAFC] px-3 pl-9 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#8A98B8] hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              />
            </div>

            <div className="relative w-full sm:w-[190px]">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-10 w-full appearance-none rounded-[10px] border border-[#E6ECF2] bg-[#F8FAFC] px-3 pr-9 text-xs font-bold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                aria-label="Status filter"
              >
                <option value="All">All Status</option>
                <option value="For Review">For Review</option>
                <option value="Approved">Approved</option>
                <option value="Contract Sent">Contract Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
              </select>
              <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#667085]" />
            </div>

            <div className="relative w-full sm:w-[220px]">
              <select
                value={accountFilter}
                onChange={e => setAccountFilter(e.target.value)}
                className="h-10 w-full appearance-none rounded-[10px] border border-[#E6ECF2] bg-[#F8FAFC] px-3 pr-9 text-xs font-bold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                aria-label="Account filter"
              >
                <option value="All">All Accounts</option>
                {accountsList
                  .filter(a => a !== "All")
                  .map(acc => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
              </select>
              <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#667085]" />
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setAccountFilter("All");
              }}
              disabled={!searchTerm && statusFilter === "All" && accountFilter === "All"}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-[#D7DEE8] bg-white px-3 text-xs font-extrabold text-[#667085] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
            >
              <Filter className="h-3.5 w-3.5" />
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 4. DATA TABLE & RESPONSIVE CARDS (OfferRecordsTable) ==================== */}
      <section className="relative z-[10] overflow-hidden rounded-2xl border border-[#DCE6F1] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
        {/* Table Notice & View Mode Indicator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6ECF2] bg-[#F8FAFC] px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black tracking-wide text-[#042C51] uppercase flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#FF5C28]" />
              Active Offer Records & Matrix
            </span>
            {actingRole.startsWith("HR") ? (
              <span className="text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <User className="w-3 h-3 text-blue-700" />
                HR Offer View Mode
              </span>
            ) : (
              <span className="text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-purple-700" />
                Attorney Approval Mode (Atty. Patricia Ramos)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Mode Toggle in Table Header */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-[10px]">
              <button
                type="button"
                onClick={() => setActingRole("HR Specialist (Offer View)")}
                className={`px-2 py-0.5 font-bold rounded transition-colors cursor-pointer ${
                  actingRole.startsWith("HR") ? "bg-[#042C51] text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                HR View
              </button>
              <button
                type="button"
                onClick={() => setActingRole("Attorney / Legal Counsel (Atty. Ramos)")}
                className={`px-2 py-0.5 font-bold rounded transition-colors cursor-pointer ${
                  actingRole.includes("Attorney") ? "bg-purple-700 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Attorney Mode
              </button>
            </div>

            <span className="text-[10px] text-slate-500 font-mono font-bold bg-white px-2.5 py-1 rounded-md border border-slate-200">
              Showing {filteredOffers.length} of {offers.length} records
            </span>
          </div>
        </div>

        {/* Desktop Data Table */}
        <div className="hidden md:block overflow-x-auto">
          {filteredOffers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <p className="text-xs font-bold">No offer records match your current filters.</p>
              <p className="text-[10px] text-slate-400">Adjust search criteria or create a new offer draft.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E6ECF2] bg-[#F8FAFC] text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">
                  <th className="py-3 px-5">Candidate & Requisition</th>
                  <th className="py-3 px-5">Position & Account</th>
                  <th className="py-3 px-5">Total Monthly Salary</th>
                  <th className="py-3 px-5 text-center">
                    {actingRole.includes("Attorney") ? "Attorney Legal Review" : "Approver Consensus"}
                  </th>
                  <th className="py-3 px-5 text-center">Offer Status</th>
                  <th className="py-3 px-5 text-right">
                    {actingRole.includes("Attorney") ? "Legal Decision Actions" : "HR Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6ECF2]">
                {filteredOffers.map(o => {
                  const totalMonthly = o.basicSalary + o.allowance;
                  const approvedCount = o.approvers ? o.approvers.filter(a => a.status === "Approved").length : 0;
                  const totalApprovers = o.approvers ? o.approvers.length : 3;
                  const consensus = o.approvalStatus || calculateConsensusStatus(o.approvers);

                  // Extract Attorney Vote Status
                  const attorneyVote = o.approvers?.find(a => a.role.includes("Attorney") || a.name.includes("Ramos") || a.id === "APP-001");
                  const attorneyStatus = attorneyVote?.status || "Pending";

                  return (
                    <tr key={o.id} className="text-xs text-slate-700 transition-colors hover:bg-[#FFF9F6]">
                      {/* Candidate Name & Req ID */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <p className="font-black text-[#042C51] text-xs">{o.name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-700">
                              {o.id}
                            </span>
                            <span>Req: <strong className="text-slate-800">{o.requisitionId || "PR-2026-001"}</strong></span>
                          </div>
                        </div>
                      </td>

                      {/* Position & BPO Account */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{o.appliedPosition}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {o.finalAccount} <span className="text-slate-300">•</span> {o.department || "Operations"}
                          </p>
                        </div>
                      </td>

                      {/* Total Monthly Salary (PHP) */}
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-extrabold text-[#042C51]">
                          ₱{totalMonthly.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">/ mo</span>
                          <div className="text-[9px] text-slate-400 font-normal">
                            ₱{o.basicSalary.toLocaleString()} basic + ₱{o.allowance.toLocaleString()} allowance
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Approver Consensus / Attorney Legal Review */}
                      <td className="py-3.5 px-5 text-center">
                        {actingRole.includes("Attorney") ? (
                          <div className="flex flex-col items-center gap-1">
                            {attorneyStatus === "Approved" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                                <ShieldCheck className="w-3 h-3 text-purple-700" />
                                Atty. Ramos: Approved
                              </span>
                            )}
                            {attorneyStatus === "Rejected" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-700" />
                                Atty. Ramos: Rejected
                              </span>
                            )}
                            {attorneyStatus === "Pending" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200 animate-pulse">
                                <Clock3 className="w-3 h-3 text-amber-700" />
                                Legal Review Required
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            {consensus === "Approved" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-800 border border-indigo-200">
                                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                Approved ({approvedCount}/{totalApprovers})
                              </span>
                            )}
                            {consensus === "Rejected" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Rejected by Approver
                              </span>
                            )}
                            {consensus === "For Review" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock3 className="w-3 h-3 text-amber-600 animate-pulse" />
                                Pending ({approvedCount}/{totalApprovers})
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Offer Status */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {o.status === "For Review" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                              For Review
                            </span>
                          )}
                          {o.status === "Approved" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                              Approved
                            </span>
                          )}
                          {o.status === "Contract Sent" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
                              Contract Sent
                            </span>
                          )}
                          {o.status === "Accepted" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                              Accepted
                            </span>
                          )}
                          {o.status === "Declined" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                              Declined
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions Column (Adapts dynamically based on active View Mode) */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details Icon (Always available) */}
                          <button
                            onClick={() => {
                              setSelectedOffer(o);
                              setActiveDetailsTab("breakdown");
                              setIsDetailsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-[#042C51] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Offer Details & Approver Votes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* ATTORNEY MODE ROW ACTIONS */}
                          {actingRole.includes("Attorney") ? (
                            <>
                              {(o.status === "For Review" || attorneyStatus === "Pending") && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleVoteOnOffer(o.id, "Attorney / Legal Approver", "Approved")}
                                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Approve Contract as Legal Counsel"
                                  >
                                    <ShieldCheck className="w-3 h-3 text-emerald-200" />
                                    Approve Contract
                                  </button>
                                  <button
                                    onClick={() => handleVoteOnOffer(o.id, "Attorney / Legal Approver", "Rejected")}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Reject Contract terms"
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                    Reject
                                  </button>
                                </div>
                              )}
                              {o.status === "Approved" && (
                                <span className="text-[10px] font-extrabold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-purple-600" />
                                  Contract Executed (HR Dispatch Pending)
                                </span>
                              )}
                            </>
                          ) : (
                            /* HR MODE ROW ACTIONS */
                            <>
                              {o.status === "For Review" && (
                                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-extrabold">
                                  Awaiting Attorney Approval
                                </span>
                              )}

                              {o.status === "Approved" && (
                                <button
                                  onClick={() => {
                                    setConfirmationData({
                                      type: "send",
                                      title: "Dispatch Job Offer Contract",
                                      message: `Are you ready to transmit the official employment contract to ${o.name} (${o.email})?`,
                                      targetId: o.id
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <Mail className="w-3 h-3" />
                                  Send Contract
                                </button>
                              )}

                              {o.status === "Contract Sent" && (
                                <>
                                  <button
                                    onClick={() => handleSimulateSigning(o.id)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Simulate Candidate Signing"
                                  >
                                    <Check className="w-3 h-3" />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeclineTargetOffer(o);
                                      setDeclineReason("Better compensation package elsewhere");
                                      setDeclineNotes("");
                                      setIsDeclineModalOpen(true);
                                    }}
                                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Capture Candidate Decline Reason"
                                  >
                                    <X className="w-3 h-3" />
                                    Decline
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Responsive Cards view (Adapts to View Mode) */}
        <div className="block md:hidden divide-y divide-[#E6ECF2]">
          {filteredOffers.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-bold">No offer records available.</div>
          ) : (
            filteredOffers.map(o => {
              const totalMonthly = o.basicSalary + o.allowance;
              const approvedCount = o.approvers ? o.approvers.filter(a => a.status === "Approved").length : 0;
              const totalApprovers = o.approvers ? o.approvers.length : 3;
              const attorneyVote = o.approvers?.find(a => a.role.includes("Attorney") || a.name.includes("Ramos") || a.id === "APP-001");
              const attorneyStatus = attorneyVote?.status || "Pending";

              return (
                <div key={o.id} className="space-y-3 bg-white p-4 transition-colors hover:bg-[#FFFDFC]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-[#042C51] text-sm">{o.name}</h4>
                      <p className="text-[10px] font-mono text-slate-500">
                        Req: {o.requisitionId || "PR-2026-001"} • ID: {o.id}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        o.status === "Accepted"
                          ? "bg-emerald-100 text-emerald-800"
                          : o.status === "Approved"
                          ? "bg-indigo-100 text-indigo-800"
                          : o.status === "Contract Sent"
                          ? "bg-purple-100 text-purple-800"
                          : o.status === "Declined"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Role & Account</span>
                      <p className="font-bold text-slate-800">{o.appliedPosition}</p>
                      <p className="text-[10px] text-slate-500">{o.finalAccount}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">
                        {actingRole.includes("Attorney") ? "Legal Status" : "Total Monthly"}
                      </span>
                      {actingRole.includes("Attorney") ? (
                        <p className="font-extrabold text-purple-800 text-[11px]">Atty. Ramos: {attorneyStatus}</p>
                      ) : (
                        <p className="font-mono font-black text-[#042C51]">₱{totalMonthly.toLocaleString()}</p>
                      )}
                      <p className="text-[9px] text-slate-500">Approvers: {approvedCount}/{totalApprovers}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedOffer(o);
                        setActiveDetailsTab("breakdown");
                        setIsDetailsModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#042C51] text-white text-xs font-extrabold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>

                    {actingRole.includes("Attorney") ? (
                      (o.status === "For Review" || attorneyStatus === "Pending") && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleVoteOnOffer(o.id, "Attorney / Legal Approver", "Approved")}
                            className="px-2.5 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-200" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleVoteOnOffer(o.id, "Attorney / Legal Approver", "Rejected")}
                            className="px-2.5 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      )
                    ) : (
                      <>
                        {o.status === "Approved" && (
                          <button
                            onClick={() => handleSendContract(o.id)}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-extrabold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Mail className="w-3 h-3" />
                            Send Contract
                          </button>
                        )}
                        {o.status === "Contract Sent" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSimulateSigning(o.id)}
                              className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                setDeclineTargetOffer(o);
                                setDeclineReason("Better compensation package elsewhere");
                                setDeclineNotes("");
                                setIsDeclineModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              Decline
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ==================== 5. LEGAL COMPLIANCE & SYNC FOOTER ==================== */}
      <section className="relative overflow-hidden rounded-xl border border-blue-100 bg-[#F7FAFE] px-3.5 py-3 shadow-[0_6px_18px_rgba(4,44,81,0.03)]">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E9F0FC] text-[#042C51]">
            <ShieldCheck className="h-[15px] w-[15px]" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[13px] font-extrabold text-[#042C51]">Offer Process Rule</h3>
            <p className="mt-0.5 text-xs font-medium leading-5 text-[#667085]">
              This prototype keeps its existing approval, contract-delivery, decline tracking, and Candidate Pipeline synchronization behavior. The update in this file is presentation-only and does not change the stored offer data or workflow handlers.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 6. MODALS ==================== */}

      {/* MODAL C: OFFER DETAILS & APPROVER WORKFLOW MODAL (OfferDetailsModal) */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedOffer && (
          <div className="fixed inset-0 z-[12000] flex h-dvh items-center justify-center bg-[#042C51]/60 p-4 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
            >
              {/* Header Matching Image 2 Theme */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#042C51] px-5 py-4 text-white sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-[#FF5C28] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white tracking-tight">{selectedOffer.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/15 text-slate-200 border border-white/10">
                        {selectedOffer.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-2">
                      <span>Req: {selectedOffer.requisitionId || "PR-2026-001"}</span>
                      <span>•</span>
                      <span>Candidate ID: {selectedOffer.candidateId}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-1.5 flex items-center justify-between shrink-0">
                <div className="flex gap-4 text-xs font-extrabold text-slate-400">
                  <button
                    onClick={() => setActiveDetailsTab("breakdown")}
                    className={`pb-1 pt-1.5 ${
                      activeDetailsTab === "breakdown" ? "text-[#042C51] border-b-2 border-[#FF5C28]" : "hover:text-slate-600"
                    }`}
                  >
                    Compensation & Approval Breakdown
                  </button>
                  <button
                    onClick={() => setActiveDetailsTab("contract")}
                    className={`pb-1 pt-1.5 ${
                      activeDetailsTab === "contract" ? "text-[#042C51] border-b-2 border-[#FF5C28]" : "hover:text-slate-600"
                    } flex items-center gap-1`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Generated Contract Document
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Consensus:</span>
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      selectedOffer.approvalStatus === "Approved" || selectedOffer.status === "Approved"
                        ? "bg-indigo-100 text-indigo-800"
                        : selectedOffer.approvalStatus === "Rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {selectedOffer.approvalStatus || calculateConsensusStatus(selectedOffer.approvers)}
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex-1 overflow-y-auto bg-[#F8FAFC] space-y-5">
                {activeDetailsTab === "breakdown" ? (
                  <>
                    {/* Candidate & Role Metadata Card */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                      <p className="text-[10px] font-black uppercase text-[#042C51] tracking-wider border-b border-slate-100 pb-1.5">
                        Candidate & Requisition Profile
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                        <div className="space-y-1">
                          <p className="flex justify-between">
                            <span className="text-slate-400 font-medium">Candidate Name:</span>
                            <span className="font-extrabold text-[#042C51]">{selectedOffer.name}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400 font-medium">Email Address:</span>
                            <span className="font-semibold text-slate-800">{selectedOffer.email}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400 font-medium">Phone Contact:</span>
                            <span className="font-mono font-bold text-slate-800">{selectedOffer.phone}</span>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="flex justify-between">
                            <span className="text-slate-400 font-medium">Position Title:</span>
                            <span className="font-bold text-slate-800">{selectedOffer.appliedPosition}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400 font-medium">Account / Department:</span>
                            <span className="font-extrabold text-[#042C51]">
                              {selectedOffer.finalAccount} ({selectedOffer.department || "Operations"})
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400 font-medium">Requisition ID:</span>
                            <span className="font-mono font-bold text-slate-800">{selectedOffer.requisitionId || "PR-2026-001"}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Compensation Breakdown Card */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                        <p className="text-[10px] font-black uppercase text-[#042C51] tracking-wider">
                          Compensation & Benefits Breakdown
                        </p>
                        <span className="text-xs font-black text-[#042C51] font-mono bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                          Total Value: ₱{(selectedOffer.basicSalary + selectedOffer.allowance).toLocaleString()} / month
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Basic Monthly Salary</span>
                          <span className="text-lg font-black text-slate-900 font-mono">
                            ₱{selectedOffer.basicSalary.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Monthly Allowance</span>
                          <span className="text-lg font-black text-slate-900 font-mono">
                            ₱{selectedOffer.allowance.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Contract Perks & Benefits:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedOffer.benefits.map((b, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-100 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Multi-User Approver Breakdown & Interactive Voting Panel */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                        <p className="text-[10px] font-black uppercase text-[#042C51] tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#FF5C28]" />
                          Multi-User Approval Workflow Matrix
                        </p>
                        <span className="text-[10px] text-slate-400 italic">Consensus: All votes required</span>
                      </div>

                      {/* Approver Roster List */}
                      <div className="space-y-2">
                        {selectedOffer.approvers && selectedOffer.approvers.map((appr) => (
                          <div
                            key={appr.id}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-[#042C51] text-xs">{appr.name}</span>
                                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                                  {appr.role}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">{appr.email}</p>
                              {appr.notes && (
                                <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 mt-1 italic">
                                  &ldquo;{appr.notes}&rdquo;
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span
                                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                  appr.status === "Approved"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : appr.status === "Rejected"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {appr.status === "Approved" && <Check className="w-3 h-3 text-emerald-600" />}
                                {appr.status === "Rejected" && <X className="w-3 h-3 text-rose-600" />}
                                {appr.status === "Pending" && <Clock3 className="w-3 h-3 text-amber-600" />}
                                {appr.status}
                              </span>
                              {appr.votedAt && (
                                <span className="text-[9px] text-slate-400 font-mono">{appr.votedAt}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Approval Voting Action Panel */}
                      {selectedOffer.status !== "Accepted" && selectedOffer.status !== "Declined" && (
                        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-3 mt-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase text-[#042C51] flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-[#FF5C28]" />
                              Legal Contract Approval Authorization
                            </p>
                            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                              Current Role: {actingRole}
                            </span>
                          </div>

                          {actingRole.startsWith("HR") ? (
                            <div className="bg-blue-50/90 p-3 rounded-lg border border-blue-200 text-xs text-slate-700 space-y-2">
                              <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-extrabold text-[#042C51]">
                                    🔒 HR Access Scope: Offer View & Contract Delivery Mode
                                  </p>
                                  <p className="text-[11px] text-slate-600 mt-0.5">
                                    HR personnel can inspect compensation breakdowns, draft offer proposals, dispatch approved contracts, and record candidate responses. Contract legal approval and rejection authority is strictly reserved for Attorney / Legal Counsel (Atty. Patricia Ramos).
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActingRole("Attorney / Legal Counsel (Atty. Ramos)");
                                    triggerToast("Switched to Attorney / Legal Counsel role");
                                  }}
                                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                                  Switch to Attorney Role to Approve / Reject
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-xs text-purple-950 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 font-bold text-xs">
                                    ⚖️
                                  </div>
                                  <div>
                                    <p className="font-black text-purple-900">Atty. Patricia Ramos — Legal Counsel</p>
                                    <p className="text-[10px] text-purple-700">Exclusive authority to approve or reject employment contracts from candidate pipeline.</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                                  Legal Approval Authority
                                </span>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-extrabold uppercase text-slate-500">Legal Review Notes / Stipulations:</label>
                                <input
                                  type="text"
                                  placeholder="Enter legal review notes or contract compliance stipulations..."
                                  value={voteNoteInput}
                                  onChange={e => setVoteNoteInput(e.target.value)}
                                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg placeholder-slate-400"
                                />
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <button
                                  type="button"
                                  onClick={() => setActingRole("HR Specialist (Offer View)")}
                                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                                >
                                  Return to HR View Mode
                                </button>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleVoteOnOffer(selectedOffer.id, "Attorney / Legal Approver", "Rejected", voteNoteInput)}
                                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                    Reject Contract
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleVoteOnOffer(selectedOffer.id, "Attorney / Legal Approver", "Approved", voteNoteInput)}
                                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                                    Approve Contract
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Contract Document Tab */
                  <div className="space-y-4">
                    <div className="bg-white border-2 border-slate-300 p-8 rounded-xl shadow-inner text-slate-800 font-serif leading-relaxed text-xs relative">
                      <div className="text-center space-y-1 pb-6 border-b border-slate-200">
                        <p className="font-bold text-sm tracking-wider uppercase">THE SIBLINGS SOLUTIONS BPO CORP.</p>
                        <p className="text-[10px] text-slate-500 font-sans italic">Davao City, Philippines</p>
                        <h4 className="text-sm font-black underline uppercase pt-3 text-slate-900">
                          EMPLOYMENT AGREEMENT CONTRACT
                        </h4>
                      </div>

                      <div className="mt-6 space-y-4 text-justify">
                        <p>
                          This Employment Agreement is formulated on <strong>{selectedOffer.dateCreated}</strong>, for candidate <strong>{selectedOffer.name}</strong>.
                        </p>
                        <p>
                          <strong>Role & Account:</strong> {selectedOffer.appliedPosition} aligned to {selectedOffer.finalAccount} ({selectedOffer.department}).
                        </p>
                        <p>
                          <strong>Basic Monthly Salary:</strong> ₱{selectedOffer.basicSalary.toLocaleString()} + Allowance: ₱{selectedOffer.allowance.toLocaleString()}.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-100 p-3.5 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-500">
                        You can print or simulate signing for this employment agreement contract.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print Contract
                        </button>

                        {selectedOffer.status === "Contract Sent" && (
                          <button
                            onClick={() => handleSimulateSigning(selectedOffer.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Simulate Candidate Signing
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Close Details
                </button>

                {selectedOffer.status === "Approved" && (
                  <button
                    onClick={() => {
                      handleSendContract(selectedOffer.id);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-4 h-4" />
                    Dispatch Contract Now
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CREATE OFFER DRAFT */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[12000] flex h-dvh items-center justify-center bg-[#042C51]/60 p-4 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
            >
              {/* Header Matching Image 2 Theme */}
              <div className="flex items-center justify-between border-b border-white/10 bg-[#042C51] px-5 py-4 text-white sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 text-[#FF5C28] flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-white">Create New Candidate Job Offer</h3>
                    <p className="text-[10px] text-slate-300">Draft compensation guidelines and set requisition ID.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Steps Indicator */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                  <span className={`pb-1 ${createStep === 1 ? "text-[#042C51] border-b-2 border-[#FF5C28]" : ""}`}>
                    1. Candidate Identity & Req
                  </span>
                  <span className={`pb-1 ${createStep === 2 ? "text-[#042C51] border-b-2 border-[#FF5C28]" : ""}`}>
                    2. Compensation & Benefits
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Step {createStep} of 2</span>
              </div>

              {/* Form Body */}
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                {createStep === 1 ? (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        Requisition ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. PR-2026-010"
                        value={newOfferRequisition}
                        onChange={e => setNewOfferRequisition(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Candidate Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Maria Teresa Macapagal"
                        value={newOfferName}
                        onChange={e => setNewOfferName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Email Address</label>
                        <input
                          type="email"
                          placeholder="e.g. maria.teresa@gmail.com"
                          value={newOfferEmail}
                          onChange={e => setNewOfferEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Contact Phone</label>
                        <input
                          type="text"
                          placeholder="e.g. +63 917 123 4567"
                          value={newOfferPhone}
                          onChange={e => setNewOfferPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Applied Position</label>
                        <select
                          value={newOfferPosition}
                          onChange={e => setNewOfferPosition(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                        >
                          <option value="Customer Service Representative">Customer Service Representative</option>
                          <option value="Technical Support Associate">Technical Support Associate</option>
                          <option value="Healthcare Support Specialist">Healthcare Support Specialist</option>
                          <option value="Financial Account Specialist">Financial Account Specialist</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Target BPO Account</label>
                        <select
                          value={newOfferAccount}
                          onChange={e => setNewOfferAccount(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                        >
                          <option value="Elevance Health">Elevance Health</option>
                          <option value="Chevron Support">Chevron Support</option>
                          <option value="Comcast Technical">Comcast Technical</option>
                          <option value="Citi Global">Citi Global</option>
                          <option value="Capital One Help">Capital One Help</option>
                          <option value="RingCentral Team">RingCentral Team</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-[#042C51] tracking-wider block">
                          Proposed Basic Salary (Php)
                        </label>
                        <input
                          type="number"
                          min={12000}
                          value={newOfferSalary}
                          onChange={e => setNewOfferSalary(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-[#042C51] tracking-wider block">
                          Monthly Allowance (Php)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={newOfferAllowance}
                          onChange={e => setNewOfferAllowance(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <label className="text-[10px] font-black uppercase text-[#042C51] tracking-wider block">
                        Included Benefits & Perks
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. HMO Day 1 + 1 dependent"
                          value={newOfferBenefit}
                          onChange={e => setNewOfferBenefit(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddBenefit())}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={handleAddBenefit}
                          className="px-3 bg-[#042C51] text-white text-xs font-bold rounded-lg"
                        >
                          Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {newOfferBenefitsList.map((ben, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200"
                          >
                            <span>{ben}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBenefit(idx)}
                              className="text-slate-400 hover:text-slate-700 font-bold"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-between items-center">
                {createStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Cancel Draft
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCreateStep(1)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded"
                  >
                    Back
                  </button>
                )}

                {createStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!newOfferName.trim() || !newOfferEmail.trim() || !newOfferPhone.trim()) {
                        triggerToast("Please fill out all mandatory contact details.");
                        return;
                      }
                      setCreateStep(2);
                    }}
                    className="px-4 py-2 bg-[#042C51] text-white text-xs font-extrabold rounded-lg hover:bg-slate-900"
                  >
                    Configure Compensation &rarr;
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateOffer}
                    className="px-5 py-2 bg-[#FF5C28] text-white text-xs font-black rounded-lg hover:bg-[#E04B1D] shadow-sm"
                  >
                    Save & Submit Offer
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DECLINE REASON CAPTURE */}
      <AnimatePresence>
        {isDeclineModalOpen && declineTargetOffer && (
          <div className="fixed inset-0 z-[12000] flex h-dvh items-center justify-center bg-[#042C51]/60 p-4 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 bg-[#042C51] px-5 py-4 text-white sm:px-6">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                    <X className="w-4.5 h-4.5 text-[#FF5C28]" />
                    Record Candidate Decline Reason
                  </h3>
                  <p className="text-[10px] text-slate-300">Understand dropout reasons for candidate analytics.</p>
                </div>
                <button
                  onClick={() => setIsDeclineModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-[11px] text-slate-500 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                  Logging decline reason for candidate <strong>{declineTargetOffer.name}</strong>.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Primary Decline Reason</label>
                  <select
                    value={declineReason}
                    onChange={e => setDeclineReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value="Better compensation package elsewhere">Better compensation package elsewhere</option>
                    <option value="Commute distance is too far">Commute distance is too far</option>
                    <option value="Work shift scheduling conflict">Work shift scheduling conflict</option>
                    <option value="Personal / Family emergency constraints">Personal / Family emergency constraints</option>
                    <option value="Counter-offer from current employer">Counter-offer from current employer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Additional Feedback</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Accepted another offer..."
                    value={declineNotes}
                    onChange={e => setDeclineNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <button onClick={() => setIsDeclineModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-500">
                  Cancel
                </button>
                <button
                  onClick={handleCaptureDecline}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-black rounded-lg"
                >
                  Save & Log Metrics
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {confirmationData && (
          <div className="fixed inset-0 z-[12050] flex h-dvh items-center justify-center bg-[#042C51]/60 p-4 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
            >
              <div className="border-b border-[#E6ECF2] bg-[#042C51] px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 ${
                    confirmationData.type === "reset" || confirmationData.type === "reject"
                      ? "text-rose-300"
                      : "text-[#FF5C28]"
                  }`}>
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-wide text-[#FFB79E]">Offers</p>
                    <h4 className="mt-0.5 text-sm font-black tracking-tight text-white">{confirmationData.title}</h4>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-5 py-5">
                <p className="text-sm font-semibold leading-6 text-[#475467]">{confirmationData.message}</p>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] font-semibold leading-5 text-amber-800">
                  Confirm this action only after reviewing the affected offer record(s).
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#E6ECF2] bg-[#F8FAFC] px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmationData(null)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#D6E0EA] bg-white px-4 text-xs font-extrabold text-[#475467] transition hover:bg-white hover:text-[#042C51]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const { type, targetId } = confirmationData;
                    if (type === "send" && targetId) {
                      handleSendContract(targetId);
                    } else if (type === "mass-approve") {
                      handleMassApprove();
                    } else if (type === "reset") {
                      handleResetDatabase();
                    }
                    setConfirmationData(null);
                  }}
                  className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-xs font-black text-white shadow-sm transition active:scale-[0.98] ${
                    confirmationData.type === "reset" || confirmationData.type === "reject"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-[#FF5C28] hover:bg-[#E95324]"
                  }`}
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTEXTUAL APPROVAL RULES & GOVERNANCE MODAL */}
      <AnimatePresence>
        {isRulesModalOpen && (
          <div className="fixed inset-0 z-[12000] flex h-dvh items-center justify-center bg-[#042C51]/60 p-4 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 bg-[#042C51] px-5 py-4 text-white sm:px-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-[#FF5C28]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                      Offers Module Contextual Governance Rules
                      <span className="text-[9px] bg-[#FF5C28] text-white px-2 py-0.5 rounded font-extrabold uppercase">
                        Active Policy
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      Approval rule permissions and authorization matrix for compensation workflows.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRulesModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                {/* Rule Highlight 1 */}
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100/80 space-y-2">
                  <div className="flex items-center gap-2 text-[#042C51]">
                    <UserCheck className="w-4 h-4 text-[#FF5C28]" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      1. Approval Rules Assignment Governance
                    </h4>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    In <strong>Recruitment Settings &gt; Approval Rules</strong>, administrators can <strong>only add users or roles</strong> that have explicit permissions to <span className="font-bold text-[#042C51]">Create Offer</span> or <span className="font-bold text-[#042C51]">Approve / Accept Offer</span> into the active consensus review matrix.
                  </p>
                  <div className="text-[11px] bg-white p-2.5 rounded-lg border border-blue-100 text-slate-600 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Users without offer rights cannot be added as approvers or draft owners.</span>
                  </div>
                </div>

                {/* Rule Highlight 2 */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      2. Multi-Person Consensus Workflow Rules
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200/80">
                      <div className="font-extrabold text-emerald-900 text-[11px] flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Rule A: Unanimous Consensus (Approved)
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-normal">
                        Requires all configured approvers to vote "Approved". Triggers eligibility for formal contract dispatch to candidate.
                      </p>
                    </div>

                    <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-200/80">
                      <div className="font-extrabold text-rose-900 text-[11px] flex items-center gap-1.5 mb-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Rule B: Single Veto Flag (Rejected)
                      </div>
                      <p className="text-[11px] text-rose-800 leading-normal">
                        Any single "Rejected" vote flags the offer for salary/allowance package revision and halts contract delivery.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rule Highlight 3: Active Role Rights Matrix Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Active Approval Matrix & Role Rights</span>
                    <span className="text-[10px] text-slate-400 font-medium">Configured in Recruitment Settings</span>
                  </h4>

                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200 text-[10px] uppercase">
                          <th className="p-2.5">System Role</th>
                          <th className="p-2.5 text-center">Offer View</th>
                          <th className="p-2.5 text-center">Create Draft</th>
                          <th className="p-2.5 text-center">Approve/Reject Contract</th>
                          <th className="p-2.5 text-center">Dispatch Contract</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                        <tr className="hover:bg-slate-50/80 bg-purple-50/40">
                          <td className="p-2.5 font-bold text-purple-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                            Attorney / Legal Counsel (Atty. Ramos)
                          </td>
                          <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Yes</td>
                          <td className="p-2.5 text-center text-slate-400">✕ No</td>
                          <td className="p-2.5 text-center text-purple-700 font-extrabold bg-purple-100/60 rounded">✓ EXCLUSIVE AUTHORITY</td>
                          <td className="p-2.5 text-center text-slate-400">✕ No</td>
                        </tr>
                        <tr className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-bold text-[#042C51] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            HR Specialist / Recruiter
                          </td>
                          <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Yes (Full Access)</td>
                          <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Yes</td>
                          <td className="p-2.5 text-center text-rose-600 font-bold bg-rose-50/80">✕ Restricted (Attorney Only)</td>
                          <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Yes</td>
                        </tr>
                        <tr className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                            TA Manager (Alena)
                          </td>
                          <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Yes (Full Access)</td>
                          <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Yes</td>
                          <td className="p-2.5 text-center text-rose-600 font-bold bg-rose-50/80">✕ Restricted (Attorney Only)</td>
                          <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Yes</td>
                        </tr>
                        <tr className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                            Finance Approver (Marco)
                          </td>
                          <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Yes</td>
                          <td className="p-2.5 text-center text-slate-400">✕ No</td>
                          <td className="p-2.5 text-center text-slate-400">✕ No</td>
                          <td className="p-2.5 text-center text-slate-400">✕ No</td>
                        </tr>
                        <tr className="hover:bg-slate-50/80 bg-slate-50/50">
                          <td className="p-2.5 font-medium text-slate-500 italic flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                            Standard Interviewer
                          </td>
                          <td className="p-2.5 text-center text-slate-400">✕ No</td>
                          <td className="p-2.5 text-center text-slate-400">✕ No</td>
                          <td className="p-2.5 text-center text-slate-400">✕ No</td>
                          <td className="p-2.5 text-center text-slate-400">✕ No</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rule Highlight 4: Downstream Connections */}
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    Upstream & Downstream Module Trigger Synchronization
                  </div>
                  <p className="text-[11px] text-amber-800 leading-normal">
                    <strong>Accepted Offers:</strong> Instantly syncs candidate record to Onboarding module and creates pre-start record (`ONB-XXXXXX`).<br />
                    <strong>Declined Offers:</strong> Captures decline reason metrics and archives candidate into Candidate Pipeline / Talent Pool.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Recruitment Governance Engine v2.4
                </span>
                <button
                  onClick={() => setIsRulesModalOpen(false)}
                  className="px-4 py-2 bg-[#042C51] text-white font-black text-xs rounded-lg hover:bg-slate-900 transition-colors"
                >
                  Close & Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
