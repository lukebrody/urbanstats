import { Selector, ClientFunction } from 'testcafe';

const TARGET = process.env.URBANSTATS_TEST_TARGET ?? "http://localhost:8000"
const SEARCH_FIELD = Selector('input').withAttribute('placeholder', 'Search Urban Stats');
const getLocation = ClientFunction(() => document.location.href);

function comparison_page(locations) {
    const params = new URLSearchParams();
    params.set('longnames', JSON.stringify(locations));
    return TARGET + '/comparison.html?' + params.toString();
}

async function check_textboxes(t, txts) {
    const hamburgerMenu = Selector('div').withAttribute('class', 'hamburgermenu');
    if (await hamburgerMenu.exists) {
        await t.click(hamburgerMenu);
    }
    for (const txt of txts) {
        const checkbox = Selector('div').withAttribute('class', 'checkbox-setting')
            // filter for label
            .filter(node => node.querySelector('label').innerText === txt, { txt })
            // find checkbox
            .find('input');
        await t.click(checkbox);
    }
    if (await hamburgerMenu.exists) {
        await t.click(hamburgerMenu);
    }
}

async function check_all_category_boxes(t) {
    const hamburgerMenu = Selector('div').withAttribute('class', 'hamburgermenu');
    if (await hamburgerMenu.exists) {
        await t.click(hamburgerMenu);
    }
    const checkboxes = Selector('div').withAttribute('class', 'checkbox-setting')
        .filter(node => {
            const label = node.querySelector('label').innerText;
            return (
                label !== "Use Imperial Units"
                && label !== "Include Historical Districts"
                && label !== "Simple Ordinals"
                && label !== "Race"
                && label !== "Election"
            );
        }).find('input');
    for (let i = 0; i < await checkboxes.count; i++) {
        await t.click(checkboxes.nth(i));
    }
    if (await hamburgerMenu.exists) {
        await t.click(hamburgerMenu);
    }
}


async function prep_for_image(t) {
    await t.wait(1000);
    await t.eval(() => {
        // disable the leaflet map
        for (const x of document.getElementsByClassName("leaflet-tile-pane")) {
            x.remove();
        }
        document.getElementById("current-version").innerHTML = "&lt;VERSION&gt;";
        document.getElementById("last-updated").innerHTML = "&lt;LAST UPDATED&gt;";
    });
}

async function screencap(t, name) {
    await prep_for_image(t)
    return await t.takeScreenshot({
        // include the browser name in the screenshot path
        path: name + '_' + t.browser.name + '.png',
        fullPage: true,
        thumbnails: false
    })
}

async function download_image(t, name) {
    const download = Selector('img').withAttribute('src', '/screenshot.png');
    await prep_for_image(t);
    await t
        .click(download);
    await t.wait(3000);
    await copy_most_recent_file(t, name);
}

async function copy_most_recent_file(t, name) {
    // get the most recent file in the downloads folder
    const fs = require('fs');
    const path = require('path');
    const downloadsFolder = require('downloads-folder');
    const files = fs.readdirSync(downloadsFolder());
    const sorted = files.map(x => path.join(downloadsFolder(), x)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    // copy the file to the screenshots folder
    const screenshotsFolder = path.join(__dirname, '..', 'screenshots');
    fs.copyFileSync(sorted[0], path.join(screenshotsFolder, name + '_' + t.browser.name + '.png'));
}

fixture('longer article test')
    .page(TARGET + '/article.html?longname=California%2C+USA')
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test('california-article-test', async t => {
    // screenshot path: images/first_test.png
    await screencap(t, "article/california");
});


test('neighboring-state-test', async t => {
    const arizona = Selector('li').withAttribute('class', 'list_of_lists')
        .withText('Arizona')
        // find a checkbox inside it
        .find('input');
    await t
        .click(arizona);
    await t.wait(1000);
    await screencap(t, "article/california-with-neighbors");
    await t
        .click(Selector('path').withAttribute('class', /tag-Arizona,_USA/));
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=Arizona%2C+USA');
});



fixture('shorter article test')
    .page(TARGET + '/article.html?longname=San+Marino+city%2C+California%2C+USA')
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });


