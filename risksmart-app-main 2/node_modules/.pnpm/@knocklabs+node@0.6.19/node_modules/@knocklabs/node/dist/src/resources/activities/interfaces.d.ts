import { User } from "../users/interfaces";
import { Object } from "../objects/interfaces";
export interface Activity {
    id: string;
    data: Record<string, any>;
    actor: User | Object;
    recipient: User | Object;
    inserted_at: string;
    updated_at: string;
    __cursor?: string;
}
