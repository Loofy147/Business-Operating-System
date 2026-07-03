export class GitHubConnector {
  public async createIssue(owner: string, repo: string, title: string): Promise<void> {
    console.log(`[GitHubConnector] Creating issue in ${owner}/${repo}: ${title}`);
  }
}
