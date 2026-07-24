const axios = require('axios');

const GITHUB_API_BASE = 'https://api.github.com';

function githubClient(accessToken) {
  return axios.create({
    baseURL: GITHUB_API_BASE,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json'
    }
  });
}

async function getUserRepos(accessToken) {
  const client = githubClient(accessToken);
  const response = await client.get('/user/repos', {
    params: { type: 'public', sort: 'updated', per_page: 50 }
  });
  return response.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    owner: repo.owner.login,
    fullName: repo.full_name,
    description: repo.description,
    private: repo.private,
    updatedAt: repo.updated_at
  }));
}

async function getRepoPullRequests(accessToken, owner, repo) {
  const client = githubClient(accessToken);
  const response = await client.get(`/repos/${owner}/${repo}/pulls`, {
    params: { state: 'open', per_page: 50 }
  });
  return response.data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    author: pr.user.login,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    htmlUrl: pr.html_url
  }));
}

async function getPullRequestFiles(accessToken, owner, repo, prNumber) {
  const client = githubClient(accessToken);
  const response = await client.get(`/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
    params: { per_page: 100 }
  });
  return response.data.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    patch: file.patch || null
  }));
}

module.exports = { getUserRepos, getRepoPullRequests, getPullRequestFiles };