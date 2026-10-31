import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  DataGrid,
  Modal,
  Drawer,
  Tabs,
  Badge,
  StatusPill,
  KanbanCard,
  StatCard,
  EmptyState,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  Stepper,
  Calendar,
  FileUpload,
  ConfirmDialog,
  CommandPalette,
  useToast,
} from '../components/ui';

import {
  Sparkles,
  Layers,
  Search,
  Mail,
  User,
  Briefcase,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar as CalendarIcon,
  ShieldCheck,
  Building2,
  FileText,
  Trash2,
  Plus,
  ArrowRight,
  Sliders,
  Bell,
  Code,
  Laptop,
  Check,
} from 'lucide-react';

export default function Styleguide() {
  const { addToast } = useToast();

  // Dialog & Drawer demo states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Form states
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('SuperSecretPass123!');
  const [selectValue, setSelectValue] = useState('CSE');
  const [selectedFile, setSelectedFile] = useState(null);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);

  // Tabs state
  const [activeTabPills, setActiveTabPills] = useState('overview');
  const [activeTabUnderline, setActiveTabUnderline] = useState('all');

  // DataGrid Demo Data
  const sampleData = [
    {
      id: '1',
      name: 'Aarav Sharma',
      usn: '1RV21CS001',
      dept: 'Computer Science',
      cgpa: 9.42,
      tier: 'Super Dream',
      status: 'Placed',
      company: 'Google',
      ctc: '32.0 LPA',
    },
    {
      id: '2',
      name: 'Sneha Rao',
      usn: '1RV21IS045',
      dept: 'Information Science',
      cgpa: 8.91,
      tier: 'Dream',
      status: 'Interview Scheduled',
      company: 'Microsoft',
      ctc: '26.5 LPA',
    },
    {
      id: '3',
      name: 'Rohan Verma',
      usn: '1RV21EC089',
      dept: 'Electronics',
      cgpa: 8.15,
      tier: 'Core',
      status: 'Applied',
      company: 'Texas Instruments',
      ctc: '16.0 LPA',
    },
    {
      id: '4',
      name: 'Pooja Iyer',
      usn: '1RV21CS112',
      dept: 'Computer Science',
      cgpa: 9.68,
      tier: 'Super Dream',
      status: 'Shortlisted',
      company: 'Amazon',
      ctc: '28.0 LPA',
    },
    {
      id: '5',
      name: 'Karthik Nair',
      usn: '1RV21ME032',
      dept: 'Mechanical Engg',
      cgpa: 7.82,
      tier: 'Standard',
      status: 'Rejected',
      company: 'L&T',
      ctc: '8.5 LPA',
    },
    {
      id: '6',
      name: 'Ananya Deshmukh',
      usn: '1RV21CS019',
      dept: 'Computer Science',
      cgpa: 9.05,
      tier: 'Dream',
      status: 'Verified',
      company: 'Adobe',
      ctc: '22.0 LPA',
    },
  ];

  const sampleColumns = [
    { key: 'name', header: 'Student Name', sortable: true },
    { key: 'usn', header: 'USN / Roll', sortable: true },
    { key: 'dept', header: 'Department', sortable: true },
    {
      key: 'cgpa',
      header: 'CGPA',
      sortable: true,
      render: (val) => <span className="font-mono font-bold text-emerald-400">{val}</span>,
    },
    {
      key: 'tier',
      header: 'Policy Tier',
      sortable: true,
      render: (val) => (
        <Badge
          variant={
            val === 'Super Dream'
              ? 'purple'
              : val === 'Dream'
              ? 'info'
              : val === 'Core'
              ? 'primary'
              : 'neutral'
          }
          size="xs"
        >
          {val}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Stage',
      sortable: true,
      render: (val) => <StatusPill status={val} size="xs" />,
    },
    {
      key: 'ctc',
      header: 'Offer CTC',
      sortable: true,
      render: (val) => <span className="font-mono text-slate-300">{val}</span>,
    },
  ];

  // Calendar Demo Events
  const today = new Date().toISOString().split('T')[0];
  const sampleEvents = [
    {
      id: 'ev-1',
      title: 'Google System Design Interview',
      date: today,
      type: 'interview',
      time: '10:00 AM',
    },
    {
      id: 'ev-2',
      title: 'Microsoft Drive Registration Deadline',
      date: today,
      type: 'deadline',
      time: '11:59 PM',
    },
    {
      id: 'ev-3',
      title: 'Goldman Sachs PPT Session',
      date: today,
      type: 'drive',
      time: '04:00 PM',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>PLACEearly Design System</span>
                <Badge variant="primary" size="xs">
                  v2.0 Dark-First
                </Badge>
              </h1>
              <p className="text-xs text-slate-400">
                Coherent design tokens, enterprise UI primitives & responsive views
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Search}
              onClick={() => setIsPaletteOpen(true)}
              className="hidden sm:inline-flex"
            >
              Command Palette <kbd className="ml-1 text-[10px] font-mono opacity-60">Ctrl+K</kbd>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                addToast({
                  type: 'success',
                  title: 'Design System Synchronized',
                  message: 'All 19 shared UI components loaded successfully with zero layout shifts.',
                });
              }}
            >
              Test Notification
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* SECTION 1: Design Tokens & Palette */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-100">1. Semantic Design Tokens</h2>
          </div>

          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Dark-first color layers enforce strict hierarchy: base application background
            (<code className="text-emerald-400 font-mono text-[11px]">#030712</code>), surface cards (
            <code className="text-emerald-400 font-mono text-[11px]">#0b1120</code>), raised containers, and interactive overlays.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-slate-400">App Canvas</span>
              <span className="text-xs font-semibold text-slate-200">#030712</span>
              <div className="h-6 rounded bg-slate-950 border border-slate-800 mt-1" />
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-slate-400">Surface Card</span>
              <span className="text-xs font-semibold text-slate-200">#0b1120</span>
              <div className="h-6 rounded bg-slate-900 border border-slate-700 mt-1" />
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-slate-400">Surface Raised</span>
              <span className="text-xs font-semibold text-slate-200">#111c34</span>
              <div className="h-6 rounded bg-slate-850 border border-slate-700 mt-1" />
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-emerald-400">Primary Emerald</span>
              <span className="text-xs font-semibold text-emerald-300">#10b981</span>
              <div className="h-6 rounded bg-emerald-500 mt-1" />
            </div>
            <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-950/20 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-sky-400">Info / Sky</span>
              <span className="text-xs font-semibold text-sky-300">#0ea5e9</span>
              <div className="h-6 rounded bg-sky-500 mt-1" />
            </div>
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-amber-400">Warning Amber</span>
              <span className="text-xs font-semibold text-amber-300">#f59e0b</span>
              <div className="h-6 rounded bg-amber-500 mt-1" />
            </div>
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-rose-400">Danger Rose</span>
              <span className="text-xs font-semibold text-rose-300">#f43f5e</span>
              <div className="h-6 rounded bg-rose-500 mt-1" />
            </div>
          </div>
        </section>

        {/* SECTION 2: Buttons */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <h2 className="text-lg font-semibold text-slate-100">2. Buttons (Variants & Sizes)</h2>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
            {/* Variants */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Variants
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Action</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Button</Button>
                <Button variant="success">Success State</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Sizes (Dense TPO to Spacious Student)
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs" variant="primary">
                  Size XS (TPO Dense)
                </Button>
                <Button size="sm" variant="primary">
                  Size SM (Standard Table)
                </Button>
                <Button size="md" variant="primary">
                  Size MD (Default)
                </Button>
                <Button size="lg" variant="primary">
                  Size LG (Hero CTA)
                </Button>
              </div>
            </div>

            {/* States & Icons */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Interactive States & Icons
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" icon={Plus}>
                  With Leading Icon
                </Button>
                <Button variant="secondary" iconRight={ArrowRight}>
                  With Trailing Icon
                </Button>
                <Button variant="primary" loading>
                  Loading State
                </Button>
                <Button variant="primary" disabled>
                  Disabled Button
                </Button>
                <Button variant="outline" size="icon" aria-label="Settings">
                  <Sliders className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Form Controls (Input & Select & FileUpload) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <h2 className="text-lg font-semibold text-slate-100">
              3. Accessible Form Controls (Input, Select, FileUpload)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            {/* Left Column: Inputs */}
            <div className="space-y-4">
              <Input
                label="Standard Text Input"
                placeholder="Enter full legal name"
                helperText="Matches your official Aadhaar or College ID."
              />

              <Input
                label="Search Input (Clearable & Icon)"
                icon={Search}
                clearable
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onClear={() => setInputValue('')}
                placeholder="Search candidates by roll number..."
              />

              <Input
                label="Password Field with Toggle"
                type="password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
              />

              <Input
                label="Error State"
                defaultValue="invalid.email@domain"
                error="Please enter an active college domain email."
              />

              <Input
                label="TPO Dense Mode (Compact Data Entry)"
                dense
                placeholder="e.g. 1RV21CS001"
                helperText="Dense height optimized for high-volume administrative tables."
              />
            </div>

            {/* Right Column: Select & FileUpload */}
            <div className="space-y-4">
              <Select
                label="Academic Department"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={[
                  { value: 'CSE', label: 'Computer Science and Engineering' },
                  { value: 'ISE', label: 'Information Science and Engineering' },
                  { value: 'ECE', label: 'Electronics and Communication' },
                  { value: 'ME', label: 'Mechanical Engineering' },
                ]}
              />

              <Select
                label="TPO Dense Select"
                dense
                value="Dream"
                options={['Standard', 'Core', 'Dream', 'Super Dream']}
              />

              <FileUpload
                label="Resume / Transcript Upload"
                helperText="Accepted formats: PDF or DOCX up to 5MB."
                selectedFile={selectedFile}
                onFileSelect={(file) => setSelectedFile(file)}
                onClear={() => setSelectedFile(null)}
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: Badges & Canonical Status Pills */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <h2 className="text-lg font-semibold text-slate-100">
              4. Badges & Standardized Status Pills
            </h2>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Generic Badges
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="primary" dot>
                  Primary Dot
                </Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="purple">Purple</Badge>
                <Badge variant="indigo">Indigo</Badge>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Recruitment Stages & Application Statuses (Canonical Mapping)
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status="Open" pulse />
                <StatusPill status="In Progress" pulse />
                <StatusPill status="Applied" />
                <StatusPill status="Shortlisted" />
                <StatusPill status="Interview Scheduled" pulse />
                <StatusPill status="Placed" />
                <StatusPill status="Rejected" />
                <StatusPill status="Verified" />
                <StatusPill status="Needs re-verification" />
                <StatusPill status="Closed" />
                <StatusPill status="Draft" />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Placement Policy Tiers
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status="Super Dream" />
                <StatusPill status="Dream" />
                <StatusPill status="Core" />
                <StatusPill status="Standard" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Stat Cards & Kanban Cards */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <h2 className="text-lg font-semibold text-slate-100">
              5. Stat Cards & Recruitment Kanban Cards
            </h2>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Students Placed"
              value="412"
              trend={{ value: '+14%', isPositive: true, label: 'vs last batch' }}
              icon={Award}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-500/10 border-emerald-500/20"
            />
            <StatCard
              title="Average CTC"
              value="₹14.8 LPA"
              trend={{ value: '+8.2%', isPositive: true, label: 'vs 2025' }}
              icon={TrendingUp}
              iconColor="text-sky-400"
              iconBg="bg-sky-500/10 border-sky-500/20"
            />
            <StatCard
              title="Active Campus Drives"
              value="28"
              trend={{ value: '6 ending soon', neutral: true }}
              icon={Briefcase}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/10 border-purple-500/20"
            />
            <StatCard
              title="Pending Verifications"
              value="19"
              trend={{ value: '-5 today', isPositive: true, label: 'queue clearance' }}
              icon={ShieldCheck}
              iconColor="text-amber-400"
              iconBg="bg-amber-500/10 border-amber-500/20"
            />
          </div>

          {/* Kanban Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <KanbanCard
              title="Aarav Sharma"
              subtitle="1RV21CS001"
              department="CSE"
              cgpa="9.42"
              tier="Super Dream"
              status="Placed"
              verified
              tags={['Full-Stack', 'System Design', 'Leetcoder 500+']}
              actions={
                <Button size="xs" variant="outline" className="w-full">
                  View Full Audit Log
                </Button>
              }
            />
            <KanbanCard
              title="Sneha Rao"
              subtitle="1RV21IS045"
              department="ISE"
              cgpa="8.91"
              tier="Dream"
              status="Interview Scheduled"
              verified
              tags={['Microservices', 'Kubernetes', 'FastAPI']}
              actions={
                <Button size="xs" variant="primary" className="w-full">
                  Join Interview Room
                </Button>
              }
            />
            <KanbanCard
              title="Rohan Verma"
              subtitle="1RV21EC089"
              department="ECE"
              cgpa="8.15"
              tier="Core"
              status="Applied"
              tags={['Embedded C', 'VLSI', 'Verilog']}
              actions={
                <Button size="xs" variant="secondary" className="w-full">
                  Review Application
                </Button>
              }
            />
          </div>
        </section>

        {/* SECTION 6: DataGrid & Composable Tables */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-lg font-semibold text-slate-100">
              6. Enterprise DataGrid (Dense TPO & Spacious Modes)
            </h2>
            <span className="text-xs text-slate-400">
              Try toggling Compact / Normal / Spacious density below!
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
            <DataGrid
              columns={sampleColumns}
              data={sampleData}
              searchable
              selectable
              defaultDensity="compact"
              pageSizeOptions={[5, 10, 20]}
              initialPageSize={5}
              onRowClick={(row) => {
                addToast({
                  type: 'info',
                  title: `Candidate Selected: ${row.name}`,
                  message: `${row.usn} | CGPA ${row.cgpa} | Status: ${row.status}`,
                });
              }}
            />
          </div>
        </section>

        {/* SECTION 7: Tabs, Stepper, and Calendar */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <h2 className="text-lg font-semibold text-slate-100">
              7. Tabs, Steppers & Recruitment Calendar
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            {/* Left: Tabs & Stepper */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Pills Segmented Tabs
                </p>
                <Tabs
                  variant="pills"
                  activeTab={activeTabPills}
                  onChange={setActiveTabPills}
                  tabs={[
                    { id: 'overview', label: 'Overview', badge: 12 },
                    { id: 'applications', label: 'Applications', badge: 84 },
                    { id: 'interviews', label: 'Interviews', badge: 5 },
                    { id: 'settings', label: 'Policies' },
                  ]}
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Underline Tabs
                </p>
                <Tabs
                  variant="underline"
                  activeTab={activeTabUnderline}
                  onChange={setActiveTabUnderline}
                  tabs={[
                    { id: 'all', label: 'All Drives', badge: 48 },
                    { id: 'active', label: 'Active Today', badge: 14 },
                    { id: 'archived', label: 'Archived' },
                  ]}
                />
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Interactive Stepper Flow
                </p>
                <Stepper
                  currentStep={currentStep}
                  onStepClick={(idx) => setCurrentStep(idx)}
                  steps={[
                    { id: 0, label: 'Eligibility', description: 'Rules verified' },
                    { id: 1, label: 'Assessment', description: 'Online coding round' },
                    { id: 2, label: 'Interviews', description: 'Tech + HR rounds' },
                    { id: 3, label: 'Offer Rollout', description: 'Acceptance & Tier Check' },
                  ]}
                />
              </div>
            </div>

            {/* Right: Calendar */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Recruitment & Interview Calendar
              </p>
              <Calendar
                events={sampleEvents}
                onEventClick={(ev) => {
                  addToast({
                    type: 'info',
                    title: ev.title,
                    message: `Scheduled for ${ev.time} on ${ev.date}`,
                  });
                }}
              />
            </div>
          </div>
        </section>

        {/* SECTION 8: Modals, Drawers & Confirm Dialogs */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <h2 className="text-lg font-semibold text-slate-100">
              8. Modals, Drawers & Action Overrides
            </h2>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-wrap items-center gap-4">
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Demo Modal
            </Button>
            <Button variant="secondary" onClick={() => setIsDrawerOpen(true)}>
              Open Slide-Over Drawer
            </Button>
            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
              Test Audit Confirm Dialog
            </Button>
            <Button variant="outline" icon={Search} onClick={() => setIsPaletteOpen(true)}>
              Launch Command Palette (Ctrl+K)
            </Button>
          </div>
        </section>

        {/* SECTION 9: Empty States & Skeletons */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <h2 className="text-lg font-semibold text-slate-100">
              9. Empty States & Loading Skeletons
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmptyState
              title="No Placement Policies Activated"
              description="Configure one-student-one-offer caps, Dream thresholds, and blackout dates to begin managing student applications."
              actionLabel="Create First Policy"
              onAction={() =>
                addToast({
                  type: 'info',
                  title: 'Policy Builder Triggered',
                  message: 'Navigate to /tpo/settings/policies to configure campus rules.',
                })
              }
              secondaryActionLabel="Import Standard Template"
            />

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Skeleton Loading Previews
              </p>
              <SkeletonCard />
              <SkeletonTable rows={2} cols={3} />
            </div>
          </div>
        </section>
      </main>

      {/* Interactive Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Student Placement Policy Details"
        subtitle="Tier classification and active eligibility rules"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                addToast({
                  type: 'success',
                  title: 'Changes Saved',
                  message: 'Student tier policy updated.',
                });
              }}
            >
              Apply Changes
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-300 leading-relaxed">
          The <strong>One-Student-One-Offer</strong> rule is enforced for this college. Once a student
          accepts an offer in a tier equal to or higher than their current tier, further applications
          in that tier are locked unless a TPO exception is granted.
        </p>
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Core Tier CTC Threshold:</span>
          <span className="font-mono text-emerald-400 font-bold">₹7.0 LPA - ₹12.0 LPA</span>
        </div>
      </Modal>

      {/* Interactive Slide-Over Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Candidate Application Profile"
        subtitle="Aarav Sharma (1RV21CS001)"
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)} className="w-full">
            Done
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Cryptographic Merkle Hash verified against College Registrar.</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Department:</span>
              <span className="text-slate-200 font-medium">Computer Science</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">CGPA:</span>
              <span className="font-mono text-emerald-400 font-bold">9.42</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Active Backlogs:</span>
              <span className="font-mono text-slate-200 font-bold">0</span>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Interactive Confirm Dialog with Mandatory Reason */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Override Placement Policy Block?"
        description="This action will grant a manual policy exception allowing this candidate to apply for a second Dream company."
        confirmLabel="Grant Override"
        variant="warning"
        requireReason
        reasonPlaceholder="Enter administrative reason for audit logs..."
        onConfirm={(reason) => {
          setIsConfirmOpen(false);
          addToast({
            type: 'warning',
            title: 'Audit Log Recorded',
            message: `Override approved with reason: "${reason}"`,
          });
        }}
      />

      {/* Command Palette */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </div>
  );
}
