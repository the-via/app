import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import fetch from 'node-fetch'
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
        context.res = {
            status: 500, 
            body: "silly"
        };
    if (req.body){ 
        const {GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET} = process.env
        const {code} = req.body
        const url = 'https://github.com/login/oauth/access_token' 
        const body = {code, client_id: GITHUB_OAUTH_CLIENT_ID, client_secret: GITHUB_OAUTH_CLIENT_SECRET}
        const tokenReq = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        const tokenResp = await tokenReq.json()
        context.res = {
            body: tokenResp
        };
    } else {
        context.res = {
            status: 500, 
            body: "Missing body parameters"
        };
    }
};

export default httpTrigger;