test('san-marino-article-test', async t => {
    await screencap(t, "article/san-marino");
});

test('san-marino-2010-health', async t => {
    await check_textboxes(t, ['2010 Census', 'Health']);
    await screencap(t, "article/san-marino-2010-health");

});

test('search-test', async t => {
    await t
        .click(SEARCH_FIELD)
        .typeText(SEARCH_FIELD, "Pasadena");
    await screencap(t, "search/san-marino-search-pasadena");
    await t
        .pressKey('enter');
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=Pasadena+city%2C+Texas%2C+USA');
});

test('search-test-with-extra-char', async t => {
    await t
        .click(SEARCH_FIELD)
        .typeText(SEARCH_FIELD, "Pasadena c");
    await screencap(t, "search/san-marino-search-pasadena-c");
});

test('search-test-with-special-chars', async t => {
    await t
        .click(SEARCH_FIELD)
        .typeText(SEARCH_FIELD, "Utt");
    await screencap(t, "search/san-marino-search-Utt");
});

test('search-test-different-first-char', async t => {
    await t
        .click(SEARCH_FIELD)
        .typeText(SEARCH_FIELD, "hina");
    await screencap(t, "search/san-marino-search-hina");
});

test('search-test-arrows', async t => {
    await t
        .click(SEARCH_FIELD);
    await t.wait(1000);
    await t
        .typeText(SEARCH_FIELD, "Pasadena");
    await t.wait(1000);
    await t
        .pressKey('down')
        .pressKey('down');
    await screencap(t, "search/san-marino-search-pasadena-down-down");
    await t
        .pressKey('enter');
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=Pasadena+CDP%2C+Maryland%2C+USA');
})

test('editable-number', async t => {
    // span with class editable_number
    const editableNumber = Selector('span').withAttribute('class', 'editable_number').nth(0);
    await t
        .click(editableNumber)
        // select all and delete
        .pressKey('ctrl+a')
        .typeText(editableNumber, '3')
        .pressKey('enter');
    await t.expect(editableNumber.innerText).eql('3');
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=Chicago+city%2C+Illinois%2C+USA');
})

test('lr-buttons', async t => {
    // button with a < on it
    const prev = Selector('a').withText('<').nth(0);
    const next = Selector('a').withText('>').nth(0);
    const prev_overall = Selector('a').withText('<').nth(1);
    const next_overall = Selector('a').withText('>').nth(1);
    await t
        .click(prev);
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=Fortuna+city%2C+California%2C+USA');
    await t
        .click(next);
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=San+Marino+city%2C+California%2C+USA');
    await t
        .click(next);
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=Lakewood+Park+CDP%2C+Florida%2C+USA');
    await t
        .click(prev)
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=San+Marino+city%2C+California%2C+USA');

    await t.click(prev_overall);
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=Havre+High+School+District%2C+Montana%2C+USA');
    await t.click(next_overall);
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=San+Marino+city%2C+California%2C+USA');
    await t.click(next_overall);
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=78225%2C+USA');
})

test('uncheck-box-mobile', async t => {
    // Find div with class checkbox-setting containing a label with text "Race"
    // and a checkbox, then find the checkbox
    await t.resizeWindow(400, 800);
    // refresh
    await t.eval(() => location.reload(true));
    await t.wait(1000);
    await check_textboxes(t, ['Race']);

    await screencap(t, "article/remove_race_initial_mobile");
    // refresh
    await t.eval(() => location.reload(true));
    await screencap(t, "article/remove_race_refresh_mobile");
})

test('uncheck-box-desktop', async t => {
    await t.resizeWindow(1400, 800);
    // refresh
    await t.eval(() => location.reload(true));
    await t.wait(1000);
    await check_textboxes(t, ['Race']);

    await screencap(t, "article/remove_race_initial_desktop");
    // refresh
    await t.eval(() => location.reload(true));
    await screencap(t, "article/remove_race_refresh_desktop");
})

