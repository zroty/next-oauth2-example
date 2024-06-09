import type { NextApiRequest, NextApiResponse } from "next";
import config from "../../utils/config";
import { DiscordUser } from "@/utils/model";
import { serialize } from 'cookie';

const scope = ["identify"].join(" ");
const REDIRECT_URI = `${config.appUri}/api/oauth`;

const OAUTH_QS = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope,
}).toString();

const OAUTH_URI = `https://discord.com/api/oauth2/authorize?${OAUTH_QS}`;


export default async  function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

    if (req.method !== "GET") return res.redirect("/");

    const { code = null, error = null } = req.query;

    if (error) {
        return res.redirect(`/?error=${req.query.error}`)
    }

    if (!code || typeof code !== "string") return res.redirect(OAUTH_URI);


    const body = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        code,
        scope,
    }).toString();

    const { access_token = null, token_type = "Bearer" } = await fetch("https://discord.com/api/oauth2/token", {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "POST",
        body,
    }).then((res) => res.json());

    if (!access_token || typeof access_token !== "string") {
        return res.redirect(OAUTH_URI);
    }


    const me : DiscordUser | {unauthorized: true}  = await fetch("https://discord.com/api/users/@me", {
        headers: { "Authorization": `Bearer ${access_token}` }, method: "GET",
    }).then((res) => res.json());

    if (!("id" in me)) {
        return res.redirect(OAUTH_URI);
    }

    res.setHeader("Set-Cookie", serialize(config.cookieName, JSON.stringify(me), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax",
        path: "/",
    }))

    res.redirect("/")
    
    

}
