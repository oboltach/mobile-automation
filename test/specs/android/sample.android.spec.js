describe('Android Sample Test', () => {
    it('should open the app and verify it launched', async () => {
        const activity = await driver.getCurrentActivity();
        console.log('Current Activity:', activity);
        expect(activity).toBeDefined();
    });
});
