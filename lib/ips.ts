import { PrismaClient } from "../prisma-client";

const prisma = new PrismaClient();

export async function getIp(ipAddressHash: string) {
    return await prisma.ipaddresses.findUnique({
        where: {
            ipAddressHash: ipAddressHash,
        },
    });
}
