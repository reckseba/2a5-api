import type { NextApiRequest, NextApiResponse } from "next";
import { getHostnamesWhitelisted } from "../../../lib/hostnames";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    if (req.method !== "GET") {
        res.status(405).json({ message: "Only GET requests allowed." });
        return;
    }

    const urls = await getHostnamesWhitelisted();

    res.status(200).json(urls);
    return;

}