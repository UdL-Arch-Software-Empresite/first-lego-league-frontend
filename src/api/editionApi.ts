import type { AuthStrategy } from "@/lib/authProvider";
import { Edition } from "@/types/edition";
import { Team } from "@/types/team";
import { getHal, mergeHal, mergeHalArray } from "./halClient";

export class EditionsService {
    constructor(private readonly authStrategy: AuthStrategy) {}

    async getEditions(): Promise<Edition[]> {
        const resource = await getHal('/editions', this.authStrategy);
        const embedded = resource.embeddedArray('editions') || [];
        return mergeHalArray<Edition>(embedded);
    }

    async getEditionById(id: string): Promise<Edition> {
        const resource = await getHal(`/editions/${id}`, this.authStrategy);
        return mergeHal<Edition>(resource);
    }

    async getEditionTeams(id: string): Promise<Team[]> {
        const resource = await getHal(`/editions/${id}/teams`, this.authStrategy);
        const embedded = resource.embeddedArray('teams') || [];
        return mergeHalArray<Team>(embedded);
    }
}
