let uniqueCategories;

// Add/Update tabs
let addTab = document.getElementById("addTab")
let updateTab = document.getElementById("updateTab")

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

//Confirm blurbs
let confirmationWindow = document.getElementsByClassName("hideConfirm")[0]

// Delete the selected blurb
deleteButton.addEventListener("click", deleteSelection)
function deleteSelection() {
    let blurbSelected = document.getElementsByClassName("activeBlurb")[0]
    let selectedID = blurbSelected.lastChild.textContent
    chrome.storage.sync.get(['blurbs'], function(resultDB) {
      for (var i = 0; i < resultDB["blurbs"].length; i++) {
         if (resultDB["blurbs"][i]["blurbID"] == selectedID) {
          resultDB["blurbs"].splice(i, 1)
          saveInDB(resultDB, "Deleted")
          }
          clearInputs();
          hideButton(updateButton)
          updateTab.className = "";
          addTab.className = "active";
      }
    })
  }

// Check if input fields are empty
function verifyFields() {
  var blurbCategory = blurbCategoryField.value
  var blurbTitle = blurbTitleField.value
  var blurbText = blurbTextField.value
  if (blurbCategoryField.value != "" && blurbTitleField.value != "" && blurbTextField.value != "") {
    return true
  } else {
    return false
  }
}
// Modify existing blurb
updateButton.addEventListener("click", updateBlurb)
function updateBlurb() {
  var fieldsNotEmpty = verifyFields()
  if (fieldsNotEmpty) {
    let blurbSelected = document.getElementsByClassName("activeBlurb")[0]
    let selectedID = blurbSelected.lastChild.textContent
    chrome.storage.sync.get(['blurbs'], function(resultDB) {
      for (var i = 0; i < resultDB["blurbs"].length; i++) {
         if (resultDB["blurbs"][i]["blurbID"] == selectedID) {
           resultDB["blurbs"].splice(i, 1)

           saveInDB(resultDB, "Updated")
           break
         }
       }
       addBlurb()
     })

  } else {
    throwError()
  }
}

// Add new blurb to DB
addButton.addEventListener("click", addBlurb)

function addBlurb() {
  var addNew = true;
  var uniqueID = Date.now()
  var addition = { category: blurbCategoryField.value, title: blurbTitleField.value, blurb: blurbTextField.value, blurbID: uniqueID}
  var fieldsNotEmpty = verifyFields()
  if (fieldsNotEmpty) {
    chrome.storage.sync.get(['blurbs'], function(resultDB) {
      if (!resultDB['blurbs'] || resultDB['blurbs'].length == 0) {
        resultDB["blurbs"] = []
        addNew = true; // Allows to add blurb if db empty
      } else {
        for (var i = 0; i < resultDB['blurbs'].length; i++) {
          if (resultDB["blurbs"][i]["category"] == blurbCategoryField.value && resultDB["blurbs"][i]["title"] == blurbTitleField.value) {
            duplicateError()
            addNew = false // If duplicate exists, dont allow to add blurb
          }
        }
        }
      if (addNew) { // Allow update DB if no duplicicates
        resultDB["blurbs"].push(addition)
        saveInDB(resultDB, "Added")
        clearInputs();
      }
    })
  }
}
/*
    var uniqueID = Date.now()
    var addition = { category: blurbCategoryField.value, title: blurbTitleField.value, blurb: blurbTextField.value, blurbID: uniqueID}

  // Adding blurb to DB
    chrome.storage.sync.get(['blurbs'], function(resultDB) {
        if (!resultDB['blurbs']) {
          resultDB["blurbs"] = []
        }
        resultDB["blurbs"].push(addition)
        saveInDB(resultDB, "Added")
        clearInputs();
      })
  } else {
    throwError()
  } */


// Store data in database
function saveInDB(resultDB, action_confirm) {
  chrome.storage.sync.set({blurbs: resultDB["blurbs"]}, function(result) {
    let confirmText = document.createElement("p")
    confirmText.textContent = action_confirm;
    confirmationWindow.innerHTML = '';
    confirmationWindow.appendChild(confirmText)
    confirmationWindow.className += " showConfirm"
    setTimeout(function(){ confirmationWindow.className = "hideConfirm"}, 2500)

  })
}

function throwError() {
  var hideError = document.getElementsByClassName("hideError")[0]
  hideError.className += " showError"
  setTimeout(function(){ hideError.className = "hideError"}, 3000)


}

// Make sure duplicate title does not exist
function checkDuplicates() {
    chrome.storage.sync.get(['blurbs'], function(resultDB) {
      console.log(resultDB['blurbs'])
      if (resultDB['blurbs'].length == 0) {
        return true
      } else {
        for (var i = 0; i < resultDB['blurbs'].length; i++) {
          if (resultDB["blurbs"][i]["title"] == blurbTitleField.value) {
            var hideDuplicate = document.getElementsByClassName("hideDuplicate")[0];
            hideDuplicate.className += " showError"
            setTimeout(function(){ hideDuplicate.className = "hideDuplicate"}, 3000)
            return false
          } else {
            return true}
        }
      }
    })
}

