from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the home page
        page.goto("http://localhost:5000")

        # Wait for the content to load
        page.wait_for_selector('h1')

        # Verify text color changes (using computed style)
        element = page.locator('.text-accent').first
        color = element.evaluate("el => getComputedStyle(el).color")
        print(f"Text accent color: {color}")

        # Take a screenshot of the main page
        page.screenshot(path="verification_home.png")

        # Click the toggle background button to trigger the channel switch effect
        # We need to capture the effect, but it's fast (300ms).
        # We can try to capture it immediately after click?
        # Or just verify the button works and switches background.

        # Initial state: Video visible, GIF hidden
        video_display = page.locator('#background-video').evaluate("el => getComputedStyle(el).display")
        gif_display = page.locator('#background-gif').evaluate("el => getComputedStyle(el).display")
        print(f"Initial: Video {video_display}, GIF {gif_display}")

        # Click toggle
        page.click('#toggle-background')

        # Wait a bit for the transition (300ms delay in JS)
        page.wait_for_timeout(500)

        # Check state after toggle: Video hidden, GIF visible
        video_display = page.locator('#background-video').evaluate("el => getComputedStyle(el).display")
        gif_display = page.locator('#background-gif').evaluate("el => getComputedStyle(el).display")
        print(f"After toggle: Video {video_display}, GIF {gif_display}")

        page.screenshot(path="verification_toggle.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
