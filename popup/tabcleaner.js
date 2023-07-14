let checklist = document.querySelector(".duplicate_checklist");

let close_tabs_button = document.querySelector(".clean_tabs");

close_tabs_button.addEventListener("click", close_selected_tabs);

// TODO what if current window is the one that is closed??
browser.tabs.query({ active: true, currentWindow: true }).then(function(tabs) {
    // button to go back to original tab where the extension was opened
    let button = document.createElement("button");
    button.textContent = "\u140a"; // ᐊ
    button.onclick = swap_to_tab.bind(button, tabs[0].id);

    // checkbox to toggle selecting all/none urls in the list
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.id = "select-all";
    checkbox.onclick = function(event) {
        let checked = event.target.checked;
        let checkboxes = checklist.getElementsByClassName("duplicate");

        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = checked;
        }
    };
    let label = document.createElement("label");
    label.textContent = "Toggle Select All";
    label.htmlFor = "select-all";

    document.body.insertBefore(
        document.createElement("br"),
        document.body.firstChild
    );
    document.body.insertBefore(label, document.body.firstChild);
    document.body.insertBefore(checkbox, document.body.firstChild);
    document.body.insertBefore(button, document.body.firstChild);
});

refresh_duplicates_list();

async function get_duplicate_tabs() {
    duplicates = [];

    // get all tabs in the focused window
    let tabs = await browser.tabs.query({ currentWindow: true });

    // sort tabs on url
    tabs.sort((first, second) => {
        return first.url.localeCompare(second.url);
    });

    // get all duplicate tabs
    for (let i = 0; i < tabs.length - 1; i++) {
        if (tabs[i].url === tabs[i + 1].url) {
            if (tabs[i].id !== browser.tabs.TAB_ID_NONE) {
                duplicates.push(tabs[i]);
            }
        }
    }
    return duplicates;
}

// Note Ctrl+Shift+T undoes all closed tabs
async function close_selected_tabs() {
    // get all url checkboxes
    let checkboxes = checklist.getElementsByClassName("duplicate");

    // get the ids of all selected urls
    let ids = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            ids.push(Number(checkboxes[i].id));
        }
    }
    // close selected urls
    await browser.tabs.remove(ids);

    // refresh list
    refresh_duplicates_list(false);
    document.querySelector("#select-all").checked = false;
}

async function swap_to_tab(tab_id) {
    await browser.tabs.update(tab_id, { active: true });
}

async function refresh_duplicates_list(checked = true) {
    let duplicates = await get_duplicate_tabs();

    // clear the checklist
    checklist.innerHTML = "";

    // insert checklist
    duplicates.forEach((tab) => {
        let switch_button = document.createElement("button");
        switch_button.textContent = "\u1405"; // ᐅ
        switch_button.onclick = swap_to_tab.bind(switch_button, tab.id);

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = checked;
        checkbox.className = "duplicate";
        checkbox.id = tab.id;

        let label = document.createElement("label");
        label.textContent = tab.url;
        label.htmlFor = tab.id;

        checklist.appendChild(switch_button);
        checklist.appendChild(checkbox);
        checklist.appendChild(label);
        checklist.appendChild(document.createElement("br"));
    });
}
