"""Optional browser verification for Google Emergence: pip install playwright; playwright install chromium.
Run after npm run build. Uses supplied offline HTML without navigating the browser;
this also exercises the no-storage fallback of an opaque origin. It is not a
substitute for hosted-origin storage, CSP, assistive-technology, or security tests.
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--browser', default=None, help='Optional Chromium executable path')
parser.add_argument('--output', default='qa-output')
args = parser.parse_args()
out = Path(args.output)
out.mkdir(parents=True, exist_ok=True)
checks = []

def check(condition, name):
    if not condition:
        raise AssertionError(name)
    checks.append(name)

with sync_playwright() as pw:
    options = {'headless': True}
    if args.browser:
        options['executable_path'] = args.browser
    browser = pw.chromium.launch(**options)
    page = browser.new_page(viewport={'width': 1440, 'height': 1050}, accept_downloads=True)
    errors, requests = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('request', lambda r: requests.append(r.url))
    page.set_content(Path('dist/google-emergence.html').read_text(), wait_until='load')
    page.wait_for_selector('h1')
    check('Continuous Human Capability Emergence' in page.locator('h1').inner_text(), 'initial board renders')
    check('3.3 / 4.0' in page.locator('[data-action="skill:systems"]').inner_text(), 'initial independent estimate')
    page.locator('[data-action="mode:assisted"]').click()
    check('4.0 / 4.0' in page.locator('[data-action="skill:systems"]').inner_text(), 'assistance mode remains separate')
    page.locator('[data-action="mode:independent"]').click()
    page.locator('[data-action="skill:systems"]').click()
    check(page.locator('dialog').evaluate('(el)=>el.open'), 'capability evidence dialog opens')
    page.keyboard.press('Escape')
    check(not page.locator('dialog').evaluate('(el)=>el.open'), 'Escape closes modal')

    def route(name):
        page.evaluate('(name)=>{location.hash=name}', name)
        page.wait_for_timeout(75)

    for name in ['feed', 'projects', 'perspectives', 'benchmarks', 'evidence', 'consent', 'proposal', 'board']:
        route(name)
        check(page.locator('h1').count() == 1, f'{name} route has one primary heading')
        unnamed = page.locator('button').evaluate_all('''els=>els.filter(el=>el.getClientRects().length && !el.innerText.trim() && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')).length''')
        check(unnamed == 0, f'{name} visible buttons have names')

    route('perspectives')
    page.locator('[data-action="perspective:storyteller"]').click()
    page.locator('input[name="practice"][value="1"]').uncheck()
    page.locator('#perspective-form button[type="submit"]').click()
    page.wait_for_selector('#reflection')
    check(page.locator('.adopted-practices p').count() == 2, 'selected practices retained in project')
    check(page.locator('[data-action^="replay:"]').is_disabled(), 'assessment gated by unfinished practice')
    for i in range(3):
        page.locator(f'input[data-step="{i}"]').check()
    page.locator('#reflection').fill('I articulated the trade-off in Google Docs; Gemini suggested alternatives.')
    check(not page.locator('[data-action^="replay:"]').is_disabled(), 'completed practice enables replay')
    with page.expect_download() as event:
        page.locator('[data-action^="brief:"]').click()
    download = event.value
    download.save_as(out / 'project-brief.md')
    check('Gemini' in (out / 'project-brief.md').read_text(), 'project brief downloads with reflection')
    page.locator('[data-action^="replay:"]').click()
    page.wait_for_timeout(100)
    check(page.locator('[data-action^="accept:"]').count() == 2, 'replay creates pending evidence')
    page.locator('[data-action^="accept:evidence-"]').click()
    route('board')
    check('2.8 / 4.0' in page.locator('[data-action="skill:story"]').inner_text(), 'acceptance recomputes matching capability')
    route('projects')
    page.locator('[data-action="filter:Complete"]').click()
    check(page.locator('.project-card').count() == 1, 'accepted evidence completes the project')

    route('benchmarks')
    page.locator('#cohort').select_option('circle')
    check('fewer than 30' in page.locator('main').inner_text(), 'small cohort comparison withheld')
    page.locator('#cohort').select_option('national')
    check('80' in page.locator('.distribution').inner_text(), 'national fictional cohort selected')
    route('consent')
    page.locator('[data-action="bench-toggle"]').click()
    route('benchmarks')
    check('Comparisons are paused' in page.locator('main').inner_text(), 'comparison opt-out honored')
    route('consent')
    page.locator('[data-action="source:projects"]').click()
    route('board')
    check('Unmapped' in page.locator('[data-action="skill:systems"]').inner_text(), 'revoked source excluded from map')
    page.locator('[data-action="mode:assisted"]').click()
    check('Unmapped' in page.locator('[data-action="skill:systems"]').inner_text(), 'revocation also excludes assisted evidence')
    route('consent')
    with page.expect_download() as event:
        page.locator('[data-action="export"]').click()
    event.value.save_as(out / 'capability-packet.json')
    packet = json.loads((out / 'capability-packet.json').read_text())
    check(packet['synthetic'] and len(packet['claims']) == 12, 'capability packet downloads in both modes')
    check(all(key not in packet for key in ['evidence', 'reflection', 'tastes', 'projects']), 'selective packet excludes private context')
    check(all(c['score'] is None for c in packet['claims'] if c['skill'] == 'systems'), 'export respects revoked grant')
    page.locator('[data-action="reset"]').click()
    page.locator('[data-action="confirm-reset"]').click()
    route('board')
    check('3.3 / 4.0' in page.locator('[data-action="skill:systems"]').inner_text(), 'reset restores fictional starting state')

    page.locator('.topbar [data-action="new"]').click()
    page.locator('#project-title').fill('<img src=x onerror=alert(1)>')
    page.locator('#project-form button[type="submit"]').click()
    check(page.locator('#dialog-title').inner_text() == '<img src=x onerror=alert(1)>', 'user title rendered as text')
    check(page.locator('#dialog-title img').count() == 0, 'user title cannot inject markup')
    page.keyboard.press('Escape')
    route('consent')
    page.locator('[data-action="reset"]').click()
    page.locator('[data-action="confirm-reset"]').click()
    route('proposal')
    with page.expect_download() as event:
        page.locator('a[href="./docs/ARCHITECTURE.md"]').first.click()
    event.value.save_as(out / 'architecture.md')
    check('Architecture' in (out / 'architecture.md').read_text(), 'offline architecture document downloads')

    for width in [320, 390, 768, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        for name in ['board', 'projects', 'perspectives', 'benchmarks', 'evidence', 'consent', 'proposal']:
            route(name)
            check(page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'no page overflow: {name} at {width}px')

    page.set_viewport_size({'width': 1440, 'height': 1050})
    check(not errors, f'no runtime errors: {errors}')
    check(not [r for r in requests if r.startswith(('http:', 'https:'))], 'no network requests from offline demo')
    result = {'passed': len(checks), 'checks': checks, 'page_errors': errors, 'browser': browser.version,
              'method': 'offline page.set_content; browser navigation policy unchanged'}
    (out / 'browser-results.json').write_text(json.dumps(result, indent=2))
    print(f'All {len(checks)} browser smoke checks passed.')
    browser.close()
