export type InterviewCompany = {
  id: string;
  name: string;
  logo?: string;
  description: string;
  interviewFocus: {
    dsa: number; // 1-10 rating
    systemDesign: number;
    behavioral: number;
  };
  commonQuestions: {
    dsa: string[];
    systemDesign: string[];
    behavioral: string[];
  };
};

export const companies: InterviewCompany[] = [
  {
    id: "1",
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
    description:
      "Google's interviews are known for their difficulty and focus on algorithms, data structures, and system design.",
    interviewFocus: {
      dsa: 9,
      systemDesign: 8,
      behavioral: 6,
    },
    commonQuestions: {
      dsa: [
        "Number of Islands",
        "LRU Cache",
        "Word Break",
        "Merge Intervals",
        "Trapping Rain Water",
      ],
      systemDesign: [
        "Design Google Search",
        "Design YouTube",
        "Design a URL Shortener",
        "Design Google Maps",
        "Design a Distributed File System",
      ],
      behavioral: [
        "Tell me about a time you handled a disagreement with your team.",
        "How do you handle ambiguity?",
        "Tell me about a project you're most proud of.",
        "How do you make decisions when there isn't a clear answer?",
        "Tell me about a time you failed and what you learned.",
      ],
    },
  },
  {
    id: "2",
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
    description:
      "Amazon strongly emphasizes their leadership principles and expects clear examples of past behavior.",
    interviewFocus: {
      dsa: 7,
      systemDesign: 9,
      behavioral: 9,
    },
    commonQuestions: {
      dsa: [
        "Two Sum",
        "Merge K Sorted Lists",
        "Longest Palindromic Substring",
        "Maximum Subarray",
        "Design In-Memory File System",
      ],
      systemDesign: [
        "Design Amazon's Recommendation System",
        "Design Amazon's Shopping Cart",
        "Design AWS S3",
        "Design Amazon's Order Fulfillment System",
        "Design Amazon Prime Video",
      ],
      behavioral: [
        "Tell me about a time you took a calculated risk.",
        "Tell me about a time you had to deal with a tight deadline.",
        "Tell me about a time you went above and beyond for a customer.",
        "Tell me about a time you had to make a decision without having all the information.",
        "Tell me about a time you faced a significant obstacle and how you overcame it.",
      ],
    },
  },
  {
    id: "3",
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png",
    description:
      "Microsoft focuses on problem-solving ability and how candidates approach technical challenges.",
    interviewFocus: {
      dsa: 8,
      systemDesign: 7,
      behavioral: 7,
    },
    commonQuestions: {
      dsa: [
        "Reverse Linked List",
        "Binary Tree Level Order Traversal",
        "Copy List with Random Pointer",
        "String to Integer (atoi)",
        "Find the Missing Number",
      ],
      systemDesign: [
        "Design Office 365",
        "Design Azure Cloud Storage",
        "Design a Chat Service like Teams",
        "Design Xbox Live Gaming Service",
        "Design a Rate Limiter",
      ],
      behavioral: [
        "Tell me about a time you learned something new quickly.",
        "Tell me about a time you turned a failure into success.",
        "How do you handle disagreements with management?",
        "Tell me about a time you had to influence without authority.",
        "How do you respond to critical feedback?",
      ],
    },
  },
  {
    id: "4",
    name: "Meta (Facebook)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1200px-Meta_Platforms_Inc._logo.svg.png",
    description:
      "Meta interviews emphasize coding speed, efficiency, and product sensibility.",
    interviewFocus: {
      dsa: 9,
      systemDesign: 8,
      behavioral: 6,
    },
    commonQuestions: {
      dsa: [
        "Valid Parentheses",
        "Product of Array Except Self",
        "Add Two Numbers",
        "Clone Graph",
        "Minimum Remove to Make Valid Parentheses",
      ],
      systemDesign: [
        "Design Facebook News Feed",
        "Design Facebook Messenger",
        "Design Instagram",
        "Design a Content Delivery Network",
        "Design WhatsApp",
      ],
      behavioral: [
        "Tell me about a difficult technical problem you solved.",
        "Tell me about a time you built something from scratch.",
        "How do you handle disagreements with coworkers?",
        "Tell me about a time you had to make a trade-off between quality and speed.",
        "What's the most innovative project you've worked on?",
      ],
    },
  },
  {
    id: "5",
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1200px-Apple_logo_black.svg.png",
    description:
      "Apple interviews place high importance on design thinking, attention to detail, and user experience.",
    interviewFocus: {
      dsa: 6,
      systemDesign: 8,
      behavioral: 8,
    },
    commonQuestions: {
      dsa: [
        "Reverse String",
        "First Unique Character in a String",
        "Container With Most Water",
        "Group Anagrams",
        "Find Peak Element",
      ],
      systemDesign: [
        "Design Apple Music",
        "Design iCloud",
        "Design App Store",
        "Design iMessage",
        "Design Maps Navigation",
      ],
      behavioral: [
        "Tell me about a time when you had to think outside the box.",
        "How do you approach designing a new feature?",
        "Tell me about a time you had to deal with ambiguity.",
        "Tell me about a project where attention to detail was critical.",
        "How do you balance user needs with technical constraints?",
      ],
    },
  },
  {
    id: "6",
    name: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png",
    description:
      "Netflix is known for its unique culture and values freedom and responsibility in its employees.",
    interviewFocus: {
      dsa: 6,
      systemDesign: 10,
      behavioral: 8,
    },
    commonQuestions: {
      dsa: [
        "Design a Cache System",
        "Meeting Rooms II",
        "Serialize and Deserialize Binary Tree",
        "Max Sum of Rectangle No Larger Than K",
        "Sliding Window Maximum",
      ],
      systemDesign: [
        "Design Netflix's Video Streaming Service",
        "Design Netflix's Recommendation Algorithm",
        "Design a Content Delivery Network",
        "Design a System for A/B Testing",
        "Design a Distributed Logging System",
      ],
      behavioral: [
        "Tell me about a time you took a calculated risk.",
        "How do you make decisions when there's no clear right answer?",
        "Tell me about a time you received difficult feedback.",
        "How do you handle situations where you need to make quick decisions with incomplete information?",
        "Tell me about a time you had to adapt to significant changes.",
      ],
    },
  },
];

