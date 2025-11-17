# Security Guidelines for Prestamax

This document outlines security best practices and guidelines for the Prestamax application.

## Overview

Prestamax is a financial application that handles sensitive user data including personal information, contact details, and loan applications. Security must be a top priority in all aspects of development and deployment.

## Critical Security Issues Identified and Remediation

### 1. Credentials Management

**⚠️ CRITICAL: Never commit credentials to version control**

#### Issues Found:
- Hardcoded database credentials in `docker-compose.yml`
- Default user credentials in application code
- Weak JWT secret defaults

#### Remediation:

1. **Use Environment Variables for All Credentials**
   - Create a `.env` file (never commit this file!)
   - Use strong, randomly generated passwords
   - Rotate credentials regularly

2. **Docker Compose Configuration**
   - Use a separate `.env` file for docker-compose
   - Example `.env` for docker-compose:
     ```env
     MYSQL_ROOT_PASSWORD=<STRONG_RANDOM_PASSWORD>
     MYSQL_DATABASE=prestamax
     MYSQL_USER=prestamaxuser
     MYSQL_PASSWORD=<STRONG_RANDOM_PASSWORD>
     ```

3. **Backend Configuration**
   - Copy `prestamax-backend/.env.example` to `prestamax-backend/.env`
   - Update all default values with strong credentials:
     ```env
     DB_HOST=127.0.0.1
     DB_USER=prestamaxuser
     DB_PASS=<STRONG_RANDOM_PASSWORD>
     DB_NAME=prestamax
     DB_PORT=3306
     JWT_SECRET=<STRONG_RANDOM_SECRET_AT_LEAST_32_CHARS>
     PORT=3001
     ```

4. **Generate Strong Secrets**
   ```bash
   # Generate a strong JWT secret (at least 32 characters)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Or use OpenSSL
   openssl rand -hex 32
   ```

### 2. Network Security

**⚠️ HIGH: Insecure HTTP connections in production**

#### Issues:
- Frontend JavaScript files use hardcoded `http://localhost:3001` URLs
- No HTTPS enforcement

#### Remediation:

1. **Use Environment-Aware URLs**
   - Create a configuration file for frontend URLs
   - Use relative URLs when frontend and backend are on the same domain
   - For different domains, use HTTPS in production

2. **Enable HTTPS**
   - Use Let's Encrypt for free SSL/TLS certificates
   - Configure reverse proxy (nginx/Apache) with SSL
   - Enforce HTTPS redirect

3. **Update Frontend Configuration**
   - Replace hardcoded URLs with configurable endpoints
   - Use environment detection (development vs production)

### 3. Application Security Headers

**⚠️ MEDIUM: Missing security headers**

#### Required Headers:

1. **Content Security Policy (CSP)**
   - Prevents XSS attacks
   - Restricts resource loading

2. **HTTP Strict Transport Security (HSTS)**
   - Forces HTTPS connections
   - Prevents protocol downgrade attacks

3. **X-Frame-Options**
   - Prevents clickjacking
   - Set to `DENY` or `SAMEORIGIN`

4. **X-Content-Type-Options**
   - Prevents MIME sniffing
   - Set to `nosniff`

5. **X-XSS-Protection**
   - Browser XSS filter
   - Set to `1; mode=block`

#### Implementation:
Install and configure helmet.js in the backend:
```bash
cd prestamax-backend
npm install helmet
```

Add to `index.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 4. Rate Limiting

**⚠️ MEDIUM: No rate limiting on sensitive endpoints**

#### Vulnerable Endpoints:
- `/login` - Brute force attacks
- `/contact` - Spam/DoS
- `/consultas` - Spam/DoS

#### Remediation:
Install and configure rate limiting:
```bash
cd prestamax-backend
npm install express-rate-limit
```

Example configuration:
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Demasiados intentos de inicio de sesión. Intente nuevamente en 15 minutos.'
});

app.post('/login', loginLimiter, ...);
```

### 5. Input Validation and Sanitization

**✓ GOOD: Using express-validator**

The application already uses `express-validator` which is excellent. Continue to:
- Validate all user inputs
- Sanitize data with `.escape()` and `.trim()`
- Use `.normalizeEmail()` for email fields

### 6. SQL Injection Prevention

**✓ GOOD: Using parameterized queries**

The application uses parameterized queries with `mysql2`, which prevents SQL injection. Continue this practice:
- Always use `?` placeholders
- Never concatenate user input into SQL strings

### 7. CORS Configuration

**⚠️ LOW: CORS allows all origins**

#### Current Configuration:
```javascript
app.use(cors());
```

#### Production Configuration:
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'https://yourdomain.com',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### 8. Authentication and Authorization

**✓ GOOD: Using bcrypt and JWT**

Current implementation is secure:
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiration
- Protected endpoints with middleware

#### Recommendations:
1. Increase bcrypt rounds to 12 in production
2. Implement token refresh mechanism
3. Add token blacklist for logout
4. Consider implementing 2FA for admin accounts

### 9. Logging and Monitoring

**✓ GOOD: Activity logging**

The application logs suspicious messages and login activity.

#### Additional Recommendations:
1. Log all authentication attempts (success and failure)
2. Monitor for unusual patterns
3. Set up alerts for security events
4. Never log sensitive data (passwords, tokens, PII)

### 10. Dependency Security

**⚠️ MEDIUM: Regular dependency updates needed**

#### Best Practices:
1. Run `npm audit` regularly
2. Update dependencies with security patches
3. Use `npm audit fix` for automatic fixes
4. Review all dependencies before adding new ones

```bash
cd prestamax-backend
npm audit
npm audit fix
```

## Deployment Security Checklist

### Before Deploying to Production:

- [ ] All credentials stored in environment variables (never in code)
- [ ] Strong, unique passwords for all services (32+ characters)
- [ ] JWT secret is cryptographically random (64+ characters)
- [ ] HTTPS enabled with valid SSL/TLS certificate
- [ ] Security headers configured (helmet.js)
- [ ] Rate limiting enabled on all public endpoints
- [ ] CORS restricted to specific domains
- [ ] Database accessible only from backend server
- [ ] Database uses strong authentication
- [ ] Firewall rules configured (only necessary ports open)
- [ ] Regular backups configured and tested
- [ ] Error messages don't expose system information
- [ ] Debug/verbose logging disabled
- [ ] Default admin account removed or password changed
- [ ] All dependencies updated to latest secure versions
- [ ] `NODE_ENV=production` set
- [ ] Application runs as non-root user
- [ ] File upload validation (if applicable)
- [ ] Session management secure (if using sessions)

## Incident Response

If you discover a security vulnerability:

1. **Do not** create a public GitHub issue
2. Email the security team immediately
3. Include detailed description of the vulnerability
4. Include steps to reproduce
5. Wait for acknowledgment before public disclosure

## Regular Security Maintenance

### Weekly:
- Review application logs for suspicious activity
- Check for failed login attempts

### Monthly:
- Run `npm audit` and update dependencies
- Review user accounts and remove unused ones
- Check SSL/TLS certificate expiration

### Quarterly:
- Rotate database credentials
- Review and update firewall rules
- Security training for development team

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MySQL Security Guidelines](https://dev.mysql.com/doc/refman/8.0/en/security-guidelines.html)

## Version History

- **2025-11-17**: Initial security documentation created
  - Identified critical security issues
  - Documented remediation steps
  - Created deployment checklist
