// src/users.routes.ts
import express, { Request, Response } from "express";
import { UnitUser, User } from "./users.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./users.database";

const userRouter = express.Router();

// Get all users
userRouter.get("/users", async (req: Request, res: Response) => {
    try {
        const allUsers: UnitUser[] = await database.findAll();
        
        if (!allUsers || allUsers.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: "No users at this time." });
        }

        return res.status(StatusCodes.OK).json({ total_users: allUsers.length, allUsers });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

// Get user by ID
userRouter.get("/user/:id", async (req: Request, res: Response) => {
    try {
        const user: UnitUser | null = await database.findOne(req.params.id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found!' });
        }
        return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

// Register new user
userRouter.post("/register", async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters." });
        }
        if (await database.findByEmail(email)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "This email has already been registered." });
        }
        const newUser = await database.create(req.body);
        return res.status(StatusCodes.CREATED).json({ newUser });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

// Login user
userRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters." });
        }
        const user = await database.comparePassword(email, password);
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid email or password!" });
        }
        return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

// Update user
userRouter.put("/user/:id", async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters." });
        }
        const user = await database.findOne(req.params.id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `No user with id ${req.params.id}` });
        }
        const updatedUser = await database.update(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({ updatedUser });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

// Delete user
userRouter.delete("/user/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const user = await database.findOne(id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "User does not exist" });
        }
        await database.remove(id);
        return res.status(StatusCodes.OK).json({ msg: "User deleted" });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

export default userRouter;