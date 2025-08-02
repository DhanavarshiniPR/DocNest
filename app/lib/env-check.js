// Environment variable validation
export function validateEnvironment() {
  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
    console.warn('Using fallback values for development');
  }

  return {
    hasRequiredVars: missingVars.length === 0,
    missingVars,
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
  };
}

// Safe environment variable getter
export function getEnvVar(name, fallback = '') {
  try {
    return process.env[name] || fallback;
  } catch (error) {
    console.warn(`Error accessing environment variable ${name}:`, error);
    return fallback;
  }
} 