const axios = require('axios');

async function testAssignmentAPI() {
  try {
    console.log('🧪 Testing Assignment API Endpoint...\n');

    const BASE_URL = 'http://localhost:3001';
    const PROJECT_ID = 29; // COMFANDI project
    
    // We need to authenticate first. For testing, we'll use admin credentials
    console.log('🔐 Authenticating...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@gmail.com',
      password: 'admin'
    });

    const token = loginResponse.data.token;
    console.log('✅ Authentication successful');

    // Now call the assignment endpoint
    console.log(`📋 Calling assignment endpoint for project ${PROJECT_ID}...`);
    
    const assignmentResponse = await axios.post(
      `${BASE_URL}/ai-tasks/assign-daily-tasks/${PROJECT_ID}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('🎯 Assignment Result:');
    console.log(JSON.stringify(assignmentResponse.data, null, 2));

    // Now let's verify the assignments by getting the AI tasks
    console.log('\n📊 Verificando asignaciones...');
    
    const tasksResponse = await axios.get(
      `${BASE_URL}/ai-tasks/project/${PROJECT_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const tasks = tasksResponse.data;
    
    let ownerTasks = 0;
    let collaboratorTasks = 0;
    let unassignedTasks = 0;
    
    // Assuming owner ID is 22 based on previous test
    const OWNER_ID = 22;
    
    tasks.forEach(task => {
      if (!task.assignee) {
        unassignedTasks++;
      } else if (task.assignee.id === OWNER_ID) {
        ownerTasks++;
      } else {
        collaboratorTasks++;
      }
    });

    console.log(`\n📊 Resultados de asignación:`);
    console.log(`  👑 Tareas asignadas al Owner: ${ownerTasks}`);
    console.log(`  👥 Tareas asignadas a Colaboradores: ${collaboratorTasks}`);
    console.log(`  ❓ Tareas sin asignar: ${unassignedTasks}`);

    if (ownerTasks === 0 && collaboratorTasks > 0) {
      console.log('\n✅ ¡ÉXITO! Las tareas se asignaron correctamente a colaboradores');
    } else if (ownerTasks > 0) {
      console.log('\n❌ PROBLEMA: Aún hay tareas asignadas al owner');
    } else if (collaboratorTasks === 0) {
      console.log('\n⚠️ WARNING: No se asignaron tareas a nadie');
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection Error: ¿Está el servidor backend ejecutándose en http://localhost:3001?');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAssignmentAPI();
