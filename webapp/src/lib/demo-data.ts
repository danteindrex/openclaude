import type { RoutePath } from "@/lib/design-tokens";

export type NavItem = {
  href: RoutePath;
  icon: string;
  label: string;
};

export type LearnerProfile = {
  name: string;
  level: string;
};

export type CourseCard = {
  category: "Technical" | "Employability" | "Foundations";
  language: string;
  progress: number;
  status: string;
  title: string;
};

export const stitchedNavItems: NavItem[] = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/catalog", icon: "school", label: "Courses" },
  { href: "/tutor", icon: "smart_toy", label: "AI Tutor" },
  { href: "/dashboard", icon: "analytics", label: "My Progress" },
  { href: "/dashboard", icon: "settings", label: "Settings" },
];

export const utilityActions = [
  { icon: "wifi_off", label: "Offline mode" },
  { icon: "translate", label: "Language" },
  { icon: "account_circle", label: "Profile" },
] as const;

export const welcomeHighlights = [
  { icon: "offline_bolt", title: "100% Offline", copy: "Runs locally with no uplink required." },
  { icon: "security", title: "Private AI", copy: "Keeps learner data on the device." },
  { icon: "dns", title: "Local Hosting", copy: "Fits a classroom, lab, or kiosk." },
] as const;

export const roleCards = [
  {
    icon: "school",
    href: "/login",
    title: "Student",
    copy: "Access personalized lessons, track progress, and continue the learning path.",
  },
  {
    icon: "psychology",
    href: "/login",
    title: "Facilitator",
    copy: "Review classroom performance, manage resources, and guide cohorts.",
  },
  {
    icon: "admin_panel_settings",
    href: "/login",
    title: "Admin",
    copy: "Maintain local infrastructure and configure offline educational systems.",
  },
] as const;

export const recentLearners: LearnerProfile[] = [
  {
    name: "Amara",
    level: "Level 4 Scholar",
  },
  {
    name: "Kofi",
    level: "Level 2 Scholar",
  },
  {
    name: "New Learner",
    level: "Add profile",
  },
];

export const dashboardStats = [
  { label: "Day Streak", value: "12 Days", icon: "local_fire_department", tone: "warm" },
  { label: "Mastery", value: "75%", icon: "workspace_premium", tone: "cool" },
  { label: "Offline Sync", value: "100%", icon: "cloud_done", tone: "neutral" },
] as const;

export const dashboardHighlights = [
  {
    title: "Python Basics",
    subtitle: "Module 4: Loops and Logic",
    progress: 64,
  },
  {
    title: "Data Science 101",
    subtitle: "12 lessons left",
    progress: 36,
  },
] as const;

export const catalogCourses: CourseCard[] = [
  {
    category: "Technical",
    language: "EN/KS",
    progress: 65,
    status: "Continue Learning",
    title: "Advanced Network Defense & Security",
  },
  {
    category: "Employability",
    language: "EN",
    progress: 0,
    status: "Enroll Now",
    title: "Interpersonal Dynamics in Modern Work",
  },
  {
    category: "Foundations",
    language: "EN/KS",
    progress: 100,
    status: "Certificate Ready",
    title: "Digital Literacy: Master the Core Tools",
  },
] as const;

export const catalogFilters = ["All Courses", "Foundations", "Technical", "Employability"] as const;

export const demoCredentials = {
  student: {
    username: "student-demo",
    password: "elimu123",
  },
  facilitator: {
    username: "facilitator-demo",
    password: "elimu123",
  },
  admin: {
    username: "admin-demo",
    password: "elimu123",
  },
} as const;
