function dbGetFacade(param, callback) {
  let hasBlurbs = false;

  chrome.storage.sync.get([param], (result) => {
    hasBlurbs = hasBlurbsEntries(result);

    if (!!hasBlurbs) {
      const dataToSave = migrate(result["blurbs"]);
      chrome.storage.sync.set(dataToSave);

      let arrayOfIDs;

      chrome.storage.sync.get(["idArray"], (result) => {
        arrayOfIDs = result;
      });

      chrome.storage.sync.get(arrayOfIDs, (blurbs) => {
        const modelThatConsumerExpects = updateDataToMatchConsumerModel(blurbs);
        callback(modelThatConsumerExpects);
      });
    }
  });

  if (!hasBlurbs) {
    chrome.storage.sync.get(["idArray"], (result) => {
      if (result?.idArray?.length > 0) {
        blurbIdList = result["idArray"].map((num) => `${num}`);

        chrome.storage.sync.get(blurbIdList, (blurbs) => {
          const modelThatConsumerExpects = updateDataToMatchConsumerModel(
            blurbs
          );

          callback(modelThatConsumerExpects);
        });
      } else {
        const modelThatConsumerExpects = updateDataToMatchConsumerModel(result);

        callback(modelThatConsumerExpects);
      }
    });
  }
}

function hasBlurbsEntries(result) {
  const hasBlurbs = Object.keys(result).includes("blurbs");
  return !!hasBlurbs && result["blurbs"].length > 0;
}

function updateDataToMatchConsumerModel(result) {
  const keys = Object.keys(result).filter((key) => key != "idArray");

  if (keys.length > 0) {
    const allBlurbs = keys.map((id) => ({
      blurb: result[id]["blurb"],
      blurbID: result[id]["blurbID"],
      category: result[id]["category"],
      title: result[id]["title"],
    }));

    return {
      blurbs: allBlurbs,
    };
  } else {
    return {
      blurbs: [],
    };
  }
}

function saveInDB(resultDB, document, confirmationWindow, action_confirm) {
  // migrate and save;
  const dataMatchesSchema = migrate(resultDB["blurbs"]);

  chrome.storage.sync.set(dataMatchesSchema, function (result) {
    let confirmText = document.createElement("p");
    confirmText.textContent = action_confirm;
    confirmationWindow.innerHTML = "";
    confirmationWindow.appendChild(confirmText);
    confirmationWindow.className += " showConfirm";
    setTimeout(function () {
      confirmationWindow.className = "hideConfirm";
    }, 2500);
  });
}

const migrate = (data) => {
  const dataToSave = {
    idArray: [],
  };

  chrome.storage.sync.set({ blurbs: [] });

  data.forEach((entry) => {
    dataToSave["idArray"].push(entry["blurbID"]);

    const id = entry["blurbID"];

    dataToSave[id] = {
      title: entry["title"],
      category: entry["category"],
      blurb: entry["blurb"],
      blurbID: entry["blurbID"],
    };
  });

  return dataToSave;
};
