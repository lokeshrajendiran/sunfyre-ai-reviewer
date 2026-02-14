import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { config } from './index';
import { User } from '../models';

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: config.github.clientId,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackURL,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // Update existing user
          user.accessToken = accessToken;
          user.username = profile.username;
          user.email = profile.emails?.[0]?.value;
          user.avatarUrl = profile.photos?.[0]?.value;
          user.profile = {
            displayName: profile.displayName || profile.username,
            profileUrl: profile.profileUrl,
          };
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            email: profile.emails?.[0]?.value,
            avatarUrl: profile.photos?.[0]?.value,
            accessToken,
            profile: {
              displayName: profile.displayName || profile.username,
              profileUrl: profile.profileUrl,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
