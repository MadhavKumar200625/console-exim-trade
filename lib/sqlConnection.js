// Fill these values locally. Do not commit real credentials.
const sqlConfig = {
  user: "madhav",
  password: "!Developer@321",
  server: "103.30.72.71",
  database: "exim_dashboard",
  port: 1433,
 options: {

    encrypt: false,

    trustServerCertificate: true,

  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

export default sqlConfig;
