import { Bot } from "../bot";
import { cleanEmptyChannels } from "../matching/clean-channels";
import { Matcher } from "../matching/matcher";

export class BackgroundService {
  private isBgService: boolean = false;
  private serviceTimeout?: NodeJS.Timeout;
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  public startServices() {
    this.runMatcher();
  }

  private async runMatcher() {
    if (this.isBgService) {
      return;
    }

    try {
      this.isBgService = true;
      await Matcher(this.bot);
      await cleanEmptyChannels(this.bot)
    } catch (error) {
      console.error("Matcher error:", error);
    } finally {
      this.isBgService = false;
      // Schedule next run after current one finishes
      this.serviceTimeout = setTimeout(() => this.runMatcher(), 5000);
    }
  }

  public cleanup() {
    if (this.serviceTimeout) {
      clearTimeout(this.serviceTimeout);
    }
  }
}
