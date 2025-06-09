const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllUsers() {
  try {
    console.log('🚀 Starting user deletion process...');
    
    // Step 1: Delete UserEvaluations
    console.log('1️⃣ Deleting user evaluations...');
    const deletedEvaluations = await prisma.userEvaluation.deleteMany({});
    console.log(`   ✅ Deleted ${deletedEvaluations.count} user evaluations`);
    
    // Step 2: Delete Notifications
    console.log('2️⃣ Deleting notifications...');
    const deletedNotifications = await prisma.notification.deleteMany({});
    console.log(`   ✅ Deleted ${deletedNotifications.count} notifications`);
    
    // Step 3: Delete Messages
    console.log('3️⃣ Deleting messages...');
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`   ✅ Deleted ${deletedMessages.count} messages`);
    
    // Step 4: Delete Notes
    console.log('4️⃣ Deleting notes...');
    const deletedNotes = await prisma.note.deleteMany({});
    console.log(`   ✅ Deleted ${deletedNotes.count} notes`);
    
    // Step 5: Delete Conversations
    console.log('5️⃣ Deleting conversations...');
    const deletedConversations = await prisma.conversation.deleteMany({});
    console.log(`   ✅ Deleted ${deletedConversations.count} conversations`);
    
    // Step 6: Delete all Events
    console.log('6️⃣ Deleting events...');
    const deletedEvents = await prisma.event.deleteMany({});
    console.log(`   ✅ Deleted ${deletedEvents.count} events`);
    
    // Step 7: Remove assignee references from AITasks
    console.log('7️⃣ Removing assignee references from AI tasks...');
    const updatedAITasks = await prisma.aITask.updateMany({
      where: {
        assigneeId: {
          not: null
        }
      },
      data: {
        assigneeId: null
      }
    });
    console.log(`   ✅ Updated ${updatedAITasks.count} AI tasks`);
    
    // Step 8: Remove assignee references from Tasks
    console.log('8️⃣ Removing assignee references from tasks...');
    const updatedTasks = await prisma.task.updateMany({
      where: {
        assigneeId: {
          not: null
        }
      },
      data: {
        assigneeId: null
      }
    });
    console.log(`   ✅ Updated ${updatedTasks.count} tasks`);
    
    // Step 9: Delete Collaborators
    console.log('9️⃣ Deleting collaborators...');
    const deletedCollaborators = await prisma.collaborator.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCollaborators.count} collaborators`);
    
    // Step 10: Delete Projects (this will cascade delete related data)
    console.log('🔟 Deleting projects...');
    const deletedProjects = await prisma.project.deleteMany({});
    console.log(`   ✅ Deleted ${deletedProjects.count} projects`);
    
    // Step 11: Finally, delete Users
    console.log('1️⃣1️⃣ Deleting users...');
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`   ✅ Deleted ${deletedUsers.count} users`);
    
    console.log('\n🎉 SUCCESS! All users and related data have been deleted.');
    console.log(`📊 Summary: ${deletedUsers.count} users removed from the database.`);
    
    return {
      success: true,
      deletedUsers: deletedUsers.count,
      summary: {
        evaluations: deletedEvaluations.count,
        notifications: deletedNotifications.count,
        messages: deletedMessages.count,
        notes: deletedNotes.count,
        conversations: deletedConversations.count,
        events: deletedEvents.count,
        updatedAITasks: updatedAITasks.count,
        updatedTasks: updatedTasks.count,
        collaborators: deletedCollaborators.count,
        projects: deletedProjects.count,
        users: deletedUsers.count
      }
    };
    
  } catch (error) {
    console.error('❌ Error deleting users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function if this script is run directly
deleteAllUsers()
  .then((result) => {
    console.log('\n📋 Final Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

module.exports = { deleteAllUsers };
