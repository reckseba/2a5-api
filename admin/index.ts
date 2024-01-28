import express, { Express, Request, Response } from "express";
import { PrismaClient } from "../prisma-client";
import * as path from "path";
require("dotenv").config();

const prisma = new PrismaClient();

async function getUrlsUndeletedUnchecked() {
    return await prisma.urls.findMany({
        where: {
            deleted: false,
            checkedBy: null
        },
        select: {
            id: true,
            urlLong: true,
            urlShort: true,
            urlShortFull: true,
            checkedAt: true,
            checkedBy: true,
            deleted: true,
            deletedAt: true,
            hostname: true,
            ipAddressHash: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
}

async function getUrlsUndeletedChecked() {
    return await prisma.urls.findMany({
        where: {
            deleted: false,
            NOT: {
                checkedBy: null
            }
        },
        select: {
            id: true,
            urlLong: true,
            urlShort: true,
            urlShortFull: true,
            checkedAt: true,
            checkedBy: true,
            deleted: true,
            deletedAt: true,
            hostname: true,
            ipAddressHash: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
}

async function getUrlsDeletedChecked() {
    const urls = await prisma.urls.findMany({
        where: {
            deleted: true,
            NOT: {
                checkedBy: null
            }
        },
        select: {
            id: true,
            urlLong: true,
            urlShort: true,
            urlShortFull: true,
            checkedAt: true,
            checkedBy: true,
            deleted: true,
            deletedAt: true,
            hostname: true,
            ipAddressHash: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return urls;

}

async function getHostnamesBlacklisted() {

    return await prisma.hostnames.findMany({
        where: {
            blacklisted: true
        },
        select: {
            id: true,
            hostname: true
        },
    });
}

async function getHostnamesWhitelisted() {

    return await prisma.hostnames.findMany({
        where: {
            blacklisted: false
        },
        select: {
            id: true,
            hostname: true
        },
    });
}

async function setUrlCheckedAdminUndeletedById(id: number) {

    // first need to check that the hostname is not blacklisted already. would not be okay to have a checked url with a blacklisted hostname
    const url = await prisma.urls.findUnique({
        where: {
            id: id
        },
        select: {
            hostname: true
        }
    });

    const hostname = await prisma.hostnames.findUnique({
        where: {
            hostname: url!.hostname,
        },
        select: {
            id: true,
            blacklisted: true
        }
    });

    // hostnames null -> ok
    // hostnames not null and blacklisted true -> nein
    // hostnames not null and blacklisted false -> ok

    // the requested hostname is blacklisted -> connot check this url
    if (hostname !== null && hostname.blacklisted === true) {
        return url!.hostname;
    }

    // TODO: better to use NOW() function instead of injecting date. could be wrong according to timezone
    await prisma.urls.update({
        where: {
            id: id
        },
        data: {
            deleted: false,
            deletedAt: null,
            checkedBy: "ADMIN",
            checkedAt: new Date()
        }
    });

    return true;
}

async function setUrlCheckedAdminDeletedById(id: number) {

    // TODO: better to use NOW() function instead of injecting date. could be wrong according to timezone
    return await prisma.urls.update({
        where: {
            id: id
        },
        data: {
            deleted: true,
            deletedAt: new Date(),
            checkedBy: "ADMIN",
            checkedAt: new Date()
        }
    });

}

async function setUrlsCheckedWhitelistByHostname(hostname: string) {
    
    return await prisma.urls.updateMany({
        where: {
            hostname: hostname,
            checkedBy: null
        },
        data: {
            checkedAt: new Date(),
            checkedBy: "WHITELIST"
        }
    });
}

async function setUrlsCheckedBlacklistByHostname(hostname: string) {

    return await prisma.urls.updateMany({
        where: {
            hostname: hostname,
            checkedBy: null
        },
        data: {
            deleted: true,
            deletedAt: new Date(),
            checkedBy: "BLACKLIST",
            checkedAt: new Date()
        }
    });
}

async function setUrlWhitelist(id: number) {
    
    const url = await prisma.urls.findUnique({
        where: {
            id: id
        },
        select: {
            hostname: true
        }
    });

    if (url === undefined) {
        throw new Error("Could not read from db.");
    }

    // check if that hostname is whitelisted already
    const hostname = await prisma.hostnames.findUnique({
        where: {
            hostname: url!.hostname
        },
        select: {
            id: true,
            blacklisted: false
        }
    });

    // yes that hostname is whitelisted already
    if (hostname !== null) {
        return [1, url!.hostname];
    }

    // now check if any url with that hostename got deleted manually before
    const urls = await prisma.urls.findMany({
        where: {
            hostname: url!.hostname,
            deleted: true,
            NOT: {
                checkedBy: null
            }
        },
        select: {
            id: true
        }
    });

    // yes there is at least one. so cannot add to whitelist. first need to clean it. Or hostname is no whitelist candidate
    if (urls.length > 0) {
        return [2, urls, url!.hostname];
    }

    await prisma.hostnames.create({
        data: {
            hostname: url!.hostname,
            blacklisted: false
        }
    });

    await setUrlsCheckedWhitelistByHostname(url!.hostname);

    return true;

}

async function setUrlBlacklist(id: number) {

    const url = await prisma.urls.findUnique({
        where: {
            id: id
        },
        select: {
            hostname: true
        }
    });

    if (url === undefined) {
        throw new Error("Could not read from db.");
    }

    // check if that hostname is blacklisted already
    const hostname = await prisma.hostnames.findUnique({
        where: {
            hostname: url!.hostname
        },
        select: {
            id: true,
            blacklisted: true
        }
    });

    // yes that hostname is blacklisted already
    if (hostname !== null) {
        return [1, url!.hostname];
    }

    // now check if any url with that hostename got checked manually before
    const urls = await prisma.urls.findMany({
        where: {
            hostname: url!.hostname,
            deleted: false,
            NOT: {
                checkedBy: null
            }
        },
        select: {
            id: true
        }
    });

    // yes there is at least one. so cannot add to blacklist. first need to clean it. Or hostname is no blacklist candidate
    if (urls.length > 0) {
        return [2, urls, url!.hostname];
    }

    await prisma.hostnames.create({
        data: {
            hostname: url!.hostname,
            blacklisted: true
        }
    });

    await setUrlsCheckedBlacklistByHostname(url!.hostname);

    return true;

}

const app: Express = express();
app.set("view engine", "pug");

const port = process.env.ADMIN_PORT;

app.get("/", async (req: Request, res: Response) => {

    const urlsUndeletedUnchecked = await getUrlsUndeletedUnchecked();
    const urlsUndeletedChecked = await getUrlsUndeletedChecked();
    const urlsDeletedChecked = await getUrlsDeletedChecked();
    const hostnamesBlacklisted = await getHostnamesBlacklisted();
    const hostnamesWhitelisted = await getHostnamesWhitelisted();
    // console.log(urls);

    res.render("home", {
        title: "2a5 Admin",
        urlsUndeletedUnchecked: urlsUndeletedUnchecked,
        urlsUndeletedChecked: urlsUndeletedChecked,
        urlsDeletedChecked: urlsDeletedChecked,
        hostnamesBlacklisted: hostnamesBlacklisted,
        hostnamesWhitelisted: hostnamesWhitelisted
    });

    //res.send('Express + TypeScript Server');
});

app.get("/api/url/check/:id", async (req: Request, res: Response) => {

    const result = await setUrlCheckedAdminUndeletedById(parseInt(req.params.id));

    if (result === true) {
        res.redirect("/");
    } else {
        res.render("url-check-error", {
            title: "2a5 Admin - Url Check Error",
            hostname: result
        });
    }

});

app.get("/api/url/delete/:id", async (req: Request, res: Response) => {

    await setUrlCheckedAdminDeletedById(parseInt(req.params.id));

    res.redirect("/");

});

app.get("/api/url/whitelist/:id", async (req: Request, res: Response) => {

    const result = await setUrlWhitelist(parseInt(req.params.id));

    if (result === true) {
        res.redirect("/");
    } else if (result[0] === 1) {
        // this is the case, that the hostname is whitelisted already
        res.render("whitelist-error-whitelisted-already", {
            title: "2a5 Admin - Whitelist Error",
            hostname: result[1]
        });
    } else if (result[0] == 2) {
        res.render("whitelist-error-urls-deleted", {
            title: "2a5 Admin - Whitelist Error",
            urls: result[1],
            hostname: result[2]
        });
    }

});

app.get("/api/url/blacklist/:id", async (req: Request, res: Response) => {

    const result = await setUrlBlacklist(parseInt(req.params.id));

    if (result === true) {
        res.redirect("/");
    } else if (result[0] === 1) {
        // this is the case, that the hostname is blacklisted already
        res.render("blacklist-error-blacklisted-already", {
            title: "2a5 Admin - Blacklist Error",
            hostname: result[1]
        });
    } else if (result[0] === 2) {
        res.render("blacklist-error-urls-checked", {
            title: "2a5 Admin - Blacklist Error",
            urls: result[1],
            hostname: result[2]
        });
    }
    
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

app.use(express.static(path.join(__dirname, "public")));
