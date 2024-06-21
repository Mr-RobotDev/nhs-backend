export default () => ({
  port: process.env.PORT,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  secrets: {
    forgotPassword: process.env.FORGOT_PASSWORD_SECRET,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
  sendgrid: {
    key: process.env.SG_API_KEY,
    from: process.env.SG_FROM,
    dashboardReportTemplate: process.env.SG_DASHBOARD_REPORT_TEMPLATE,
    deviceAlertTemplate: process.env.SG_DEVICE_ALERT_TEMPLATE,
  },
  spaces: {
    cdn: process.env.SPACES_CDN_ENDPOINT,
    endpoint: process.env.SPACES_ENDPOINT,
    bucket: process.env.SPACES_BUCKET,
    region: process.env.SPACES_REGION,
    accessKey: process.env.SPACES_ACCESS_KEY,
    secretKey: process.env.SPACES_SECRET_KEY,
  },
  dataConnectorSecret: process.env.DATA_CONNECTOR_SECRET,
});
