export interface SurveySession {
  id: string;
  startedAt: string;
  lastActivity: string;
  currentStep: number;
  currentCategory?: string;
  completed: boolean;
  abandoned: boolean;
  completedAt?: string;
}

export interface AnalyticsData {
  totalStarts: number;
  totalCompletions: number;
  totalAbandoned: number;
  conversionRate: number;
  dropoffByCategory: Record<string, number>;
  averageTimeToComplete: number;
  sessions: SurveySession[];
  contactMethods: {
    email: number;
    phone: number;
    emailPercentage: number;
    phonePercentage: number;
  };
}

const ANALYTICS_KEY = 'survey_analytics';
const SESSION_KEY = 'current_survey_session';

export function startSurveySession(): string {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session: SurveySession = {
    id: sessionId,
    startedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    currentStep: 0,
    completed: false,
    abandoned: false,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  saveSessionToAnalytics(session);
  
  return sessionId;
}

export function updateSessionProgress(step: number, categoryId?: string) {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return;

  const session: SurveySession = JSON.parse(sessionStr);
  session.currentStep = step;
  session.currentCategory = categoryId;
  session.lastActivity = new Date().toISOString();

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  updateSessionInAnalytics(session);
}

export function completeSurveySession() {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return;

  const session: SurveySession = JSON.parse(sessionStr);
  session.completed = true;
  session.completedAt = new Date().toISOString();
  session.lastActivity = new Date().toISOString();

  updateSessionInAnalytics(session);
  localStorage.removeItem(SESSION_KEY);
}

export function abandonSurveySession() {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return;

  const session: SurveySession = JSON.parse(sessionStr);
  
  // Only mark as abandoned if they progressed beyond start
  if (session.currentStep > 0 && !session.completed) {
    session.abandoned = true;
    session.lastActivity = new Date().toISOString();
    updateSessionInAnalytics(session);
  }
  
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentSession(): SurveySession | null {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  return sessionStr ? JSON.parse(sessionStr) : null;
}

function saveSessionToAnalytics(session: SurveySession) {
  const analytics = getAnalytics();
  analytics.sessions.push(session);
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
}

function updateSessionInAnalytics(session: SurveySession) {
  const analytics = getAnalytics();
  const index = analytics.sessions.findIndex(s => s.id === session.id);
  
  if (index !== -1) {
    analytics.sessions[index] = session;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  }
}

function getAnalytics(): { sessions: SurveySession[] } {
  const analyticsStr = localStorage.getItem(ANALYTICS_KEY);
  return analyticsStr ? JSON.parse(analyticsStr) : { sessions: [] };
}

export function calculateAnalytics(): AnalyticsData {
  const { sessions } = getAnalytics();
  
  const totalStarts = sessions.length;
  const totalCompletions = sessions.filter(s => s.completed).length;
  const totalAbandoned = sessions.filter(s => s.abandoned).length;
  const conversionRate = totalStarts > 0 ? (totalCompletions / totalStarts) * 100 : 0;

  // Calculate drop-off by category
  const dropoffByCategory: Record<string, number> = {};
  sessions.filter(s => s.abandoned && s.currentCategory).forEach(s => {
    if (s.currentCategory) {
      dropoffByCategory[s.currentCategory] = (dropoffByCategory[s.currentCategory] || 0) + 1;
    }
  });

  // Calculate average time to complete (in minutes)
  const completedSessions = sessions.filter(s => s.completed && s.completedAt);
  const averageTimeToComplete = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => {
        const start = new Date(s.startedAt).getTime();
        const end = new Date(s.completedAt!).getTime();
        return sum + (end - start);
      }, 0) / completedSessions.length / 60000 // Convert to minutes
    : 0;

  // Calculate contact method stats from localStorage responses
  const responsesStr = localStorage.getItem('survey_responses');
  const responses = responsesStr ? JSON.parse(responsesStr) : [];
  
  const emailCount = responses.filter((r: any) => r.contactMethod === 'email').length;
  const phoneCount = responses.filter((r: any) => r.contactMethod === 'phone').length;
  const totalContacts = emailCount + phoneCount;

  return {
    totalStarts,
    totalCompletions,
    totalAbandoned,
    conversionRate,
    dropoffByCategory,
    averageTimeToComplete,
    sessions,
    contactMethods: {
      email: emailCount,
      phone: phoneCount,
      emailPercentage: totalContacts > 0 ? (emailCount / totalContacts) * 100 : 0,
      phonePercentage: totalContacts > 0 ? (phoneCount / totalContacts) * 100 : 0,
    },
  };
}

export function clearAnalytics() {
  localStorage.removeItem(ANALYTICS_KEY);
  localStorage.removeItem(SESSION_KEY);
}
