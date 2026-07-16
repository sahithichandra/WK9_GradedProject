import { Types } from "mongoose";

// Create sample tags
const t1 = new Types.ObjectId();
const t2 = new Types.ObjectId();
const t3 = new Types.ObjectId();
const t4 = new Types.ObjectId();
const t5 = new Types.ObjectId();
const t6 = new Types.ObjectId();
const t7 = new Types.ObjectId();
const t8 = new Types.ObjectId();

export const tags = [
  { _id: t1, name: "javascript" },
  { _id: t2, name: "nodejs" },
  { _id: t3, name: "express" },
  { _id: t4, name: "mongodb" },
  { _id: t5, name: "react" },
  { _id: t6, name: "vue" },
  { _id: t7, name: "python" },
  { _id: t8, name: "java" },
];

// Create sample users
const u1 = new Types.ObjectId();
const u2 = new Types.ObjectId();
const u3 = new Types.ObjectId();
const u4 = new Types.ObjectId();
const u5 = new Types.ObjectId();
const u6 = new Types.ObjectId();
const u7 = new Types.ObjectId();
const u8 = new Types.ObjectId();
const u9 = new Types.ObjectId();
const u10 = new Types.ObjectId();

export const users = [
  {
    _id: u1,
    name: "Bob Smith",
    email: "bob@example.com",
    password: "pass123",
    isAdmin: true,
  },
  {
    _id: u2,
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "pass123",
    isAdmin: false,
  },
  {
    _id: u3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    password: "pass123",
    isAdmin: false,
  },
  {
    _id: u4,
    name: "David Wilson",
    email: "david@example.com",
    password: "pass123",
    isAdmin: false,
  },
  {
    _id: u5,
    name: "Eva Green",
    email: "eva@example.com",
    password: "pass123",
    isAdmin: false,
  },
  {
    _id: u6,
    name: "Frank Wright",
    email: "frank@example.com",
    password: "pass123",
    isAdmin: false,
  },
  {
    _id: u7,
    name: "Grace Lee",
    email: "grace@example.com",
    password: "pass123",
    isAdmin: false,
  },
  {
    _id: u8,
    name: "Henry Davis",
    email: "henry@example.com",
    password: "pass123",
    isAdmin: false,
  },
  {
    _id: u9,
    name: "Isabel Martinez",
    email: "isabel@example.com",
    password: "pass123",
    isAdmin: false,
  },
  {
    _id: u10,
    name: "James Anderson",
    email: "james@example.com",
    password: "pass123",
    isAdmin: false,
  },
];

// Sample question titles and descriptions
const q1 = new Types.ObjectId();
const q2 = new Types.ObjectId();
const q3 = new Types.ObjectId();
const q4 = new Types.ObjectId();
const q5 = new Types.ObjectId();
const q6 = new Types.ObjectId();
const q7 = new Types.ObjectId();
const q8 = new Types.ObjectId();
const q9 = new Types.ObjectId();
const q10 = new Types.ObjectId();

