"use server";

import { CreateEditionPayload, EditionsService } from "@/api/editionApi";
import { serverAuthProvider } from "@/lib/authProvider";
import { getEncodedResourceId } from "@/lib/halRoute";

export async function createEdition(data: CreateEditionPayload) {
    const service = new EditionsService(serverAuthProvider);
    const edition = await service.createEdition(data);
    const editionId = getEncodedResourceId(edition.uri ?? edition.link("self")?.href);

    if (!editionId) {
        throw new Error("The edition was created, but no identifier was returned.");
    }

    return `/editions/${editionId}`;
}
