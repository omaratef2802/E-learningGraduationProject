export default async function run(page, ui) {
  const courseId = "6ab710e62105bc8ddb69173b";

  // --- log in through the real form ---
  await page.goto("http://localhost:4200/login", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  const loginTree = await ui.snapshot();
  const emailRef = loginTree.match(/@(e\d+) textbox[^\n]*[Ee]mail/)?.[1];
  const passRef = loginTree.match(/@(e\d+) textbox[^\n]*[Pp]assword/)?.[1];

  let loginSnapshot = loginTree;
  if (emailRef && passRef) {
    await ui.fill(emailRef, "ui.smoke@test.local");
    await ui.fill(passRef, "UiSmoke123!");
    const afterFill = await ui.snapshot();
    const submit =
      afterFill.match(/@(e\d+) button "Sign in"/)?.[1] ||
      afterFill.match(/@(e\d+) button "Log in"/)?.[1] ||
      afterFill.match(/@(e\d+) button "Login"/)?.[1];
    if (submit) await ui.click(submit);
    await page.waitForTimeout(3000);
    loginSnapshot = "submitted";
  }

  // --- go straight to the learning player ---
  await page.goto(`http://localhost:4200/learn/${courseId}`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(3500);

  const url = page.url();
  const bodyText = await page.evaluate(() =>
    document.body.innerText.slice(0, 2500),
  );
  const hasSection2Lock = await page.evaluate(() =>
    document.body.innerText.includes("Finish the previous section to unlock"),
  );
  const hasLockedIcons = await page.evaluate(() =>
    document.body.innerText.includes("🔒"),
  );

  return {
    url,
    loginSnapshot,
    hasSection2Lock,
    hasLockedIcons,
    text: bodyText,
  };
}