test('simple', async t => {
    await t.resizeWindow(1400, 800);
    // refresh
    await t.eval(() => location.reload(true));
    await t.wait(1000);
    await check_textboxes(t, ['Simple Ordinals']);

    await screencap(t, "article/simple-ordinals");
})

test('download-article', async t => {
    await download_image(t, "article/download-article");
})

test('create-comparison-from-article', async t => {
    const otherRegion = Selector('input').withAttribute('placeholder', 'Other region...');
    await t
        .click(otherRegion)
        .typeText(otherRegion, "pasadena city california")
        .pressKey('enter');
    await t.expect(getLocation())
        .eql(comparison_page(["San Marino city, California, USA", "Pasadena city, California, USA"]));
})

const upper_sgv = "Upper San Gabriel Valley CCD [CCD], Los Angeles County, California, USA"
const pasadena = "Pasadena CCD [CCD], Los Angeles County, California, USA"
const sw_sgv = "Southwest San Gabriel Valley CCD [CCD], Los Angeles County, California, USA"
const east_sgv = "East San Gabriel Valley CCD [CCD], Los Angeles County, California, USA"
const chicago = "Chicago city [CCD], Cook County, Illinois, USA"

fixture('comparison test heterogenous')
    .page(comparison_page(["San Marino city, California, USA", pasadena, sw_sgv]))
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test('comparison-3-desktop-heterogenous', async t => {
    await t.resizeWindow(1400, 800);
    await t.eval(() => location.reload(true));
    await screencap(t, "comparison/heterogenous-comparison-desktop");
})

test('comparison-3-mobile-heterogenous', async t => {
    await t.resizeWindow(400, 800);
    await t.eval(() => location.reload(true));
    await screencap(t, "comparison/heterogenous-comparison-mobile");
})

fixture('comparison test homogenous (2)')
    .page(comparison_page([upper_sgv, sw_sgv]))
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test('comparison-2-mobile', async t => {
    await t.resizeWindow(400, 800);
    await t.eval(() => location.reload(true));
    await screencap(t, "comparison/basic-comparison-2-mobile");
})

fixture('comparison test homogenous (3)')
    .page(comparison_page([upper_sgv, pasadena, sw_sgv]))
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });


test('comparison-3-desktop', async t => {
    await t.resizeWindow(1400, 800);
    await t.eval(() => location.reload(true));
    await screencap(t, "comparison/basic-comparison-desktop");
})

test('comparison-3-mobile', async t => {
    await t.resizeWindow(400, 800);
    await t.eval(() => location.reload(true));
    await screencap(t, "comparison/basic-comparison-mobile");
})

test('comparison-3-download', async t => {
    await t.resizeWindow(1400, 800);
    await t.eval(() => location.reload(true));
    await download_image(t, "comparison/download-comparison");
})

test('comparison-3-add', async t => {
    const otherRegion = Selector('input').withAttribute('placeholder', 'Name');
    await t
        .click(otherRegion)
        .typeText(otherRegion, "san marino city california")
        .pressKey('enter');
    await t.expect(getLocation())
        .eql(comparison_page([upper_sgv, pasadena, sw_sgv, "San Marino city, California, USA"]));
})

test('comparison-3-remove-first', async t => {
    const remove = Selector('div').withAttribute('class', 'serif manipulation-button-delete').nth(0);
    await t
        .click(remove);
    await t.expect(getLocation())
        .eql(comparison_page([pasadena, sw_sgv]));
})

test('comparison-3-remove-second', async t => {
    const remove = Selector('div').withAttribute('class', 'serif manipulation-button-delete').nth(1);
    await t
        .click(remove);
    await t.expect(getLocation())
        .eql(comparison_page([upper_sgv, sw_sgv]));
})

test('comparison-3-replace-second', async t => {
    const replace = Selector('div').withAttribute('class', 'serif manipulation-button-replace').nth(1);
    await t
        .click(replace);
    // already focused on the input
    const otherRegion = Selector('input').withAttribute('placeholder', 'Replacement');
    await t
        .typeText(otherRegion, "East San Gabriel Valley")
        .pressKey('enter');
    await t.expect(getLocation())
        .eql(comparison_page([upper_sgv, east_sgv, sw_sgv]));
});

