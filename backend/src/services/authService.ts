import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import ProfilePicture from '../models/ProfilePictureConfig';

class AuthService {
  // user registration
  public async registerUser(name: string, email: string, username: string, password: string) {
    try {
      const usernameAlreadyExists = await User.findOne({ username });
      const emailAlreadyExists = await User.findOne({ email: { $exists: true, $eq: email } });

      if (usernameAlreadyExists) {
      throw new Error('Username already exists');
      }

      if (emailAlreadyExists) {
        throw new Error('This email is already registered with an account. Please login.');
      }

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      const defaultProfile = await ProfilePicture.create({
        bgColor: "#FFFFFF",
        baseImage: "./images/goose.png",
        accessory: "",
        heldItem: "",
      });


      const profilePictureId = defaultProfile._id;

      await User.create({
        name: name, 
        email: email, 
        username: username, 
        password: hashedPassword,
        dailyStreakCount: 0,
        longestStreak: 0,
        totalExp: 0,
        profile: profilePictureId,
       });
      const foundUser = await User.findOne({ username });
      const token = this.getJwtToken(foundUser?._id, foundUser?.username);

      return {
        token: token, 
        id: foundUser?._id, 
        username: username
      };

    } catch (error: any) {
      console.error('Error:', error);
      throw new Error(error.message);
    }
  }

  // user login
  public async loginUser(username: string, password: string) {
    try {
      const foundUser = await User.findOne({ username });
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      if (!foundUser || foundUser.password !== hashedPassword) {
        throw new Error('Invalid credentials');
      }

      return this.getJwtToken(foundUser._id, foundUser.username);

    } catch (error: any) {
      console.error('Error:', error);
      throw new Error(error.message);
    }
  }

  // generate jwt based on user name and id
  private getJwtToken(userId: any, username: any) {
      return jwt.sign(
        { id: userId, username: username },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' }
      );
  }
}

export default new AuthService();
