let uniqueCategories;

// Add/Update tabs
let addTab = document.getElementById("addTab");
let updateTab = document.getElementById("updateTab");

// Blurb
let displayBlurbList = document.getElementsByClassName("displayBlurb");

// Input fields
let blurbCategoryField = document.getElementsByName("blurbCategory")[0];
let blurbTitleField = document.getElementsByName("blurbTitle")[0];
let blurbTextField = document.getElementsByName("paragraphText")[0];

// Add/Remove/Delete Buttons
let addButton = document.getElementById("addText");
let updateButton = document.getElementById("updateText");
let deleteButton = document.getElementById("deleteText");

const dbGetFacade = chrome.extension.getBackgroundPage().dbGetFacade;
const saveInDB = chrome.extension.getBackgroundPage().saveInDB;

// Confirm blurbs
let confirmationWindow = document.getElementsByClassName("hideConfirm")[0];

function log(logInfo, logInfo2) {
  chrome.extension.getBackgroundPage().console.log(logInfo, logInfo2);
}

// Delete the selected blurb
deleteButton.addEventListener("click", deleteSelection);
function deleteSelection() {
  let blurbSelected = document.getElementsByClassName("activeBlurb")[0];
  let selectedID = blurbSelected.lastChild.textContent;

  dbGetFacade("blurbs", function (resultDB) {
    for (let i = 0; i < resultDB["blurbs"].length; i++) {
      if (resultDB["blurbs"][i]["blurbID"] == selectedID) {
        resultDB["blurbs"].splice(i, 1);
        saveInDB(resultDB, document, confirmationWindow, "Deleted");
      }

      clearInputs();
      hideButton(updateButton);
      updateTab.className = "";
      addTab.className = "active";
    }
  });
}

// Modify existing blurb
updateButton.addEventListener("click", updateBlurb);
function updateBlurb() {
  const fieldsNotEmpty = verifyFields();

  if (fieldsNotEmpty) {
    let blurbSelected = document.getElementsByClassName("activeBlurb")[0];
    let selectedID = blurbSelected.lastChild.textContent;
    dbGetFacade("blurbs", (resultDB) => {
      for (let i = 0; i < resultDB["blurbs"].length; i++) {
        if (resultDB["blurbs"][i]["blurbID"] == selectedID) {
          resultDB["blurbs"].splice(i, 1);
          saveInDB(resultDB, document, confirmationWindow, "Updated");
          break;
        }
      }
      addBlurb();
    });
  } else {
    throwError();
  }
}

// Add new blurb to DB
addButton.addEventListener("click", addBlurb);

function addBlurb() {
  let addNew = true;
  const uniqueID = Date.now();
  const addition = {
    category: blurbCategoryField.value,
    title: blurbTitleField.value,
    blurb: blurbTextField.value,
    blurbID: uniqueID,
  };

  const fieldsNotEmpty = verifyFields();

  if (fieldsNotEmpty) {
    dbGetFacade("blurbs", (resultDB) => {
      if (!resultDB["blurbs"] || resultDB["blurbs"].length == 0) {
        resultDB["blurbs"] = [];
        addNew = true; // Allows to add blurb if db empty
      } else {
        for (let i = 0; i < resultDB["blurbs"].length; i++) {
          if (
            resultDB["blurbs"][i]["category"] == blurbCategoryField.value &&
            resultDB["blurbs"][i]["title"] == blurbTitleField.value
          ) {
            duplicateError();
            addNew = false; // If duplicate exists, dont allow to add blurb
          }
        }
      }

      if (addNew) {
        // Allow update DB if no duplicicates
        resultDB["blurbs"].push(addition);
        saveInDB(resultDB, document, confirmationWindow, "Added");
        clearInputs();
      }
    });
  }
}

// Check if input fields are empty
function verifyFields() {
  const blurbCategory = blurbCategoryField.value;
  const blurbTitle = blurbTitleField.value;
  const blurbText = blurbTextField.value;

  return blurbCategory != "" && blurbTitle != "" && blurbText != "";
}

function throwError() {
  let hideError = document.getElementsByClassName("hideError")[0];
  hideError.className += " showError";
  setTimeout(function () {
    hideError.className = "hideError";
  }, 3000);
}

// Make sure duplicate title does not exist
function checkDuplicates() {
  dbGetFacade("blurbs", function (resultDB) {
    if (resultDB["blurbs"].length == 0) {
      return true;
    } else {
      for (let i = 0; i < resultDB["blurbs"].length; i++) {
        if (resultDB["blurbs"][i]["title"] == blurbTitleField.value) {
          let hideDuplicate = document.getElementsByClassName(
            "hideDuplicate"
          )[0];
          hideDuplicate.className += " showError";
          setTimeout(function () {
            hideDuplicate.className = "hideDuplicate";
          }, 3000);
          return false;
        } else {
          return true;
        }
      }
    }
  });
}

