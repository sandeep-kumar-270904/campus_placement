export const JOB_PLATFORMS_DATA = [
  {
    id: 'wellfound',
    name: 'Wellfound (AngelList)',
    category: 'Tech & Startups',
    tagline: 'Direct outreach to high-growth tech startups and founding teams',
    url: 'https://wellfound.com/jobs',
    color: '#000000',
    badge: 'Startup Favorite',
    features: [
      'Direct messaging with founders and hiring managers',
      'Transparent compensation, equity packages, and salary ranges upfront',
      'No recruiter spam or unverified agency intermediaries'
    ],
    bestFor: 'Engineering, product, and design roles at seed through Series C tech startups',
    proTip: 'Write a short 2-3 sentence personalized pitch citing a specific feature or GitHub repo you built instead of a generic cover letter.',
    deepLinks: [
      { label: 'Junior / Entry Roles', url: 'https://wellfound.com/jobs?role=Software+Engineer&experience=Entry-Level' },
      { label: 'Remote Engineering', url: 'https://wellfound.com/jobs?remote=true&role=Software+Engineer' },
      { label: 'Internships', url: 'https://wellfound.com/jobs?type=Internship' }
    ],
    atsGuide: 'Startups scan for GitHub links, live project URLs, and clear tech stack tags (e.g. React, Next.js, FastAPI, PostgreSQL).'
  },
  {
    id: 'yc-startup',
    name: 'Y Combinator Work at a Startup',
    category: 'Tech & Startups',
    tagline: 'One application to join 1,000+ top funded Y Combinator companies',
    url: 'https://www.workatastartup.com/',
    color: '#FF6600',
    badge: 'High Impact',
    features: [
      'Single centralized profile reviewed by hundreds of active YC founders',
      'Direct access to top 1% global engineering cultures',
      'Zero recruiter friction — founders reach out directly'
    ],
    bestFor: 'Full-stack engineers, AI researchers, and founding-engineer roles',
    proTip: 'Highlight open-source contributions, hackathon wins, and production demo URLs in your bio statement.',
    deepLinks: [
      { label: 'Software Engineering', url: 'https://www.workatastartup.com/jobs?role=eng' },
      { label: 'Internships', url: 'https://www.workatastartup.com/jobs?role=eng&type=intern' },
      { label: 'AI / ML Roles', url: 'https://www.workatastartup.com/jobs?role=eng&search=ai' }
    ],
    atsGuide: 'YC founders read profiles personally. Keep descriptions concise, metrics-driven, and focused on things you personally shipped.'
  },
  {
    id: 'unstop',
    name: 'Unstop (Dare2Compete)',
    category: 'Freshers & Internships',
    tagline: 'Hackathons, coding challenges, and direct campus hiring drives',
    url: 'https://unstop.com/jobs',
    color: '#0052CC',
    badge: 'Campus Essential',
    features: [
      'National-level hiring challenges by Tata, Amazon, Flipkart, and Walmart',
      'Direct interview fast-passes for high-ranking participants',
      'Targeted for 2025, 2026, and 2027 college graduation batches'
    ],
    bestFor: 'College students and freshers seeking competitive hiring tracks & case competitions',
    proTip: 'Participate in sponsored hackathons. Finishing in the top 50 almost always bypasses the initial resume screening round.',
    deepLinks: [
      { label: 'Fresher Jobs', url: 'https://unstop.com/jobs' },
      { label: 'College Internships', url: 'https://unstop.com/internships' },
      { label: 'Coding Contests', url: 'https://unstop.com/hackathons' }
    ],
    atsGuide: 'Ensure your college name, graduation year, CGPA, and competitive coding handles (LeetCode, CodeChef) are linked.'
  },
  {
    id: 'internshala',
    name: 'Internshala',
    category: 'Freshers & Internships',
    tagline: 'Leading internship and fresher job portal with guaranteed stipends',
    url: 'https://internshala.com/internships',
    color: '#008BD3',
    badge: 'Top for Internships',
    features: [
      'Verified minimum monthly stipend guarantee for all listings',
      'Work-from-home, in-office, and flexible part-time internship filters',
      'Transparent company response ratings and application deadlines'
    ],
    bestFor: '1st to 4th year college students seeking initial industry work experience',
    proTip: 'Always customize the "Why should you be hired?" prompt by demonstrating familiarity with their specific product.',
    deepLinks: [
      { label: 'Web Development', url: 'https://internshala.com/internships/web-development-internship' },
      { label: 'Computer Science', url: 'https://internshala.com/internships/computer-science-internship' },
      { label: 'Work from Home', url: 'https://internshala.com/internships/work-from-home-internships' }
    ],
    atsGuide: 'Companies filter by availability (e.g. "Can start immediately") and specific project links.'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Jobs',
    category: 'Big Tech & Corporate',
    tagline: 'Global professional network with direct alumni connections and recruiter inmail',
    url: 'https://www.linkedin.com/jobs/',
    color: '#0A66C2',
    badge: 'Global Giant',
    features: [
      '1-Click Easy Apply with saved resume and verified skills assessments',
      'Automatic alerts showing alumni from your university working at the hiring company',
      'Live applicant counter and recruiter search insights'
    ],
    bestFor: 'Enterprise technology giants, multinational corporations, and warm referral outreach',
    proTip: 'Filter by "Date Posted: Past 24 hours" and "Applicants: Under 10". Early applicants are viewed 3x more often.',
    deepLinks: [
      { label: 'Entry Level SDE', url: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20entry%20level' },
      { label: 'Tech Internships', url: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern' },
      { label: 'Remote Software', url: 'https://www.linkedin.com/jobs/search/?f_WT=2&keywords=software%20engineer' }
    ],
    atsGuide: 'Mirror the exact keyword phrases in the job description (e.g. "RESTful APIs", "Docker", "Unit Testing") in your resume.'
  },
  {
    id: 'cuvette',
    name: 'Cuvette Tech',
    category: 'Freshers & Internships',
    tagline: 'Verified tech internships and fresher jobs with guaranteed ₹15,000+ stipends',
    url: 'https://cuvette.tech/',
    color: '#6366F1',
    badge: 'Fast Turnaround',
    features: [
      '100% curated software engineering, frontend, and backend openings',
      'Mandatory minimum ₹15k to ₹40k monthly stipend standard',
      'Average hiring turnaround under 7 working days'
    ],
    bestFor: 'Computer science students wanting real development work without unpaid agency busywork',
    proTip: 'Take the Cuvette Platform Coding Test; scoring well automatically recommends your profile to top startups.',
    deepLinks: [
      { label: 'Full Stack Roles', url: 'https://cuvette.tech/' },
      { label: 'Backend Roles', url: 'https://cuvette.tech/' },
      { label: 'Frontend Roles', url: 'https://cuvette.tech/' }
    ],
    atsGuide: 'Highlight frameworks you have used to build full-stack deployed applications with GitHub repos.'
  },
  {
    id: 'cutshort',
    name: 'Cutshort',
    category: 'Tech & Startups',
    tagline: 'AI-driven talent matchmaking connecting developers with hiring managers',
    url: 'https://cutshort.io/',
    color: '#10B981',
    badge: 'No Ghosting',
    features: [
      'Direct WhatsApp and platform chat with verified hiring managers',
      'No Ghosting policy with compulsory status updates on applications',
      'Skill assessments that showcase your verified problem solving'
    ],
    bestFor: 'Developers seeking modern Indian tech unicorns, funded scaleups, and product firms',
    proTip: 'Take the Voila tech verification test to get the "Verified Candidate" badge for 4x recruiter views.',
    deepLinks: [
      { label: 'Frontend Jobs', url: 'https://cutshort.io/' },
      { label: 'Backend Jobs', url: 'https://cutshort.io/' },
      { label: 'Full Stack Jobs', url: 'https://cutshort.io/' }
    ],
    atsGuide: 'Ensure your current location, notice period (e.g. Immediate / College Student), and salary expectation are realistic.'
  },
  {
    id: 'instahyre',
    name: 'Instahyre',
    category: 'Tech & Startups',
    tagline: 'Reverse-recruiting platform where top tech companies compete to hire you',
    url: 'https://www.instahyre.com/',
    color: '#0D9488',
    badge: 'Reverse Hiring',
    features: [
      'InstaMatch algorithm connects you only with relevant tech companies',
      'Zero recruiter spam — employers must view and request an interview',
      'Top hiring companies: Amazon, Uber, Swiggy, Paytm, and Flipkart'
    ],
    bestFor: 'Freshers with strong project portfolios and engineers looking for high-quality inbounds',
    proTip: 'List specific database, cloud, and programming language competencies to trigger high matching scores.',
    deepLinks: [
      { label: 'Software Engineer', url: 'https://www.instahyre.com/software-engineer-jobs/' },
      { label: 'Bangalore Jobs', url: 'https://www.instahyre.com/jobs-in-bangalore/' },
      { label: 'Work From Home', url: 'https://www.instahyre.com/work-from-home-jobs/' }
    ],
    atsGuide: 'Use standard title keywords and ensure all skills are tagged from their predefined autocomplete menu.'
  },
  {
    id: 'remoteok',
    name: 'RemoteOK',
    category: 'Global & Remote',
    tagline: 'Worldwide remote developer opportunities paying in USD, EUR, and GBP',
    url: 'https://remoteok.com/',
    color: '#FF4742',
    badge: 'Global Remote',
    features: [
      '100% remote job listings verified across the US, Europe, and Asia',
      'Transparent median compensation estimates in international currencies',
      'Direct link to company application pages with no middleman'
    ],
    bestFor: 'Engineers who want to work from home for international tech teams and earn in foreign currencies',
    proTip: 'Emphasize your async communication skills, written documentation ability, and timezone flexibility.',
    deepLinks: [
      { label: 'Software Dev', url: 'https://remoteok.com/remote-dev-jobs' },
      { label: 'Junior / Intern', url: 'https://remoteok.com/remote-junior-jobs' },
      { label: 'React / Node', url: 'https://remoteok.com/remote-react-jobs' }
    ],
    atsGuide: 'International startups value clear English communication, self-starter mindset, and deployed demo links.'
  },
  {
    id: 'weworkremotely',
    name: 'We Work Remotely (WWR)',
    category: 'Global & Remote',
    tagline: 'The premier worldwide community for finding remote software engineering jobs',
    url: 'https://weworkremotely.com/',
    color: '#E05A47',
    badge: 'Trusted Global',
    features: [
      'Over 130,000 monthly applications with trusted enterprise employers',
      'Strict verification preventing low-quality or scam postings',
      'Direct application workflows linking to company Greenhouse or Lever portals'
    ],
    bestFor: 'Senior and entry-level developers looking for established remote-first organizations',
    proTip: 'Check listings between 9:00 AM and 11:00 AM EST when new US-based roles are published daily.',
    deepLinks: [
      { label: 'Full-Stack Dev', url: 'https://weworkremotely.com/categories/remote-full-stack-programming-jobs' },
      { label: 'Back-End Dev', url: 'https://weworkremotely.com/categories/remote-back-end-programming-jobs' },
      { label: 'Front-End Dev', url: 'https://weworkremotely.com/categories/remote-front-end-programming-jobs' }
    ],
    atsGuide: 'Companies typically use Lever or Greenhouse ATS. Keep resumes to standard single-column text format.'
  },
  {
    id: 'hirist',
    name: 'Hirist',
    category: 'Big Tech & Corporate',
    tagline: 'India’s premier portal for deep tech, mobile, cloud, and analytics careers',
    url: 'https://www.hirist.tech/',
    color: '#3B82F6',
    badge: 'Tech Specialist',
    features: [
      'Comprehensive categorisation by tech stack (Python, Java, Cloud, DevOps, AI)',
      'Detailed CTC breakdowns and company culture ratings',
      'Direct recruiter notification when your profile is viewed or shortlisted'
    ],
    bestFor: 'Specialized backend, full-stack, mobile, and DevOps engineers across Indian tech hubs',
    proTip: 'Highlight your preferred tech stack in your profile headline (e.g. "Full-Stack Dev | MERN + Docker + AWS").',
    deepLinks: [
      { label: 'Java / Backend', url: 'https://www.hirist.tech/c/java-jobs.html' },
      { label: 'Frontend / UI', url: 'https://www.hirist.tech/c/ui-developer-jobs.html' },
      { label: 'Fresher IT', url: 'https://www.hirist.tech/c/fresher-it-jobs.html' }
    ],
    atsGuide: 'Ensure years of experience with each technology are stated accurately in the skill grid.'
  },
  {
    id: 'gfg-jobs',
    name: 'GeeksforGeeks Job Portal',
    category: 'Freshers & Internships',
    tagline: 'Practice-to-hire platform connecting DSA problem solvers with recruiters',
    url: 'https://practice.geeksforgeeks.org/jobs',
    color: '#2F8D46',
    badge: 'DSA Mapped',
    features: [
      'Connects your GeeksforGeeks practice score directly to employer shortlists',
      'Off-campus hiring drive calendar with batch eligibility dates',
      'Mock interview questions and company-specific preparation tracks'
    ],
    bestFor: 'College students who have invested time in DSA, problem solving, and campus practice',
    proTip: 'Keep your GfG Coding Score above 200 to automatically qualify for partner company drive tests.',
    deepLinks: [
      { label: 'Internships', url: 'https://practice.geeksforgeeks.org/jobs' },
      { label: 'Off-Campus Drives', url: 'https://practice.geeksforgeeks.org/jobs' },
      { label: 'Hiring Contests', url: 'https://practice.geeksforgeeks.org/events' }
    ],
    atsGuide: 'GfG recruiters specifically check data structures solved count and contest ratings.'
  },
  {
    id: 'mlh-fellowship',
    name: 'Major League Hacking (MLH) Fellowship',
    category: 'Developer Fellowships',
    tagline: '12-week remote internship alternative contributing to real open-source software',
    url: 'https://fellowship.mlh.io/',
    color: '#D9381E',
    badge: 'Prestigious Fellowship',
    features: [
      'Earn an educational stipend while working on production open-source software',
      'Mentorship from senior engineers at GitHub, Meta, and Shopify',
      'Graduates frequently secure full-time offers at tier-1 tech firms'
    ],
    bestFor: 'Aspiring developers seeking prestigious credential alternatives to traditional internships',
    proTip: 'Submit a code sample that is clean, well-tested, and demonstrates clean architecture principles.',
    deepLinks: [
      { label: 'Open Source Track', url: 'https://fellowship.mlh.io/programs/open-source' },
      { label: 'Software Track', url: 'https://fellowship.mlh.io/programs/software-engineering' },
      { label: 'Web3 Track', url: 'https://fellowship.mlh.io/programs/web3' }
    ],
    atsGuide: 'MLH evaluators review your GitHub commit history, PR quality, and written communication during the interview.'
  },
  {
    id: 'indeed',
    name: 'Indeed',
    category: 'Big Tech & Corporate',
    tagline: 'Comprehensive job engine with company reviews and salary insights',
    url: 'https://www.indeed.com/',
    color: '#2164F3',
    badge: 'High Volume',
    features: [
      'Aggregates millions of jobs from career portals and enterprise websites',
      'Authentic employee reviews, interview feedback, and salary disclosures',
      'Simple resume upload with instant application status tracking'
    ],
    bestFor: 'Broad searches across all industries, locations, and company sizes',
    proTip: 'Use quotation marks to search exact job titles, e.g. "Junior Software Engineer" "React".',
    deepLinks: [
      { label: 'Entry Level SDE', url: 'https://www.indeed.com/q-Software-Engineer-Entry-Level-jobs.html' },
      { label: 'Software Intern', url: 'https://www.indeed.com/q-Software-Engineer-Intern-jobs.html' },
      { label: 'Remote Developer', url: 'https://www.indeed.com/q-Remote-Software-Engineer-jobs.html' }
    ],
    atsGuide: 'Keep formatting simple; Indeed parses text cleanly when headers like Experience and Education are standard.'
  },
  {
    id: 'naukri',
    name: 'Naukri.com',
    category: 'Big Tech & Corporate',
    tagline: 'India’s largest employment portal for IT services, MNCs, and corporate drives',
    url: 'https://www.naukri.com/',
    color: '#4A90E2',
    badge: 'India Largest',
    features: [
      'Highest volume of MNC and IT service company mass recruitment drives',
      'Recruiter resume search engine used by over 50,000 consultancies and corporations',
      'Walk-in drive schedules and off-campus test notifications'
    ],
    bestFor: 'Mass hiring drives at companies like TCS, Infosys, Wipro, Cognizant, and Accenture',
    proTip: 'Log in and update your resume headline at least once a week. Naukri sorts search results by "Active in last 7 days".',
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
  'Freshers & Internships',
  'Tech & Startups',
  'Global & Remote',
  'Big Tech & Corporate',
  'Developer Fellowships'
];