test('comparison-3-editable-number-third', async t => {
    const editableNumber = Selector('span').withAttribute('class', 'editable_number').nth(2);
    await t
        .click(editableNumber)
        // select all and delete
        .pressKey('ctrl+a')
        .typeText(editableNumber, '3')
        .pressKey('enter');
    await t.expect(editableNumber.innerText).eql('3');
    await t.expect(getLocation())
        .eql(comparison_page([upper_sgv, pasadena, chicago]));
})

fixture('statistics')
    .page(TARGET + '/article.html?longname=Indianapolis+IN+HRR%2C+USA')
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test('statistics-page', async t => {
    await t.resizeWindow(1400, 800);
    await t.eval(() => location.reload(true));
    // click the link labeled "Population"
    await t
        .click(Selector('a').withText(/^Population$/));
    // assert url is https://urbanstats.org/statistic.html?statname=Population&article_type=Hospital+Referral+Region&start=21&amount=20
    await t.expect(getLocation())
        .eql(TARGET + '/statistic.html?statname=Population&article_type=Hospital+Referral+Region&start=21&amount=20&universe=USA');
    await screencap(t, "statistics/population");
    // click link "Data Explanation and Credit"
    await t
        .click(Selector('a').withText(/^Data Explanation and Credit$/));
    await t.expect(getLocation())
        .eql(TARGET + '/data-credit.html#explanation_population');
});

fixture('statistics-navigation')
    .page(TARGET + '/statistic.html?statname=Population&article_type=Hospital+Referral+Region&start=21&amount=20')
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test('statistics-navigation-left', async t => {
    await t
        .click(Selector('button').withText('<'));
    const url = TARGET + '/statistic.html?statname=Population&article_type=Hospital+Referral+Region&start=1&amount=20';
    await t.expect(getLocation())
        .eql(url);
    // going left again does nothing
    await t
        .click(Selector('button').withText('<'));
    await t.expect(getLocation())
        .eql(url);
});

test('statistics-navigation-right', async t => {
    await t
        .click(Selector('button').withText('>'));
    await t.expect(getLocation())
        .eql(TARGET + '/statistic.html?statname=Population&article_type=Hospital+Referral+Region&start=41&amount=20');
});

test('statistics-navigation-amount', async t => {
    // take the select field that currently says 20 and make it say 50
    const amount = Selector('select').nth(0);
    await t
        .click(amount)
        .click(Selector('option').withText('50'));
    await t.expect(getLocation())
        .eql(TARGET + '/statistic.html?statname=Population&article_type=Hospital+Referral+Region&start=1&amount=50');
    await screencap(t, "statistics/amount-50");
    // set to All
    await t
        .click(amount)
        .click(Selector('option').withText('All'));
    await t.expect(getLocation())
        .eql(TARGET + '/statistic.html?statname=Population&article_type=Hospital+Referral+Region&start=1&amount=All');
    await screencap(t, "statistics/amount-all");
});


test('statistics-navigation-last-page', async t => {
    // find input with value 2, then replace it with 15
    const page = Selector('input').withAttribute('value', '2');
    await t
        .click(page)
        .pressKey('ctrl+a')
        .typeText(page, '15')
        .pressKey('enter');

    const url = TARGET + '/statistic.html?statname=Population&article_type=Hospital+Referral+Region&start=281&amount=20';

    await t.expect(getLocation())
        .eql(url);

    await screencap(t, "statistics/last-page");
    // going right again does nothing
    await t
        .click(Selector('button').withText('>'));
    await t.expect(getLocation())
        .eql(url);
});


