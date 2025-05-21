export type SystemDesignCase = {
  id: string;
  title: string;
  summary: string;
  problem: string;
  techStack: string[];
  requirements: {
    functional: string[];
    nonFunctional: string[];
  };
  diagram: string;
  tradeoffs: Array<{
    title: string;
    pros: string[];
    cons: string[];
  }>;
  createdAt: string;
  resources?: Array<{
    title: string;
    url: string;
  }>;
};

export type ScalabilityPattern = {
  id: string;
  name: string;
  description: string;
  useCases: string[];
  benefits: string[];
  drawbacks?: string[];
};

export type MetricsData = {
  id: string;
  system: string;
  environment: string;
  qps: number;
  latency: number;
  storage: number;
  cacheHitRatio: number;
  date: string;
  notes?: string;
};

export const systemDesignCases: SystemDesignCase[] = [
  {
    id: "sdc1",
    title: "URL Shortener Service",
    summary: "Design a URL shortening service like TinyURL or Bitly.",
    problem:
      "Design a service that takes a long URL and converts it into a shorter, more manageable URL. The service should redirect users to the original URL when they access the shortened version.",
    techStack: ["Node.js", "Redis", "PostgreSQL", "Load Balancer", "CDN"],
    requirements: {
      functional: [
        "Generate a short URL from a long URL",
        "Redirect to the original URL when accessing the short URL",
        "Custom short URLs for premium users",
        "Analytics for URL access",
      ],
      nonFunctional: [
        "High availability (99.9% uptime)",
        "Low latency redirects (<100ms)",
        "Scalable to handle millions of URLs",
        "Secure against malicious URLs",
      ],
    },
    diagram: `graph TD
      A[Client] -->|1. Request Short URL| B[Load Balancer]
      B -->|2. Forward Request| C[Application Servers]
      C -->|3. Check Cache| D[Redis Cache]
      D -->|4. Cache Miss| C
      C -->|5. Generate Hash| C
      C -->|6. Store URL Mapping| E[Database]
      C -->|7. Return Short URL| B
      B -->|8. Return Short URL| A
      
      F[User] -->|1. Access Short URL| G[Load Balancer]
      G -->|2. Forward Request| H[Application Servers]
      H -->|3. Check Cache| I[Redis Cache]
      I -->|4. Return Original URL| H
      H -->|5. Cache Miss| H
      H -->|6. Query URL| J[Database]
      J -->|7. Return Original URL| H
      H -->|8. Update Analytics| K[Analytics DB]
      H -->|9. Redirect| G
      G -->|10. Redirect to Original URL| F`,
    tradeoffs: [
      {
        title: "Hash Function vs. Counter-based ID Generation",
        pros: [
          "Hash functions provide quick generation",
          "Reduced database lookups",
          "Can check for duplicates easily",
        ],
        cons: [
          "Potential for collisions",
          "Fixed-length output may be longer than needed",
          "May leak information about original URL",
        ],
      },
      {
        title: "NoSQL vs. Relational Database",
        pros: [
          "NoSQL scales horizontally more easily",
          "Better for write-heavy workloads",
          "Flexible schema for analytics",
        ],
        cons: [
          "Less consistency guarantees",
          "More complex querying for analytics",
          "May require additional infrastructure",
        ],
      },
    ],
    createdAt: "2023-04-15",
    resources: [
      {
        title: "System Design: URL Shortener",
        url: "https://example.com/blog/system-design-url-shortener",
      },
      {
        title: "Designing a URL Shortening service like TinyURL",
        url: "https://example.com/blog/designing-tinyurl",
      },
    ],
  },
  {
    id: "sdc2",
    title: "Distributed Cache System",
    summary:
      "Design a distributed in-memory caching system like Redis or Memcached.",
    problem:
      "Create a high-performance, distributed caching solution that can help reduce database load and improve application response times across multiple services.",
    techStack: ["Go", "gRPC", "Consistent Hashing", "Raft Consensus"],
    requirements: {
      functional: [
        "Store and retrieve key-value pairs",
        "Set expiration times on keys",
        "Support for atomic operations",
        "Cluster management and data replication",
      ],
      nonFunctional: [
        "High throughput (100K+ operations/second)",
        "Low latency (<10ms per operation)",
        "Fault-tolerant with no single point of failure",
        "Horizontally scalable",
      ],
    },
    diagram: `graph TD
      A[Client] -->|1. Cache Request| B[Load Balancer]
      B -->|2. Route Request| C[Cache Proxy]
      C -->|3. Consistent Hashing| C
      C -->|4. Forward to Shard| D[Cache Shard 1]
      C -->|5. Forward to Shard| E[Cache Shard 2]
      C -->|6. Forward to Shard| F[Cache Shard 3]
      
      D -->|7. Replicate| G[Replica 1-1]
      D -->|8. Replicate| H[Replica 1-2]
      E -->|9. Replicate| I[Replica 2-1]
      E -->|10. Replicate| J[Replica 2-2]
      F -->|11. Replicate| K[Replica 3-1]
      F -->|12. Replicate| L[Replica 3-2]
      
      M[Cache Manager] -->|13. Monitor| D
      M -->|14. Monitor| E
      M -->|15. Monitor| F
      M -->|16. Rebalance| C`,
    tradeoffs: [
      {
        title: "In-Memory vs. Persistent Storage",
        pros: [
          "In-memory provides extremely low latency",
          "Simple architecture with fewer components",
          "Higher throughput for read/write operations",
        ],
        cons: [
          "Data loss on node failure unless replicated",
          "Memory constraints limit storage capacity",
          "Higher cost per GB compared to disk storage",
        ],
      },
      {
        title: "Eviction Policies",
        pros: [
          "LRU is simple and effective for most workloads",
          "LFU better preserves frequently accessed items",
          "TTL prevents stale data accumulation",
        ],
        cons: [
          "No single policy works best for all workloads",
          "Complex policies add computational overhead",
          "Difficult to predict cache hit rates",
        ],
      },
    ],
    createdAt: "2023-05-23",
  },
  {
    id: "sdc3",
    title: "Real-time Chat System",
    summary:
      "Design a scalable real-time messaging application like Slack or Discord.",
    problem:
      "Build a messaging system that supports real-time communication between users, with features like group chats, direct messages, and message persistence.",
    techStack: ["WebSockets", "Node.js", "MongoDB", "Redis", "Kafka"],
    requirements: {
      functional: [
        "Send and receive messages in real-time",
        "Support for group and private conversations",
        "Message history and search",
        "Offline message delivery",
        "Read receipts and typing indicators",
      ],
      nonFunctional: [
        "Low latency message delivery (<500ms)",
        "Scalable to millions of concurrent users",
        "Reliable message delivery",
        "End-to-end encryption for private messages",
      ],
    },
    diagram: `graph TD
      A[Client] -->|1. WebSocket Connection| B[Load Balancer]
      B -->|2. Connect to Socket Server| C[Socket Server Cluster]
      C -->|3. Authenticate| D[Auth Service]
      C -->|4. Subscribe to Channels| E[Pub/Sub Service]
      
      A -->|5. Send Message| B
      B -->|6. Route Message| C
      C -->|7. Store Message| F[Message DB]
      C -->|8. Publish Message| E
      E -->|9. Broadcast to Subscribers| C
      C -->|10. Deliver to Recipients| A
      
      G[Offline Client] -->|11. Connect Later| B
      C -->|12. Fetch Missed Messages| F
      C -->|13. Deliver Missed Messages| G`,
    tradeoffs: [
      {
        title: "WebSockets vs. HTTP Long Polling",
        pros: [
          "WebSockets provide true bidirectional communication",
          "Lower latency for real-time updates",
          "More efficient use of server resources for active connections",
        ],
        cons: [
          "More complex to implement and debug",
          "May be blocked by some corporate proxies/firewalls",
          "Requires fallback mechanisms for incompatible clients",
        ],
      },
      {
        title: "Centralized vs. Federated Architecture",
        pros: [
          "Centralized is simpler to implement and maintain",
          "Easier to enforce consistent policies and features",
          "Better control over quality of service",
        ],
        cons: [
          "Single point of failure risks",
          "Scaling challenges at massive scale",
          "Privacy concerns with centralized data storage",
        ],
      },
    ],
    createdAt: "2023-06-12",
    resources: [
      {
        title: "Building a Real-time Chat Application",
        url: "https://example.com/blog/real-time-chat-architecture",
      },
    ],
  },
  {
    id: "sdc4",
    title: "Video Streaming Platform",
    summary:
      "Design a scalable video streaming service like YouTube or Netflix.",
    problem:
      "Create a platform that allows users to upload, store, process, and stream video content to millions of viewers with high availability and quality.",
    techStack: [
      "CDN",
      "Transcoding Services",
      "Object Storage",
      "Microservices",
      "Recommendation Engine",
    ],
    requirements: {
      functional: [
        "Video upload and processing",
        "Streaming at multiple quality levels",
        "Content recommendation",
        "User engagement features (likes, comments)",
        "Analytics and monetization",
      ],
      nonFunctional: [
        "High availability (99.99% uptime)",
        "Low latency streaming start times",
        "Bandwidth efficiency",
        "Global scale and regional compliance",
      ],
    },
    diagram: `graph TD
      A[User] -->|1. Upload Video| B[Web/Mobile App]
      B -->|2. Generate Upload URL| C[API Gateway]
      C -->|3. Request URL| D[Upload Service]
      D -->|4. Generate URL| E[Object Storage]
      E -->|5. Return Signed URL| D
      D -->|6. Return Upload URL| C
      C -->|7. Return Upload URL| B
      B -->|8. Upload Directly| E
      
      E -->|9. Trigger| F[Video Processing Service]
      F -->|10. Create Jobs| G[Transcoding Queue]
      G -->|11. Assign Tasks| H[Transcoding Workers]
      H -->|12. Process Video| H
      H -->|13. Store Versions| I[CDN]
      
      J[Viewer] -->|14. Request Video| K[CDN Edge]
      K -->|15. Cache Miss| I
      K -->|16. Stream Video| J`,
    tradeoffs: [
      {
        title: "Progressive Download vs. Adaptive Streaming",
        pros: [
          "Adaptive streaming adjusts quality based on network conditions",
          "Better user experience with fewer interruptions",
          "More bandwidth efficient",
        ],
        cons: [
          "More complex to implement",
          "Requires multiple encodings of the same content",
          "Higher processing costs",
        ],
      },
      {
        title: "Pre-transcoding vs. Real-time Transcoding",
        pros: [
          "Pre-transcoding ensures consistent quality",
          "Reduces streaming server load",
          "Allows for more optimization of encoded files",
        ],
        cons: [
          "Increases storage requirements",
          "Longer delay before content is available",
          "May waste resources on unwatched content",
        ],
      },
    ],
    createdAt: "2023-07-05",
  },
  {
    id: "sdc5",
    title: "E-commerce Platform",
    summary: "Design a scalable e-commerce system like Amazon or Shopify.",
    problem:
      "Build a robust e-commerce platform that can handle product listings, shopping cart functionality, payment processing, and order fulfillment at scale.",
    techStack: [
      "Microservices",
      "MySQL",
      "Elasticsearch",
      "Redis",
      "RabbitMQ",
      "React",
    ],
    requirements: {
      functional: [
        "Product catalog and search",
        "User accounts and profiles",
        "Shopping cart and checkout",
        "Payment processing",
        "Order management and tracking",
        "Recommendations",
      ],
      nonFunctional: [
        "High availability during peak shopping periods",
        "Secure payment processing",
        "Fast search and filtering",
        "Consistent inventory management",
      ],
    },
    diagram: `graph TD
      A[Customer] -->|1. Browse Products| B[Web/Mobile Frontend]
      B -->|2. Search Request| C[API Gateway]
      C -->|3. Query| D[Search Service]
      D -->|4. Query| E[Elasticsearch]
      E -->|5. Return Results| D
      D -->|6. Return Products| C
      C -->|7. Display Results| B
      
      A -->|8. Add to Cart| B
      B -->|9. Update Cart| F[Cart Service]
      F -->|10. Store Cart| G[Cart DB]
      
      A -->|11. Checkout| B
      B -->|12. Process Order| H[Order Service]
      H -->|13. Reserve Inventory| I[Inventory Service]
      H -->|14. Process Payment| J[Payment Service]
      J -->|15. Payment Gateway| K[External Payment Provider]
      H -->|16. Create Order| L[Order DB]
      H -->|17. Notification| M[Notification Service]
      M -->|18. Send Confirmation| A`,
    tradeoffs: [
      {
        title: "Monolith vs. Microservices",
        pros: [
          "Microservices allow independent scaling of components",
          "Better fault isolation",
          "Enables technology diversity for specific needs",
        ],
        cons: [
          "Increased operational complexity",
          "More difficult to maintain data consistency",
          "Network overhead between services",
        ],
      },
      {
        title: "Inventory Management Strategies",
        pros: [
          "Just-in-time reservation reduces phantom inventory",
          "Optimistic concurrency allows higher throughput",
          "Eventual consistency simplifies implementation",
        ],
        cons: [
          "May result in order cancellations during high traffic",
          "Complex compensation logic required for failures",
          "Can lead to customer disappointment",
        ],
      },
    ],
    createdAt: "2023-08-20",
  },
];

