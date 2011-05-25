if (!History.handleInitialState()) (function(){

// Forms
Matcher.register({
	'form': Class.Instantiate(Form.Element),
	'input[data-dg-form-clearable]': Class.Instantiate(Form.Clear),
	'input[data-dg-form-listen-to]': Class.Instantiate(Form.ListenTo),
	'input[data-dg-input-type=date]': Class.Instantiate(Form.Date),
	'input[type=number]': Class.Instantiate(Form.Number),
	'div.form_checkbox': Class.Instantiate(Form.Checkbox),
	'ul.radio': Class.Instantiate(Form.Radio),
	'div.select': Class.Instantiate(Form.Select),
	'textarea': Class.Instantiate(Form.AutoGrow, {margin: -6})
});

if (Form.Placeholder) Matcher.register('input[placeholder]', Form.Placeholder);

// Popover
Matcher.register({
	'[data-dg-popover]': Class.Instantiate(Popover, {margin: 10}),
	'[data-dg-tooltip]': Class.Instantiate(Tip, {margin: 10}),
	'[data-dg-popover-auto]': Class.Instantiate(Popover.Auto, {margin: 10})
});

// Notice
Notice.setup(Doppelganger.lookupSetting('notice'));

// Scroll
Scrollbar.use('div.scroll', Browser.isMobile ? 'iScroll' : 'DesktopScrollbar');

// Dispatcher
new Dispatcher(ApplicationState.get('URL') || History.getPath() || '/', {
	selectors: {
		anchor: 'a:not([href^=#]):not([href^=http://]):not([data-dg-noxhr])',
		wipe: '[data-dg-wipe]',
		nohistory: '[data-dg-nohistory]',
		noselect: '[data-dg-noselect]'
	},

	selectedClassName: Doppelganger.lookupSetting('selected_class'),
	hiddenClassName: Doppelganger.lookupSetting('hidden_class')
}).setFactory(new Dispatcher.ObjectFactory().defineObjects({
	'default': Dispatcher.Object,
	form: Dispatcher.Object.Form.Django
})).addEvents(Doppelganger.lookupSetting('dispatcher:events'));

Browser.attachBehaviors(
	new BrowserBehavior.BodyClass,
	new BrowserBehavior.ActiveState,
	new BrowserBehavior.ScrollToTop,
	new BrowserBehavior.iOSTouchFix,
	new BrowserBehavior.ScrollToTopOnTap(Matcher, '[data-dg-scroll-to-top]'),
	new BrowserBehavior.ScrollToTopOnAction
);

})();