fixture('quiz result test')
    .page(TARGET + '/quiz.html?date=100')
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => {
            localStorage.clear()
            const quiz_history = {};
            for (var i = 2; i <= 100; i++) {
                quiz_history[i] = {
                    "choices": ["A", "A", "A", "A", "A"],
                    "correct_pattern": [true, true, true, i % 3 == 1, i % 4 == 1]
                }
            }
            quiz_history[62] = {
                "choices": ["A", "A", "A", "A", "A"],
                "correct_pattern": [false, false, false, false, false]
            }
            localStorage.setItem("quiz_history", JSON.stringify(quiz_history));
        });
    });

test('quiz-results-test', async t => {
    await t.eval(() => location.reload(true));
    await t.eval(() => document.getElementById("quiz-timer").remove());
    await screencap(t, "quiz/results-page");
});

fixture('article universe selector test')
    .page(TARGET + '/article.html?longname=San+Marino+city%2C+California%2C+USA')
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test('article-universe-selector-test', async t => {
    await t
        .click(Selector('img').withAttribute('class', 'universe-selector'));
    await screencap(t, "article-dropped-down-universe-selector");
    await t
        .click(
            Selector('img')
                .withAttribute('class', 'universe-selector-option')
                .withAttribute('alt', 'California, USA'));
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=San+Marino+city%2C+California%2C+USA&universe=California%2C+USA');
});

fixture('article universe selector test international')
    .page(TARGET + '/article.html?longname=Delhi+%5BNew+Delhi%5D+Urban+Center%2C+India')
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test('article-universe-selector-test', async t => {
    await t
        .click(Selector('img').withAttribute('class', 'universe-selector'));
    await screencap(t, "article-dropped-down-universe-selector-international");
    await t
        .click(
            Selector('img')
                .withAttribute('class', 'universe-selector-option')
                .withAttribute('alt', 'India'));
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=Delhi+%5BNew+Delhi%5D+Urban+Center%2C+India&universe=India');
    await screencap(t, "article/delhi-india");
});

fixture('statistic universe selector test')
    .page(TARGET + '/statistic.html?statname=Population&article_type=City&start=3461&amount=20')
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });


test('statistic-universe-selector-test', async t => {
    await t
        .click(Selector('img').withAttribute('class', 'universe-selector'));
    await screencap(t, "statistic-dropped-down-universe-selector");
    await t
        .click(
            Selector('img')
                .withAttribute('class', 'universe-selector-option')
                .withAttribute('alt', 'Puerto Rico, USA'));
    await t.expect(getLocation())
        .eql(TARGET + '/statistic.html?statname=Population&article_type=City&start=3461&amount=20&universe=Puerto+Rico%2C+USA');
});

fixture('article universe navigation test')
    .page(TARGET + '/article.html?longname=San+Marino+city%2C+California%2C+USA&universe=California%2C+USA')
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test('article-universe-right-arrow', async t => {
    // click right population arrow
    await t
        .click(Selector('a').withText('>'));
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=Camp+Pendleton+South+CDP%2C+California%2C+USA&universe=California%2C+USA');
});

test("article-universe-ordinal", async t => {
    // click the ordinal for the universe
    const editableNumber = Selector('span').withAttribute('class', 'editable_number').nth(0);
    await t
        .click(editableNumber)
        // select all and delete
        .pressKey('ctrl+a')
        .typeText(editableNumber, '3')
        .pressKey('enter');
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=San+Jose+city%2C+California%2C+USA&universe=California%2C+USA');
});



test("article-universe-statistic-page", async t => {
    // click the link for Area
    await t
        .click(Selector('a').withText(/^Area$/));
    await t.expect(getLocation())
        .eql(TARGET + '/statistic.html?statname=Area&article_type=City&start=801&amount=20&universe=California%2C+USA');
    await screencap(t, "statistics/universe-statistic-page");
});

test("article-universe-related-button", async t => {
    await t
        .click(Selector('a').withText('Los Angeles County'));
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=Los+Angeles+County%2C+California%2C+USA&universe=California%2C+USA');
});

test("article-universe-search", async t => {
    await t
        .click(SEARCH_FIELD)
        .typeText(SEARCH_FIELD, "Chino");
    await t
        .pressKey('enter');
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=Chino+city%2C+California%2C+USA&universe=California%2C+USA');
});

