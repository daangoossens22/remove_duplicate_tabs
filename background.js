browser.commands.onCommand.addListener((command) => {
    browser.tabs.query({currentWindow: true}).then(function(tabs) {
        // sort on url
        tabs.sort((first, second) => { return first.url.localeCompare(second.url); });

        // get all duplicate urls' ids
        // let duplicates = [];
        let duplicates_ids = [];
        for (let i = 0; i < tabs.length - 1; i++) {
            if (tabs[i].url === tabs[i+1].url) {
                if (tabs[i].id !== browser.tabs.TAB_ID_NONE && 
                    tabs[i].url !== "https://bugzilla.kernel.org/show_bug.cgi?id=196683") { // temporary
                    // duplicates.push(tabs[i]);
                    duplicates_ids.push(tabs[i].id);
                }
            }
        }
        // duplicates.forEach(dup => {
        //     console.log(dup.url);
        // });
        // console.log(duplicates_ids);

        // close duplicate tabs
        browser.tabs.remove(duplicates_ids);
    });
});
