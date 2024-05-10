db.createUser(
    {
      user: 'labUser',
      pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
      roles: [{ role: 'readWrite', db: 'lab' }],
    },
  );