test("article-universe-compare", async t => {
    // compare to San Francisco
    await t
        .click(Selector('input').withAttribute('placeholder', 'Other region...'))
        .typeText(Selector('input').withAttribute('placeholder', 'Other region...'), "San Francisco city california")
        .pressKey('enter');
    await t.expect(getLocation())
        .eql(
            TARGET + '/comparison.html?longnames=%5B%22San+Marino+city%2C+California%2C+USA%22%2C%22San+Francisco+city%2C+California%2C+USA%22%5D&universe=California%2C+USA'
        );
    await screencap(t, "comparison/universe-compare");
});

test("article-universe-compare-different", async t => {
    // compare to Chicago
    await t
        .click(Selector('input').withAttribute('placeholder', 'Other region...'))
        .typeText(Selector('input').withAttribute('placeholder', 'Other region...'), "Chicago city illinois")
        .pressKey('enter');
    await t.expect(getLocation())
        .eql(
            TARGET + '/comparison.html?longnames=%5B%22San+Marino+city%2C+California%2C+USA%22%2C%22Chicago+city%2C+Illinois%2C+USA%22%5D'
        );
    await screencap(t, "comparison/universe-compare-different");
});

fixture('article universe state test')
    .page(TARGET + '/article.html?longname=California%2C+USA')
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test("article-universe-state-world", async t => {
    // go to the world
    await t
        .click(Selector('img').withAttribute('class', 'universe-selector'));
    await t
        .click(
            Selector('img')
                .withAttribute('class', 'universe-selector-option')
                .withAttribute('alt', 'world'));
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=California%2C+USA&universe=world');
    // screenshot
    await screencap(t, "article/california-world");
});

fixture('article universe state from subnational test')
    .page(TARGET + '/article.html?longname=Kerala%2C+India')
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });


test("article-universe-state-from-subnational", async t => {
    await screencap(t, "article/kerala-india");
    // click the > button
    await t
        .click(Selector('a').withText('>'));
    await t.expect(getLocation())
        .eql(TARGET + '/article.html?longname=California%2C+USA&universe=world');
    await screencap(t, "article/california-world-from-kerala");
});

fixture('mapping')
    .page(TARGET + '/mapper.html?settings=H4sIAAAAAAAAA1WOzQ6CQAyEX8XUeCOGixeO%2BggejSEFy7Kh%2B5PdRSWEd7dLjMHe2plvpjMociqg76d60PYBFVwTJoICOs2JAlQzkMWGSbQOOZIoo22TdjZrafIk0O9UwBODzv4I1e2%2BLAW0jl2oo8RugKitYlrtPObDmbEddgcQIKDxGytrSxjgG2Rwq%2FlAkZJoFk3eL2NDPbF%2BQ27OpBRPUiTIiotnX64j0Iu06uWr8ngSd4OR%2FtNdNJLzAd2YY7skAQAA')
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test("state-map", async t => {
    await screencap(t, "state-map");
})

fixture('random')
    .page(TARGET + "/random.html?sampleby=population&us_only=true")
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test("random-usa", async t => {
    // wait for load
    await t.wait(1000);
    // contains article
    await t.expect(getLocation())
        .contains('/article.html?longname=');
    // location should not include &universe=
    await t.expect(getLocation())
        .notContains('&universe=');
})

fixture('all stats test')
    .page(TARGET + '/article.html?longname=California%2C+USA')
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test('california-all-stats', async t => {
    await check_all_category_boxes(t);
    await screencap(t, "article/california-all-stats");
});

// selected because the gz changed in statistic classes
fixture('all stats test regression')
    .page(TARGET + '/article.html?longname=Charlotte%2C+Maine%2C+USA')
    // no local storage
    .beforeEach(async t => {
        await t.eval(() => localStorage.clear());
    });

test('charlotte-all-stats', async t => {
    await check_all_category_boxes(t);
    await screencap(t, "article/charlotte-all-stats");
});
