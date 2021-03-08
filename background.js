//debugging
function log(logInfo, data) {
  chrome.extension.getBackgroundPage().console.log(logInfo, data);
}

// Pull menu items from DB and sets menus on db change
chrome.storage.onChanged.addListener(getMenus);
function getMenus() {
  dbGetFacade("blurbs", function (resultDB) {
    try {
      const uniqueCategories = unique(resultDB["blurbs"], "category");
      setMenus(uniqueCategories, resultDB);
    } catch {
      uniqueCategories = ["empty"];
    }
  });
}

getMenus();

// Set menu items on right click
function setMenus(uniqueCategories, resultDB) {
  chrome.contextMenus.removeAll(function () {
    for (let i = 0; i < uniqueCategories.length; i++) {
      const contextItem = {
        id: uniqueCategories[i],
        title: uniqueCategories[i],
        contexts: ["editable", "selection"],
      };

      chrome.contextMenus.create(contextItem);

      resultDB["blurbs"].forEach(function (element) {
        if (element["category"] == uniqueCategories[i]) {
          const titleContextItem = {
            id: uniqueCategories[i] + ":" + element["title"],
            title: element["title"],
            parentId: uniqueCategories[i],
            contexts: ["editable", "selection"],
          };

          try {
            chrome.contextMenus.create(titleContextItem);
          } catch (err) {}
        }
      });
    }
  });
  addListeners();
}
//  Add listener to menu click

function addListeners() {
  chrome.contextMenus.onClicked.removeListener(clickListener);
  chrome.contextMenus.onClicked.addListener(clickListener);
}

function clickListener(clickData) {
  const [categoryClick, titleClick] = clickData.menuItemId.split(":");

  dbGetFacade("blurbs", (result) => {
    const correctBlurb = result.blurbs.find((blurb) => {
      return blurb.category === categoryClick && blurb.title === titleClick;
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { blurb: correctBlurb.blurb },
        function (response) {}
      );
    });
  });
}

// Identify unique categories for menu options
function unique(array, propertyName) {
  const uniqueCat = [];
  const filteredObjects = array.filter(
    (e, i) => array.findIndex((a) => a[propertyName] === e[propertyName]) === i
  );
  filteredObjects.forEach(function (element) {
    uniqueCat.push(element["category"]);
  });
  return uniqueCat;
}

// Enable popup window
chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [new chrome.declarativeContent.PageStateMatcher()],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});
