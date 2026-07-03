export class SlackConnector {
  public async sendMessage(channel: string, text: string): Promise<void> {
    console.log(`[SlackConnector] Sending message to ${channel}: ${text}`);
  }
}
