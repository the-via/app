
export type GistResponse = {description: string,files: {[k:string]: {filename: string}}}[]
const random_state = Math.random().toString()
let resolvable: (value: unknown)=>any;

function onMessage(evt: MessageEvent) {
  const {data} = evt
  if (data.token && data.state === random_state && resolvable) {
    console.log('message', data)
    localStorage.setItem('gh_token', data.token)
    window.removeEventListener('message', onMessage)
    resolvable(undefined)
  }
}
export async function authGithub() {
  const isLocalhost = location.hostname === 'localhost'
  const redirect_uri = isLocalhost ? 'http://localhost:8080/github_oauth.html' : 'https://usevia.app/github_oauth.html'
  const client_id = isLocalhost ? '4300c2892225537a065c' : '257d3d5bb57e29d1ce06'
  window.addEventListener('message', onMessage)
  window.open(`https://github.com/login/oauth/authorize?response_type=code&client_id=${client_id}&scope=gist&redirect_uri=${redirect_uri}&state=${random_state}`, 'oauth', 'popup')
  return new Promise((res, rej) => {
    resolvable=res
  })
}

const ghAPI = async (url: string) => {
  const gistAPI = await fetch(`https://api.github.com/${url}`, {
    headers: {
      'Authorization': `token ${localStorage.getItem('gh_token')}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  })
  const resp: any = await gistAPI.json()
  return resp
}

export async function getUser() {
  const resp = await ghAPI('user')
  return resp
}

export async function getKLEFiles() {
  const resp: GistResponse = await ghAPI('gists')
  return resp.filter((gistResp) => {
    const files = Object.values(gistResp.files)
    return files.length === 1 && /\.kbd\.json$/.test(files[0].filename)
  })
}