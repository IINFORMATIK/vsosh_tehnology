/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  approved: boolean;
  avatarSeed: string;
  createdAt: string;
  studyStats?: {
    completedChapters: string[];
    bookmarkedSubsections: string[];
    quizzesTaken: number;
    correctAnswers: number;
    streakDays: number;
    lastActiveDate?: string;
    testScores?: Record<string, { score: number; total: number; takenAt: string }>;
  };
}

export interface RegistrationRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface SubsectionLink {
  title: string;
  url: string;
}

export interface SubsectionImage {
  src: string;
  alt: string;
  caption?: string;
  source?: string;
}

export interface Subsection {
  id: string; // e.g. "1.1.1"
  title: string;
  content: string; // support simple HTML / nicely styled paragraphs or markdown
  tables?: Array<{
    headers: string[];
    rows: string[][];
    caption?: string;
  }>;
  list?: string[];
  keyTerms?: Array<{
    term: string;
    definition: string;
  }>;
  gostReference?: string;
  formulas?: string[];
  /** Legacy primary image. Kept for compatibility with existing saved data. */
  imageUrl?: string;
  images?: SubsectionImage[];
  links?: SubsectionLink[];
}

export interface Section {
  id: string; // e.g. "1.1"
  title: string;
  subsections: Subsection[];
}

export interface Chapter {
  id: string; // e.g. "1" or "0"
  title: string;
  sections?: Section[];
  content?: string; // for simple chapters with just introductory content
}

export interface preparationResource {
  name: string;
  url: string;
  iconName: string;
  description: string;
  category: "external" | "file" | "link";
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  level?: "basic" | "advanced";
}

export interface QuizTest {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdAt: string;
  topic?: string;
  relatedSubsectionIds?: string[];
  sourceLabel?: string;
  coverageNote?: string;
}
