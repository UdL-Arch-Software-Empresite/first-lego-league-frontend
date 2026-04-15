import { getHal, deleteHal } from "@/lib/api-utils";
import { AuthStrategy } from "@/lib/authProvider";
import { Team } from "@/types/team";
import { User } from "@/types/user";

function getSafeEncodedId(id: string): string {
    return encodeURIComponent(id);
}

export class TeamsService {
    constructor(private readonly authStrategy: AuthStrategy) {}

    async getTeams(): Promise<Team[]> {
        const data = await getHal("/teams", this.authStrategy);
        return data?._embedded?.teams ?? [];
    }

    async getTeamById(id: string): Promise<Team> {
        const teamId = getSafeEncodedId(id);
        return getHal(`/teams/${teamId}`, this.authStrategy);
    }

    async getTeamCoach(id: string): Promise<User[]> {
        const teamId = getSafeEncodedId(id);
        const data = await getHal(`/teams/${teamId}/coaches`, this.authStrategy);
        return data?._embedded?.users ?? [];
    }

    async getTeamMembers(id: string): Promise<any> {
        const teamId = getSafeEncodedId(id);
        return getHal(`/teams/${teamId}/teamMembers`, this.authStrategy);
    }

    async deleteTeam(id: string): Promise<void> {
        const teamId = getSafeEncodedId(id);
        await deleteHal(`/teams/${teamId}`, this.authStrategy);
    }

    async removeTeamMember(uri: string): Promise<void> {
        await deleteHal(uri, this.authStrategy);
    }
}