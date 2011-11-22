(function(){
	Matcher.register('header', function(elements){
		elements.each(function(element){
			var left = element.getElement('.left');
			var right = element.getElement('.right');
			var title = element.getElement('h1');
			var header_check = element.getParent().getChildren('.header_check')[0];
			
			if (!left) {
				left = new Element('div', {'class': 'left'}).inject(element);
			}
			if (!right) {
				right = new Element('div', {'class': 'right'}).inject(element);
			}
			if (!header_check) {
				header_check = new Element('div', {'class': 'header_check'}).inject(element.getParent());
			}
			
			var fullSize = element.getSize().x;
			var leftSize = left.getSize().x;
			var rightSize = right.getSize().x;
			var centerSize = 0;
			var availableSize = fullSize - leftSize - rightSize;
			var biggerSide = null;
			
			if (leftSize >= rightSize) {
				centerSize = fullSize - leftSize * 2;
				biggerSide = 'left';
			} else if (rightSize > leftSize) {
				centerSize = fullSize - rightSize * 2;
				biggerSide = 'right';
			}
			
			if (title) {
				// we'll use this to check the title size against the available space
				title.clone().inject(header_check.empty());

				var titleWidth = header_check.getSize().x;

				if (titleWidth < centerSize) {
					// if we're smaller than the center size, make sure that we center the text by
					// making the smaller side the same size as the larger one.
					if (biggerSide == 'right') {
						left.setStyle('width', rightSize);
					} else if (biggerSide == 'left') {
						right.setStyle('width', leftSize);
					}
				} else if (titleWidth < availableSize) {
					// otherwise, if we're smaller than the available size,
					// left align the text so it dosn't look wonky
					title.setStyle('text-align', 'left');
				}
			}
		});
	});
	Matcher.register('.back.button', function(elements){
		elements.each(function(element){
			new Element('div', {'class': 'icon'}).inject(element, 'top');
		});
	});
})();