function duplicateError() {
  let hideDuplicate = document.getElementsByClassName("hideDuplicate")[0];
  hideDuplicate.className += " showError";
  setTimeout(function () {
    hideDuplicate.className = "hideDuplicate";
  }, 3000);
}
// Create right-side read section to display existing Blurbs
let displaySection = document.getElementById("displaySection");
function displayRightSide() {
  displaySection.innerHTML = "";

  dbGetFacade("blurbs", (resultDB) => {
    try {
      // log("right side data", resultDB);
      if (resultDB.blurbs.length === 0) return;
      uniqueCategories = unique(resultDB["blurbs"], "category"); // List of unique categories

      uniqueCategories.forEach(function (element) {
        // Create categories (displayed once)
        const newCategory = document.createElement("div");
        newCategory.className = "displayBlurbCategory";
        const categoryName = document.createElement("div");
        categoryName.className = "categoryTitle";
        categoryName.textContent = element;
        newCategory.appendChild(categoryName); // Setting category name at the top;

        for (let i = 0; i < resultDB["blurbs"].length; i++) {
          if (resultDB["blurbs"][i]["category"] == element) {
            // Create new blurb entry
            const newBlurbDiv = document.createElement("div");
            newBlurbDiv.className = "displayBlurb";
            const newP = document.createElement("p");
            newP.textContent =
              resultDB["blurbs"][i]["title"] +
              ": " +
              resultDB["blurbs"][i]["blurb"];
            newBlurbDiv.appendChild(newP);

            // Create div with unique ID
            const uniqueDiv = document.createElement("div");
            uniqueDiv.className = "uniqueDiv";
            uniqueDiv.textContent = resultDB["blurbs"][i]["blurbID"];
            newBlurbDiv.appendChild(uniqueDiv);

            blurbListeners(newBlurbDiv);
            newCategory.appendChild(newBlurbDiv);
          }
        }
        displaySection.appendChild(newCategory);
      });
    } catch {}
  });
}

// Add listeners for right side blurb selection
function blurbListeners(newBlurbDiv) {
  newBlurbDiv.addEventListener("click", blurbClicked);
}

// Right-side blurb onclick listener functions
function blurbClicked() {
  clearBlurbColors();
  this.className = "displayBlurb activeBlurb"; // Clicked blurb now visible
  updateTab.className = "active";
  addTab.className = "";
  const act = this;
  updateFields(act);
  hideButton(addButton);
}

// Function to fire when "New Blurb Template" clicked
addTab.addEventListener("click", function () {
  addTab.className = "active";
  updateTab.className = "";
  clearBlurbColors();
  clearInputs();
  hideButton(updateButton);
});

// When blurb selected, update input fields
function updateFields(act) {
  const blurbIDtoSearch = act.lastChild.textContent;
  dbGetFacade("blurbs", (resultDB) => {
    for (let i = 0; i < resultDB["blurbs"].length; i++) {
      if (resultDB["blurbs"][i]["blurbID"] == blurbIDtoSearch) {
        blurbCategoryField.value = resultDB["blurbs"][i]["category"];
        blurbTitleField.value = resultDB["blurbs"][i]["title"];
        blurbTextField.value = resultDB["blurbs"][i]["blurb"];
        break;
      }
    }
  });
}

// Clear inputs
function clearInputs() {
  blurbCategoryField.value = "";
  blurbTitleField.value = "";
  blurbTextField.value = "";
}

// Switch Add/Update buttons
function hideButton(button) {
  if (button == updateButton) {
    updateButton.className = "hideButton";
    deleteButton.className = "hideButton";
    addButton.className = "";
  } else {
    updateButton.className = "";
    deleteButton.className = "";
    addButton.className = "hideButton";
  }
}
// Clear Blurb colors
function clearBlurbColors() {
  for (let i = 0; i < displayBlurbList.length; i++) {
    displayBlurbList[i].className = "displayBlurb";
  }
}
// Identify unique values in categories to display
function unique(array, propertyName) {
  const uniqueCat = [];
  let filteredObjects = array.filter(
    (e, i) => array.findIndex((a) => a[propertyName] === e[propertyName]) === i
  );
  filteredObjects.forEach(function (element) {
    uniqueCat.push(element["category"]);
  });
  return uniqueCat;
}

// Sort categories alphabetically to display on right side
function rightSideSort(resultDB) {
  resultDB["blurbs"].sort(function (a, b) {
    const objA = a.category.toUpperCase();
    const objB = b.category.toUpperCase();
    return objA[0] < objB[0] ? -1 : 1;
  });
}

// If change in DB, updates right side display
chrome.storage.onChanged.addListener(function () {
  displayRightSide();
});
displayRightSide();
