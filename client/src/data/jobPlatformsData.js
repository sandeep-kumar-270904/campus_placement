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

  // 9. Hirect
  {
    id: 'hirect',
    name: 'Hirect',
    category: 'Tech & Startups',
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
    category: 'Tech & Startups',
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
    category: 'Tech & Startups',
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
  }
];

export const CATEGORIES = [
  'All Platforms',
  'Enterprise & Corporate',
  'Freshers & Internships',
  'Tech & Startups',
  'High-Velocity & Local',
  'Search & Aggregators',
  'Global & Remote',
  'Diversity & Inclusion'
];