function duplicateError() {
  var hideDuplicate = document.getElementsByClassName("hideDuplicate")[0];
  hideDuplicate.className += " showError"
  setTimeout(function(){ hideDuplicate.className = "hideDuplicate"}, 3000)
}
// Create right-side read section to display existing Blurbs
var displaySection = document.getElementById("displaySection")

function displayRightSide() {
  displaySection.innerHTML = '';
  chrome.storage.sync.get(['blurbs'], function(resultDB) {
    try {
    uniqueCategories = unique(resultDB["blurbs"], "category") // List of unique categories

      uniqueCategories.forEach(function(element) {

        // Create categories (displayed once)
        var newCategory = document.createElement("div");
        newCategory.className = "displayBlurbCategory";
        var categoryName = document.createElement("div");
        categoryName.className = "categoryTitle";
        categoryName.textContent = element;
        newCategory.appendChild(categoryName) // Setting category name at the top;

        for (var i = 0; i < resultDB["blurbs"].length; i++) {
          if (resultDB["blurbs"][i]["category"] == element) {

            // Create new blurb entry
            var newBlurbDiv = document.createElement("div");
            newBlurbDiv.className = "displayBlurb"
            var newP = document.createElement("p");
            newP.textContent = resultDB["blurbs"][i]["title"] + ": " + resultDB["blurbs"][i]["blurb"];
            newBlurbDiv.appendChild(newP)

            // Create div with unique ID
            var uniqueDiv = document.createElement("div");
            uniqueDiv.className = "uniqueDiv"
            uniqueDiv.textContent = resultDB["blurbs"][i]["blurbID"]
            newBlurbDiv.appendChild(uniqueDiv)

            blurbListeners(newBlurbDiv)
            newCategory.appendChild(newBlurbDiv)
          }
        }
        displaySection.appendChild(newCategory)
      })
    } catch {

    }
    }
  )
}

// Add listeners for right side blurb selection
function blurbListeners(newBlurbDiv) {
  newBlurbDiv.addEventListener("click", blurbClicked)
}

// Right-side blurb onclick listener functions
function blurbClicked() {

  clearBlurbColors()
  this.className = "displayBlurb activeBlurb"; // Clicked blurb now visible
  updateTab.className = "active";
  addTab.className = "";
  var act = this
  updateFields(act)
  hideButton(addButton)

}

// Function to fire when "New Blurb Template" clicked
addTab.addEventListener("click", function() {
  addTab.className = "active"
  updateTab.className = "";
  clearBlurbColors()
  clearInputs()
  hideButton(updateButton)
})

// When blurb selected, update input fields
function updateFields(act) {
  var blurbIDtoSearch = act.lastChild.textContent
  chrome.storage.sync.get(['blurbs'], function(resultDB) {
    for (var i = 0; i < resultDB["blurbs"].length; i++) {
      if (resultDB["blurbs"][i]["blurbID"] == blurbIDtoSearch) {
        blurbCategoryField.value = resultDB["blurbs"][i]["category"]
        blurbTitleField.value = resultDB["blurbs"][i]["title"]
        blurbTextField.value = resultDB["blurbs"][i]["blurb"]
        break
      }
    }
  })


}

// Clear inputs
function clearInputs() {
  blurbCategoryField.value = '';
  blurbTitleField.value = '';
  blurbTextField.value = '';
}

// Switch Add/Update buttons
function hideButton(button) {
    if (button == updateButton) {
      updateButton.className = "hideButton";
      deleteButton.className = "hideButton";
      addButton.className = '';
    } else {
      updateButton.className = "";
      deleteButton.className = "";
      addButton.className = "hideButton";
  }
}
// Clear Blurb colors
function clearBlurbColors() {
  for (var i = 0; i < displayBlurbList.length; i++) {
    displayBlurbList[i].className = "displayBlurb";
  }
}
// Identify unique values in categories to display
function unique(array, propertyName) {
  var uniqueCat = []
  var filteredObjects = array.filter((e, i) => array.findIndex(a => a[propertyName] === e[propertyName]) === i);
  filteredObjects.forEach(function(element) {
    uniqueCat.push(element["category"])
  })
  return uniqueCat
}

// Sort categories alphabetically to display on right side
function rightSideSort(resultDB)  {
  resultDB['blurbs'].sort(function(a, b) {
    var objA = a.category.toUpperCase();
    var objB = b.category.toUpperCase();
    if (objA[0] < objB[0]) {
      return -1;
    }
      else {
        return 1;
      }
})
}

// If change in DB, updates right side display
chrome.storage.onChanged.addListener(function() {
       console.log('db updated')
       displayRightSide()
     });
displayRightSide();