export const scalabilityPatterns: ScalabilityPattern[] = [
  {
    id: "sp1",
    name: "Sharding",
    description:
      "Technique to split a large database into smaller, faster, more manageable pieces called shards across multiple servers.",
    useCases: [
      "Large databases with horizontal partitioning potential",
      "Systems with data that can be separated by region, customer, or feature",
      "Applications requiring improved throughput and query performance",
    ],
    benefits: [
      "Improves read/write performance by distributing load",
      "Allows horizontal scaling of database tier",
      "Can improve availability if properly implemented",
    ],
  },
  {
    id: "sp2",
    name: "Caching",
    description:
      "Storing copies of frequently accessed data in faster storage to reduce load on backend systems.",
    useCases: [
      "Read-heavy workloads",
      "Computationally expensive operations",
      "Reducing database load",
      "Improving response times",
    ],
    benefits: [
      "Dramatically improves read performance",
      "Reduces load on primary data stores",
      "Can significantly cut costs by reducing primary storage needs",
    ],
  },
  {
    id: "sp3",
    name: "Load Balancing",
    description:
      "Distributing network traffic across multiple servers to ensure high availability and reliability.",
    useCases: [
      "High-traffic web applications",
      "API services with variable load patterns",
      "Systems requiring high availability",
    ],
    benefits: [
      "Improves application availability and reliability",
      "Enables horizontal scaling of application tier",
      "Can provide SSL termination and security benefits",
    ],
  },
  {
    id: "sp4",
    name: "Command Query Responsibility Segregation (CQRS)",
    description:
      "Pattern that separates read and write operations to optimize for different requirements.",
    useCases: [
      "Systems with significant difference between read and write workloads",
      "Applications requiring complex reporting alongside transactional operations",
      "Event-driven architectures",
    ],
    benefits: [
      "Allows independent scaling of read and write workloads",
      "Can optimize data models for specific usage patterns",
      "Supports eventual consistency when appropriate",
    ],
  },
  {
    id: "sp5",
    name: "Circuit Breaker",
    description:
      "Design pattern that prevents cascading failures in distributed systems by stopping operations when failures reach a threshold.",
    useCases: [
      "Microservice architectures",
      "Systems depending on external services",
      "High-reliability applications",
    ],
    benefits: [
      "Prevents system overload during partial outages",
      "Fails fast instead of adding latency",
      "Allows graceful degradation of functionality",
    ],
  },
  {
    id: "sp6",
    name: "Message Queue",
    description:
      "Mechanism for asynchronous service-to-service communication used in serverless and microservices architectures.",
    useCases: [
      "Workload decoupling",
      "Traffic spike handling",
      "Long-running background jobs",
      "Cross-service communication",
    ],
    benefits: [
      "Decouples producers from consumers",
      "Helps handle traffic spikes with buffering",
      "Enables asynchronous processing patterns",
    ],
  },
];

export const metricsData: MetricsData[] = [
  {
    id: "m1",
    system: "User Auth Service",
    environment: "production",
    qps: 5000,
    latency: 45,
    storage: 250,
    cacheHitRatio: 92,
    date: "2023-09-10",
    notes: "After Redis cache implementation",
  },
  {
    id: "m2",
    system: "Product Catalog API",
    environment: "production",
    qps: 12000,
    latency: 120,
    storage: 800,
    cacheHitRatio: 85,
    date: "2023-09-15",
  },
  {
    id: "m3",
    system: "Payment Processing",
    environment: "production",
    qps: 2500,
    latency: 180,
    storage: 450,
    cacheHitRatio: 65,
    date: "2023-09-20",
    notes: "High traffic during sale event",
  },
  {
    id: "m4",
    system: "Recommendation Engine",
    environment: "production",
    qps: 3800,
    latency: 200,
    storage: 1200,
    cacheHitRatio: 78,
    date: "2023-09-25",
  },
];
