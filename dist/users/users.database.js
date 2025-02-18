import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import fs from "fs";
let users = loadUsers();
function loadUsers() {
    try {
        const data = fs.readFileSync("./users.json", "utf-8");
        return JSON.parse(data);
    }
    catch (error) {
        console.log(`Error loading users: ${error}`);
        return {}; // Return an empty object if loading fails
    }
}
function saveUsers() {
    try {
        fs.writeFileSync("./users.json", JSON.stringify(users, null, 2), "utf-8");
        console.log("Users saved successfully!");
    }
    catch (error) {
        console.log(`Error saving users: ${error}`);
    }
}
export const findAll = async () => {
    return Object.values(users);
};
export const findOne = async (id) => {
    return users[id] || null;
};
export const create = async (userData) => {
    try {
        let id = random();
        let check_user = await findOne(id);
        // Ensure a unique ID for the user
        while (check_user) {
            id = random();
            check_user = await findOne(id);
        }
        // Hash the user's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const user = {
            id,
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
        };
        users[id] = user;
        saveUsers();
        return user;
    }
    catch (error) {
        console.log(`Error creating user: ${error}`);
        return null;
    }
};
export const findByEmail = async (user_email) => {
    try {
        const allUsers = await findAll();
        const getUser = allUsers.find((result) => user_email === result.email);
        return getUser || null;
    }
    catch (error) {
        console.log(`Error finding user by email: ${error}`);
        return null;
    }
};
export const comparePassword = async (email, supplied_password) => {
    try {
        const user = await findByEmail(email);
        if (!user) {
            return null; // User not found
        }
        const decryptPassword = await bcrypt.compare(supplied_password, user.password);
        if (!decryptPassword) {
            return null; // Passwords do not match
        }
        return user;
    }
    catch (error) {
        console.log(`Error comparing password: ${error}`);
        return null;
    }
};
export const update = async (id, updateValues) => {
    try {
        const userExists = await findOne(id);
        if (!userExists) {
            return null; // User doesn't exist
        }
        if (updateValues.password) {
            // Hash new password if provided
            const salt = await bcrypt.genSalt(10);
            updateValues.password = await bcrypt.hash(updateValues.password, salt);
        }
        users[id] = {
            ...userExists,
            ...updateValues,
        };
        saveUsers();
        return users[id];
    }
    catch (error) {
        console.log(`Error updating user: ${error}`);
        return null;
    }
};
export const remove = async (id) => {
    try {
        const user = await findOne(id);
        if (!user) {
            return null; // User not found
        }
        delete users[id];
        saveUsers();
    }
    catch (error) {
        console.log(`Error removing user: ${error}`);
    }
};
