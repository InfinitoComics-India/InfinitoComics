import CrudRepository from "./crud-repository.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
class UserRepository extends CrudRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    try {
      return await User.findOne({ email: email });
    } catch (error) {
      console.log("Error in findByEmail:", error);
      throw error;
    }
  }

  async createuser(data) {
        try {
            const verificationcode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

            const dataWithOtp = {
            ...data,
            verificationcode,
            verificationCodeExpiresAt: expiresAt
            };

            const newUser = await User.create(dataWithOtp);

            sendEmail(
                newUser.email,
                'Email Verification - Action Required',
                `Hi Infinito Member,\n\nThank you for registering with Infinito Comics!\n\nTo verify your email address and ensure the security of your account, please use the verification code below:\n\nVerification Code: ${verificationcode}\n\nPlease note that this code is valid for 10 minutes only.\n\nIf you did not initiate this registration or verification request, please ignore this email.\n\nBest regards,\nInfinito Comics`
            );
            return newUser;
        } catch (error) {
            console.log('something wrong at repo level');
            throw error;
        }
    }

  

      async verify(data) {
        try {
            const user = await User.findOne({
                verificationcode: data.code
            });

            // If no user found or OTP doesn't match
            if (!user) throw new Error("Invalid verification code");

            // Check if OTP is expired
            if (!user.verificationCodeExpiresAt || Date.now() > user.verificationCodeExpiresAt.getTime()) {
                throw new Error("Verification code has expired");
            }

            // Mark user as verified
            user.isverified = true;
            user.verificationcode = null;
            user.verificationCodeExpiresAt = null;

            await user.save();

            return user;

        } catch (error) {
            throw error;
        }
      }
}

export default UserRepository;
