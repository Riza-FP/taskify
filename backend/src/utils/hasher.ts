import * as bcrypt from "bcrypt";
import { InvariantError } from "./errors.js";

export class Hasher {
    static async hash(plain_text: string, salt: number = 10): Promise<string> {
        return bcrypt.hash(plain_text, salt);
    }
    static async compare(plain_text: string, hashed_text: string): Promise<void> {
        const res = await bcrypt.compare(plain_text, hashed_text);
        if (!res) {
            throw new InvariantError("invalid credentials")
        }
    }
}
