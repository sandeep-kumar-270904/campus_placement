export const JOB_PLATFORMS_DATA = [
  // 1. Naukri.com
  {
    id: 'naukri',
    name: 'Naukri.com',
    category: 'Enterprise & Corporate',
    tagline: 'India’s largest employment portal for IT services, MNCs, and corporate recruitment drives.',
    url: 'https://www.naukri.com/',
    color: '#4A90E2',
    tags: ['MNC Mass Hiring', 'Recruiter Search', 'Walk-in Drives'],
    features: [
      'Highest volume of MNC and IT service company mass recruitment drives',
      'Resume search engine utilized by over 50,000 corporate recruitment teams',
      'Direct walk-in interview notices and off-campus test updates'
    ],
    bestFor: 'Freshers and experienced graduates targeting major Indian IT consultancies and corporations.',
    deepLinks: [
      { label: 'IT Fresher Jobs', url: 'https://www.naukri.com/it-fresher-jobs' },
      { label: 'Software Developer', url: 'https://www.naukri.com/software-developer-jobs' },
      { label: 'Walk-in Drives', url: 'https://www.naukri.com/walk-in-jobs' }
    ],
    atsGuide: 'Keep your resume headline active and updated weekly; Naukri ranks profiles by recent activity.'
  },

  // 2. Indeed.com
  {
    id: 'indeed',
    name: 'Indeed',
    category: 'Enterprise & Corporate',
    tagline: 'High-volume global search engine indexing enterprise and corporate postings worldwide.',
    url: 'https://www.indeed.com/',
    color: '#2164F3',
    tags: ['Global Reach', 'Salary Insights', 'Company Reviews'],
    features: [
      'Aggregates millions of jobs from direct corporate career websites',
      'Verified employee reviews, interview experiences, and salary disclosures',
      'Straightforward application tracking and instant employer alerts'
    ],
    bestFor: 'Broad searches across all enterprise employers and international locations.',
    deepLinks: [
      { label: 'Entry Level SDE', url: 'https://www.indeed.com/q-Software-Engineer-Entry-Level-jobs.html' },
      { label: 'Software Intern', url: 'https://www.indeed.com/q-Software-Engineer-Intern-jobs.html' },
      { label: 'Remote Developer', url: 'https://www.indeed.com/q-Remote-Software-Engineer-jobs.html' }
    ],
    atsGuide: 'Maintain clean single-column formatting with standard headers (Experience, Education, Skills).'
  },

  // 3. LinkedIn Jobs
  {
    id: 'linkedin',
    name: 'LinkedIn Jobs',
    category: 'Enterprise & Corporate',
    tagline: 'World’s largest professional network with alumni connections and recruiter inmail.',
    url: 'https://www.linkedin.com/jobs/',
    color: '#0A66C2',
    tags: ['Alumni Referrals', '1-Click Apply', 'Enterprise MNCs'],
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
    atsGuide: 'Match exact technical keywords from the job description (e.g. Docker, REST APIs, Microservices).'
  },

  // 4. Foundit (Formerly Monster.com)
  {
    id: 'foundit',
    name: 'Foundit (Formerly Monster)',
    category: 'Enterprise & Corporate',
    tagline: 'AI-powered career platform providing personalized job recommendations and assessments.',
    url: 'https://www.foundit.in/',
    color: '#6D28D9',
    tags: ['AI Matchmaking', 'Fresher Drives', 'Career Insights'],
    features: [
      'Next-generation talent platform formerly known as Monster India',
      'AI-based contextual matching between candidate profiles and job roles',
      'Comprehensive readiness tests and verified skill endorsements'
    ],
    bestFor: 'Early career candidates and freshers looking for technology and business roles.',
    deepLinks: [
      { label: 'IT & Software Jobs', url: 'https://www.foundit.in/search/it-software-jobs' },
      { label: 'Fresher Jobs', url: 'https://www.foundit.in/search/fresher-jobs' },
      { label: 'Walk-in Interviews', url: 'https://www.foundit.in/search/walkin-jobs' }
    ],
    atsGuide: 'Highlight core technical skills prominently in the first quarter of your resume profile.'
  },

  // 5. HerKey (Formerly Jobs for Her)
  {
    id: 'herkey',
    name: 'HerKey (Formerly JobsForHer)',
    category: 'Diversity & Inclusion',
    tagline: 'India’s largest career engagement platform dedicated to women in tech and corporate careers.',
    url: 'https://www.herkey.com/',
    color: '#BE185D',
    tags: ['Women in Tech', 'Inclusive Hiring', 'Returnship Tracks'],
    features: [
      'Partnered with 10,000+ inclusive enterprises championing gender diversity',
      'Specialized returnship and starter programs for female graduates',
      'Direct mentorship, communities, and tech reskilling masterclasses'
    ],
    bestFor: 'Women engineers, female college graduates, and women returning to the workforce.',
    deepLinks: [
      { label: 'Tech Openings', url: 'https://www.herkey.com/jobs' },
      { label: 'Work from Home', url: 'https://www.herkey.com/jobs' },
      { label: 'Starter Roles', url: 'https://www.herkey.com/jobs' }
    ],
    atsGuide: 'Emphasize leadership initiatives, hackathon projects, and ongoing technical coursework.'
  },

  // 6. Shine.com
  {
    id: 'shine',
    name: 'Shine.com',
    category: 'Enterprise & Corporate',
    tagline: 'Leading Indian job portal with two-way matching algorithms and salary tools.',
    url: 'https://www.shine.com/',
    color: '#EA580C',
    tags: ['Two-Way Matching', 'Salary Tools', 'Enterprise IT'],
    features: [
      'Two-way matching technology linking candidates directly to hiring recruiters',
      'Integrated salary benchmarking calculators and career market reports',
      'Direct application workflows across over 300,000 active postings'
    ],
    bestFor: 'Candidates seeking opportunities across enterprise IT, BFSI, and manufacturing sectors.',
    deepLinks: [
      { label: 'IT Software Roles', url: 'https://www.shine.com/job-search/it-software-jobs' },
      { label: 'Fresher Openings', url: 'https://www.shine.com/job-search/fresher-jobs' },
      { label: 'Bangalore Jobs', url: 'https://www.shine.com/job-search/jobs-in-bangalore' }
    ],
    atsGuide: 'Ensure certifications and key technical proficiencies are tagged in your profile header.'
  },

  // 7. Google Jobs
  {
    id: 'google-jobs',
    name: 'Google for Jobs',
    category: 'Search & Aggregators',
    tagline: 'Google’s structured job search aggregating listings from across the entire web.',
    url: 'https://www.google.com/search?q=software+engineer+jobs+near+me&ibp=htl;jobs',
    color: '#4285F4',
    tags: ['Universal Search', 'Direct Apply', 'Zero Middlemen'],
    features: [
      'Direct indexing of employer career pages, boards, and ATS portals',
      'Commute time calculators and salary benchmark ranges',
      'Instant notifications when new matching positions go live on company sites'
    ],
    bestFor: 'Finding direct company application pages and cutting through intermediary job boards.',
    deepLinks: [
      { label: 'Software Engineer Roles', url: 'https://www.google.com/search?q=software+engineer+jobs&ibp=htl;jobs' },
      { label: 'Entry Level Tech', url: 'https://www.google.com/search?q=entry+level+software+engineer+jobs&ibp=htl;jobs' },
      { label: 'Remote Engineering', url: 'https://www.google.com/search?q=remote+developer+jobs&ibp=htl;jobs' }
    ],
    atsGuide: 'Google indexes structured JSON-LD job postings; submit applications directly on the company Lever/Greenhouse link.'
  },

  // 8. Glassdoor
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    category: 'Enterprise & Corporate',
    tagline: 'Job listings combined with verified employee reviews, interview experiences, and real salaries.',
    url: 'https://www.glassdoor.com/Job/index.htm',
    color: '#0CAA41',
    tags: ['Company Reviews', 'Interview Questions', 'Salary Transparency'],
    features: [
      'Unfiltered reviews from current and past employees on company work culture',
      'Actual interview questions asked in past rounds by target employers',
      'Detailed CTC and base salary breakdowns across tech levels'
    ],
    bestFor: 'Researching company reputation, interview difficulty, and negotiating offer packages.',
    deepLinks: [
      { label: 'Software Engineer Jobs', url: 'https://www.glassdoor.com/Job/software-engineer-jobs-SRCH_KO0,17.htm' },
      { label: 'Tech Internships', url: 'https://www.glassdoor.com/Job/software-engineer-intern-jobs-SRCH_KO0,24.htm' },
      { label: 'Interview Questions', url: 'https://www.glassdoor.com/Interview/index.htm' }
    ],
    atsGuide: 'Review candidate interview questions posted on Glassdoor prior to technical rounds.'
  },

  // ZipRecruiter
  {
    id: 'ziprecruiter',
    name: 'ZipRecruiter',
    category: 'Enterprise & Corporate',
    tagline: 'AI-driven job marketplace matching resumes with mid-career positions across various industries.',
    url: 'https://www.ziprecruiter.com/',
    color: '#00843D',
    tags: ['AI Matchmaking', '1-Click Apply', 'Mid-Level & Experienced'],
    features: [
      'Proprietary AI matching engine that delivers candidate resumes directly to hiring managers',
      'Phil AI recruiter assistant sending instant alerts when your profile is viewed',
      'Over 2.8 million active employers and Fortune 500 enterprises hiring on the platform'
    ],
    bestFor: 'Mid-level engineers, experienced developers, and specialized technical professionals.',
    deepLinks: [
      { label: 'Software Engineer', url: 'https://www.ziprecruiter.com/Jobs/Software-Engineer' },
      { label: 'Remote Developer', url: 'https://www.ziprecruiter.com/Jobs/Remote-Software-Engineer' },
      { label: 'Mid-Level Tech', url: 'https://www.ziprecruiter.com/' }
    ],
    atsGuide: 'Use standard industry job titles and list technical project accomplishments with measurable impact.'
  },

  // CareerBuilder
  {
    id: 'careerbuilder',
    name: 'CareerBuilder',
    category: 'Enterprise & Corporate',
    tagline: 'Aggregator offering industry-specific listings, resume distribution, and labor market insights.',
    url: 'https://www.careerbuilder.com/',
    color: '#F97316',
    tags: ['Labor Market Data', 'Resume Distribution', 'Experienced Roles'],
    features: [
      'Broad resume distribution network reaching thousands of corporate recruiters simultaneously',
      'Real-time labor market data, compensation trends, and hiring demand insights',
      'Advanced filters for mid-level, supervisory, and senior engineering tracks'
    ],
    bestFor: 'Mid-career and experienced corporate professionals seeking direct industry listings.',
    deepLinks: [
      { label: 'IT Software Jobs', url: 'https://www.careerbuilder.com/jobs-it' },
      { label: 'Experienced Engineer', url: 'https://www.careerbuilder.com/jobs-engineering' },
      { label: 'Work from Home', url: 'https://www.careerbuilder.com/jobs-work-from-home' }
    ],
    atsGuide: 'Emphasize professional certifications, leadership milestones, and software architecture stack.'
  },

  // SimplyHired
  {
    id: 'simplyhired',
    name: 'SimplyHired',
    category: 'Search & Aggregators',
    tagline: 'Broad job board network collecting mid-career and experienced listings from across the internet.',
    url: 'https://www.simplyhired.com/',
    color: '#2563EB',
    tags: ['Job Board Network', 'Salary Estimator', 'Direct Company Apply'],
    features: [
      'Aggregates millions of open requisitions across corporate boards, agencies, and career hubs',
      'Integrated salary estimator tool comparing local vs national market compensation benchmarks',
      'Streamlined application workflows connecting directly with company career sites'
    ],
    bestFor: 'Fast multi-source job searches for mid-level and experienced professionals.',
    deepLinks: [
      { label: 'Software Engineer', url: 'https://www.simplyhired.com/search?q=software+engineer' },
      { label: 'Experienced Roles', url: 'https://www.simplyhired.com/search?q=developer' },
      { label: 'Remote Tech', url: 'https://www.simplyhired.com/search?q=remote+software' }
    ],
    atsGuide: 'Ensure resume headers are simple and standard to parse cleanly across aggregated employer ATS portals.'
  },

  // 9. Hirect
  {
    id: 'hirect',
    name: 'Hirect',
    category: 'Tech & Developer',
    tagline: 'Direct mobile chat connecting candidates with startup founders and CXOs with zero agents.',
    url: 'https://hirect.in/',
    color: '#06B6D4',
    tags: ['Direct Founder Chat', 'Instant Responses', 'Zero Agents'],
    features: [
      'Direct 1-on-1 instant messaging with verified hiring managers and CXOs',
      'Average response time under 2 hours without agency middlemen',
      'Tailored for seed to Series B tech startups hiring urgently'
    ],
    bestFor: 'Tech freshers and early engineers wanting fast direct contact with startup leadership.',
    deepLinks: [
      { label: 'Startup Tech Roles', url: 'https://hirect.in/' },
      { label: 'Remote Startup Jobs', url: 'https://hirect.in/' },
      { label: 'Entry Level Roles', url: 'https://hirect.in/' }
    ],
    atsGuide: 'Write a punchy 2-sentence opening message showcasing your best GitHub repository or deployed project.'
  },

  // 10. Cutshort
  {
    id: 'cutshort',
    name: 'Cutshort',
    category: 'Tech & Developer',
    tagline: 'AI recruitment platform connecting verified developers with tech scaleups and unicorns.',
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

  // 11. Wellfound (Formerly AngelList India)
  {
    id: 'wellfound',
    name: 'Wellfound (AngelList)',
    category: 'Tech & Developer',
    tagline: 'Direct outreach to venture-backed startups, seed founders, and equity engineering roles.',
    url: 'https://wellfound.com/jobs',
    color: '#000000',
    tags: ['Startup Equity', 'Founder Direct', 'Transparent Pay'],
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

  // 12. Freshersworld
  {
    id: 'freshersworld',
    name: 'Freshersworld',
    category: 'Freshers & Internships',
    tagline: 'Specialized Indian job portal dedicated to fresh college graduates and campus drives.',
    url: 'https://www.freshersworld.com/',
    color: '#4F46E5',
    tags: ['Fresher Focused', 'Off-Campus Drives', 'Govt & IT'],
    features: [
      'Over 1.5 crore registered freshers with dedicated college cohort tracking',
      'Daily updates on off-campus recruitment drives by MNCs and consultancies',
      'Mock aptitude tests, placement papers, and interview question archives'
    ],
    bestFor: 'Final year college students and fresh graduates searching for entry-level recruitment drives.',
    deepLinks: [
      { label: 'IT Jobs for Freshers', url: 'https://www.freshersworld.com/jobs/category/it-software-job-vacancies' },
      { label: 'Off-Campus Drives', url: 'https://www.freshersworld.com/jobs/off-campus-drives' },
      { label: 'Govt & PSU Tests', url: 'https://www.freshersworld.com/jobs/category/govt-sector-job-vacancies' }
    ],
    atsGuide: 'List exact graduation year, degree percentage/CGPA, and core CS subjects studied.'
  },

  // 13. Internshala
  {
    id: 'internshala',
    name: 'Internshala',
    category: 'Freshers & Internships',
    tagline: 'India’s premier college internship portal with guaranteed monthly stipends.',
    url: 'https://internshala.com/internships',
    color: '#008BD3',
    tags: ['Verified Stipend', 'College Friendly', 'Work From Home'],
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

  // 14. LetsIntern
  {
    id: 'letsintern',
    name: 'LetsIntern',
    category: 'Freshers & Internships',
    tagline: 'Student internship portal matching college undergraduates with startups and creative firms.',
    url: 'https://www.letsintern.com/',
    color: '#F43F5E',
    tags: ['Student Internships', 'Summer Training', 'Startup Exposure'],
    features: [
      'Dedicated strictly to students and young college graduates',
      'Virtual internships, summer internships, and part-time opportunities',
      'Direct employer messaging and fast status tracking'
    ],
    bestFor: 'Undergraduates seeking initial semester or summer internships.',
    deepLinks: [
      { label: 'Computer Science', url: 'https://www.letsintern.com/' },
      { label: 'Virtual Internships', url: 'https://www.letsintern.com/' },
      { label: 'Startup Internships', url: 'https://www.letsintern.com/' }
    ],
    atsGuide: 'Highlight academic projects, extracurricular leadership, and willingness to learn quickly.'
  },

  // Handshake
  {
    id: 'handshake',
    name: 'Handshake',
    category: 'Freshers & Internships',
    tagline: 'Connects university students and recent alumni directly with college-accredited campus recruiters.',
    url: 'https://joinhandshake.com/',
    color: '#D32F2F',
    tags: ['College Accredited', 'University Network', 'Early Career'],
    features: [
      'Official campus recruitment partner for over 1,400+ colleges and universities',
      'Direct invitations to virtual career fairs and on-campus interview sessions',
      'Pre-filtered early-career listings verified by institutional career centers'
    ],
    bestFor: 'College students, final year candidates, and recent alumni seeking accredited campus hiring.',
    deepLinks: [
      { label: 'Entry Level Jobs', url: 'https://joinhandshake.com/' },
      { label: 'Campus Internships', url: 'https://joinhandshake.com/' },
      { label: 'Virtual Career Fairs', url: 'https://joinhandshake.com/' }
    ],
    atsGuide: 'Ensure university affiliation, major, and graduation year are verified with your student email.'
  },

  // Naukri Campus / FirstNaukri
  {
    id: 'firstnaukri',
    name: 'Naukri Campus / FirstNaukri',
    category: 'Freshers & Internships',
    tagline: 'Dedicated entry-level branch of Naukri focused exclusively on recent graduates and fresher hiring drives.',
    url: 'https://www.firstnaukri.com/',
    color: '#0084FF',
    tags: ['0-1 Yrs Exp', 'Campus Placement', 'MNC Off-Campus'],
    features: [
      'Strictly dedicated to fresh college graduates with 0 to 1 years of experience',
      'Direct campus recruitment drives, test alerts, and off-campus walk-in dates',
      'Aptitude tests, company interview papers, and practice assessments'
    ],
    bestFor: 'Fresh engineering, management, and science graduates entering the corporate workforce.',
    deepLinks: [
      { label: 'Engineering Freshers', url: 'https://www.firstnaukri.com/engineering-jobs' },
      { label: 'Off-Campus Drives', url: 'https://www.firstnaukri.com/fresher-jobs' },
      { label: 'MNC Walk-ins', url: 'https://www.firstnaukri.com/walkin-jobs' }
    ],
    atsGuide: 'Highlight final year capstone projects, coding language fundamentals, and overall CGPA/percentage.'
  },

  // WayUp
  {
    id: 'wayup',
    name: 'WayUp',
    category: 'Freshers & Internships',
    tagline: 'Curated platform for college students and recent grads seeking early-career roles and corporate training schemes.',
    url: 'https://www.wayup.com/',
    color: '#1E88E5',
    tags: ['Early Career', 'Fortune 500 Training', 'Verified Roles'],
    features: [
      'Curated early-career roles across top tech companies, finance, and consumer brands',
      'Rotational corporate training schemes and leadership development programs',
      'Verified recruiter reviews and direct application feedback'
    ],
    bestFor: 'College students and recent graduates targeting structured corporate training programs.',
    deepLinks: [
      { label: 'Software Engineering', url: 'https://www.wayup.com/s/software-engineering-jobs/' },
      { label: 'Tech Internships', url: 'https://www.wayup.com/s/internships/' },
      { label: 'Rotational Programs', url: 'https://www.wayup.com/' }
    ],
    atsGuide: 'Showcase project initiatives, student leadership roles, and quantitative results on your resume.'
  },

  // Gradcracker
  {
    id: 'gradcracker',
    name: 'Gradcracker',
    category: 'Freshers & Internships',
    tagline: 'Specialized careers portal dedicated strictly to STEM (Science, Technology, Engineering, and Maths) university students.',
    url: 'https://www.gradcracker.com/',
    color: '#E65100',
    tags: ['100% STEM Focus', 'Graduate Schemes', 'Work Placements'],
    features: [
      'The premier careers hub specifically built for STEM disciplines',
      'Over 250+ premier employers advertising graduate schemes and work placements',
      'Webinars, employer hubs, and detailed technology engineering roadmaps'
    ],
    bestFor: 'STEM university students seeking structured engineering and technical graduate programs.',
    deepLinks: [
      { label: 'Computing & IT', url: 'https://www.gradcracker.com/search/computing-technology/jobs' },
      { label: 'Engineering Schemes', url: 'https://www.gradcracker.com/search/engineering/jobs' },
      { label: 'Work Placements', url: 'https://www.gradcracker.com/search/all-disciplines/work-placements' }
    ],
    atsGuide: 'Detail specific STEM modules, practical lab/programming coursework, and engineering tool proficiencies.'
  },

  // 15. Apna
  {
    id: 'apna',
    name: 'Apna',
    category: 'High-Velocity & Local',
    tagline: 'India’s leading professional network for fast local, tech, and operational career opportunities.',
    url: 'https://apna.co/',
    color: '#15803D',
    tags: ['Direct HR Call', 'Fast-Track', 'Local & Remote'],
    features: [
      'Over 5 crore registered professionals across 70+ Indian cities',
      'Direct telephone and app interview connections with hiring teams',
      'Zero recruitment agent commission or hidden candidate fees'
    ],
    bestFor: 'Entry-level professionals, operations, sales, and junior developer roles.',
    deepLinks: [
      { label: 'IT Software Jobs', url: 'https://apna.co/jobs' },
      { label: 'Work from Home', url: 'https://apna.co/jobs' },
      { label: 'Fresher Openings', url: 'https://apna.co/jobs' }
    ],
    atsGuide: 'Ensure phone number and immediate availability status are verified on the platform.'
  },

  // 16. WorkIndia
  {
    id: 'workindia',
    name: 'WorkIndia',
    category: 'High-Velocity & Local',
    tagline: 'Verified direct-call employment portal with 100% free hiring for entry and fresher positions.',
    url: 'https://www.workindia.in/',
    color: '#1D4ED8',
    tags: ['Direct Employer Call', 'Zero Agency Fees', 'Immediate Joining'],
    features: [
      'Geo-located job matching across major metropolitan and tier-2 Indian cities',
      'Automated employer verification to screen out fraudulent postings',
      'One-click direct call connection between candidate and hiring employer'
    ],
    bestFor: 'Immediate joining roles, entry-level positions, and local hiring.',
    deepLinks: [
      { label: 'Software / IT Jobs', url: 'https://www.workindia.in/' },
      { label: 'Fresher Roles', url: 'https://www.workindia.in/' },
      { label: 'Work From Home', url: 'https://www.workindia.in/' }
    ],
    atsGuide: 'Be prepared for a direct telephone screening shortly after submitting your application.'
  },

  // 17. TimesJobs
  {
    id: 'timesjobs',
    name: 'TimesJobs',
    category: 'Enterprise & Corporate',
    tagline: 'Times Group corporate hiring platform featuring Fortune India 500 employer opportunities.',
    url: 'https://www.timesjobs.com/',
    color: '#DC2626',
    tags: ['Corporate Tech', 'Fortune 500', 'Enterprise Portals'],
    features: [
      'Backed by Times Group with partnerships across leading enterprise conglomerates',
      'Specialized IT, BFSI, telecom, and automotive recruitment sections',
      'Skill assessment tests and recruiter recommendation algorithms'
    ],
    bestFor: 'Candidates seeking positions at top-tier corporate enterprises in India.',
    deepLinks: [
      { label: 'IT Software Jobs', url: 'https://www.timesjobs.com/' },
      { label: 'Fresher Jobs', url: 'https://www.timesjobs.com/' },
      { label: 'Bangalore Tech', url: 'https://www.timesjobs.com/' }
    ],
    atsGuide: 'Tag corporate enterprise keywords and relevant degree qualifications in your headline.'
  },

  // 18. Jobsora
  {
    id: 'jobsora',
    name: 'Jobsora',
    category: 'Search & Aggregators',
    tagline: 'Global job search engine aggregating career opportunities from over 250+ boards in real-time.',
    url: 'https://in.jobsora.com/',
    color: '#0284C7',
    tags: ['Aggregated Search', '250+ Sources', 'Real-Time Feeds'],
    features: [
      'Deep indexing of thousands of verified corporate and regional job openings',
      'Clean interface with filter by salary, city, experience, and job type',
      'Direct link to official employer application pages'
    ],
    bestFor: 'Comprehensive cross-portal searches without visiting multiple individual sites.',
    deepLinks: [
      { label: 'Software Engineer', url: 'https://in.jobsora.com/' },
      { label: 'Fresher Openings', url: 'https://in.jobsora.com/' },
      { label: 'Remote Tech', url: 'https://in.jobsora.com/' }
    ],
    atsGuide: 'Use targeted boolean search terms to isolate direct employer postings.'
  },

  // 19. QuikrJobs
  {
    id: 'quikrjobs',
    name: 'QuikrJobs',
    category: 'High-Velocity & Local',
    tagline: 'Large-scale job marketplace connecting entry-level candidates with immediate local openings.',
    url: 'https://www.quikr.com/jobs',
    color: '#EAB308',
    tags: ['Immediate Joining', 'Regional Openings', 'Entry Level'],
    features: [
      'Massive reach across hundreds of tier-1, tier-2, and tier-3 Indian cities',
      'Fast application turnaround with direct recruiter contacts',
      'Dedicated categories for IT support, junior developers, and technical assistants'
    ],
    bestFor: 'Immediate joining candidates and local regional job seekers.',
    deepLinks: [
      { label: 'IT & Software Jobs', url: 'https://www.quikr.com/jobs' },
      { label: 'Work from Home', url: 'https://www.quikr.com/jobs' },
      { label: 'Fresher Roles', url: 'https://www.quikr.com/jobs' }
    ],
    atsGuide: 'Indicate immediate availability and location preference directly in your bio.'
  },

  // 20. Hirist
  {
    id: 'hirist',
    name: 'Hirist',
    category: 'Enterprise & Corporate',
    tagline: 'Specialized Indian tech portal for backend, cloud, data, and mobile engineering professionals.',
    url: 'https://www.hirist.tech/',
    color: '#3B82F6',
    tags: ['Deep Tech', 'Bangalore / Hyderabad', 'Verified CTC'],
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

  // 21. Jooble
  {
    id: 'jooble',
    name: 'Jooble',
    category: 'Search & Aggregators',
    tagline: 'International search aggregator operating in 71 countries indexing over 140,000 corporate sources.',
    url: 'https://in.jooble.org/',
    color: '#7C3AED',
    tags: ['Global Aggregator', '71 Countries', 'Direct Company Links'],
    features: [
      'Aggregates vacancies from corporate career pages, recruiters, and portals globally',
      'Operating in 71 countries worldwide with localized Indian portal',
      'Advanced filters for salary ranges, remote opportunities, and experience levels'
    ],
    bestFor: 'Worldwide and pan-India multi-source job searches with zero duplicates.',
    deepLinks: [
      { label: 'Software Engineer', url: 'https://in.jooble.org/' },
      { label: 'IT Fresher', url: 'https://in.jooble.org/' },
      { label: 'Remote Developer', url: 'https://in.jooble.org/' }
    ],
    atsGuide: 'Click through to the primary employer source to ensure your application enters the primary ATS pool.'
  },

  // Bonus Tier-1 Tech Ecosystems
  {
    id: 'yc-startup',
    name: 'Y Combinator Work at a Startup',
    category: 'Tech & Developer',
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
    atsGuide: 'YC founders read submissions personally. Highlight technical depth and live demo links.'
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
    atsGuide: 'Ensure college name, graduation cohort, and competitive programming handles are verified.'
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
    category: 'Remote-First',
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
    category: 'Remote-First',
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
  }
,

  // --- SENIOR, LEADERSHIP & EXECUTIVE PLATFORMS ---
  {
    id: 'execunet',
    name: 'ExecuNet',
    category: 'Executive & Leadership',
    tagline: 'Private networking and executive search community designed for VP, C-suite, and director-level executives.',
    url: 'https://www.execunet.com/',
    color: '#0F172A',
    tags: ['C-Suite & VP', 'Executive Search', '$200k+ Compensation'],
    features: [
      'Private community connecting over 750,000 executive leaders with retained search firms',
      'Unadvertised, confidential director, VP, and C-suite requisitions',
      'Executive coaching, board placement networks, and peer mastermind groups'
    ],
    bestFor: 'Senior directors, VPs, CXOs, and board candidates seeking executive search placement.',
    deepLinks: [
      { label: 'Executive Jobs', url: 'https://www.execunet.com/jobs/' },
      { label: 'C-Suite Network', url: 'https://www.execunet.com/' },
      { label: 'Career Services', url: 'https://www.execunet.com/career-services/' }
    ],
    atsGuide: 'Focus executive summary on board-level impact, P&L ownership, and strategic organizational transformation.'
  },
  {
    id: 'bluesteps',
    name: 'BlueSteps',
    category: 'Executive & Leadership',
    tagline: 'Managed by AESC, connecting verified global executive talent with retained executive search consultants.',
    url: 'https://www.bluesteps.com/',
    color: '#004B87',
    tags: ['AESC Retained Search', 'Global C-Suite', 'Board Appointments'],
    features: [
      'Direct visibility to 16,000+ vetted executive search consultants across 70+ countries',
      'Governed by the Association of Executive Search and Leadership Consultants (AESC)',
      'Confidential career profile management keeping your search discreet'
    ],
    bestFor: 'Accomplished leaders targeting global C-suite, general management, and board seats.',
    deepLinks: [
      { label: 'Search Consultants', url: 'https://www.bluesteps.com/' },
      { label: 'Executive Careers', url: 'https://www.bluesteps.com/executive-careers' },
      { label: 'Career Hub', url: 'https://www.bluesteps.com/' }
    ],
    atsGuide: 'Highlight corporate governance experience, global scale metrics, and verifiable P&L results.'
  },
  {
    id: 'theladders',
    name: 'The Ladders',
    category: 'Executive & Leadership',
    tagline: 'Curated job board and career ecosystem dedicated specifically to $100k+ and $200k+ senior leadership roles.',
    url: 'https://www.theladders.com/',
    color: '#1E293B',
    tags: ['$100k+ Benchmarks', 'Senior Management', 'Executive Matchmaking'],
    features: [
      'Strict compensation floor screening positions paying six figures and above',
      'Curated matches based on compensation requirements and management level',
      'Executive resume review and ATS compatibility scoring'
    ],
    bestFor: 'Senior managers, engineering leads, directors, and high-earning professionals.',
    deepLinks: [
      { label: 'Tech Leadership', url: 'https://www.theladders.com/' },
      { label: '$100k+ Openings', url: 'https://www.theladders.com/' },
      { label: 'Remote Leadership', url: 'https://www.theladders.com/' }
    ],
    atsGuide: 'List quantifiable enterprise outcomes and team leadership size in top achievement summaries.'
  },
  {
    id: 'experteer',
    name: 'Experteer',
    category: 'Executive & Leadership',
    tagline: 'Global executive recruitment service connecting high-caliber professionals with headhunters worldwide.',
    url: 'https://www.experteer.com/',
    color: '#1A365D',
    tags: ['Global Headhunters', 'Senior Leadership', 'Benchmark Salaries'],
    features: [
      'Access to thousands of headhunter listings with disclosed salary benchmarks',
      'Strong presence across European, North American, and international multinational markets',
      'Discreet matching tool allowing passive job browsing without public exposure'
    ],
    bestFor: 'Senior leaders and directors exploring international opportunities and headhunter networks.',
    deepLinks: [
      { label: 'Executive Search', url: 'https://www.experteer.com/' },
      { label: 'IT & Engineering Lead', url: 'https://www.experteer.com/' },
      { label: 'Salary Benchmarks', url: 'https://www.experteer.com/' }
    ],
    atsGuide: 'Present executive biographies with clear functional competencies and international scope.'
  },

  // --- REMOTE-FIRST WORK PLATFORMS ---
  {
    id: 'flexjobs',
    name: 'FlexJobs',
    category: 'Remote-First',
    tagline: 'Hand-screened telecommuting, remote, and flexible positions vetted to guarantee zero spam or scams.',
    url: 'https://www.flexjobs.com/',
    color: '#0D9488',
    tags: ['100% Hand-Screened', 'Zero Spam', 'Hybrid & Remote'],
    features: [
      'Trained researchers manually review and verify every company and requisition',
      'Complete elimination of commission-only, multi-level marketing, or junk listings',
      'Skills tests, career coaching webinars, and direct corporate application links'
    ],
    bestFor: 'Professionals seeking verified legitimate remote, flexible, and hybrid careers.',
    deepLinks: [
      { label: 'Remote Software Jobs', url: 'https://www.flexjobs.com/search?search=software' },
      { label: 'Entry-Level Remote', url: 'https://www.flexjobs.com/search?search=entry+level' },
      { label: 'Computer & IT', url: 'https://www.flexjobs.com/search?search=it' }
    ],
    atsGuide: 'Highlight demonstrated self-management, distributed tooling (Jira, Slack, Git), and timezone availability.'
  },
  {
    id: 'himalayas',
    name: 'Himalayas',
    category: 'Remote-First',
    tagline: 'Modern remote job directory featuring in-depth company culture profiles and timezone-specific filters.',
    url: 'https://himalayas.app/',
    color: '#0284C7',
    tags: ['Timezone Filters', 'Tech-Forward UI', 'Transparent Pay'],
    features: [
      'Deep company culture profiles detailing tech stacks, benefits, and async habits',
      'Precise timezone overlap filters ensuring you only see roles you qualify for geographically',
      'Direct ATS application links with transparent salary ranges on over 80% of roles'
    ],
    bestFor: 'Modern developers and tech workers seeking progressive remote-first tech startups.',
    deepLinks: [
      { label: 'Software Engineering', url: 'https://himalayas.app/jobs/software-engineer' },
      { label: 'Frontend Jobs', url: 'https://himalayas.app/jobs/frontend-developer' },
      { label: 'Entry Level', url: 'https://himalayas.app/jobs?experience_level=entry_level' }
    ],
    atsGuide: 'Keep portfolio and GitHub links prominent; modern tech startups inspect live code.'
  },
  {
    id: 'jobspresso',
    name: 'Jobspresso',
    category: 'Remote-First',
    tagline: 'Hand-curated remote careers across tech, marketing, customer success, and product engineering.',
    url: 'https://jobspresso.co/',
    color: '#8B5CF6',
    tags: ['Curated Remote', 'Tech & Product', 'Startup Focus'],
    features: [
      'Curated and vetted by human editors before publication',
      'Strong selection of modern tech startups and growing digital agencies',
      'Simple resume database where remote employers can reach out directly'
    ],
    bestFor: 'Developers, designers, and marketers seeking quality-filtered remote positions.',
    deepLinks: [
      { label: 'Tech & Dev Jobs', url: 'https://jobspresso.co/remote-software-jobs/' },
      { label: 'Product & Design', url: 'https://jobspresso.co/remote-design-jobs/' },
      { label: 'Post Resume', url: 'https://jobspresso.co/' }
    ],
    atsGuide: 'Emphasize cross-functional team communication and remote collaboration history.'
  },
  {
    id: 'dynamitejobs',
    name: 'Dynamite Jobs',
    category: 'Remote-First',
    tagline: 'Remote job search engine filtering opportunities by weekly hours, timezone overlap, and company size.',
    url: 'https://dynamitejobs.com/',
    color: '#EF4444',
    tags: ['Timezone Matching', 'Bootstrapped Teams', 'Disclosed Pay'],
    features: [
      'Advanced timezone filtering matching candidates with remote teams worldwide',
      'Positions within high-growth entrepreneurial and bootstrapped technology businesses',
      'Detailed company profiles highlighting team size, work style, and tech stack'
    ],
    bestFor: 'Digital builders and developers looking for high-autonomy distributed companies.',
    deepLinks: [
      { label: 'Developer Jobs', url: 'https://dynamitejobs.com/remote-jobs/developers' },
      { label: 'Worldwide Remote', url: 'https://dynamitejobs.com/remote-jobs?location=worldwide' },
      { label: 'Design Roles', url: 'https://dynamitejobs.com/remote-jobs/design' }
    ],
    atsGuide: 'Showcase proactive problem-solving, documentation discipline, and deployed side projects.'
  },
  {
    id: 'workingnomads',
    name: 'Working Nomads',
    category: 'Remote-First',
    tagline: 'Curated list of remote jobs tailored for digital nomads and location-independent professionals.',
    url: 'https://www.workingnomads.com/jobs',
    color: '#10B981',
    tags: ['Anywhere in World', 'Digital Nomad', 'Development & DevOps'],
    features: [
      'Dedicated "Anywhere" filter for positions allowing travel across global borders',
      'Heavy concentration of backend, frontend, DevOps, and cloud infrastructure roles',
      'Instant daily or weekly email blasts tailored to specific tech tags'
    ],
    bestFor: 'Developers seeking true work-from-anywhere flexibility without geographical restrictions.',
    deepLinks: [
      { label: 'Development Jobs', url: 'https://www.workingnomads.com/jobs?category=development' },
      { label: 'System Admin', url: 'https://www.workingnomads.com/jobs?category=system-administration' },
      { label: 'Design Roles', url: 'https://www.workingnomads.com/jobs?category=design' }
    ],
    atsGuide: 'Clarify available working hours and self-sufficiency across international time zones.'
  },

  // --- FREELANCE, CONTRACT & GIG MARKETPLACES ---
  {
    id: 'upwork',
    name: 'Upwork',
    category: 'Freelance & Gigs',
    tagline: 'World’s largest global freelance platform covering development, creative work, AI, and IT consulting.',
    url: 'https://www.upwork.com/',
    color: '#14A800',
    tags: ['Hourly & Fixed Price', 'Escrow Security', 'Enterprise Clients'],
    features: [
      'Milestone-based escrow payment security and automated hourly tracking software',
      'Upwork Enterprise offering long-term contracts with Fortune 500 corporations',
      'Verified badge tiers (Rising Talent, Top Rated, Top Rated Plus)'
    ],
    bestFor: 'Freelancers, contract developers, consultants, and agencies seeking high-volume client projects.',
    deepLinks: [
      { label: 'Web & Mobile Dev', url: 'https://www.upwork.com/freelance-jobs/web-development/' },
      { label: 'AI & Data Science', url: 'https://www.upwork.com/freelance-jobs/artificial-intelligence/' },
      { label: 'Design & Creative', url: 'https://www.upwork.com/freelance-jobs/design-creative/' }
    ],
    atsGuide: 'Structure proposals around solving the client problem in your first 2 sentences; provide verified portfolio proof.'
  },
  {
    id: 'fiverr',
    name: 'Fiverr',
    category: 'Freelance & Gigs',
    tagline: 'Service catalog platform where freelancers sell predefined service packages ("gigs") at custom prices.',
    url: 'https://www.fiverr.com/',
    color: '#1DBF73',
    tags: ['Packaged Services', 'Fiverr Pro', 'Global Client Base'],
    features: [
      'Productized services allowing clients to purchase predefined development and design deliverables',
      'Fiverr Pro program for verified, top-tier vetted specialists with premium pricing',
      'Seamless milestone delivery, buyer messaging, and dispute protection'
    ],
    bestFor: 'Specialists offering discrete deliverables like UI designs, bug fixes, script automation, and full apps.',
    deepLinks: [
      { label: 'Web Programming', url: 'https://www.fiverr.com/categories/programming-tech/website-development' },
      { label: 'Fiverr Pro', url: 'https://www.fiverr.com/pro' },
      { label: 'Mobile Apps', url: 'https://www.fiverr.com/categories/programming-tech/mobile-apps' }
    ],
    atsGuide: 'Design clear 3-tiered gig packages (Basic, Standard, Premium) with explicit deliverable boundaries.'
  },
  {
    id: 'toptal',
    name: 'Toptal',
    category: 'Freelance & Gigs',
    tagline: 'Exclusive network screening the top 3% of freelance software developers, designers, and PMs globally.',
    url: 'https://www.toptal.com/',
    color: '#204ECF',
    tags: ['Top 3% Talent', 'Premium Rates', 'Enterprise Matching'],
    features: [
      'Rigorous 5-step screening process testing language, personality, live coding, and project execution',
      'Direct matching with high-paying Silicon Valley and multinational clients',
      'Zero bidding wars; platform handles contract negotiations and enterprise billing'
    ],
    bestFor: 'Elite software engineers, architects, and designers commanding top-tier global rates.',
    deepLinks: [
      { label: 'Apply as Developer', url: 'https://www.toptal.com/talent/apply' },
      { label: 'Software Engineers', url: 'https://www.toptal.com/developers' },
      { label: 'Designers', url: 'https://www.toptal.com/designers' }
    ],
    atsGuide: 'Prepare for rigorous algorithmic problem solving, clean system design, and communication tests.'
  },
  {
    id: 'freelancer',
    name: 'Freelancer.com',
    category: 'Freelance & Gigs',
    tagline: 'Global project bidding marketplace hosting micro-tasks, large-scale projects, and design contests.',
    url: 'https://www.freelancer.com/',
    color: '#29B2FE',
    tags: ['Project Bidding', 'Design Contests', 'Micro & Macro Tasks'],
    features: [
      'Over 60 million registered employers and freelancers worldwide',
      'Competitive project contests offering guaranteed prize pools for creative submissions',
      'Milestone payment system ensuring funds are locked prior to work commencement'
    ],
    bestFor: 'Competitive freelancers and agencies seeking active project bid competitions.',
    deepLinks: [
      { label: 'Software Projects', url: 'https://www.freelancer.com/jobs/software-development' },
      { label: 'Website Design', url: 'https://www.freelancer.com/jobs/website-design' },
      { label: 'Contests', url: 'https://www.freelancer.com/contest' }
    ],
    atsGuide: 'Bid early with concrete milestones and reference previous client feedback ratings.'
  },
  {
    id: 'contra',
    name: 'Contra',
    category: 'Freelance & Gigs',
    tagline: 'Modern commission-free platform for digital freelancers to showcase rich portfolios and manage contracts.',
    url: 'https://contra.com/',
    color: '#FF5964',
    tags: ['0% Commission', 'Modern Portfolios', 'Direct Invoicing'],
    features: [
      '0% commission fees on contracts and client payouts',
      'Stunning visual portfolio showcase designed for modern tech and creative workers',
      'Built-in contract generation, client proposals, and international payment processing'
    ],
    bestFor: 'Modern developers, designers, and creators seeking a beautiful, fee-free freelance hub.',
    deepLinks: [
      { label: 'Engineering Projects', url: 'https://contra.com/engineering' },
      { label: 'Design Opportunities', url: 'https://contra.com/design' },
      { label: 'Explore Clients', url: 'https://contra.com/' }
    ],
    atsGuide: 'Build an interactive visual case study with Figma embeds, live site links, and client testimonials.'
  },
  {
    id: 'guru',
    name: 'Guru',
    category: 'Freelance & Gigs',
    tagline: 'Platform focused on technical, creative, and business freelance projects with milestone-based agreements.',
    url: 'https://www.guru.com/',
    color: '#4B9CD3',
    tags: ['SafePay Escrow', 'Flexible Agreements', 'Enterprise Workrooms'],
    features: [
      'SafePay payment protection guaranteeing funds before milestones begin',
      'Flexible agreement types: Fixed Price, Hourly, Task-based, or Recurring',
      'Dedicated workroom collaboration spaces for real-time document and project tracking'
    ],
    bestFor: 'Independent professionals and boutique agencies looking for structured corporate client contracts.',
    deepLinks: [
      { label: 'Programming Jobs', url: 'https://www.guru.com/d/jobs/c/programming-development/' },
      { label: 'Design & Art', url: 'https://www.guru.com/d/jobs/c/design-art/' },
      { label: 'Find Work', url: 'https://www.guru.com/d/jobs/' }
    ],
    atsGuide: 'Clearly break down deliverables and timeline estimates within proposal quotes.'
  },
  {
    id: 'peopleperhour',
    name: 'PeoplePerHour',
    category: 'Freelance & Gigs',
    tagline: 'UK-founded marketplace connecting businesses with freelancers across web development, SEO, and content.',
    url: 'https://www.peopleperhour.com/',
    color: '#F36E21',
    tags: ['Hourly Offers', 'European Clients', 'AI Talent Match'],
    features: [
      'Fixed-price "Offers" allowing quick purchase of recurring services',
      'Strong presence in the United Kingdom, Europe, and English-speaking markets',
      'AI matching engine proposing top projects based on your profile skills'
    ],
    bestFor: 'Freelancers seeking international European and UK clients with hourly or fixed rates.',
    deepLinks: [
      { label: 'Software Dev', url: 'https://www.peopleperhour.com/freelance-software-development-jobs' },
      { label: 'Web Design', url: 'https://www.peopleperhour.com/freelance-web-design-jobs' },
      { label: 'Post an Offer', url: 'https://www.peopleperhour.com/' }
    ],
    atsGuide: 'Create targeted, high-demand Offers with realistic turnaround times and clear deliverables.'
  },

  // --- TECH, DEVELOPER & SPECIALIZED DOMAIN PLATFORMS ---
  {
    id: 'dice',
    name: 'Dice',
    category: 'Tech & Developer',
    tagline: 'Tech-exclusive platform covering software engineering, cybersecurity, DevOps, and IT infrastructure.',
    url: 'https://www.dice.com/',
    color: '#CC0000',
    tags: ['Tech Exclusive', 'Security Clearances', 'Salary Predictor'],
    features: [
      'Dedicated exclusively to technology and engineering career paths',
      'Predictive salary model and employer responsiveness rating',
      'High concentration of enterprise IT, defense tech, and specialized engineering roles'
    ],
    bestFor: 'Software engineers, cloud architects, cybersecurity analysts, and DevOps specialists.',
    deepLinks: [
      { label: 'Software Engineer', url: 'https://www.dice.com/jobs/q-Software+Engineer-jobs' },
      { label: 'Remote Tech', url: 'https://www.dice.com/jobs/q-Remote-jobs' },
      { label: 'DevOps Roles', url: 'https://www.dice.com/jobs/q-DevOps-jobs' }
    ],
    atsGuide: 'List technical skills, certifications (AWS, CKA, CISSP), and tech stack version numbers clearly.'
  },
  {
    id: 'github-ecosystem',
    name: 'GitHub Ecosystem & Open Source',
    category: 'Tech & Developer',
    tagline: 'Developer-focused hiring platforms centered around open-source contributions and code repositories.',
    url: 'https://github.com/topics/job-search',
    color: '#24292F',
    tags: ['Open Source', 'Direct Repositories', 'Code-First'],
    features: [
      'Discovered directly through active developer communities and README hiring tags',
      'Positions prioritizing public Git commits, PR reviews, and open-source contributions',
      'Direct connections to maintainers and engineering leadership on GitHub'
    ],
    bestFor: 'Developers who write clean code and have active GitHub repositories to showcase.',
    deepLinks: [
      { label: 'Who is Hiring (HN)', url: 'https://news.ycombinator.com/item?id=38842977' },
      { label: 'GitHub Hiring Topics', url: 'https://github.com/topics/job-search' },
      { label: 'Open Source Jobs', url: 'https://opensourcejobhub.com/' }
    ],
    atsGuide: 'Feature pinned GitHub repositories with clean READMEs, test coverage, and deployed links.'
  },
  {
    id: 'offerzen-honeypot',
    name: 'OfferZen & Honeypot (Reverse Hiring)',
    category: 'Tech & Developer',
    tagline: 'Reverse hiring platforms where vetted tech companies apply directly to developers with upfront offers.',
    url: 'https://www.offerzen.com/',
    color: '#2563EB',
    tags: ['Reverse Hiring', 'Upfront Salaries', 'Dev Exclusivity'],
    features: [
      'Flip the script: Vetted companies send interview requests and upfront salary offers to you',
      'Dedicated talent advisor assisting with interview preparation and salary negotiation',
      'Strong presence across European, African, and international tech engineering hubs'
    ],
    bestFor: 'Software developers, tech leads, and DevOps engineers with 1+ years experience.',
    deepLinks: [
      { label: 'OfferZen Platform', url: 'https://www.offerzen.com/' },
      { label: 'Honeypot Europe', url: 'https://www.honeypot.io/' },
      { label: 'Tech Salary Guide', url: 'https://www.offerzen.com/reports/' }
    ],
    atsGuide: 'Detail your preferred tech stack, salary expectations, and code samples upfront.'
  },
  {
    id: 'dribbble-jobs',
    name: 'Dribbble Jobs',
    category: 'Creative & Design',
    tagline: 'Design-first job directory for UI/UX designers, illustrators, product designers, and brand strategists.',
    url: 'https://dribbble.com/jobs',
    color: '#EA4C89',
    tags: ['UI/UX Design', 'Product Design', 'Visual Portfolios'],
    features: [
      'World-leading design community job board connecting visual talent with top agencies and tech firms',
      'Profiles show interactive visual work samples and case study "shots"',
      'Filtered by UI/UX, product design, mobile app UI, animation, and remote roles'
    ],
    bestFor: 'Product designers, UI/UX engineers, design systems creators, and visual artists.',
    deepLinks: [
      { label: 'Product Design', url: 'https://dribbble.com/jobs?category=product-design' },
      { label: 'Remote Design Jobs', url: 'https://dribbble.com/jobs?location=Remote' },
      { label: 'Freelance Design', url: 'https://dribbble.com/jobs?contract_type=freelance' }
    ],
    atsGuide: 'Embed a direct link to your live design portfolio (Figma, Framer, web) at the very top of your application.'
  },
  {
    id: 'behance-jobs',
    name: 'Behance Joblist',
    category: 'Creative & Design',
    tagline: 'Adobe’s creative showcase board featuring roles in visual art, animation, 3D, and digital media.',
    url: 'https://www.behance.net/joblist',
    color: '#0057FF',
    tags: ['Adobe Ecosystem', 'Visual Arts', 'Creative Direction'],
    features: [
      'Directly connected with Adobe Creative Cloud portfolios and enterprise agency recruiters',
      'Comprehensive search across graphic design, 3D motion, brand identity, and video production',
      'Worldwide listings spanning game studios, advertising agencies, and tech brands'
    ],
    bestFor: 'Motion designers, 3D artists, visual brand designers, and creative directors.',
    deepLinks: [
      { label: 'UI/UX & Web', url: 'https://www.behance.net/joblist?field=ui-ux' },
      { label: 'Graphic Design', url: 'https://www.behance.net/joblist?field=graphic-design' },
      { label: 'Animation & 3D', url: 'https://www.behance.net/joblist?field=animation' }
    ],
    atsGuide: 'Ensure your Behance portfolio projects contain complete process breakdowns, not just final mockups.'
  },
  {
    id: 'problogger',
    name: 'ProBlogger',
    category: 'Creative & Design',
    tagline: 'Focused job board specifically for freelance copywriters, technical writers, and content strategists.',
    url: 'https://problogger.com/jobs/',
    color: '#00A86B',
    tags: ['Technical Writing', 'Content Marketing', 'Copywriting Gigs'],
    features: [
      'Longest-standing specialized job board for digital writers, editors, and technical documentation authors',
      'Vetted client job posts paying professional per-word, per-article, or monthly retainer rates',
      'Direct employer applications with no bidding wars or middleman platform fees'
    ],
    bestFor: 'Technical writers, software documentation creators, content strategists, and copywriters.',
    deepLinks: [
      { label: 'Latest Writing Jobs', url: 'https://problogger.com/jobs/' },
      { label: 'Technical Writing', url: 'https://problogger.com/jobs/?search=technical' },
      { label: 'Remote Content', url: 'https://problogger.com/jobs/?search=remote' }
    ],
    atsGuide: 'Attach 2-3 live published writing samples in the exact domain or niche requested by the employer.'
  }
];

export const CATEGORIES = [
  'All Platforms',
  'Freshers & Internships',
  'Enterprise & Corporate',
  'Tech & Developer',
  'Remote-First',
  'Freelance & Gigs',
  'Executive & Leadership',
  'Creative & Design',
  'High-Velocity & Local',
  'Search & Aggregators',
  'Diversity & Inclusion'
];
