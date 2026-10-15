export const LEARNING_PLATFORMS_DATA = [
  // --- CODING & DSA PRACTICE ---
  {
    id: 'leetcode',
    name: 'LeetCode',
    category: 'Coding & DSA Practice',
    pricing: 'Freemium',
    tagline: 'The gold standard for Data Structures, Algorithms, and technical FAANG interview preparation.',
    url: 'https://leetcode.com/',
    color: '#FFA116',
    tags: ['DSA', 'FAANG Interviews', 'Weekly Contests'],
    features: [
      'Over 3,000+ curated algorithmic problem challenges tagged by data structure',
      'Company-specific interview problem sets (Google, Amazon, Meta, Microsoft)',
      'Global weekly and bi-weekly rated algorithmic coding contests'
    ],
    bestFor: 'Students and engineers preparing for coding rounds and technical interviews.',
    deepLinks: [
      { label: 'Problem Set', url: 'https://leetcode.com/problemset/all/' },
      { label: 'Top Interview 150', url: 'https://leetcode.com/studyplan/top-interview-150/' },
      { label: 'Weekly Contests', url: 'https://leetcode.com/contest/' }
    ],
    learningTip: 'Solve problems by pattern (Sliding Window, Two Pointers, Trees) rather than random numbers; aim for medium-level mastery.'
  },
  {
    id: 'neetcode',
    name: 'NeetCode',
    category: 'Coding & DSA Practice',
    pricing: '100% Free & Pro',
    tagline: 'Structured DSA roadmaps with concise, visual video explanations for every problem.',
    url: 'https://neetcode.io/',
    color: '#10B981',
    tags: ['NeetCode 150', 'Blind 75', 'Video Solutions'],
    features: [
      'The famous NeetCode 150 and Blind 75 structured DSA progression tree',
      'Clean visual walkthroughs and Python/C++/Java solutions for each problem',
      'System design and object-oriented design course modules'
    ],
    bestFor: 'Candidates wanting an organized, stress-free path through LeetCode without getting overwhelmed.',
    deepLinks: [
      { label: 'NeetCode 150', url: 'https://neetcode.io/practice' },
      { label: 'Roadmap Tree', url: 'https://neetcode.io/roadmap' },
      { label: 'System Design', url: 'https://neetcode.io/courses' }
    ],
    learningTip: 'Follow the interactive roadmap branch by branch; master Arrays & Hashing before jumping into Dynamic Programming.'
  },
  {
    id: 'geeksforgeeks',
    name: 'GeeksforGeeks',
    category: 'Coding & DSA Practice',
    pricing: 'Free & Paid Tracks',
    tagline: 'India’s most comprehensive encyclopedia for computer science theory, DSA, and college placements.',
    url: 'https://www.geeksforgeeks.org/',
    color: '#2F8D46',
    tags: ['CS Theory', 'Company Archives', 'Placement Papers'],
    features: [
      'Comprehensive explanations of core CS subjects (OS, DBMS, CN, OOPs)',
      'Massive coding practice portal with Indian service & product company archives',
      'Topic-wise interview practice questions with detailed time-complexity analysis'
    ],
    bestFor: 'College students studying for both university semester exams and placement coding tests.',
    deepLinks: [
      { label: 'DSA Practice', url: 'https://practice.geeksforgeeks.org/' },
      { label: 'Core CS Subjects', url: 'https://www.geeksforgeeks.org/fundamentals-of-computer-science/' },
      { label: 'Company Archives', url: 'https://www.geeksforgeeks.org/company-preparation/' }
    ],
    learningTip: 'Use GFG articles to deeply revise theoretical concepts like ACID properties and CPU scheduling before campus interviews.'
  },
  {
    id: 'hackerrank',
    name: 'HackerRank',
    category: 'Coding & DSA Practice',
    pricing: '100% Free',
    tagline: 'Skill-assessment platform widely used by hiring companies for screening tests.',
    url: 'https://www.hackerrank.com/',
    color: '#00EA64',
    tags: ['Skill Certifications', 'Problem Solving', 'Screening Tests'],
    features: [
      'Recognized skill certification tests in Problem Solving, Python, SQL, and Java',
      'Domain tracks from basic syntax to advanced algorithms and functional coding',
      'Standard test interface identical to actual corporate hiring assessment portals'
    ],
    bestFor: 'Freshers preparing for initial online assessment (OA) rounds in campus placements.',
    deepLinks: [
      { label: 'Certifications', url: 'https://www.hackerrank.com/skills-verification' },
      { label: 'Problem Solving', url: 'https://www.hackerrank.com/domains/algorithms' },
      { label: 'SQL Practice', url: 'https://www.hackerrank.com/domains/sql' }
    ],
    learningTip: 'Earn the Problem Solving (Intermediate) and SQL (Advanced) badges and feature them on your placement resume.'
  },
  {
    id: 'codeforces',
    name: 'Codeforces',
    category: 'Coding & DSA Practice',
    pricing: '100% Free',
    tagline: 'The premier competitive programming platform hosting rated rounds and global leaderboards.',
    url: 'https://codeforces.com/',
    color: '#1F8ACB',
    tags: ['Competitive Programming', 'Elo Ratings', 'Div 2/3 Contests'],
    features: [
      'Rated 2-hour contests (Div 1, Div 2, Div 3, Div 4) every week',
      'High-speed judge testing speed, memory limits, and algorithmic efficiency',
      'World-class editorial write-ups and test-case inspection for all rounds'
    ],
    bestFor: 'Competitive coders targeting international ACM-ICPC or high-paying algorithmic HFT trading desks.',
    deepLinks: [
      { label: 'Contest Calendar', url: 'https://codeforces.com/contests' },
      { label: 'Problemset', url: 'https://codeforces.com/problemset' },
      { label: 'Rating Groups', url: 'https://codeforces.com/ratings' }
    ],
    learningTip: 'Start with Div 3 and Div 4 contests to develop quick problem-comprehension under tight time constraints.'
  },
  {
    id: 'codechef',
    name: 'CodeChef',
    category: 'Coding & DSA Practice',
    pricing: 'Free & Paid Contests',
    tagline: 'Leading Indian competitive programming community hosting monthly Starters and Cook-Offs.',
    url: 'https://www.codechef.com/',
    color: '#5B4638',
    tags: ['Indian Contests', 'Star Rating', 'Campus Chapters'],
    features: [
      'Weekly Starters contests designed specifically for college students and beginners',
      'Star rating system (1★ to 7★) recognized across Indian tech recruitment drives',
      'Extensive college chapter network with campus workshops and hackathons'
    ],
    bestFor: 'Indian college students looking to build a verified competitive programming profile.',
    deepLinks: [
      { label: 'Compete Now', url: 'https://www.codechef.com/contests' },
      { label: 'Practice Problems', url: 'https://www.codechef.com/practice' },
      { label: 'Learning Paths', url: 'https://www.codechef.com/learn' }
    ],
    learningTip: 'Aim to reach 3★ or 4★ rating on CodeChef to immediately stand out during initial resume screening.'
  },

  // --- CS & UNIVERSITY COURSES ---
  {
    id: 'harvard-cs50',
    name: 'Harvard CS50',
    category: 'CS & University Courses',
    pricing: '100% Free',
    tagline: 'Harvard University’s world-famous introduction to the intellectual enterprises of computer science.',
    url: 'https://cs50.harvard.edu/x/',
    color: '#A51C30',
    tags: ['Harvard University', 'Foundational CS', 'C / Python / SQL'],
    features: [
      'Taught by Professor David J. Malan with unmatched production quality',
      'Covers C, memory management, algorithms, Python, SQL, HTML/CSS, and Flask',
      'Rigorous real-world problem sets with free automated grading and certification'
    ],
    bestFor: 'Any student or self-taught developer wanting an elite foundation in true computer science.',
    deepLinks: [
      { label: 'CS50x Main Course', url: 'https://cs50.harvard.edu/x/' },
      { label: 'CS50 Web Dev', url: 'https://cs50.harvard.edu/web/' },
      { label: 'CS50 AI with Python', url: 'https://cs50.harvard.edu/ai/' }
    ],
    learningTip: 'Complete the Speller problem set in Week 5; it teaches low-level pointers and hash table optimization better than any textbook.'
  },
  {
    id: 'mit-ocw',
    name: 'MIT OpenCourseWare',
    category: 'CS & University Courses',
    pricing: '100% Free',
    tagline: 'Complete MIT undergraduate and graduate computer science curriculum open to the world.',
    url: 'https://ocw.mit.edu/',
    color: '#A31F34',
    tags: ['MIT Lectures', 'Algorithms (6.006)', 'Operating Systems'],
    features: [
      'Full video lectures, lecture notes, syllabus, and exams directly from MIT classrooms',
      'Legendary courses: 6.006 (Introduction to Algorithms) and 6.046 (Design and Analysis of Algorithms)',
      'Advanced systems, computer architecture, and distributed systems materials'
    ],
    bestFor: 'Engineers who want university-grade depth into algorithmic theory and systems engineering.',
    deepLinks: [
      { label: 'Intro to Algorithms (6.006)', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/' },
      { label: 'Computer Science Courses', url: 'https://ocw.mit.edu/search/?d=Electrical%20Engineering%20and%20Computer%20Science' },
      { label: 'Math for CS (6.042J)', url: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/' }
    ],
    learningTip: 'Watch Erik Demaine and Srini Devadas’ 6.006 lectures for asymptotic analysis and dynamic programming clarity.'
  },
  {
    id: 'coursera',
    name: 'Coursera',
    category: 'CS & University Courses',
    pricing: 'Freemium / Financial Aid',
    tagline: 'Accredited university degrees, professional certificates, and specializations from top institutions.',
    url: 'https://www.coursera.org/',
    color: '#0056D2',
    tags: ['Stanford / Google', 'Accredited Certs', 'Financial Aid'],
    features: [
      'Partnerships with Stanford, Princeton, Google, IBM, and top global institutions',
      'Tim Howard and Andrew Ng’s landmark Machine Learning and Deep Learning specializations',
      'Generous financial aid program providing 100% free verified certificates for students'
    ],
    bestFor: 'College students seeking globally recognized certificates from elite universities.',
    deepLinks: [
      { label: 'Computer Science', url: 'https://www.coursera.org/browse/computer-science' },
      { label: 'Google IT / Cloud', url: 'https://www.coursera.org/google-career-certificates' },
      { label: 'Algorithms Specialization', url: 'https://www.coursera.org/specializations/algorithms' }
    ],
    learningTip: 'Apply for Financial Aid on course pages; applications take ~14 days and grant full certificate access.'
  },
  {
    id: 'edx',
    name: 'edX',
    category: 'CS & University Courses',
    pricing: 'Freemium (Free Audit)',
    tagline: 'Nonprofit online learning destination founded by Harvard and MIT offering university MicroMasters.',
    url: 'https://www.edx.org/',
    color: '#02262B',
    tags: ['MIT & Harvard', 'MicroBachelors', 'Free Audit Mode'],
    features: [
      'Free audit mode allowing access to entire video libraries and reading materials',
      'MicroMasters programs granting transferable graduate academic credits',
      'Rigorous software engineering, cloud computing, and AI programs'
    ],
    bestFor: 'Learners wanting free access to Ivy League course content without paying for mandatory certificates.',
    deepLinks: [
      { label: 'Computer Science Hub', url: 'https://www.edx.org/learn/computer-science' },
      { label: 'MIT Programs', url: 'https://www.edx.org/school/mitx' },
      { label: 'Harvard Programs', url: 'https://www.edx.org/school/harvardx' }
    ],
    learningTip: 'Choose "Audit Course" during enrollment to view all video lectures and course readings completely free.'
  },
  {
    id: 'nptel',
    name: 'NPTEL / SWAYAM',
    category: 'CS & University Courses',
    pricing: 'Free Learning / Nominal Exam Fee',
    tagline: 'Indian Ministry of Education portal featuring curriculum-aligned courses taught by IIT and IISc professors.',
    url: 'https://nptel.ac.in/',
    color: '#F58220',
    tags: ['IIT & IISc', 'College Credits', 'AICTE Approved'],
    features: [
      'Taught directly by professors from IIT Madras, IIT Bombay, IIT Delhi, and IISc',
      'Officially approved by AICTE for university elective credit transfer in Indian engineering colleges',
      'Proctored in-person exams resulting in government-backed certificates'
    ],
    bestFor: 'Indian engineering students aiming for honors degrees, GATE prep, and verified IIT credentials.',
    deepLinks: [
      { label: 'Course Catalog', url: 'https://nptel.ac.in/courses' },
      { label: 'Computer Science Track', url: 'https://nptel.ac.in/courses/106' },
      { label: 'SWAYAM Portal', url: 'https://swayam.gov.in/' }
    ],
    learningTip: 'Submit weekly assignments faithfully; internal assignment scores account for 25% of your final NPTEL grade.'
  },

  // --- FULL-STACK & WEB DEV ---
  {
    id: 'freecodecamp',
    name: 'freeCodeCamp',
    category: 'Full-Stack & Web Dev',
    pricing: '100% Free Forever',
    tagline: 'World’s most respected free non-profit coding curriculum with verified project-based certifications.',
    url: 'https://www.freecodecamp.org/',
    color: '#0A0A23',
    tags: ['100% Free', 'Project Verified', 'Full Stack'],
    features: [
      '300-hour verified certifications across Responsive Web Design, JS Algorithms, and Backend APIs',
      'Hands-on interactive browser coding exercises followed by mandatory capstone projects',
      'Thousands of alumni hired at Google, Apple, Microsoft, Amazon, and Spotify'
    ],
    bestFor: 'Complete beginners and college students wanting a proven, zero-cost roadmap to full-stack mastery.',
    deepLinks: [
      { label: 'Curriculum', url: 'https://www.freecodecamp.org/learn' },
      { label: 'JS Algorithms', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/' },
      { label: 'Backend & APIs', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/' }
    ],
    learningTip: 'Do not just pass the interactive challenges; build the 5 required certification projects completely on your own.'
  },
  {
    id: 'the-odin-project',
    name: 'The Odin Project',
    category: 'Full-Stack & Web Dev',
    pricing: '100% Free',
    tagline: 'The gold standard open-source full-stack curriculum teaching real local developer workflows.',
    url: 'https://www.theodinproject.com/',
    color: '#D19A66',
    tags: ['Full Stack Node', 'Git & CLI', 'Real World Projects'],
    features: [
      'Teaches you to build on your own machine using real developer tools (Terminal, Git, VS Code, npm)',
      'Two complete specialized tracks: Full Stack JavaScript (React + Node.js) and Full Stack Ruby on Rails',
      'Vibrant community on Discord for code reviews, mentorship, and debugging help'
    ],
    bestFor: 'Learners who want to escape "tutorial hell" and learn how professional software engineers actually build.',
    deepLinks: [
      { label: 'Foundations', url: 'https://www.theodinproject.com/paths/foundations/courses/foundations' },
      { label: 'Full Stack JS', url: 'https://www.theodinproject.com/paths/full-stack-javascript' },
      { label: 'All Paths', url: 'https://www.theodinproject.com/paths' }
    ],
    learningTip: 'Complete the Foundations path first; it sets up your Git command-line muscle memory properly.'
  },
  {
    id: 'roadmap-sh',
    name: 'Roadmap.sh',
    category: 'Full-Stack & Web Dev',
    pricing: '100% Free',
    tagline: 'Community-driven visual roadmaps and study guides for modern developer career paths.',
    url: 'https://roadmap.sh/',
    color: '#FACC15',
    tags: ['Visual Paths', 'Frontend / Backend', 'DevOps / AI'],
    features: [
      'Interactive, node-by-node career roadmaps for Frontend, Backend, DevOps, AI, and Android',
      'Curated learning resources and documentation links for every single technical concept',
      'Skill assessments and custom progress tracking features'
    ],
    bestFor: 'Anyone confused about what technologies to learn next in what logical sequence.',
    deepLinks: [
      { label: 'Frontend Roadmap', url: 'https://roadmap.sh/frontend' },
      { label: 'Backend Roadmap', url: 'https://roadmap.sh/backend' },
      { label: 'DevOps Roadmap', url: 'https://roadmap.sh/devops' }
    ],
    learningTip: 'Bookmark the Backend or Frontend roadmap and check off topics as you build full-stack portfolio projects.'
  },
  {
    id: 'frontend-masters',
    name: 'Frontend Masters',
    category: 'Full-Stack & Web Dev',
    pricing: 'Subscription / Free Student Pack',
    tagline: 'Deep-dive workshops taught by lead engineers and architects from Netflix, Stripe, and Google.',
    url: 'https://frontendmasters.com/',
    color: '#C02D28',
    tags: ['Expert Workshops', 'Deep JS Engine', 'Architecture'],
    features: [
      'Courses taught by industry legends like Kyle Simpson, Will Sentance, and Sarah Drasner',
      'Deep dives into JavaScript under the hood, V8 engine execution, React internals, and TypeScript',
      'Free 6-month full membership included in the GitHub Student Developer Pack'
    ],
    bestFor: 'Intermediate developers wanting to bridge the gap from junior to senior software engineer.',
    deepLinks: [
      { label: 'Learning Paths', url: 'https://frontendmasters.com/learn/' },
      { label: 'JavaScript Hard Parts', url: 'https://frontendmasters.com/courses/javascript-hard-parts-v2/' },
      { label: 'Free Student Access', url: 'https://frontendmasters.com/welcome/github-student-pack/' }
    ],
    learningTip: 'Claim your GitHub Student Developer Pack to unlock 6 months of Frontend Masters for free.'
  },
  {
    id: 'scrimba',
    name: 'Scrimba',
    category: 'Full-Stack & Web Dev',
    pricing: 'Freemium',
    tagline: 'Revolutionary interactive screencasts where you can pause the video and edit the code directly.',
    url: 'https://scrimba.com/',
    color: '#6C5CE7',
    tags: ['Interactive Screencasts', 'React Career Path', 'Live Code Editing'],
    features: [
      'Unique audio-code format: click anywhere inside the teacher’s video to start editing their code',
      'The Frontend Developer Career Path with Bob Ziroll and top instructors',
      'Dozens of free interactive mini-bootcamps covering React, CSS Grid, and JavaScript'
    ],
    bestFor: 'Visual and kinesthetic learners who get bored watching passive video tutorials.',
    deepLinks: [
      { label: 'Free Courses', url: 'https://scrimba.com/all-courses?price=free' },
      { label: 'Learn React for Free', url: 'https://scrimba.com/learn/learnreact' },
      { label: 'Frontend Career Path', url: 'https://scrimba.com/learn/frontend' }
    ],
    learningTip: 'Take Bob Ziroll’s free React course; its interactive micro-drills make component state click instantly.'
  },
  {
    id: 'codecademy',
    name: 'Codecademy',
    category: 'Full-Stack & Web Dev',
    pricing: 'Freemium',
    tagline: 'Beginner-friendly in-browser coding lessons with immediate feedback and structured tracks.',
    url: 'https://www.codecademy.com/',
    color: '#1F2430',
    tags: ['Syntax Foundations', 'In-Browser Editor', 'Beginner Friendly'],
    features: [
      'Zero installation required; write code and receive instant automated test validation',
      'Free introductory tracks in Python 3, JavaScript, HTML/CSS, SQL, and C++',
      'Career paths featuring portfolio project prompts and interview prep modules'
    ],
    bestFor: 'Absolute beginners learning their very first programming language syntax.',
    deepLinks: [
      { label: 'Free Course Catalog', url: 'https://www.codecademy.com/catalog/all' },
      { label: 'Learn Python 3', url: 'https://www.codecademy.com/learn/learn-python-3' },
      { label: 'Learn SQL', url: 'https://www.codecademy.com/learn/learn-sql' }
    ],
    learningTip: 'Use Codecademy to learn syntax in 1 week, then transition to building projects on The Odin Project.'
  },

  // --- SYSTEM DESIGN & INTERVIEW PREP ---
  {
    id: 'bytebytego',
    name: 'ByteByteGo',
    category: 'System Design & Interview',
    pricing: 'Freemium & Book',
    tagline: 'Alex Xu’s visual system design platform simplifying complex distributed architecture.',
    url: 'https://bytebytego.com/',
    color: '#00A3C4',
    tags: ['System Design', 'Distributed Systems', 'Alex Xu'],
    features: [
      'Stunning step-by-step visual architecture diagrams for real-world distributed systems',
      'Deep case studies: Design YouTube, Twitter, Rate Limiter, Payment System, Distributed Locking',
      'Weekly newsletter breaking down real architecture incidents at Netflix, Stripe, and Discord'
    ],
    bestFor: 'Developers preparing for mid-to-senior technical system design interview rounds.',
    deepLinks: [
      { label: 'System Design Course', url: 'https://bytebytego.com/courses/system-design-interview' },
      { label: 'Architecture Newsletter', url: 'https://blog.bytebytego.com/' },
      { label: 'Free System Design Guide', url: 'https://bytebytego.com/' }
    ],
    learningTip: 'Memorize common estimation numbers (latency numbers every programmer should know) to ace design estimates.'
  },
  {
    id: 'takeuforward',
    name: 'takeUforward (Striver)',
    category: 'System Design & Interview',
    pricing: '100% Free',
    tagline: 'Striver’s legendary A2Z DSA sheet and SDE preparation roadmaps for Indian campus placements.',
    url: 'https://takeuforward.org/',
    color: '#DC2626',
    tags: ['Striver A2Z Sheet', 'SDE Core Sheet', 'FAANG Placement'],
    features: [
      'Striver’s A2Z DSA Course sheet: 450+ curated problems with video explanations in C++ and Java',
      'Core subject interview sheets covering Operating Systems, DBMS, and Object-Oriented Design',
      'Curated Blind 75 and SDE placement challenge sheets tested across top engineering colleges'
    ],
    bestFor: 'Indian college students and freshers targeting Tier-1 product companies and SDE-1 roles.',
    deepLinks: [
      { label: 'Striver A2Z DSA Sheet', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2' },
      { label: 'SDE Sheet', url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/' },
      { label: 'Core CS Sheets', url: 'https://takeuforward.org/os-dbms-cn/' }
    ],
    learningTip: 'Work through Striver’s SDE Sheet 3 months before placement season begins; it maps directly to standard OA questions.'
  },
  {
    id: 'algoexpert',
    name: 'AlgoExpert',
    category: 'System Design & Interview',
    pricing: 'Subscription',
    tagline: 'Curated technical interview platform created by ex-Google and ex-Facebook engineers.',
    url: 'https://www.algoexpert.io/',
    color: '#007BFF',
    tags: ['AlgoExpert', 'SystemsExpert', 'Mock Interviews'],
    features: [
      '200 rigorously vetted coding interview questions with video explanations in 9 languages',
      'Integrated SystemsExpert module covering 25 comprehensive system design architectures',
      'Mock interview matchmaking tool to practice live whiteboarding with peers'
    ],
    bestFor: 'Candidates preparing for Tier-1 FAANG and unicorn SDE interviews wanting an all-in-one bundle.',
    deepLinks: [
      { label: 'Coding Interview Prep', url: 'https://www.algoexpert.io/product' },
      { label: 'SystemsExpert', url: 'https://www.algoexpert.io/systems/product' },
      { label: 'Mock Interviews', url: 'https://www.algoexpert.io/mock-interviews' }
    ],
    learningTip: 'Use their 4-pane workspace (prompt, editor, test cases, and scratchpad) to simulate genuine interview coding environments.'
  },
  {
    id: 'educative',
    name: 'Educative.io',
    category: 'System Design & Interview',
    pricing: 'Freemium / Subscription',
    tagline: 'Text-based interactive courses with embedded cloud sandboxes allowing faster learning without video fatigue.',
    url: 'https://www.educative.io/',
    color: '#0D9488',
    tags: ['Grokking System Design', 'Text-Based', 'Zero Video Scrubbing'],
    features: [
      'Home of the famous "Grokking the System Design Interview" and "Grokking Modern System Design"',
      'Text-first interactive format: read, run code directly in the browser, and test understanding immediately',
      'Comprehensive paths for API Design, Distributed Systems, and Concurrency in Go/Java'
    ],
    bestFor: 'Engineers who prefer reading and hands-on terminal sandboxes over slow video lecture scrubbing.',
    deepLinks: [
      { label: 'Grokking System Design', url: 'https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers' },
      { label: 'Free Courses', url: 'https://www.educative.io/explore?type=free' },
      { label: 'Coding Patterns', url: 'https://www.educative.io/courses/grokking-coding-interview-patterns-python' }
    ],
    learningTip: 'Study the "Grokking the Coding Interview: Patterns" course to recognize algorithm archetypes instantly.'
  },
  {
    id: 'interviewbit',
    name: 'InterviewBit',
    category: 'System Design & Interview',
    pricing: '100% Free',
    tagline: 'Gamified placement prep platform with strict countdown timers simulating actual coding tests.',
    url: 'https://www.interviewbit.com/',
    color: '#F37021',
    tags: ['Timed Tests', 'Company Tracks', 'Mock Interviews'],
    features: [
      'Strict timer-based problem sets that penalize hints to mimic high-stakes recruitment exams',
      'Company-tailored interview tracks (Amazon, Microsoft, Adobe, Directi, Flipkart)',
      'Detailed streak tracking and placement readiness scoring dashboard'
    ],
    bestFor: 'College students wanting to build fast problem-solving speed under pressure.',
    deepLinks: [
      { label: 'Practice Problems', url: 'https://www.interviewbit.com/practice/' },
      { label: 'Company Tracks', url: 'https://www.interviewbit.com/search/?q=company' },
      { label: 'System Design', url: 'https://www.interviewbit.com/courses/system-design/' }
    ],
    learningTip: 'Solve problems on InterviewBit without checking the solution tab to develop genuine algorithmic endurance.'
  },

  // --- AI, ML & DATA SCIENCE ---
  {
    id: 'deeplearning-ai',
    name: 'DeepLearning.AI',
    category: 'AI, ML & Data Science',
    pricing: 'Freemium / Free Short Courses',
    tagline: 'Founded by AI pioneer Andrew Ng, delivering premier generative AI and deep learning curricula.',
    url: 'https://www.deeplearning.ai/',
    color: '#1E3A8A',
    tags: ['Andrew Ng', 'Generative AI', 'Deep Learning Specialization'],
    features: [
      'The definitive Deep Learning Specialization and Machine Learning Specialization with Stanford',
      'Free 1-hour short courses with industry partners (OpenAI, LangChain, Anthropic, AWS)',
      'Cutting-edge coverage of LLMs, Prompt Engineering, RAG architectures, and AI Agents'
    ],
    bestFor: 'Anyone wanting to understand modern deep learning and production generative AI systems.',
    deepLinks: [
      { label: 'Free Short Courses', url: 'https://www.deeplearning.ai/short-courses/' },
      { label: 'ML Specialization', url: 'https://www.deeplearning.ai/courses/machine-learning-specialization/' },
      { label: 'Generative AI for Everyone', url: 'https://www.deeplearning.ai/courses/generative-ai-for-everyone/' }
    ],
    learningTip: 'Take the free 1-hour short courses on LangChain and RAG to learn production AI application development in an afternoon.'
  },
  {
    id: 'kaggle',
    name: 'Kaggle Learn',
    category: 'AI, ML & Data Science',
    pricing: '100% Free',
    tagline: 'Practical, bite-sized micro-courses paired with free GPU-backed Jupyter notebooks.',
    url: 'https://www.kaggle.com/learn',
    color: '#20BEFF',
    tags: ['Hands-On Notebooks', 'Free GPU', 'Data Competitions'],
    features: [
      'Interactive micro-courses (Python, Pandas, Machine Learning, Deep Learning, Feature Engineering)',
      'Free cloud Jupyter notebooks with 30+ hours/week of dedicated NVIDIA GPU/TPU access',
      'World-famous competitive data science leaderboards and open datasets'
    ],
    bestFor: 'Aspiring data scientists and ML engineers wanting to work on real-world datasets with free cloud GPUs.',
    deepLinks: [
      { label: 'Kaggle Micro-Courses', url: 'https://www.kaggle.com/learn' },
      { label: 'Intro to Machine Learning', url: 'https://www.kaggle.com/learn/intro-to-machine-learning' },
      { label: 'Datasets', url: 'https://www.kaggle.com/datasets' }
    ],
    learningTip: 'Complete the Intro to ML course, then submit an entry to the classic "Titanic" or "House Prices" competition.'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Learn',
    category: 'AI, ML & Data Science',
    pricing: '100% Free',
    tagline: 'The open-source AI community’s official courses on Transformers, NLP, and Diffusion Models.',
    url: 'https://huggingface.co/learn',
    color: '#FFD21E',
    tags: ['Transformers', 'Open Source Models', 'PyTorch / NLP'],
    features: [
      'In-depth, hands-on Hugging Face NLP course teaching how to fine-tune transformers with PyTorch',
      'Deep reinforcement learning and diffusion models course with interactive community spaces',
      'Hands-on deployment of models onto Hugging Face Spaces with Gradio'
    ],
    bestFor: 'AI engineers wanting to work with state-of-the-art open-source LLMs and fine-tuning pipelines.',
    deepLinks: [
      { label: 'NLP Course', url: 'https://huggingface.co/learn/nlp-course' },
      { label: 'Deep RL Course', url: 'https://huggingface.co/learn/deep-rl-course' },
      { label: 'Audio Course', url: 'https://huggingface.co/learn/audio-course' }
    ],
    learningTip: 'Follow the NLP Course Chapter 3 to learn how to fine-tune a BERT model on your own dataset in 10 lines of code.'
  },
  {
    id: 'fast-ai',
    name: 'Fast.ai',
    category: 'AI, ML & Data Science',
    pricing: '100% Free',
    tagline: 'Top-down practical deep learning for coders, making neural networks accessible without math PhDs.',
    url: 'https://www.fast.ai/',
    color: '#4F46E5',
    tags: ['Top-Down ML', 'PyTorch', 'Practical Deep Learning'],
    features: [
      'Created by Jeremy Howard, former Kaggle Chief Scientist and President',
      'Top-down teaching style: get high-accuracy models running in Lesson 1 before diving into calculus',
      'Complete coverage of computer vision, NLP, tabular data, and collaborative filtering'
    ],
    bestFor: 'Programmers who prefer coding working models immediately rather than getting stuck in theoretical math proofs.',
    deepLinks: [
      { label: 'Practical Deep Learning Course', url: 'https://course.fast.ai/' },
      { label: 'Course Forum', url: 'https://forums.fast.ai/' },
      { label: 'Fastai Library', url: 'https://docs.fast.ai/' }
    ],
    learningTip: 'Follow Jeremy Howard’s advice: train a model on your own quirky dataset and write a blog post about what broke.'
  },
  {
    id: 'datacamp',
    name: 'DataCamp',
    category: 'AI, ML & Data Science',
    pricing: 'Freemium',
    tagline: 'Interactive browser-based training in Python, R, SQL, and data engineering pathways.',
    url: 'https://www.datacamp.com/',
    color: '#03EF62',
    tags: ['Data Engineering', 'SQL & Python', 'Career Tracks'],
    features: [
      'Step-by-step interactive coding exercises in Python, SQL, Power BI, and Tableau',
      'Complete career tracks: Data Analyst, Data Scientist, and Machine Learning Scientist',
      'Automated code assessment checking syntax, logic, and output values'
    ],
    bestFor: 'Business analysts, data analysts, and developers wanting structured SQL and data manipulation drills.',
    deepLinks: [
      { label: 'Free Chapters', url: 'https://www.datacamp.com/courses' },
      { label: 'Data Analyst Track', url: 'https://www.datacamp.com/tracks/data-analyst-with-python' },
      { label: 'SQL Fundamentals', url: 'https://www.datacamp.com/tracks/sql-fundamentals' }
    ],
    learningTip: 'Practice SQL queries daily on DataCamp to easily clear the DBMS and data analysis technical test rounds.'
  },

  // --- CLOUD, DEVOPS & SECURITY ---
  {
    id: 'aws-skill-builder',
    name: 'AWS Skill Builder',
    category: 'Cloud, DevOps & Security',
    pricing: 'Free & Subscriptions',
    tagline: 'Amazon Web Services’ official learning center featuring 600+ free cloud digital courses.',
    url: 'https://skillbuilder.aws/',
    color: '#FF9900',
    tags: ['Official AWS', 'Cloud Certifications', 'Hands-On Labs'],
    features: [
      'Direct curriculum from AWS experts covering Cloud Practitioner, Solutions Architect, and SysOps',
      'Interactive AWS Cloud Quest gamified role-playing game teaching real infrastructure deployment',
      'Official practice exam questions and certification readiness blueprints'
    ],
    bestFor: 'Engineers preparing for AWS Certified Solutions Architect or Cloud Practitioner exams.',
    deepLinks: [
      { label: 'Free Course Catalog', url: 'https://explore.skillbuilder.aws/learn/catalog' },
      { label: 'Cloud Quest Game', url: 'https://aws.amazon.com/training/digital/aws-cloud-quest/' },
      { label: 'Certification Prep', url: 'https://explore.skillbuilder.aws/learn/category/28/certification-preparation' }
    ],
    learningTip: 'Complete the free "AWS Cloud Practitioner Essentials" course before attempting the official exam.'
  },
  {
    id: 'gcp-skills-boost',
    name: 'Google Cloud Skills Boost',
    category: 'Cloud, DevOps & Security',
    pricing: 'Freemium (Free Credits)',
    tagline: 'Official training hub for Google Cloud Platform, BigQuery, Kubernetes, and Vertex AI.',
    url: 'https://www.cloudskillsboost.google/',
    color: '#4285F4',
    tags: ['Google Cloud', 'Kubernetes / GKE', 'Hands-On Labs'],
    features: [
      'Real GCP console access via temporary sandboxed accounts (no credit card risk)',
      'Skill Badges shareable directly to LinkedIn and digital placement resumes',
      'Specialized learning paths in Data Engineering, Cloud DevOps, and Machine Learning'
    ],
    bestFor: 'Developers learning containerization, Kubernetes, and enterprise Google Cloud infrastructure.',
    deepLinks: [
      { label: 'Course Catalog', url: 'https://www.cloudskillsboost.google/catalog' },
      { label: 'Cloud Engineer Path', url: 'https://www.cloudskillsboost.google/paths/11' },
      { label: 'Generative AI Path', url: 'https://www.cloudskillsboost.google/paths/118' }
    ],
    learningTip: 'Look out for official "Google Cloud Arcade" events to earn free lab credits and physical swag.'
  },
  {
    id: 'microsoft-learn',
    name: 'Microsoft Learn',
    category: 'Cloud, DevOps & Security',
    pricing: '100% Free',
    tagline: 'Free, interactive learning modules for Azure cloud, C#, .NET, GitHub, and Power Platform.',
    url: 'https://learn.microsoft.com/',
    color: '#0078D4',
    tags: ['100% Free', 'Azure Cloud', 'C# & GitHub'],
    features: [
      'Completely free sandbox environments to practice Azure commands without an Azure subscription',
      'Official preparation paths for AZ-900 (Azure Fundamentals), DP-900, and AI-900 certifications',
      'Official Foundational C# Certification launched in collaboration with freeCodeCamp'
    ],
    bestFor: 'College students seeking enterprise cloud knowledge and free Microsoft certification credentials.',
    deepLinks: [
      { label: 'Azure Fundamentals (AZ-900)', url: 'https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/' },
      { label: 'Free C# Certification', url: 'https://learn.microsoft.com/en-us/training/paths/get-started-c-sharp-part-1/' },
      { label: 'All Learning Paths', url: 'https://learn.microsoft.com/en-us/training/browse/' }
    ],
    learningTip: 'Earn the free Microsoft Learn C# certification; it is validated directly on freeCodeCamp and verifiable by recruiters.'
  },
  {
    id: 'tryhackme',
    name: 'TryHackMe',
    category: 'Cloud, DevOps & Security',
    pricing: 'Freemium',
    tagline: 'Gamified, hands-on cybersecurity training taught through browser-based virtual labs.',
    url: 'https://tryhackme.com/',
    color: '#E53E3E',
    tags: ['Hands-On Cyber', 'Virtual Attack Labs', 'Gamified Security'],
    features: [
      'Pre-configured target machines deployable inside your browser with step-by-step guidance',
      'Beginner-friendly learning paths: Pre-Security, Complete Beginner, and Web Fundamentals',
      'Covers practical penetration testing, network sniffing, burp suite, and defensive security'
    ],
    bestFor: 'Students curious about cybersecurity, ethical hacking, and secure backend engineering.',
    deepLinks: [
      { label: 'Learning Paths', url: 'https://tryhackme.com/hacktivities' },
      { label: 'Pre-Security Path', url: 'https://tryhackme.com/path/outline/presecurity' },
      { label: 'Web Fundamentals', url: 'https://tryhackme.com/path/outline/web' }
    ],
    learningTip: 'Work through the Web Fundamentals path to understand how SQL injection and XSS attacks happen in production apps.'
  },
  {
    id: 'hackthebox',
    name: 'Hack The Box',
    category: 'Cloud, DevOps & Security',
    pricing: 'Freemium',
    tagline: 'The premier hands-on cybersecurity platform for real-world offensive and defensive penetration testing.',
    url: 'https://www.hackthebox.com/',
    color: '#9FEF00',
    tags: ['Advanced Pentesting', 'CTF Challenges', 'Industry Standard'],
    features: [
      'Realistic corporate network machines and Capture The Flag (CTF) challenges',
      'HTB Academy providing modular courses from basic Linux fundamentals to binary exploitation',
      'Recognized by top cybersecurity firms and corporate security operations centers (SOCs)'
    ],
    bestFor: 'Intermediate-to-advanced learners pursuing careers as security engineers or ethical hackers.',
    deepLinks: [
      { label: 'HTB Academy', url: 'https://academy.hackthebox.com/' },
      { label: 'Labs & Challenges', url: 'https://www.hackthebox.com/hacker/labs' },
      { label: 'Career Paths', url: 'https://www.hackthebox.com/hacker/certifications' }
    ],
    learningTip: 'Start with HTB Academy’s "Linux Fundamentals" and "Setting up a Target Machine" before tackling active boxes.'
  },

  // --- VIDEO & SKILL LIBRARIES ---
  {
    id: 'udemy',
    name: 'Udemy',
    category: 'Video & Skill Libraries',
    pricing: 'Affordable One-Time Courses',
    tagline: 'World’s largest online marketplace with 200,000+ courses by top industry practitioners.',
    url: 'https://www.udemy.com/',
    color: '#A435F0',
    tags: ['Comprehensive Bootcamps', 'Lifetime Access', 'Real-World Projects'],
    features: [
      'Top-rated developer bootcamps by Angela Yu, Colt Steele, Maximilian Schwarzmüller, and Stephen Grider',
      'Affordable pricing during regular sales ($10-$15 / ₹499-₹699) with lifetime access and updates',
      'Covers niche frameworks, modern full-stack web development, and cloud certification crash courses'
    ],
    bestFor: 'Learners seeking comprehensive 60+ hour project-driven bootcamps on specific modern frameworks.',
    deepLinks: [
      { label: 'Web Development', url: 'https://www.udemy.com/topic/web-development/' },
      { label: 'Python Bootcamps', url: 'https://www.udemy.com/topic/python/' },
      { label: 'AWS Certifications', url: 'https://www.udemy.com/topic/aws-certified-solutions-architect-associate/' }
    ],
    learningTip: 'Never pay full price on Udemy; wait for their weekly flash sales where top courses drop to ₹499 or $12.99.'
  },
  {
    id: 'pluralsight',
    name: 'Pluralsight',
    category: 'Video & Skill Libraries',
    pricing: 'Subscription / Free Trial',
    tagline: 'Enterprise tech skill development platform with Skill IQ assessments and curated paths.',
    url: 'https://www.pluralsight.com/',
    color: '#F80067',
    tags: ['Skill IQ Assessment', 'Enterprise Grade', 'Curated Paths'],
    features: [
      'Skill IQ assessment tool quantifying your exact skill level compared to other engineers',
      'In-depth enterprise courses covering C#, Java, Cloud, Kubernetes, and software architecture',
      'Path-based curriculum curated to take developers from novice to proficient'
    ],
    bestFor: 'Software developers seeking structured enterprise skill upgrades and skill verification.',
    deepLinks: [
      { label: 'Skill IQ Assessments', url: 'https://www.pluralsight.com/product/skill-iq' },
      { label: 'Software Development', url: 'https://www.pluralsight.com/browse/software-development' },
      { label: 'Cloud Computing', url: 'https://www.pluralsight.com/browse/cloud-computing' }
    ],
    learningTip: 'Take a Skill IQ test in your primary language every 6 months to benchmark your growth.'
  },
  {
    id: 'udacity',
    name: 'Udacity',
    category: 'Video & Skill Libraries',
    pricing: 'Nanodegree Subscription',
    tagline: 'Career-focused Nanodegree programs co-created with Google, AWS, Mercedes, and Nvidia.',
    url: 'https://www.udacity.com/',
    color: '#01B3E3',
    tags: ['Nanodegrees', 'Code Reviewers', 'Industry Co-Created'],
    features: [
      'Comprehensive Nanodegrees in AI, Autonomous Systems, Cloud Architecture, and Data Engineering',
      'Real human code reviews on every submitted project within 24 hours',
      'Free catalog of standalone introductory video courses'
    ],
    bestFor: 'Learners wanting personalized human feedback on complex capstone coding projects.',
    deepLinks: [
      { label: 'Free Course Catalog', url: 'https://www.udacity.com/courses/all?price=Free' },
      { label: 'AI Nanodegrees', url: 'https://www.udacity.com/school-of-ai' },
      { label: 'Cloud Computing', url: 'https://www.udacity.com/school-of-cloud' }
    ],
    learningTip: 'Filter Udacity’s course catalog by "Free" to find dozens of free foundational courses co-created with Google.'
  }
];

export const LEARNING_CATEGORIES = [
  'All Platforms',
  'Coding & DSA Practice',
  'CS & University Courses',
  'Full-Stack & Web Dev',
  'System Design & Interview',
  'AI, ML & Data Science',
  'Cloud, DevOps & Security',
  'Video & Skill Libraries'
];
