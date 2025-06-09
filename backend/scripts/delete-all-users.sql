-- SQL script to delete all users and related data
-- Execute this in order to respect foreign key constraints

-- 1. Delete UserEvaluations
DELETE FROM "UserEvaluation";

-- 2. Delete Notifications  
DELETE FROM "Notification";

-- 3. Delete Messages
DELETE FROM "Message";

-- 4. Delete Notes
DELETE FROM "Note";

-- 5. Delete Conversations
DELETE FROM "Conversation";

-- 6. Delete Events
DELETE FROM "Event";

-- 7. Remove assignee references from AITasks
UPDATE "AITask" SET "assigneeId" = NULL WHERE "assigneeId" IS NOT NULL;

-- 8. Remove assignee references from Tasks
UPDATE "Task" SET "assigneeId" = NULL WHERE "assigneeId" IS NOT NULL;

-- 9. Delete Collaborators
DELETE FROM "Collaborator";

-- 10. Delete Projects (this will cascade delete related Tasks and AITasks)
DELETE FROM "Project";

-- 11. Finally, delete Users
DELETE FROM "User";

-- Verify deletion
SELECT 'Users' as table_name, COUNT(*) as remaining_count FROM "User"
UNION ALL
SELECT 'Projects', COUNT(*) FROM "Project"
UNION ALL
SELECT 'Tasks', COUNT(*) FROM "Task"
UNION ALL
SELECT 'AITasks', COUNT(*) FROM "AITask"
UNION ALL
SELECT 'Collaborators', COUNT(*) FROM "Collaborator"
UNION ALL
SELECT 'Messages', COUNT(*) FROM "Message"
UNION ALL
SELECT 'Notes', COUNT(*) FROM "Note"
UNION ALL
SELECT 'Conversations', COUNT(*) FROM "Conversation"
UNION ALL
SELECT 'Notifications', COUNT(*) FROM "Notification"
UNION ALL
SELECT 'UserEvaluations', COUNT(*) FROM "UserEvaluation"
UNION ALL
SELECT 'Events', COUNT(*) FROM "Event";
