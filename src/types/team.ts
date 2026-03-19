import { Resource } from "halfred";

export interface TeamEntity {
    uri?: string;
    name?: string;
}

export type Team = TeamEntity & Resource;
