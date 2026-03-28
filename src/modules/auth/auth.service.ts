import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../../config/env";
import { prisma } from "../../shared/prisma/prisma";
import type { SigninBody, SignupBody } from "./auth.schemas";

const SALT_ROUNDS = 10;

export class AuthService {
  async signup(body: SignupBody) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = this.generateToken(user.id, user.email);

    return {
      user,
      token,
    };
  }

  async signin(body: SigninBody) {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  generateToken(userId: string, email: string) {
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    };

    return jwt.sign(
      {
        userId,
        email,
      },
      env.JWT_SECRET,
      options,
    );
  }

  verifyToken(token: string) {
    return jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
    };
  }
}