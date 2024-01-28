import { PrismaClient } from "../prisma-client";

const prisma = new PrismaClient();

export function getHostname(urlLong: string) {
    try {
        const { hostname } = new URL(urlLong);
        return hostname;
    } catch (e) {
        return undefined;
    }
}

export async function getHostnameList(hostname: string) {
    return await prisma.hostnames.findUnique({
        where: {
            hostname: hostname,
        },
    });
}
