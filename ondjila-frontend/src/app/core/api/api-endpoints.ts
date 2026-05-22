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
    requestPool: '/api/pool/request.php',
    cancelPool: '/api/pool/cancel.php',
  },
  driver: {
    currentRide: '/api/drivers/current-ride.php',
    availablePools: '/api/drivers/available-pools.php',
    acceptPool: '/api/drivers/accept-pool.php',
    startRide: '/api/drivers/start-ride.php',
    completeRide: '/api/drivers/complete-ride.php',
  },
} as const;
