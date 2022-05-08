
export type GistResponse = {description: string,files: {[k:string]: {filename: string}}}[]
export function authGithub() {
  const isLocalhost = location.hostname === 'localhost'
  const redirect_uri = isLocalhost ? 'http://localhost:8080/github_oauth.html' : 'https://usevia.app/github_oauth.html'
  const client_id = isLocalhost ? '4300c2892225537a065c' : '257d3d5bb57e29d1ce06'
  const state = Math.random()
  window.open(`https://github.com/login/oauth/authorize?response_type=code&client_id=${client_id}&scope=gist&redirect_uri=${redirect_uri}&state=${state}`, 'oauth', 'popup')
}

export async function getKLEFiles(token: string) {
  const gistAPI = await fetch('https://api.github.com/gists', {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  })
  const resp: GistResponse = await gistAPI.json()
  return resp.filter((gistResp) => {
    const files = Object.values(gistResp.files)
    return files.length === 1 && /\.kbd\.json$/.test(files[0].filename)
  })
}