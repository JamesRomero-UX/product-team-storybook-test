import { BasePage } from './BasePage';

export class ImpactRatingsRegisterPage extends BasePage {
  async navigateTo() {
    await this.navigation.navigateToChild('Impacts', 'Ratings');
  }
}
