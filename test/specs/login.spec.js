import { expect } from 'chai';
import Login from '../screens/LoginScreen.ios.js';

describe('iOS: Biometric + OTP', () => {
  it('Biometric success unlocks the app', async () => {
    // Ensure the simulator has biometrics “enrolled”
    await Login.enrollBiometricIfNeeded();

    // Show biometric prompt (depends on app flow)
    await Login.triggerBiometricPromptIfNeeded();

    // Approve with Face ID / Touch ID
    await Login.biometricSuccess();

    // Verify home screen is visible
    await Login.homeTitle.waitForDisplayed({ timeout: 15000 });
    expect(await Login.homeTitle.isDisplayed()).to.equal(true);
  });

  it('Cancel biometric → login with password + OTP', async () => {
    // Route to password fallback if the gate shows up
    await Login.triggerBiometricPromptIfNeeded();
    await Login.cancelBiometricIfGateHasFallback();

    const USER = process.env.TEST_USER || 'ios_user@test.com';
    const PASS = process.env.TEST_PASS || 'Pass123!';
    const OTP  = process.env.OTP_CODE   || '123456';

    await Login.loginWithPasswordAndOtp(USER, PASS, OTP);

    // Assert we’re on home
    await Login.homeTitle.waitForDisplayed({ timeout: 15000 });
    expect(await Login.homeTitle.isDisplayed()).to.equal(true);
  });
});
