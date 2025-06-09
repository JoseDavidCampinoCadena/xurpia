/**
 * Utility functions for checking user permissions in projects
 */

import { Project } from '../hooks/useProjects';

export interface UserPermissions {
  isOwner: boolean;
  isCollaborator: boolean;
  canViewTasks: boolean;
  canViewChats: boolean;
  canViewCalendar: boolean;
  canCreateEvents: boolean;
  canManageProject: boolean;
}

/**
 * Determines the user's role and permissions for a given project
 */
export function getUserPermissions(
  user: { id: number } | null,
  project: Project | undefined
): UserPermissions {
  if (!user || !project) {
    return {
      isOwner: false,
      isCollaborator: false,
      canViewTasks: false,
      canViewChats: false,
      canViewCalendar: false,
      canCreateEvents: false,
      canManageProject: false,
    };
  }

  const isOwner = project.ownerId === user.id;
  const isCollaborator = project.collaborators?.some(
    (collab) => collab.user?.id === user.id || collab.userId === user.id
  ) || false;

  // Owners have full permissions
  if (isOwner) {
    return {
      isOwner: true,
      isCollaborator: true, // Owners are also considered collaborators
      canViewTasks: true,
      canViewChats: true,
      canViewCalendar: true,
      canCreateEvents: true,
      canManageProject: true,
    };
  }

  // Collaborators have restricted permissions
  if (isCollaborator) {
    return {
      isOwner: false,
      isCollaborator: true,
      canViewTasks: false, // Collaborators cannot see tasks
      canViewChats: false, // Collaborators cannot see chats
      canViewCalendar: true, // Collaborators can view calendar
      canCreateEvents: false, // Collaborators cannot create events
      canManageProject: false,
    };
  }

  // No access if not owner or collaborator
  return {
    isOwner: false,
    isCollaborator: false,
    canViewTasks: false,
    canViewChats: false,
    canViewCalendar: false,
    canCreateEvents: false,
    canManageProject: false,
  };
}

/**
 * Checks if a user can access a specific project
 */
export function canAccessProject(
  user: { id: number } | null,
  project: Project | undefined
): boolean {
  if (!user || !project) {
    return false;
  }

  const permissions = getUserPermissions(user, project);
  return permissions.isOwner || permissions.isCollaborator;
}

/**
 * Gets the user's role string for display purposes
 */
export function getUserRole(
  user: { id: number } | null,
  project: Project | undefined
): 'owner' | 'collaborator' | 'none' {
  if (!user || !project) {
    return 'none';
  }

  const permissions = getUserPermissions(user, project);
  if (permissions.isOwner) {
    return 'owner';
  }
  if (permissions.isCollaborator) {
    return 'collaborator';
  }
  return 'none';
}
