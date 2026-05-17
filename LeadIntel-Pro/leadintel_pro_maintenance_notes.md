# LeadIntel Pro - Developer Maintenance Notes

Project Name:
LeadIntel Pro - LinkedIn Lead Finder

Project Type:
Chrome Extension (Manifest V3)

Tech Stack:
- HTML
- CSS
- Vanilla JavaScript
- Chrome Extension APIs

No Frameworks:
- No React
- No Vue
- No TypeScript
- No Build Tools

==================================================
1. PROJECT OVERVIEW
==================================================

This extension is built to extract publicly visible LinkedIn leads from:
- Search pages
- Feed posts
- People results
- Hashtag pages

The extension works completely locally.

There is:
- No backend
- No database server
- No external APIs
- No cloud sync

All data is stored inside:
chrome.storage.local

==================================================
2. IMPORTANT WARNING ABOUT LINKEDIN
==================================================

LinkedIn changes its DOM structure frequently.

This means:
- CSS classes may change
- Element structure may change
- Feed layout may change
- Search layout may change
- Selectors may stop working

THIS IS NORMAL.

Most future maintenance work will involve:
- Updating selectors
- Adjusting parsers
- Fixing extraction logic

The extraction system was intentionally designed using modular parser architecture to make maintenance easier.

==================================================
3. PROJECT FOLDER STRUCTURE
==================================================

/extension

  manifest.json
  popup.html
  popup.css
  popup.js
  background.js
  content.js

  /core
    stateManager.js
    eventBus.js

  /services
    extractionService.js
    campaignService.js
    exportService.js

  /utils
    storage.js
    csv.js
    domUtils.js
    queryGenerator.js
    constants.js
    logger.js

    /linkedinParser
      index.js
      selectorRegistry.js
      parserHelpers.js
      searchParser.js
      feedParser.js
      peopleParser.js
      semanticParser.js
      fallbackParser.js

  /assets
    icon16.png
    icon48.png
    icon128.png

==================================================
4. MOST IMPORTANT FILES
==================================================

==================================================
4.1 selectorRegistry.js
==================================================

FILE:
/utils/linkedinParser/selectorRegistry.js

THIS IS THE MOST IMPORTANT MAINTENANCE FILE.

If LinkedIn changes class names:
- update selectors here first
- do NOT rewrite parsers immediately

Example:

OLD:
.feed-shared-update-v2

NEW:
.feed-update-container

Update inside:
feedCards: []

==================================================
4.2 Parser Files
==================================================

These files handle different LinkedIn page types.

searchParser.js
- handles LinkedIn search pages

feedParser.js
- handles LinkedIn feed posts

peopleParser.js
- handles people suggestion pages

semanticParser.js
- fallback semantic extraction
- less dependent on CSS classes

fallbackParser.js
- last fallback parser
- extracts minimal data if everything else fails

==================================================
4.3 index.js
==================================================

FILE:
/utils/linkedinParser/index.js

This is the main parser orchestrator.

It combines all parser outputs:
- search parser
- feed parser
- people parser
- semantic parser
- fallback parser

It also removes duplicates.

==================================================
5. HOW EXTRACTION WORKS
==================================================

Flow:

content.js
↓
ExtractionService
↓
linkedinParser/index.js
↓
individual parser files
↓
lead objects generated
↓
storage.js saves leads
↓
popup dashboard shows data

==================================================
6. HOW TO FIX BROKEN EXTRACTION
==================================================

If users report:
- no leads extracted
- partial extraction
- feed extraction stopped
- names missing
- profile URLs missing

Follow these steps.

STEP 1
Open LinkedIn page.

STEP 2
Open Chrome DevTools.

STEP 3
Inspect element.

STEP 4
Find updated class names.

STEP 5
Update:
selectorRegistry.js

STEP 6
Reload extension.

STEP 7
Test extraction again.

IMPORTANT:
Always try selector updates BEFORE rewriting parser logic.

==================================================
7. HOW TO DEBUG EXTRACTION
==================================================

Use:
console.log()

Main debugging files:
- content.js
- extractionService.js
- parser files

Useful checks:

Check if selectors work:

Example:

document.querySelectorAll(
  '.entity-result'
)

