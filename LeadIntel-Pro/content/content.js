(async () => {

  try {

    const module = await import(
      chrome.runtime.getURL(
        "content/main.js"
      )
    );

    module.initialize();

  } catch (error) {

    console.error(
      "Bootstrap loader failed",
      error
    );
  }

})();