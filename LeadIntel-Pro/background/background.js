chrome.runtime.onInstalled.addListener(() => {
  console.log("LeadIntel Pro Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === "DOWNLOAD_FILE") {

    chrome.downloads.download({
      url: message.url,
      filename: message.filename,
      saveAs: true
    });

    sendResponse({
      success: true
    });
  }

  return true;
});