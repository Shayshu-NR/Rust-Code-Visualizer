/**
 * Creates a number only used once for unique IDs
 *
 * @export
 * @return {*}  {string}
 */
export function getNonce(): string {
	let text: string = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