export const questions = [
  {
    _id: q1,
    title: "How to implement authentication in Express.js?",
    description:
      "I'm building a web application with Express and need to implement user authentication. What are the best practices and libraries to use?",
    tags: [t2, t3],
    upvotes: [u2, u3],
    downvotes: [],
    views: 10,
    author: u1,
  },
  {
    _id: q2,
    title: "Optimizing MongoDB queries for large datasets",
    description:
      "My application has grown and now has millions of documents. Queries are becoming slow. How can I optimize my MongoDB queries for better performance?",
    tags: [t4],
    upvotes: [u1, u3, u4],
    downvotes: [],
    views: 15,
    author: u2,
  },
  {
    _id: q3,
    title: "React state management solutions comparison",
    description:
      "With so many state management libraries available for React (Redux, MobX, Context API, Recoil), which one should I use for a medium-sized application?",
    tags: [t5],
    upvotes: [u2],
    downvotes: [u1],
    views: 12,
    author: u3,
  },
  {
    _id: q4,
    title: "Deploying Node.js applications to AWS",
    description:
      "What is the best way to deploy a Node.js application to AWS? I've heard of Elastic Beanstalk, EC2, and Lambda, but I'm not sure which one to choose.",
    tags: [t2],
    upvotes: [u1, u2],
    downvotes: [],
    views: 8,
    author: u4,
  },
  {
    _id: q5,
    title: "Handling file uploads with Express and Multer",
    description:
      "I need to implement file uploads in my Express application. How can I use Multer effectively and securely?",
    tags: [t3],
    upvotes: [u1, u2, u3],
    downvotes: [],
    views: 10,
    author: u5,
  },
  {
    _id: q6,
    title: "Best practices for error handling in async/await",
    description:
      "I'm using async/await in my Node.js application. What are the best practices for handling errors in async functions?",
    tags: [t2],
    upvotes: [u1, u2],
    downvotes: [],
    views: 5,
    author: u6,
  },
  {
    _id: q7,
    title: "Implementing real-time features with Socket.io",
    description:
      "How can I add real-time capabilities like notifications and chat to my Express application using Socket.io?",
    tags: [t2],
    upvotes: [u5, u2, u3],
    downvotes: [],
    views: 8,
    author: u1,
  },
  {
    _id: q8,
    title: "Securing MongoDB connections in production",
    description:
      "What steps should I take to secure my MongoDB connections in a production environment?",
    tags: [t4],
    upvotes: [u3, u4, u5],
    downvotes: [u2],
    views: 10,
    author: u2,
  },
  {
    _id: q9,
    title: "TypeScript integration with Express",
    description:
      "I want to convert my Express application from JavaScript to TypeScript. What's the best approach and what are the benefits?",
    tags: [t1, t2],
    upvotes: [u3, u4, u5, u6],
    downvotes: [],
    views: 22,
    author: u3,
  },
  {
    _id: q10,
    title: "MongoDB vs PostgreSQL for web applications",
    description:
      "I'm starting a new web project and can't decide between MongoDB and PostgreSQL. What are the pros and cons of each for modern web applications?",
    tags: [t2, t4],
    upvotes: [u3, u4, u5, u6],
    downvotes: [],
    views: 12,
    author: u4,
  },
];

