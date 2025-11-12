/**
 * Admin Stats Service
 * Fetches statistics for admin dashboard
 */

import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';

/**
 * Get support chat statistics
 */
export async function getSupportChatStats() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const todayTimestamp = Timestamp.fromDate(todayStart);
    const weekTimestamp = Timestamp.fromDate(weekStart);

    // Get all chats
    const allChatsQuery = query(collection(db, 'supportChats'));
    const allChatsSnapshot = await getDocs(allChatsQuery);
    const allChats = allChatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate stats
    const totalChats = allChats.length;
    const activeChats = allChats.filter(chat => chat.status === 'active').length;
    const resolvedChats = allChats.filter(chat => chat.status === 'resolved').length;
    
    const todayChats = allChats.filter(chat => {
      const createdAt = chat.createdAt?.toDate?.() || new Date(chat.createdAt);
      return createdAt >= todayStart;
    }).length;

    const weekChats = allChats.filter(chat => {
      const createdAt = chat.createdAt?.toDate?.() || new Date(chat.createdAt);
      return createdAt >= weekStart;
    }).length;

    // Calculate average response time (if we have response data)
    let avgResponseTime = null;
    const chatsWithResponses = allChats.filter(chat => {
      const messages = chat.messages || [];
      return messages.some(msg => msg.role === 'support');
    });

    if (chatsWithResponses.length > 0) {
      const responseTimes = chatsWithResponses.map(chat => {
        const messages = chat.messages || [];
        const firstUserMsg = messages.find(msg => msg.role === 'user');
        const firstSupportMsg = messages.find(msg => msg.role === 'support');
        
        if (firstUserMsg && firstSupportMsg) {
          const userTime = firstUserMsg.timestamp?.toDate?.() || new Date(firstUserMsg.timestamp);
          const supportTime = firstSupportMsg.timestamp?.toDate?.() || new Date(firstSupportMsg.timestamp);
          return (supportTime - userTime) / (1000 * 60); // Convert to minutes
        }
        return null;
      }).filter(time => time !== null && time > 0);

      if (responseTimes.length > 0) {
        avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      }
    }

    return {
      success: true,
      stats: {
        total: totalChats,
        active: activeChats,
        resolved: resolvedChats,
        today: todayChats,
        thisWeek: weekChats,
        avgResponseTimeMinutes: avgResponseTime ? Math.round(avgResponseTime) : null,
        resolutionRate: totalChats > 0 ? Math.round((resolvedChats / totalChats) * 100) : 0,
      },
    };
  } catch (error) {
    console.error('Error fetching support chat stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  try {
    // Get total users (from auth - we'll approximate from onboardingApplications)
    const onboardingQuery = query(collection(db, 'onboardingApplications'));
    const onboardingSnapshot = await getDocs(onboardingQuery);
    const applications = onboardingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const uniqueUsers = new Set(applications.map(app => app.userId));
    const totalUsers = uniqueUsers.size;

    // Get active assessments (conversations in progress)
    const conversationsQuery = query(collection(db, 'conversations'));
    const conversationsSnapshot = await getDocs(conversationsQuery);
    const conversations = conversationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const activeAssessments = conversations.filter(conv => {
      const assessmentData = conv.assessmentData || {};
      return !assessmentData.completed;
    }).length;

    // Get completed onboardings
    const completedOnboardings = applications.filter(app => {
      const status = app.status;
      return status === 'complete' || status === 'scheduled' || status === 'insurance_submitted';
    }).length;

    // Get in-progress onboardings
    const inProgressOnboardings = applications.filter(app => {
      const status = app.status;
      return status === 'assessment_complete' || status === 'in_progress';
    }).length;

    return {
      success: true,
      stats: {
        total: totalUsers,
        activeAssessments,
        completedOnboardings,
        inProgressOnboardings,
        onboardingCompletionRate: applications.length > 0 
          ? Math.round((completedOnboardings / applications.length) * 100) 
          : 0,
      },
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get appointment statistics
 */
export async function getAppointmentStats() {
  try {
    const appointmentsQuery = query(collection(db, 'appointments'));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const totalAppointments = appointments.length;
    const scheduledAppointments = appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'pending').length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;

    const todayAppointments = appointments.filter(apt => {
      const dateTime = apt.dateTime?.toDate?.() || new Date(apt.dateTime);
      return dateTime >= todayStart && dateTime < new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    }).length;

    const weekAppointments = appointments.filter(apt => {
      const dateTime = apt.dateTime?.toDate?.() || new Date(apt.dateTime);
      return dateTime >= weekStart;
    }).length;

    return {
      success: true,
      stats: {
        total: totalAppointments,
        scheduled: scheduledAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        today: todayAppointments,
        thisWeek: weekAppointments,
        completionRate: totalAppointments > 0 
          ? Math.round((completedAppointments / totalAppointments) * 100) 
          : 0,
      },
    };
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get assessment statistics
 */
export async function getAssessmentStats() {
  try {
    const conversationsQuery = query(collection(db, 'conversations'));
    const conversationsSnapshot = await getDocs(conversationsQuery);
    const conversations = conversationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const totalAssessments = conversations.length;
    const completedAssessments = conversations.filter(conv => {
      const assessmentData = conv.assessmentData || {};
      return assessmentData.completed === true;
    }).length;

    const inProgressAssessments = conversations.filter(conv => {
      const assessmentData = conv.assessmentData || {};
      return !assessmentData.completed;
    }).length;

    const todayAssessments = conversations.filter(conv => {
      const createdAt = conv.createdAt?.toDate?.() || new Date(conv.createdAt);
      return createdAt >= todayStart;
    }).length;

    const weekAssessments = conversations.filter(conv => {
      const createdAt = conv.createdAt?.toDate?.() || new Date(conv.createdAt);
      return createdAt >= weekStart;
    }).length;

    // Calculate suitability breakdown
    const suitable = conversations.filter(conv => {
      const assessmentData = conv.assessmentData || {};
      return assessmentData.suitability === 'suitable';
    }).length;

    const notSuitable = conversations.filter(conv => {
      const assessmentData = conv.assessmentData || {};
      return assessmentData.suitability === 'not_suitable';
    }).length;

    const crisis = conversations.filter(conv => {
      const assessmentData = conv.assessmentData || {};
      return assessmentData.crisisDetected === true || assessmentData.suitability === 'crisis';
    }).length;

    return {
      success: true,
      stats: {
        total: totalAssessments,
        completed: completedAssessments,
        inProgress: inProgressAssessments,
        today: todayAssessments,
        thisWeek: weekAssessments,
        completionRate: totalAssessments > 0 
          ? Math.round((completedAssessments / totalAssessments) * 100) 
          : 0,
        suitable,
        notSuitable,
        crisis,
      },
    };
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all admin statistics
 */
export async function getAllAdminStats() {
  try {
    const [supportStats, userStats, appointmentStats, assessmentStats] = await Promise.all([
      getSupportChatStats(),
      getUserStats(),
      getAppointmentStats(),
      getAssessmentStats(),
    ]);

    return {
      success: true,
      stats: {
        support: supportStats.success ? supportStats.stats : null,
        users: userStats.success ? userStats.stats : null,
        appointments: appointmentStats.success ? appointmentStats.stats : null,
        assessments: assessmentStats.success ? assessmentStats.stats : null,
      },
      errors: {
        support: supportStats.success ? null : supportStats.error,
        users: userStats.success ? null : userStats.error,
        appointments: appointmentStats.success ? null : appointmentStats.error,
        assessments: assessmentStats.success ? null : assessmentStats.error,
      },
    };
  } catch (error) {
    console.error('Error fetching all admin stats:', error);
    return { success: false, error: error.message };
  }
}

export default {
  getSupportChatStats,
  getUserStats,
  getAppointmentStats,
  getAssessmentStats,
  getAllAdminStats,
};

