class LoginScreenIOS {
  // --- iOS selectors (prefer accessibility identifiers -> "~id") ---
  get usernameField()      { return $('~login_username'); }
  get passwordField()      { return $('~login_password'); }
  get loginButton()        { return $('~login_submit'); }

  // Optional “Use password instead” fallback shown when biometric gate appears
  get usePasswordInstead() { return $('~use_password_instead'); }

  // OTP screen
  get otpField()           { return $('~otp_code'); }
  get otpSubmitButton()    { return $('~otp_submit'); }

  // Post-login marker (Home)
  get homeTitle()          { return $('~home_title'); }

  // --- Biometric helpers (safe no-throw wrappers) ---
  async enrollBiometricIfNeeded() {
    try {
      // Some versions: 'mobile: enrollBiometric', others: 'mobile: toggleEnrollBiometric'
      await driver.execute('mobile: toggleEnrollBiometric', { isEnabled: true });
    } catch {}
  }

  async biometricSuccess() {
    try {
      // For Face ID / Touch ID prompt: match = true
      await driver.execute('mobile: sendBiometricMatch', { match: true });
    } catch {}
  }

  async cancelBiometricIfGateHasFallback() {
    try {
      if (await this.usePasswordInstead.isDisplayed()) {
        await this.usePasswordInstead.click();
      }
    } catch {}
  }

  // --- Basic actions ---
  async enterUsername(v) { await this.usernameField.waitForDisplayed(); await this.usernameField.setValue(v); }
  async enterPassword(v) { await this.passwordField.waitForDisplayed(); await this.passwordField.setValue(v); }
  async tapLogin()       { await this.loginButton.click(); }

  async enterOtp(code) {
    await this.otpField.waitForDisplayed();
    await this.otpField.setValue(code);
    await this.otpSubmitButton.click();
  }

  // Full fallback (password → OTP)
  async loginWithPasswordAndOtp(username, password, otpCode) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.tapLogin();
    await this.enterOtp(otpCode);
  }

  // Sometimes apps show the biometric gate only after tapping Login for returning users
  async triggerBiometricPromptIfNeeded() {
    try { await this.loginButton.click(); } catch {}
  }
}

export default new LoginScreenIOS();
