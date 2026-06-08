import { WorkflowPreferenceSetting } from "./interfaces";
export declare function buildUpdateParam(param: WorkflowPreferenceSetting): import("./interfaces").ConditionalPreferenceSettings | {
    channel_types: import("./interfaces").ChannelTypePreferences;
} | {
    subscribed: boolean;
};
export declare const DEFAULT_PREFERENCE_SET_ID = "default";
