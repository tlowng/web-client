// src/types/index.ts

// ==================== ENUMS ====================
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum ProblemDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum SubmissionStatus {
  PENDING = 'Pending',
  IN_QUEUE = 'In Queue',
  JUDGING = 'Judging',
  ACCEPTED = 'Accepted',
  WRONG_ANSWER = 'Wrong Answer',
  TIME_LIMIT_EXCEEDED = 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED = 'Memory Limit Exceeded',
  RUNTIME_ERROR = 'Runtime Error',
  COMPILATION_ERROR = 'Compilation Error',
  INTERNAL_ERROR = 'Internal Error'
}

export enum ContestType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RATED = 'rated'
}

export enum ScoringSystem {
  ICPC = 'ICPC',
  IOI = 'IOI',
  ATCODER = 'AtCoder'
}

export enum ContestStatus {
  DRAFT = 'draft',
  UPCOMING = 'upcoming',
  RUNNING = 'running',
  ENDED = 'ended'
}

export enum ProblemSolutionStatus {
  AC = 'AC',
  WA = 'WA',
  PENDING = 'Pending',
  NOT_ATTEMPTED = 'Not Attempted'
}

export enum PostReactionType {
  LIKE = 'like',
  LOVE = 'love',
  HAHA = 'haha',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry'
}

export enum AnalyticsType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

// ==================== BASIC TYPES ====================
export interface UserData {
  username?: string;
  email: string;
  password?: string;
  role?: UserRole;
}

export interface TestCase {
  input: string;
  output: string;
}