Check if profile links exist:

document.querySelectorAll(
  'a[href*="/in/"]'
)

==================================================
8. WHY MULTIPLE SELECTORS EXIST
==================================================

Example:

profileName: [
  '.update-components-actor__name',
  '.entity-result__title-text',
  '[data-anonymize="person-name"]'
]

This is intentional.

Reason:
LinkedIn may change one selector while another still works.

This is called:
Selector Fallback Strategy.

DO NOT remove fallback selectors unless absolutely necessary.

==================================================
9. HOW DUPLICATE PREVENTION WORKS
==================================================

Duplicates are prevented using:
- normalized LinkedIn URLs

Example:

linkedin.com/in/john/
linkedin.com/in/john?trk=abc

Both become:
linkedin.com/in/john

Normalization happens inside:
/domUtils.js

Function:
normalizeLinkedInUrl()

==================================================
10. STORAGE SYSTEM
==================================================

All data is stored in:
chrome.storage.local

Main storage keys:
- campaigns
- leads
- duplicates
- settings

Storage logic:
/utils/storage.js

==================================================
11. EXPORT SYSTEM
==================================================

CSV export:
/utils/csv.js

Export service:
/services/exportService.js

Uses:
chrome.downloads API

==================================================
12. HOW TO ADD NEW PARSERS
==================================================

If LinkedIn introduces new layouts:

STEP 1
Create new parser file.

Example:
companyParser.js

STEP 2
Add selectors inside:
selectorRegistry.js

STEP 3
Import parser inside:
linkedinParser/index.js

STEP 4
Add parser execution:

...parseCompanyResults()

==================================================
13. PERFORMANCE RULES
==================================================

VERY IMPORTANT.

Do NOT:
- add aggressive intervals
- add infinite loops
- scan DOM every second
- use heavy observers
- scan entire document repeatedly

The extension is intentionally optimized for:
- low memory usage
- lightweight scanning
- safe LinkedIn behavior

==================================================
14. LINKEDIN SAFETY RULES
==================================================

NEVER implement:
- auto messaging
- auto connection requests
- login automation
- captcha bypass
- hidden automation
- aggressive scrolling bots

Reason:
- LinkedIn account risk
- Chrome Store rejection risk
- compliance issues

==================================================
15. HOW TO TEST EXTENSION
==================================================

STEP 1
Open Chrome.

STEP 2
Go to:
chrome://extensions

STEP 3
Enable:
Developer Mode

STEP 4
Click:
Load Unpacked

STEP 5
Select extension folder.

STEP 6
Open LinkedIn.

STEP 7
Open extension popup.

STEP 8
Test extraction.

==================================================
16. IF CONTENT.JS STOPS WORKING
==================================================

Check:
manifest.json

Verify:

"content_scripts"

and:

"host_permissions"

must include:
https://*.linkedin.com/*

==================================================
17. HOW TO RELEASE UPDATES
==================================================

STEP 1
Update version inside:
manifest.json

Example:
1.0.0 → 1.0.1

STEP 2
Zip extension folder.

STEP 3
Upload to Chrome Web Store.

==================================================
18. IMPORTANT DEVELOPMENT RULES
==================================================

Always:
- keep files modular
- avoid giant files
- use reusable functions
- update selectors centrally
- preserve fallback parsers
- maintain low CPU usage
- test on multiple LinkedIn pages

Avoid:
- hardcoding page assumptions
- relying on one selector only
- putting all logic in content.js
- adding unnecessary dependencies

==================================================
19. FUTURE IMPROVEMENT IDEAS
==================================================

Potential future upgrades:
- IndexedDB support
- lead scoring
- smart tagging
- parser confidence scoring
- dark/light themes
- advanced filters
- semantic AI classification
- remote selector updates
- export filters
- analytics dashboard

==================================================
20. FINAL MAINTENANCE ADVICE
==================================================

Most future maintenance issues will come from LinkedIn DOM updates.

Usually fixes involve:
- updating selectors
- adjusting parser logic
- adding fallback extraction

DO NOT panic if extraction breaks.

This is normal for LinkedIn tools.

The modular parser architecture was specifically designed to make future fixes easier and faster.

