export class AlertsPage {

  // ===== Original Selectors from S (no change) =====
  get alertViews() {
    return $('~Alert Views');
  }

  get okCancelCell_pred() {
    return $(
      '-ios predicate string:type == "XCUIElementTypeStaticText" AND (name CONTAINS[c] "Cancel")'
    );
  }

  get okButton_chain() {
    return $(
      '-ios class chain:**/XCUIElementTypeButton[`name == "OK" OR label == "OK"`]'
    );
  }

  get okayButton_chain() {
    return $(
      '-ios class chain:**/XCUIElementTypeButton[`name == "Okay" OR label == "Okay"`]'
    );
  }

  get cancelButton_chain() {
    return $(
      '-ios class chain:**/XCUIElementTypeButton[`name == "Cancel" OR label == "Cancel"`]'
    );
  }

  get alert_pred() {
    return $('-ios predicate string:type == "XCUIElementTypeAlert"');
  }

  // ===== Original Test Steps (no logic changes) =====
  async openAlertViews() {
    await this.alertViews.waitForDisplayed({ timeout: 15000 }); //button/menu - 5s, Popups/Alerts - 5/8s, Screen load (dashboard) -10s, app cold launch - 15s
    await this.alertViews.click();
  }

  async openOkCancelAlert() {
    const okCancelCell = await this.okCancelCell_pred;
    await okCancelCell.waitForDisplayed({ timeout: 10000 });
    await okCancelCell.click();
  }

  async handleAlertOK() {
    const alert = await this.alert_pred;
    await alert.waitForDisplayed({ timeout: 10000 });

    const okBtn = await this.okButton_chain;
    const okayBtn = await this.okayButton_chain;

    if (await okBtn.isDisplayed()) {
      await okBtn.click();
    } else if (await okayBtn.isDisplayed()) {
      await okayBtn.click();
    } else {
      const src = await driver.getPageSource();
      console.log('Alert DOM:\n', src.slice(0, 2000), '...');
      await browser.saveScreenshot('./reports/uicatalog-alerts-fail.png');
      throw new Error('Neither "OK" nor "Okay" button was visible on the alert.');
    }
    //These lines confirm the alert was properly closed after tapping “OK” (or “Okay”).
    await expect(alert).not.toBeDisplayed({ wait: 5000 });
    await browser.saveScreenshot('./reports/uicatalog-alerts-success.png');
  }

  async handleAlertCancel() {
    const alert = await this.alert_pred;
    await alert.waitForDisplayed({ timeout: 10000 });

    const cancelBtn = await this.cancelButton_chain;

    if (await cancelBtn.isDisplayed()) {
      await cancelBtn.click();
    } else {
      const src = await driver.getPageSource();
      console.log('Alert DOM:\n', src.slice(0, 2000), '...');
      await browser.saveScreenshot('./reports/uicatalog-alerts-fail.png');
      throw new Error('Cancel button was visible on the alert.');
    }
    //These lines confirm the alert was properly closed after tapping “OK” (or “Okay”).
    await expect(alert).not.toBeDisplayed({ wait: 5000 });
    await browser.saveScreenshot('./reports/uicatalog-alerts-success.png');
  }
}
