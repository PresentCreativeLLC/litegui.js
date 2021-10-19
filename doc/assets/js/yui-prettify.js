YUI().use('node', (Y) =>
{
	const code = Y.all('.prettyprint.linenums');
	if (code.size())
	{
		code.each((c) =>
		{
			let lis = c.all('ol li'),
				l = 1;
			lis.each((n) =>
			{
				n.prepend('<a name="LINENUM_' + l + '"></a>');
				l++;
			});
		});
		let h = location.hash;
		location.hash = '';
		h = h.replace('LINE_', 'LINENUM_');
		location.hash = h;
	}
});
