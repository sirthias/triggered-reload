const TITLE_ENABLE = "Enable triggered-reload";
const TITLE_DISABLE = "Disable triggered-reload";

const ports = new Map();

function enableTriggeredReload(tabId) {
  console.log(`Enabling triggered-reload on tab ${tabId}...`);
  var port;
  if (ports.size === 0) {    
    port = browser.runtime.connectNative("triggered.reload");
    port.onMessage.addListener(msg => {
      console.log(`Received reload trigger for ${msg}`);
      browser.tabs.query({ url: msg }).then(tabs => {
        for (let tab of tabs) {
          if (ports.has(tab.id)) browser.tabs.reload(tab.id, { bypassCache: true });
        }
      })
    });
    port.onDisconnect.addListener(p => {
      const x = p.error ? p.error.message : "<no error>";
      console.log(`Triggered-Reload disconnected: ${x}`);
      for (let tabId of ports.keys()) showAsDisabled(tabId);
      ports.clear()
    });
  } else port = ports.keys().next().value
  ports.set(tabId, port)
}

function showAsDisabled(tabId) {
  if (tabId !== browser.tabs.TAB_ID_NONE) {
    browser.pageAction.setIcon({ tabId: tabId, path: "icons/off.svg" });
    browser.pageAction.setTitle({ tabId: tabId, title: TITLE_ENABLE })
  }
}

function toggle(tab) {
  if (tab.id !== browser.tabs.TAB_ID_NONE) {
    if (!ports.has(tab.id)) {
      enableTriggeredReload(tab.id);
      browser.pageAction.setIcon({ tabId: tab.id, path: "icons/on.svg"});
      browser.pageAction.setTitle({ tabId: tab.id, title: TITLE_DISABLE})
    } else {
      console.log(`Disabling triggered-reload on tab ${tab.id}...`);
      const port = ports.get(tab.id);
      ports.delete(tab.id);
      showAsDisabled(tab.id)
      if (ports.size === 0) port.disconnect();
    }
  }
}

browser.pageAction.onClicked.addListener(toggle);