// Youbook's media. Client work, captured on the one destination's public site that runs the
// native booking: the widget with a date and a slot picked, and the cart. The cart needs a real
// hold at the provider, so its captures come from a one-off session that added one place,
// captured /panier/ at 1440 and 390 px wide and emptied the cart at once; they are cropped into
// captures/cart.png and captures/cart-mobile.png. The cover sets the widget beside the cart on a
// phone (scene.js). The figure is drawn for the site
// from what the case study says, at the level of the components, with no internal name, host or
// network.
const url =
  "https://semaines-tourisme-economique.bzh/visite/visite-de-la-brasserie-la-renneizh-fr-49c708a9-ac08-4fff-94fc-746706c6ceac/";
// The ratio of the cell a capture fills in a 16:10 frame without the data row (the gallery), at
// a width where the widget fills most of the page. The cover crops it from its top left.
const viewport = { width: 1100, height: 651 };

export default {
  out: "src/content/projects/youbook",
  scene: "/media/youbook/scene.js",
  captures: [
    {
      name: "widget",
      url,
      viewport,
      prepare: async (page) => {
        // Non-essential cookies declined, as a visitor would
        await page.getByText("Do not accept", { exact: true }).click();
        const widget = page.locator("yb-details");
        await widget.getByText("Sélectionner une date").click();
        await page.waitForTimeout(2500);
        // The first day of the event that still has slots when the capture was taken
        await widget.locator(".vc-day.in-month:not(.is-disabled) .vc-day-content:not(.vc-disabled)").first().click();
        await page.waitForTimeout(2500);
        // A slot picked, so the widget shows what comes next
        await widget.getByText("16:00", { exact: true }).click();
        await page.waitForTimeout(1500);
        await widget.getByText("Choisissez vos dates").evaluate((node) => {
          window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 16);
        });
        // At this width the site's header hides on scroll but leaves its logo pinned over the
        // page: the header is the host's, not the widget, so the capture leaves it out
        await page.addStyleTag({ content: ".mobile-header { visibility: hidden !important; }" });
        await page.waitForTimeout(2500);
      },
    },
  ],
  outputs: [
    { file: "cover.png", params: { shot: "cover" }, time: 0 },
    { file: "widget.png", ratio: "16:10", src: "captures/widget.png" },
    { file: "cart.png", ratio: "16:10", src: "captures/cart.png" },
    { file: "template.png", width: 720, ratio: "16:10", params: { shot: "template" }, time: 0 },
  ],
};
