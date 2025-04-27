import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { logger } from './logger';

// Configuración de la estrategia JWT
export const configureJwtStrategy = (): void => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'default_jwt_secret',
  };

  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        // Aquí normalmente verificarías el usuario en la base de datos
        // Por ahora, simplemente validamos que el token tenga un ID de usuario
        if (payload.id) {
          return done(null, payload);
        }
        return done(null, false);
      } catch (error) {
        logger.error(`Error en autenticación JWT: ${(error as Error).message}`);
        return done(error, false);
      }
    })
  );

  logger.info('Estrategia JWT configurada');
};

// Configuración de la estrategia Google OAuth
export const configureGoogleStrategy = (): void => {
  // Verificar que las variables de entorno estén definidas
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = `${process.env.API_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  if (!clientID || !clientSecret) {
    logger.warn('Credenciales de Google OAuth no configuradas');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Aquí normalmente buscarías o crearías el usuario en la base de datos
          // Por ahora, devolvemos el perfil como usuario
          const user = {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            provider: 'google',
          };

          return done(null, user);
        } catch (error) {
          logger.error(`Error en autenticación Google: ${(error as Error).message}`);
          return done(error, false);
        }
      }
    )
  );

  logger.info('Estrategia Google OAuth configurada');
};

// Configuración de la estrategia Facebook OAuth
export const configureFacebookStrategy = (): void => {
  // Verificar que las variables de entorno estén definidas
  const clientID = process.env.FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_APP_SECRET;
  const callbackURL = `${process.env.API_URL || 'http://localhost:3000'}/api/auth/facebook/callback`;

  if (!clientID || !clientSecret) {
    logger.warn('Credenciales de Facebook OAuth no configuradas');
    return;
  }

  passport.use(
    new FacebookStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        profileFields: ['id', 'emails', 'name'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Aquí normalmente buscarías o crearías el usuario en la base de datos
          // Por ahora, devolvemos el perfil como usuario
          const user = {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            provider: 'facebook',
          };

          return done(null, user);
        } catch (error) {
          logger.error(`Error en autenticación Facebook: ${(error as Error).message}`);
          return done(error, false);
        }
      }
    )
  );

  logger.info('Estrategia Facebook OAuth configurada');
};

// Configuración de serialización y deserialización de usuarios
export const configurePassport = (): void => {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    // Aquí normalmente buscarías el usuario en la base de datos
    // Por ahora, simplemente devolvemos un objeto con el ID
    done(null, { id });
  });

  // Configurar estrategias
  configureJwtStrategy();
  configureGoogleStrategy();
  configureFacebookStrategy();

  logger.info('Passport configurado correctamente');
};

export default passport;