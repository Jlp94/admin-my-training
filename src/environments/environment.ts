export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/my-training/v1',

    // ─── Auth ───
  auth: {
    login:   '/auth/login',
    profile: '/auth/profile',
  },

  // ─── Users ───
  users: {
    base:             '/users',
    me:               '/users/me',
    createAdmin:      '/users/admin',
    byId:             '/users/:id',
    macros:           '/users/:id/macros',
    dietLogs:         '/users/:id/diet-logs',
    neatLogs:         '/users/:id/neat-logs',
    neatLogByDate:    '/users/:id/neat-logs/:date',
    workoutLogs:      '/users/:id/workout-logs',
    workoutLogByDate: '/users/:id/workout-logs/:date',
    exerciseLog:      '/users/:id/exercise-log/:exerciseId',
  },

  // ─── Exercises ───
  exercises: {
    base: '/exercises',       // GET ?name= &category=
    byId: '/exercises/:id',
  },

  // ─── Foods ───
  foods: {
    base: '/foods',           // GET ?name=
    byId: '/foods/:id',
  },

  // ─── Cardio ───
  cardio: {
    base: '/cardio',
    byId: '/cardio/:id',
  },

  // ─── Diets ───
  diets: {
    base: '/diets',           // GET ?userId=
    byId: '/diets/:id',
  },

  // ─── Routines ───
  routines: {
    base:           '/routines',          // GET ?userId=
    byId:           '/routines/:id',
    sessionByDay:   '/routines/:id/sessions/:day',
    addExercise:    '/routines/:id/sessions/:day/exercises',
    removeExercise: '/routines/:id/sessions/:day/exercises/:exerciseId',
  },

};
