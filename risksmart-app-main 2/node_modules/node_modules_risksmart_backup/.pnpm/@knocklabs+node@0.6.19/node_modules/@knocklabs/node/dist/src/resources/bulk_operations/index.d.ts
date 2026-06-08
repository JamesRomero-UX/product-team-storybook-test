import { Knock } from "../../knock";
import { BulkOperation } from "../bulk_operations/interfaces";
export declare class BulkOperations {
    readonly knock: Knock;
    constructor(knock: Knock);
    get(id: string): Promise<BulkOperation>;
}