export interface ProblemData {
  _id?: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  timeLimit: number; // in milliseconds
  memoryLimit: number; // in MB
  testCases: TestCase[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ==================== USER TYPES ====================
export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: UserProfile;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// ==================== CONTEST TYPES ====================
export interface PopulatedContestProblem {
  problem: ProblemData;
  label: string;
  points: number;
}

export interface ContestParticipant {
  user: UserProfile; // Changed from string to UserProfile
  registeredAt: string;
}

export interface ContestSettings {
  showOthersCode: boolean;
  allowClarifications: boolean;
  penaltyPerWrongSubmission: number;
  enablePlagiarismCheck: boolean;
  autoPublishResults: boolean;
}

export interface Contest {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  problems: PopulatedContestProblem[];
  participants: ContestParticipant[];
  type: ContestType;
  scoringSystem: ScoringSystem;
  allowedLanguages: string[];
  maxSubmissions: number;
  freezeTime: number;
  isVisible: boolean;
  isRated: boolean;
  createdBy: UserProfile; // Changed from string to UserProfile
  settings: ContestSettings;
  registrationDeadline: string;
  password?: string;
  isPublished: boolean;
  totalSubmissions: number;
  // Virtual fields from API
  status: ContestStatus;
  timeLeft: number;
  canRegister: boolean;
  participantCount: number;
  isRegistered?: boolean; // Added optional field
  isCreator?: boolean;   // Added optional field
  createdAt: string;
  updatedAt: string;
}

export interface ContestFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: ContestType;
  scoringSystem: ScoringSystem;
  allowedLanguages: string[];
  maxSubmissions: number;
  freezeTime: number;
  isRated: boolean;
  password?: string;
  settings: ContestSettings;
  problems: {
    problemId: string;
    label: string;
    points: number;
  }[];
}

export interface ContestRegistrationData {
  contestId: string;
  password?: string;
}

// ==================== CONTEST SUBMISSION TYPES ====================
export interface ContestSubmission {
  _id: string;
  contest: string; // ObjectId
  user: string; // ObjectId
  problem: string; // ObjectId
  problemLabel: string;
  submission: SubmissionResult; // Populated submission
  submissionTime: number; // minutes from contest start
  points: number;
  penalty: number;
  isAccepted: boolean;
  attemptNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContestSubmissionData {
  contestId: string;
  problemLabel: string; // Problem Label A,B,C...
  code: string;
  language: string;
}

// ==================== STANDINGS TYPES ====================
export interface ProblemResult {
  problemId: string;
  label: string;
  score: number;
  penalty: number;
  attempts: number;
  status: ProblemSolutionStatus;
  solvedAt?: string;
  submissionTime?: number; // minutes from contest start
}

export interface RankingEntry {
  user: {
    _id: string;
    username: string;
  };
  rank: number;
  totalScore: number;
  totalPenalty: number;
  problems: ProblemResult[];
}

export interface Standings {
  _id: string;
  contest: string; // ObjectId
  rankings: RankingEntry[];
  lastUpdated: string;
  isFrozen: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== REGULAR SUBMISSION TYPES ====================
export interface SubmissionData {
  problemId: string;
  code: string;
  language: string;
}

export interface Problem extends Omit<ProblemData, '_id'> {
  _id: string; 
  acceptance: number; 
  submissionCount: number; 
}

export interface SubmissionResult {
  _id: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  executionTime?: number;
  memoryUsed?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedSubmissionResult extends Omit<SubmissionResult, 'problemId'> {
  problemId: {
    _id: string;
    title: string;
  };
}

export interface FullyPopulatedSubmissionResult extends Omit<PopulatedSubmissionResult, 'userId'> {
  userId: {
    _id: string;
    username: string;
  };
}


// ==================== FORUM TYPES ====================
export interface ForumCategory {
  _id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  color: string;
  order: number;
  topicCount: number;
  postCount: number;
  moderators: string[]; // ObjectId[]
  lastTopic?: {
    _id: string;
    title: string;
    slug: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ForumTopic {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  viewCount: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  lastActivity: string;
  lastPost?: {
    _id: string;
    author: {
      _id: string;
      username: string;
    };
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ForumPost {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  topic: string; // ObjectId
  replyTo?: string; // ObjectId
  likeCount: number;
  position?: number;
  userLiked?: boolean;
  userLikeType?: PostReactionType;
  createdAt: string;
  updatedAt: string;
}

export interface PostLike {
  _id: string;
  post: string; // ObjectId
  user: string; // ObjectId
  type: PostReactionType;
  createdAt: string;
  updatedAt: string;
}

export interface ForumProfile {
  _id: string;
  user: string; // ObjectId
  signature?: string;
  avatar?: string;
  title?: string;
  location?: string;
  website?: string;
  githubProfile?: string;
  postCount: number;
  topicCount: number;
  reputation: number;
  lastSeen: string;
  preferences: {
    emailNotifications: boolean;
    showOnlineStatus: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserWithProfile {
  user: UserProfile;
  profile: ForumProfile;
  recentActivity?: {
    topics: ForumTopic[];
    posts: ForumPost[];
  };
}

export interface PopulatedForumPost extends Omit<ForumPost, 'topic'> {
  topic: {
    _id: string;
    slug: string;
    title: string;
  };
}

export interface UserWithPopulatedActivity extends Omit<UserWithProfile, 'recentActivity'> {
   recentActivity?: {
    topics: ForumTopic[];
    posts: PopulatedForumPost[];
  };
}

// ==================== FORUM ANALYTICS ====================
export interface PageViews {
  total: number;
  topics: number;
  categories: number;
  profiles: number;
}

export interface ForumActions {
  topics: number;
  posts: number;
  likes: number;
  searches: number;
}

export interface TopSearch {
  query: string;
  count: number;
}

export interface PopularTopic {
  topic: string; // ObjectId
  views: number;
}

export interface ForumAnalytics {
  _id: string;
  date: string;
  type: AnalyticsType;
  pageViews: PageViews;
  actions: ForumActions;
  uniqueUsers: string[]; // ObjectId[]
  topSearches: TopSearch[];
  popularTopics: PopularTopic[];
  createdAt: string;
  updatedAt: string;
}

// ==================== FORM DATA TYPES ====================
export interface CreateTopicData {
  title: string;
  content: string;
  categoryId: string;
  tags?: string[];
}

export interface CreatePostData {
  content: string;
  topicId: string;
  replyTo?: string;
}

export interface UpdateProfileData {
  signature?: string;
  avatar?: string;
  title?: string;
  location?: string;
  website?: string;
  githubProfile?: string;
  preferences?: {
    emailNotifications: boolean;
    showOnlineStatus: boolean;
  };
}

export interface CreateCategoryData {
  name: string;
  description: string;
  icon?: string;
  color: string;
  order?: number;
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

// Problem API responses
export interface CreateProblemResponse {
  _id: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  timeLimit: number;
  memoryLimit: number;
  testCases: TestCase[];
  createdAt: string;
  message?: string;
}

export interface ProblemsListResponse {
  problems: ProblemData[];
  pagination?: PaginationInfo;
}

// Forum API responses
export interface ForumTopicsResponse {
  topics: ForumTopic[];
  pagination: PaginationInfo;
}

export interface PostsResponse {
  posts: ForumPost[];
  pagination: PaginationInfo;
}

export interface CategoriesResponse {
  categories: ForumCategory[];
}

// Contest API responses
export interface ContestsResponse {
  contests: Contest[];
  pagination?: PaginationInfo;
}

export interface ContestSubmissionsResponse {
  submissions: ContestSubmission[];
  pagination?: PaginationInfo;
}

// ==================== SEARCH & FILTER TYPES ====================
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContestFilters {
  status?: ContestStatus[];
  type?: ContestType[];
  difficulty?: ProblemDifficulty[];
  language?: string[];
  startDate?: string;
  endDate?: string;
}

export interface ProblemFilters {
  difficulty?: ProblemDifficulty[];
  tags?: string[];
  solved?: boolean;
}

export interface ForumFilters {
  category?: string;
  author?: string;
  tags?: string[];
  isPinned?: boolean;
  hasReplies?: boolean;
}

// ==================== WEBSOCKET TYPES ====================
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface ContestUpdate {
  type: 'TIMER_UPDATE' | 'STANDINGS_UPDATE' | 'SUBMISSION_UPDATE' | 'CONTEST_STATUS_CHANGE';
  contestId: string;
  data: any;
}

export interface SubmissionUpdate {
  submissionId: string;
  status: SubmissionStatus;
  executionTime?: number;
  memoryUsed?: number;
}

export interface StandingsUpdate {
  contestId: string;
  standings: Standings;
}

export interface OnlineUser {
  userId: string;
  username: string;
  lastSeen: string;
}

// ==================== ADMIN TYPES ====================
export interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalContests: number;
    totalProblems: number;
    totalSubmissions: number;
    activeContests: number;
  };
  recentActivity: {
    newUsers: UserProfile[];
    recentSubmissions: SubmissionResult[];
    newTopics: ForumTopic[];
  };
  analytics: ForumAnalytics[];
}

export interface UserManagement {
  users: UserProfile[];
  pagination: PaginationInfo;
  filters: {
    role?: UserRole;
    registeredAfter?: string;
    lastActiveAfter?: string;
  };
}

// ==================== NOTIFICATION TYPES ====================
export interface Notification {
  _id: string;
  userId: string;
  type: 'CONTEST_REMINDER' | 'SUBMISSION_RESULT' | 'FORUM_REPLY' | 'CONTEST_STARTED' | 'STANDINGS_UPDATE';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  contestReminders: boolean;
  submissionResults: boolean;
  forumReplies: boolean;
  contestUpdates: boolean;
  emailNotifications: boolean;
}

// ==================== UTILITY TYPES ====================
export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ContestTimer {
  contestId: string;
  status: ContestStatus;
  timeUntilStart?: TimeRemaining;
  timeUntilEnd?: TimeRemaining;
  totalDuration: number;
  elapsed: number;
}

export interface CodeEditorSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  autoComplete: boolean;
}

// ==================== VALIDATION TYPES ====================
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ==================== STATISTICS TYPES ====================
export interface UserStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  contestsParticipated: number;
  problemsSolved: number;
  averageRating?: number;
  topicCount: number;
  postCount: number;
  reputation: number;
}

export interface ContestStats {
  totalParticipants: number;
  totalSubmissions: number;
  averageScore: number;
  solutionDistribution: {
    [problemLabel: string]: {
      attempts: number;
      solved: number;
      acceptanceRate: number;
    };
  };
}

export interface ProblemStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  averageExecutionTime: number;
  languageDistribution: {
    [language: string]: number;
  };
}

// Interfaces for populated data (when user field is populated)
export interface ForumProfilePopulated extends Omit<ForumProfile, 'user'> {
  user: UserProfile; // user field is populated with full UserProfile object
}

// Leaderboard specific types
export interface LeaderboardEntry extends Omit<ForumProfile, 'user'> {
  user: UserProfile; // populated user data
}

export interface LeaderboardResponse {
  profiles: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