// Sample answers for questions — each question has 5–7 answers, all by different users
export const answers = [
  // q1: How to implement authentication in Express.js? (author: u1)
  {
    questionId: q1,
    answerText:
      "You can use Passport.js for authentication in Express. It supports various strategies like local, OAuth, etc. Make sure to hash passwords using bcrypt.",
    author: u2,
    upvotes: [u1],
    downvotes: [],
  },
  {
    questionId: q1,
    answerText:
      "Consider using JWT for stateless authentication. It allows you to securely transmit user information between the client and server.",
    author: u5,
    upvotes: [u3, u4],
    downvotes: [],
  },
  {
    questionId: q1,
    answerText:
      "For session management, you can use express-session with a store like connect-mongo for MongoDB.",
    author: u6,
    upvotes: [u1],
    downvotes: [],
  },
  {
    questionId: q1,
    answerText:
      "Another solid approach is cookie-based authentication with http-only, secure cookies. This prevents JavaScript access to the session token and protects against XSS attacks.",
    author: u3,
    upvotes: [u2, u4],
    downvotes: [],
  },
  {
    questionId: q1,
    answerText:
      "Consider delegating authentication entirely to a provider like Auth0 or Firebase Auth. You get OAuth, MFA, and token management out of the box without maintaining your own auth logic.",
    author: u4,
    upvotes: [u5, u6],
    downvotes: [],
  },
  {
    questionId: q1,
    answerText:
      "For modern APIs, pair short-lived JWTs with refresh tokens stored in http-only cookies. Rotate refresh tokens on each use to limit the blast radius of a stolen token.",
    author: u7,
    upvotes: [u1, u3],
    downvotes: [],
  },

  // q2: Optimizing MongoDB queries for large datasets (author: u2)
  {
    questionId: q2,
    answerText:
      "To optimize MongoDB queries, create indexes on fields that are frequently queried. Use the explain() method to analyze query performance.",
    author: u4,
    upvotes: [u1],
    downvotes: [],
  },
  {
    questionId: q2,
    answerText:
      "Consider using aggregation pipelines for complex queries. They can be more efficient than multiple find() calls.",
    author: u5,
    upvotes: [u6, u1, u4],
    downvotes: [],
  },
  {
    questionId: q2,
    answerText:
      "Use projections to return only the fields your application actually needs. Fetching full documents when you need two fields wastes network bandwidth and memory.",
    author: u1,
    upvotes: [u3, u5],
    downvotes: [],
  },
  {
    questionId: q2,
    answerText:
      "MongoDB Atlas's Performance Advisor automatically detects slow queries and recommends indexes. It's worth enabling even if you manage your own cluster.",
    author: u3,
    upvotes: [u2, u6],
    downvotes: [],
  },
  {
    questionId: q2,
    answerText:
      "Denormalize your data model strategically. Embedding frequently-read subdocuments avoids expensive lookups, trading write complexity for read speed.",
    author: u6,
    upvotes: [u4, u5],
    downvotes: [],
  },
  {
    questionId: q2,
    answerText:
      "Layer a Redis cache in front of hot queries. Cache invalidation adds complexity but can reduce MongoDB load by orders of magnitude for read-heavy workloads.",
    author: u7,
    upvotes: [u1, u2, u3],
    downvotes: [],
  },

  // q3: React state management solutions comparison (author: u3)
  {
    questionId: q3,
    answerText:
      "For medium-sized applications, Redux is a popular choice due to its ecosystem and community support. However, Context API is a good lightweight alternative.",
    author: u5,
    upvotes: [u1],
    downvotes: [],
  },
  {
    questionId: q3,
    answerText:
      "Recoil is a newer library that provides a more flexible and modern approach to state management in React. It might be worth exploring.",
    author: u6,
    upvotes: [u2, u4],
    downvotes: [],
  },
  {
    questionId: q3,
    answerText:
      "Zustand is a lightweight library with a minimal API. It avoids Redux boilerplate while still giving you a single global store with simple selectors.",
    author: u1,
    upvotes: [u4, u6],
    downvotes: [],
  },
  {
    questionId: q3,
    answerText:
      "For server state specifically, React Query or SWR handle caching, background refetching, and loading states far better than general-purpose stores. Pair one of these with Zustand for client state.",
    author: u2,
    upvotes: [u5, u7],
    downvotes: [],
  },
  {
    questionId: q3,
    answerText:
      "Don't reach for a library immediately. Context API with useReducer handles a surprising amount of complexity and keeps your bundle small. Add a dedicated library when you feel real pain.",
    author: u4,
    upvotes: [u1, u3],
    downvotes: [],
  },
  {
    questionId: q3,
    answerText:
      "Jotai takes an atomic approach similar to Recoil but with a simpler API and no Provider boilerplate. Great fit for apps with lots of independent, loosely-related state.",
    author: u7,
    upvotes: [u2, u5],
    downvotes: [],
  },
  {
    questionId: q3,
    answerText:
      "MobX is worth considering if your team is comfortable with reactive/observable patterns. It requires less boilerplate than Redux and handles deeply nested state changes naturally.",
    author: u8,
    upvotes: [u6],
    downvotes: [u1],
  },

  // q4: Deploying Node.js applications to AWS (author: u4)
  {
    questionId: q4,
    answerText:
      "Elastic Beanstalk is a good choice for easy deployment, while EC2 offers more control. Lambda is great for serverless architectures.",
    author: u5,
    upvotes: [u4, u6],
    downvotes: [],
  },
  {
    questionId: q4,
    answerText:
      "ECS with Docker containers gives you reproducible deployments with fine-grained resource controls. Use Fargate to avoid managing EC2 instances entirely.",
    author: u1,
    upvotes: [u2, u3],
    downvotes: [],
  },
  {
    questionId: q4,
    answerText:
      "AWS App Runner abstracts away infrastructure completely — point it at your container image or source code and it handles scaling, load balancing, and TLS. Best choice for teams that want to ship fast.",
    author: u2,
    upvotes: [u5, u7],
    downvotes: [],
  },
  {
    questionId: q4,
    answerText:
      "Whatever service you choose, set up a CI/CD pipeline with GitHub Actions and AWS CodeDeploy or CodePipeline. Manual deployments don't scale and introduce human error.",
    author: u3,
    upvotes: [u1, u6],
    downvotes: [],
  },
  {
    questionId: q4,
    answerText:
      "Store secrets like database credentials in AWS Secrets Manager and pull them at runtime. Never bake sensitive values into environment variables committed to your repository.",
    author: u6,
    upvotes: [u2, u4],
    downvotes: [],
  },
  {
    questionId: q4,
    answerText:
      "Put CloudFront in front of your Node.js server. It caches static assets at the edge and can significantly reduce latency for geographically distributed users.",
    author: u8,
    upvotes: [u1, u3, u5],
    downvotes: [],
  },

  // q5: Handling file uploads with Express and Multer (author: u5)
  {
    questionId: q5,
    answerText:
      "Multer is a middleware for handling multipart/form-data. Use it to process file uploads in your Express app.",
    author: u2,
    upvotes: [u1, u3],
    downvotes: [],
  },
  {
    questionId: q5,
    answerText:
      "Always validate MIME type and file size in your Multer configuration. Rely on the fileFilter callback and limits option rather than trusting the client-provided content type.",
    author: u1,
    upvotes: [u3, u5],
    downvotes: [],
  },
  {
    questionId: q5,
    answerText:
      "Store uploads in S3 rather than the local filesystem. Local storage doesn't scale across multiple servers and files are lost on container restarts. Use the multer-s3 package to stream directly to S3.",
    author: u3,
    upvotes: [u2, u6],
    downvotes: [],
  },
  {
    questionId: q5,
    answerText:
      "Never serve uploaded files from the same path they were saved. Rename files on disk using a UUID and keep a database record mapping the UUID to the original filename.",
    author: u4,
    upvotes: [u1, u7],
    downvotes: [],
  },
  {
    questionId: q5,
    answerText:
      "For production, scan uploaded files with an antivirus service (ClamAV or a cloud API) before making them accessible. Attackers routinely upload malicious files disguised as images.",
    author: u6,
    upvotes: [u2, u4],
    downvotes: [],
  },
  {
    questionId: q5,
    answerText:
      "For very large files, consider chunked uploads using the tus resumable upload protocol. Libraries exist for both the client and server side, and users can resume interrupted transfers.",
    author: u9,
    upvotes: [u3, u5, u8],
    downvotes: [],
  },

  // q6: Best practices for error handling in async/await (author: u6)
  {
    questionId: q6,
    answerText:
      "Use try/catch blocks to handle errors in async functions. You can also use a middleware to catch errors globally.",
    author: u3,
    upvotes: [u1, u2],
    downvotes: [],
  },
  {
    questionId: q6,
    answerText:
      "Create a custom AppError class that extends Error and includes an HTTP status code and an isOperational flag. This lets your global error handler distinguish programming bugs from expected operational errors.",
    author: u1,
    upvotes: [u4, u5],
    downvotes: [],
  },
  {
    questionId: q6,
    answerText:
      "Install express-async-errors at app startup. It monkey-patches Express so unhandled promise rejections in async route handlers are automatically forwarded to your error middleware.",
    author: u2,
    upvotes: [u3, u6],
    downvotes: [],
  },
  {
    questionId: q6,
    answerText:
      "Put a single error-handling middleware at the very end of your Express app as a catch-all. Keep it as the last middleware and make sure it has four parameters (err, req, res, next) so Express recognises it.",
    author: u4,
    upvotes: [u1, u7],
    downvotes: [],
  },
  {
    questionId: q6,
    answerText:
      "Log errors with full context using Winston or Pino: include the request ID, user ID, route, and stack trace. Structured JSON logs are much easier to query in production monitoring tools.",
    author: u5,
    upvotes: [u2, u3],
    downvotes: [],
  },
  {
    questionId: q6,
    answerText:
      "Handle process-level uncaught exceptions and unhandled promise rejections with process.on('uncaughtException') and process.on('unhandledRejection'). Log them, then exit gracefully — running in a broken state is worse than restarting.",
    author: u9,
    upvotes: [u4, u6],
    downvotes: [],
  },

  // q7: Implementing real-time features with Socket.io (author: u1)
  {
    questionId: q7,
    answerText:
      "Socket.io makes it easy to add real-time features. You can use it for chat applications, notifications, and more.",
    author: u4,
    upvotes: [u3, u5],
    downvotes: [],
  },
  {
    questionId: q7,
    answerText:
      "Use Socket.io namespaces to separate concerns (e.g., /chat vs /notifications) and rooms to broadcast to subsets of connected clients efficiently.",
    author: u2,
    upvotes: [u1, u6],
    downvotes: [],
  },
  {
    questionId: q7,
    answerText:
      "Always handle reconnection on the client side. Socket.io's client library retries automatically, but you need to re-subscribe to rooms and re-request missed events after reconnecting.",
    author: u3,
    upvotes: [u4, u7],
    downvotes: [],
  },
  {
    questionId: q7,
    answerText:
      "For horizontal scaling across multiple Node.js processes, use the socket.io-redis adapter. All server instances share a pub/sub channel so events broadcast correctly regardless of which server a client is connected to.",
    author: u5,
    upvotes: [u2, u8],
    downvotes: [],
  },
  {
    questionId: q7,
    answerText:
      "Authenticate Socket.io connections by verifying a JWT in the handshake middleware. Reject the connection before the socket is established rather than after, to avoid authorizing unauthenticated sockets even briefly.",
    author: u6,
    upvotes: [u1, u3, u4],
    downvotes: [],
  },
  {
    questionId: q7,
    answerText:
      "For simpler use cases where you only need one-way server push, consider Server-Sent Events (SSE) instead. SSE works over plain HTTP, needs no extra library, and is easier to proxy and load-balance.",
    author: u10,
    upvotes: [u5, u9],
    downvotes: [],
  },

  // q8: Securing MongoDB connections in production (author: u2)
  {
    questionId: q8,
    answerText:
      "To secure MongoDB connections, use SSL/TLS, enable authentication, and restrict IP addresses.",
    author: u5,
    upvotes: [u2, u3, u4],
    downvotes: [],
  },
  {
    questionId: q8,
    answerText:
      "Apply the principle of least privilege. Create a dedicated database user per application with only the collections and operations it genuinely needs. Never connect with the root or admin user.",
    author: u1,
    upvotes: [u4, u6],
    downvotes: [],
  },
  {
    questionId: q8,
    answerText:
      "Enable MongoDB's audit logging to record all authentication attempts, administrative actions, and data operations. Route audit logs to a separate, write-only destination so they can't be tampered with.",
    author: u3,
    upvotes: [u2, u5],
    downvotes: [],
  },
  {
    questionId: q8,
    answerText:
      "Place your MongoDB instance inside a VPC and use security groups to allow inbound traffic only from your application servers' security group. The database should never be reachable from the public internet.",
    author: u4,
    upvotes: [u1, u7],
    downvotes: [],
  },
  {
    questionId: q8,
    answerText:
      "Rotate database credentials regularly using a secrets manager (AWS Secrets Manager, HashiCorp Vault). Configure your app to reload credentials without a restart so rotation doesn't cause downtime.",
    author: u6,
    upvotes: [u3, u8],
    downvotes: [],
  },
  {
    questionId: q8,
    answerText:
      "Encrypt data at rest using MongoDB's WiredTiger encryption or a cloud provider's disk encryption. This protects your data if physical media is ever compromised.",
    author: u10,
    upvotes: [u1, u4, u5],
    downvotes: [],
  },

  // q9: TypeScript integration with Express (author: u3)
  {
    questionId: q9,
    answerText:
      "Start by installing typescript, @types/node, and @types/express as dev dependencies. Run tsc --init to generate a tsconfig.json, then rename your .js files to .ts and fix type errors incrementally.",
    author: u1,
    upvotes: [u4, u5],
    downvotes: [],
  },
  {
    questionId: q9,
    answerText:
      "Use ts-node-dev during development for fast incremental compilation with automatic server restarts. It's a drop-in replacement for nodemon that speaks TypeScript natively.",
    author: u2,
    upvotes: [u6, u7],
    downvotes: [],
  },
  {
    questionId: q9,
    answerText:
      "Extend Express's Request interface with declaration merging to add custom properties like req.user. This gives you type-safe access to authenticated user data in every route handler.",
    author: u4,
    upvotes: [u1, u3],
    downvotes: [],
  },
  {
    questionId: q9,
    answerText:
      "Pair TypeScript with Zod or io-ts for runtime schema validation. TypeScript types are erased at runtime, so you still need to validate untrusted input at API boundaries — Zod infers TypeScript types from schemas automatically.",
    author: u5,
    upvotes: [u2, u8],
    downvotes: [],
  },
  {
    questionId: q9,
    answerText:
      "Configure path aliases in tsconfig.json (e.g., @/controllers/*) and mirror them in your bundler or with tsconfig-paths. This eliminates brittle relative imports like ../../../controllers.",
    author: u6,
    upvotes: [u4, u9],
    downvotes: [],
  },
  {
    questionId: q9,
    answerText:
      "Enable strict mode in tsconfig.json from the start. It's much harder to retrofit later and catches the class of bugs TypeScript is best at preventing: undefined access, implicit any, and incorrect nullability.",
    author: u7,
    upvotes: [u1, u5],
    downvotes: [],
  },
  {
    questionId: q9,
    answerText:
      "Structure your app with typed controller classes and a dependency injection container like tsyringe or InversifyJS. This makes testing straightforward — inject mock services without touching Express.",
    author: u8,
    upvotes: [u2, u6],
    downvotes: [],
  },

  // q10: MongoDB vs PostgreSQL for web applications (author: u4)
  {
    questionId: q10,
    answerText:
      "MongoDB shines when your data is naturally document-shaped and your schema evolves frequently. The flexible schema lets you ship features faster early on, but plan for validation as the app matures.",
    author: u1,
    upvotes: [u3, u5],
    downvotes: [],
  },
  {
    questionId: q10,
    answerText:
      "PostgreSQL's ACID transactions and strong consistency guarantees make it the safer choice for financial data, inventory, or anything where partial writes would be catastrophic.",
    author: u2,
    upvotes: [u6, u7],
    downvotes: [],
  },
  {
    questionId: q10,
    answerText:
      "Think about your query patterns first. If your app relies heavily on joins across multiple entities, PostgreSQL's relational model and query planner will outperform MongoDB's $lookup aggregation stages.",
    author: u3,
    upvotes: [u1, u4],
    downvotes: [],
  },
  {
    questionId: q10,
    answerText:
      "MongoDB's horizontal sharding is easier to set up for very high write throughput at massive scale. PostgreSQL can scale reads with replicas but sharding writes requires more operational effort.",
    author: u5,
    upvotes: [u2, u8],
    downvotes: [],
  },
  {
    questionId: q10,
    answerText:
      "PostgreSQL's JSONB column type gives you the best of both worlds for semi-structured data — you can index inside JSON fields and still write relational queries across tables. It's often the pragmatic middle ground.",
    author: u6,
    upvotes: [u3, u9],
    downvotes: [],
  },
  {
    questionId: q10,
    answerText:
      "Consider your team's existing expertise. Both databases are production-proven. A team fluent in SQL will be productive with PostgreSQL immediately; a team coming from a NoSQL background will ramp up on MongoDB faster.",
    author: u9,
    upvotes: [u1, u5],
    downvotes: [],
  },
  {
    questionId: q10,
    answerText:
      "A useful rule of thumb: start with PostgreSQL for most web apps. It handles relational and document data, has mature tooling, and its strict schema catches data quality bugs early. Switch to MongoDB only when you have a clear document-model advantage.",
    author: u10,
    upvotes: [u2, u4, u6],
    downvotes: [],
  },
];
