export const ApiEndpoints = {
  auth: {
    login: '/api/auth/login.php',
    register: '/api/auth/register.php',
  },
  wallet: {
    balance: '/api/wallet/balance.php',
  },
  passenger: {
    currentRide: '/api/passenger/current-ride.php',
    requestRide: '/api/passenger/request-ride.php',
    requestPool: '/api/pool/request.php',
    cancelPool: '/api/pool/cancel.php',
  },
  pricing: {
    quote: '/api/pricing/quote.php',
  },
  admin: {
    pricing: '/api/admin/pricing.php',
    overview: '/api/admin/overview.php',
    reports: '/api/admin/reports.php',
    reportsPdf: '/api/admin/reports-pdf.php',
    drivers: '/api/admin/drivers.php',
    section: '/api/admin/section.php',
  },
  pool: {
    details: '/api/pool/details.php',
    confirm: '/api/pool/confirm.php',
  },
  driver: {
    register: '/api/drivers/register.php',
    currentRide: '/api/drivers/current-ride.php',
    availablePools: '/api/drivers/available-pools.php',
    acceptPool: '/api/drivers/accept-pool.php',
    startRide: '/api/drivers/start-ride.php',
    completeRide: '/api/drivers/complete-ride.php',
    updateLocation: '/api/drivers/update-location.php',
  },
} as const;
