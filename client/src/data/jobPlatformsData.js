export const JOB_PLATFORMS_DATA = [
  {
    id: 'wellfound',
    name: 'Wellfound',
    category: 'Tech & Startups',
    tagline: 'Direct outreach to venture-backed startups and founding engineers.',
    url: 'https://wellfound.com/jobs',
    color: '#000000',
    tags: ['Direct Founder Contact', 'Equity Transparency', 'No Recruiters'],
    features: [
      'Direct messaging with founders and hiring managers',
      'Transparent salary and equity compensation disclosed upfront',
      'Filters for pre-seed through Series C tech startups'
    ],
    bestFor: 'Full-stack, frontend, and backend engineering at fast-moving startups.',
    deepLinks: [
      { label: 'Entry Level Roles', url: 'https://wellfound.com/jobs?role=Software+Engineer&experience=Entry-Level' },
      { label: 'Remote Engineering', url: 'https://wellfound.com/jobs?remote=true&role=Software+Engineer' },
      { label: 'Internships', url: 'https://wellfound.com/jobs?type=Internship' }
    ],
    atsGuide: 'Keep resume descriptions concise. Emphasize shipped products, production deployments, and clean GitHub repositories.'
  },
  {
    id: 'yc-startup',
    name: 'Y Combinator Work at a Startup',
    category: 'Tech & Startups',
    tagline: 'Single centralized application for over 1,000+ funded Y Combinator companies.',
    url: 'https://www.workatastartup.com/',
    color: '#FF6600',
    tags: ['YC Backed', 'Top 1% Engineering', 'Direct Founder Review'],
    features: [
      'One profile reviewed by active YC founders seeking founding talent',
      'High-autonomy roles across AI, infrastructure, fintech, and developer tools',
      'Direct interview invitations with no intermediary screening'
    ],
    bestFor: 'Ambitious engineers, AI developers, and technical founders-in-residence.',
    deepLinks: [
      { label: 'Software Engineering', url: 'https://www.workatastartup.com/jobs?role=eng' },
      { label: 'Internships', url: 'https://www.workatastartup.com/jobs?role=eng&type=intern' },
      { label: 'AI & ML Roles', url: 'https://www.workatastartup.com/jobs?role=eng&search=ai' }
    ],
    atsGuide: 'YC founders read submissions personally. Highlight technical depth, hackathon projects, and live deployed demo links.'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Jobs',
    category: 'Big Tech & Corporate',
    tagline: 'Global enterprise career portal with alumni networks and recruiter insights.',
    url: 'https://www.linkedin.com/jobs/',
    color: '#0A66C2',
    tags: ['Enterprise / MNC', 'Alumni Connections', '1-Click Easy Apply'],
    features: [
      'Direct visibility into college alumni working at hiring organizations',
      '1-Click Easy Apply with saved credentials and verified skill badges',
      'Real-time applicant volume and recruiter search trends'
    ],
    bestFor: 'Enterprise technology companies, Fortune 500 corporations, and referral outreach.',
    deepLinks: [
      { label: 'Entry Level SDE', url: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20entry%20level' },
      { label: 'Tech Internships', url: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern' },
      { label: 'Remote Software', url: 'https://www.linkedin.com/jobs/search/?f_WT=2&keywords=software%20engineer' }
    ],
    atsGuide: 'Match exact technical keywords from the job description (e.g., Docker, REST APIs, Microservices, TypeScript).'
  },
  {
    id: 'unstop',
    name: 'Unstop',
    category: 'Freshers & Internships',
    tagline: 'Campus recruitment platform hosting national coding contests and direct hiring challenges.',
    url: 'https://unstop.com/jobs',
    color: '#0052CC',
    tags: ['Campus Drives', 'Coding Hackathons', 'Batch Targeted'],
    features: [
      'National-level hiring challenges by Tata, Amazon, Flipkart, and Walmart',
      'Direct interview shortlisting for top hackathon and contest finishers',
      'Targeted for 2025, 2026, and 2027 college batches'
    ],
    bestFor: 'College students and freshers seeking competitive campus hiring tracks.',
    deepLinks: [
      { label: 'Fresher Drives', url: 'https://unstop.com/jobs' },
      { label: 'Internships', url: 'https://unstop.com/internships' },
      { label: 'Coding Contests', url: 'https://unstop.com/hackathons' }
    ],
    atsGuide: 'Ensure college name, graduation cohort, CGPA, and competitive programming handles are verified.'
  },
  {
    id: 'internshala',
    name: 'Internshala',
    category: 'Freshers & Internships',
    tagline: 'Verified college internships with guaranteed monthly stipends.',
    url: 'https://internshala.com/internships',
    color: '#008BD3',
    tags: ['Verified Stipend', 'Beginner Friendly', 'Remote & In-Office'],
    features: [
      'Mandatory minimum monthly stipend guarantee across all listings',
      'Dedicated filters for work-from-home, part-time, and summer internships',
      'Transparent company response ratings and application deadlines'
    ],
    bestFor: 'College students seeking initial verified industry internships.',
    deepLinks: [
      { label: 'Web Development', url: 'https://internshala.com/internships/web-development-internship' },
      { label: 'Computer Science', url: 'https://internshala.com/internships/computer-science-internship' },
      { label: 'Work from Home', url: 'https://internshala.com/internships/work-from-home-internships' }
    ],
    atsGuide: 'Demonstrate specific project proof in responses rather than generic statements.'
  },
  {
    id: 'cuvette',
    name: 'Cuvette Tech',
    category: 'Freshers & Internships',
    tagline: 'Curated software engineering internships at tech startups with guaranteed ₹15k+ stipends.',
    url: 'https://cuvette.tech/',
    color: '#6366F1',
    tags: ['₹15k+ Stipend', '100% Tech', '7-Day Turnaround'],
    features: [
      'Strictly curated software engineering, frontend, and backend openings',
      'Guaranteed minimum ₹15,000/month stipend standard',
      'Fast-track hiring turnaround averaging 7 working days'
    ],
    bestFor: 'Computer science students seeking verified tech startups with competitive stipends.',
    deepLinks: [
      { label: 'Full Stack Roles', url: 'https://cuvette.tech/' },
      { label: 'Backend Roles', url: 'https://cuvette.tech/' },
      { label: 'Frontend Roles', url: 'https://cuvette.tech/' }
    ],
    atsGuide: 'Highlight frameworks used to build deployed full-stack applications with live URLs.'
  },
  {
    id: 'remoteok',
    name: 'RemoteOK',
    category: 'Global & Remote',
    tagline: 'International remote developer roles paying in USD, EUR, and GBP.',
    url: 'https://remoteok.com/',
    color: '#FF4742',
    tags: ['100% Remote', 'USD Salaries', 'Global Hiring'],
    features: [
      'Global remote roles across North America, Europe, and Asia-Pacific',
      'Disclosed compensation figures and median salary benchmarks',
      'Direct application workflows linking to hiring engineering teams'
    ],
    bestFor: 'Software developers seeking remote international engineering positions.',
    deepLinks: [
      { label: 'Software Dev', url: 'https://remoteok.com/remote-dev-jobs' },
      { label: 'Junior / Intern', url: 'https://remoteok.com/remote-junior-jobs' },
      { label: 'React / Node', url: 'https://remoteok.com/remote-react-jobs' }
    ],
    atsGuide: 'Highlight async communication capabilities, documentation quality, and timezone overlap.'
  },
  {
    id: 'weworkremotely',
    name: 'We Work Remotely',
    category: 'Global & Remote',
    tagline: 'The longest-standing remote engineering and tech community.',
    url: 'https://weworkremotely.com/',
    color: '#E05A47',
    tags: ['Established Brands', 'Global Remote', 'Engineering Focus'],
    features: [
      'Over 130,000 monthly applications with verified employers',
      'Direct links to official company Lever and Greenhouse ATS portals',
      'Filtered categories for backend, full-stack, DevOps, and mobile'
    ],
    bestFor: 'Developers seeking remote-first engineering teams worldwide.',
    deepLinks: [
      { label: 'Full-Stack Dev', url: 'https://weworkremotely.com/categories/remote-full-stack-programming-jobs' },
      { label: 'Back-End Dev', url: 'https://weworkremotely.com/categories/remote-back-end-programming-jobs' },
      { label: 'Front-End Dev', url: 'https://weworkremotely.com/categories/remote-front-end-programming-jobs' }
    ],
    atsGuide: 'Use standard clean single-column resumes parsed cleanly by Lever and Greenhouse.'
  },
  {
    id: 'instahyre',
    name: 'Instahyre',
    category: 'Tech & Startups',
    tagline: 'AI matching platform where top product companies reach out to candidates.',
    url: 'https://www.instahyre.com/',
    color: '#0D9488',
    tags: ['Inbound Inquiries', 'Product Companies', 'Zero Spam'],
    features: [
      'Automated matching connecting relevant candidate profiles with employers',
      'Zero recruiter spam — companies review profile and request interviews',
      'Partner employers include Uber, Swiggy, Paytm, and Flipkart'
    ],
    bestFor: 'Engineers seeking inbound interviews from product-driven Indian tech firms.',
    deepLinks: [
      { label: 'Software Engineer', url: 'https://www.instahyre.com/software-engineer-jobs/' },
      { label: 'Bangalore Roles', url: 'https://www.instahyre.com/jobs-in-bangalore/' },
      { label: 'Work From Home', url: 'https://www.instahyre.com/work-from-home-jobs/' }
    ],
    atsGuide: 'Tag all primary programming languages and frameworks from their autocomplete catalog.'
  },
  {
    id: 'cutshort',
    name: 'Cutshort',
    category: 'Tech & Startups',
    tagline: 'AI recruitment platform connecting verified developers with tech scaleups.',
    url: 'https://cutshort.io/',
    color: '#10B981',
    tags: ['Verified Assessments', 'Fast Responses', 'Direct Chat'],
    features: [
      'Direct chat with verified tech hiring managers',
      'Compulsory application status updates to eliminate ghosting',
      'Skill assessments to demonstrate verified algorithmic problem solving'
    ],
    bestFor: 'Developers seeking fast-tracked hiring at funded scaleups and unicorns.',
    deepLinks: [
      { label: 'Frontend Jobs', url: 'https://cutshort.io/' },
      { label: 'Backend Jobs', url: 'https://cutshort.io/' },
      { label: 'Full Stack Jobs', url: 'https://cutshort.io/' }
    ],
    atsGuide: 'Complete the Voila technical verification test to earn verified profile ranking.'
  },
  {
    id: 'gfg-jobs',
    name: 'GeeksforGeeks Jobs',
    category: 'Freshers & Internships',
    tagline: 'DSA practice platform connecting problem solvers with corporate recruiters.',
    url: 'https://practice.geeksforgeeks.org/jobs',
    color: '#2F8D46',
    tags: ['DSA Linked', 'Campus Drives', 'Practice to Hire'],
    features: [
      'Direct mapping between practice problem scores and employer shortlists',
      'Off-campus hiring calendar with graduation batch criteria',
      'Company-specific mock interview tests and questions'
    ],
    bestFor: 'College students who practice algorithmic problem solving and data structures.',
    deepLinks: [
      { label: 'Internships', url: 'https://practice.geeksforgeeks.org/jobs' },
      { label: 'Off-Campus Drives', url: 'https://practice.geeksforgeeks.org/jobs' },
      { label: 'Hiring Contests', url: 'https://practice.geeksforgeeks.org/events' }
    ],
    atsGuide: 'Keep your GeeksforGeeks coding score updated to qualify for partner company drive tests.'
  },
  {
    id: 'mlh-fellowship',
    name: 'MLH Fellowship',
    category: 'Developer Fellowships',
    tagline: '12-week educational internship alternative contributing to production open-source.',
    url: 'https://fellowship.mlh.io/',
    color: '#D9381E',
    tags: ['Paid Stipend', 'Open Source', 'Tier-1 Mentors'],
    features: [
      'Educational stipend while contributing to major open-source codebases',
      '1-on-1 mentorship from senior engineers at GitHub, Meta, and Shopify',
      'Prestigious portfolio credential recognized across global tech'
    ],
    bestFor: 'Aspiring developers seeking prestigious open-source engineering fellowships.',
    deepLinks: [
      { label: 'Open Source Track', url: 'https://fellowship.mlh.io/programs/open-source' },
      { label: 'Software Track', url: 'https://fellowship.mlh.io/programs/software-engineering' },
      { label: 'Web3 Track', url: 'https://fellowship.mlh.io/programs/web3' }
    ],
    atsGuide: 'Submit code samples with clear architectural structure, thorough documentation, and unit tests.'
  },
  {
    id: 'hirist',
    name: 'Hirist',
    category: 'Big Tech & Corporate',
    tagline: 'Indian tech portal focused on backend, cloud, data, and mobile engineering.',
    url: 'https://www.hirist.tech/',
    color: '#3B82F6',
    tags: ['Tech Specialist', 'India Tech Hubs', 'Verified CTC'],
    features: [
      'Deep categorization by technology stack and cloud platform',
      'Detailed CTC breakdowns and company work culture ratings',
      'Direct alerts when applications are reviewed or shortlisted'
    ],
    bestFor: 'Backend, mobile, and cloud engineers targeting major Indian tech hubs.',
    deepLinks: [
      { label: 'Java / Backend', url: 'https://www.hirist.tech/c/java-jobs.html' },
      { label: 'Frontend / UI', url: 'https://www.hirist.tech/c/ui-developer-jobs.html' },
      { label: 'Fresher IT', url: 'https://www.hirist.tech/c/fresher-it-jobs.html' }
    ],
    atsGuide: 'Clearly state years of experience with each primary technology in the skills grid.'
  },
  {
    id: 'indeed',
    name: 'Indeed',
    category: 'Big Tech & Corporate',
    tagline: 'High-volume global search engine indexing enterprise and corporate postings.',
    url: 'https://www.indeed.com/',
    color: '#2164F3',
    tags: ['Global Reach', 'Salary Calculator', 'Company Reviews'],
    features: [
      'Aggregates millions of jobs from direct corporate career sites',
      'Verified employee reviews, interview experiences, and salary disclosures',
      'Straightforward application tracking and status notifications'
    ],
    bestFor: 'Broad searches across all enterprise employers and locations.',
    deepLinks: [
      { label: 'Entry Level SDE', url: 'https://www.indeed.com/q-Software-Engineer-Entry-Level-jobs.html' },
      { label: 'Software Intern', url: 'https://www.indeed.com/q-Software-Engineer-Intern-jobs.html' },
      { label: 'Remote Developer', url: 'https://www.indeed.com/q-Remote-Software-Engineer-jobs.html' }
    ],
    atsGuide: 'Maintain clean single-column formatting with standard headers (Experience, Education, Skills).'
  },
  {
    id: 'naukri',
    name: 'Naukri.com',
    category: 'Big Tech & Corporate',
    tagline: 'India’s largest corporate recruitment platform for IT services and mass hiring.',
    url: 'https://www.naukri.com/',
    color: '#4A90E2',
    tags: ['IT Services / MNC', 'Mass Hiring', 'Recruiter Search'],
    features: [
      'Highest volume of MNC and IT services mass recruitment drives',
      'Resume search engine utilized by corporate recruitment teams',
      'Walk-in drive alerts and off-campus test updates'
    ],
    bestFor: 'Mass campus and off-campus recruitment drives across Indian IT consultancies.',
    deepLinks: [
      { label: 'IT Fresher Jobs', url: 'https://www.naukri.com/it-fresher-jobs' },
      { label: 'Software Developer', url: 'https://www.naukri.com/software-developer-jobs' },
      { label: 'Walkin Drives', url: 'https://www.naukri.com/walk-in-jobs' }
    ],
    atsGuide: 'Include all primary programming languages and academic qualifications directly in the Resume Headline.'
  }
];

export const CATEGORIES = [
  'All Platforms',
  'Tech & Startups',
  'Freshers & Internships',
  'Global & Remote',
  'Big Tech & Corporate',
  'Developer Fellowships'
];