export type BehavioralQuestion = {
  id: string;
  category:
    | "leadership"
    | "teamwork"
    | "conflict"
    | "failure"
    | "success"
    | "challenge";
  question: string;
  tipForAnswer: string;
};

export const behavioralQuestions: BehavioralQuestion[] = [
  {
    id: "1",
    category: "leadership",
    question:
      "Tell me about a time when you had to lead a team through a difficult project.",
    tipForAnswer:
      "Focus on how you established direction, motivated team members, and overcame obstacles. Include specific metrics and outcomes.",
  },
  {
    id: "2",
    category: "leadership",
    question:
      "Describe a situation where you had to make an unpopular decision.",
    tipForAnswer:
      "Explain your decision-making process, how you communicated the decision, and how you handled pushback or resistance.",
  },
  {
    id: "3",
    category: "teamwork",
    question:
      "Give an example of a successful team project. What was your contribution?",
    tipForAnswer: `Balance describing the team's success with highlighting your specific role and impact. Avoid taking too much or too little credit.`,
  },
  {
    id: "4",
    category: "teamwork",
    question:
      "Tell me about a time you had to work with someone who was difficult to get along with.",
    tipForAnswer:
      "Focus on how you adapted your approach, found common ground, and achieved results despite the interpersonal challenge.",
  },
  {
    id: "5",
    category: "conflict",
    question:
      "Describe a conflict you had with a colleague and how you resolved it.",
    tipForAnswer:
      "Emphasize your conflict resolution skills, willingness to understand other perspectives, and the positive outcome achieved.",
  },
  {
    id: "6",
    category: "conflict",
    question:
      "Tell me about a time when you disagreed with your manager. How did you handle it?",
    tipForAnswer:
      "Show respect for authority while demonstrating your ability to respectfully advocate for your ideas when appropriate.",
  },
  {
    id: "7",
    category: "failure",
    question:
      "Tell me about a time you failed. What did you learn from the experience?",
    tipForAnswer:
      "Be honest about the failure, but focus on what you learned and how you applied that knowledge to subsequent situations.",
  },
  {
    id: "8",
    category: "failure",
    question: `Describe a project that didn't go as planned. How did you respond?`,
    tipForAnswer:
      "Highlight your adaptability, problem-solving skills, and resilience in the face of unexpected challenges.",
  },
  {
    id: "9",
    category: "success",
    question: "What achievement are you most proud of in your career so far?",
    tipForAnswer:
      "Choose an achievement that demonstrates skills relevant to the position and quantify the impact whenever possible.",
  },
  {
    id: "10",
    category: "success",
    question: "Tell me about a time you exceeded expectations on a project.",
    tipForAnswer:
      "Explain not just what you did, but why it was above and beyond, and how it benefited the team or organization.",
  },
  {
    id: "11",
    category: "challenge",
    question: `Describe the most challenging project you've worked on.`,
    tipForAnswer:
      "Focus on how you approached the challenge, the specific actions you took, and the positive outcome.",
  },
  {
    id: "12",
    category: "challenge",
    question:
      "Tell me about a time when you had to work under a tight deadline.",
    tipForAnswer:
      "Highlight your time management, prioritization skills, and ability to deliver quality work under pressure.",
  },
];
