var tempContext;

chrome.storage.onChanged.addListener(getMenus)

// Pull menu items from DB
function getMenus() {
  chrome.storage.sync.get(['blurbs'], function(resultDB) {
    try {
      var uniqueCategories = unique(resultDB["blurbs"], "category");
      setMenus(uniqueCategories, resultDB)
    } catch {
      uniqueCategories = ['empty'];
    }
  })
}

getMenus()

// Set menu items on right click
function setMenus(uniqueCategories, resultDB) {
chrome.contextMenus.removeAll(function() {
  tempContext = [];
      for (let i = 0; i < uniqueCategories.length; i++) {
        var contextItem = {
          "id": uniqueCategories[i],
          "title": uniqueCategories[i],
          "contexts": ["editable", "selection"],
          }
        chrome.contextMenus.create(contextItem)
        resultDB["blurbs"].forEach(function(element) {
          if(element["category"] == uniqueCategories[i]) {
            var titleContextItem = {
            "id": uniqueCategories[i] + ":" + element["title"],
            "title": element["title"],
            "parentId": uniqueCategories[i],
            "contexts": ["editable", "selection"],
            }
            tempContext.push(titleContextItem)
            try {
            chrome.contextMenus.create(titleContextItem)
          } catch(err){

          }
          }
        })
      }
  })
      addListeners()
}
//  Add listener to menu click

function addListeners() {
  chrome.contextMenus.onClicked.removeListener(clickListener);
  chrome.contextMenus.onClicked.addListener(clickListener);
}

function clickListener(clickData) {
  for (let menuItem = 0; menuItem < tempContext.length; menuItem++) {
    if (clickData.menuItemId === tempContext[menuItem]["id"]) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: tempContext[menuItem]["id"]}, function(response) {
        })
      })
    }
  }
}

// Identify unique categories for menu options
function unique(array, propertyName) {
  var uniqueCat = []
    var filteredObjects = array.filter((e, i) => array.findIndex(a => a[propertyName] === e[propertyName]) === i);
    filteredObjects.forEach(function(element) {
      uniqueCat.push(element["category"])
    })
    return uniqueCat
}



// Enable popup window
chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher()],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  });
