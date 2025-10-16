import { AlertsPage } from '../pageobjects/alerts.page.js';

const alertsPage = new AlertsPage();

describe('UIKitCatalog smoke', () => {
  it('navigates to Alerts and taps an alert', async () => {
    await alertsPage.openAlertViews();
    await alertsPage.openOkCancelAlert();
    await alertsPage.handleAlertOK();
  });
});
