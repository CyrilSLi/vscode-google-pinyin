// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { window } from 'vscode';

import * as cloud from './clound';

let statusIcon: vscode.StatusBarItem;
let punc_init = true;

export function activate(context: vscode.ExtensionContext) {
	statusIcon = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	width();
	punc_init = false;
	statusIcon.command = "google-pinyin.width";
	context.subscriptions.push(statusIcon);
	context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.width', () => {
		width()
	}));

	const cloudPinyin = new cloud.CloudPinyin();

	const pinyin_state = new PinyinState(cloudPinyin);

	let enabled = false;

	context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.toggle', () => {
		enabled = !enabled;
		vscode.commands.executeCommand("setContext", "google-pinyin.enabled", enabled);
		vscode.commands.executeCommand("setContext", "google-pinyin.selecting", false);
		if (!enabled) {
			pinyin_state.hide();
			statusIcon.hide();
		} else {
			statusIcon.show();
		}
		vscode.window.showInformationMessage(`google-pinyin ${enabled ? "enabled" : "disabled"}`);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.pagenext', () => {
		pinyin_state.pagenext();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.pageprev', () => {
		pinyin_state.pageprev();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.accept.selected', () => {
		pinyin_state.acceptSelected();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.input.unsolved', () => {
		pinyin_state.inputUnsolved();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.accept.first', () => {
		pinyin_state.acceptFirst();
	}));

	for (let i = 0; i < 26; i += 1) {
		const ch = String.fromCharCode('a'.charCodeAt(0) + i);
		context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.typing-terminal.' + ch, () => {
			pinyin_state.focus = "terminal";
			pinyin_state.typing(ch);
		}));
		context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.typing-editor.' + ch, () => {
			pinyin_state.focus = "editor";
			pinyin_state.typing(ch);
		}));
	}

	for (let i = 1; i <= 9; i += 1) {
		const ch = String.fromCharCode('0'.charCodeAt(0) + i);
		context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.typing.' + ch, () => {
			pinyin_state.typingNum(i);
		}));
	}

	const punc_full = String.raw`，。、！？：；（）【】｛｝《》`;
	const punc_keys = ["comma", "period", "enumperiod", "exclamation", "question", "colon", "semicolon",
		"lparen", "rparen", "lbracket", "rbracket", "lbrace", "rbrace", "langle", "rangle"]
		.map((v, i) => [v, punc_full[i]]);
	for (const [key, ch] of punc_keys) {
		context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.typing-terminal.' + key, () => {
			editorInsert(ch, "terminal");
		}));
		context.subscriptions.push(vscode.commands.registerCommand('google-pinyin.typing-editor.' + key, () => {
			editorInsert(ch, "editor");
		}));
	}
}

export function width() {
	if (statusIcon.text === "半") {
		statusIcon.text = "全";
		statusIcon.tooltip = "full-width punctuation\n全角符号";
		vscode.commands.executeCommand("setContext", "google-pinyin.full-width", true);
	} else {
		statusIcon.text = "半";
		statusIcon.tooltip = "half-width punctuation\n半角符号";
		vscode.commands.executeCommand("setContext", "google-pinyin.full-width", false);
	}
	if (!punc_init) { // Will not run during activation
		vscode.window.showInformationMessage(`google-pinyin ${statusIcon.text}角符号`);
	}
}

type MyQuickPickItem = vscode.QuickPickItem
	& { result: cloud.SearchResult };

class PinyinState {
	readonly quickPick = window.createQuickPick<MyQuickPickItem>();
	index_updated = 0;
	index = 0;
	page = 0;
	focus = "";
	constructor(readonly cloudPinyin: cloud.CloudPinyin) {
		this.quickPick.matchOnDetail = true;
		this.quickPick.onDidChangeValue(() => this.onDidChangeValue());
		// this.quickPick.onDidChangeValue(this.onDidChangeValue);
		this.quickPick.onDidAccept(() => this.onDidAccept());
		this.quickPick.onDidHide(() => this.onDidHide());
		// const show = (label: string) => (event: any) => {
		// 	window.showInformationMessage(label + " : " + event);
		// };
		// quickPick.onDidAccept(show("onDidAccept"));
		// quickPick.onDidChangeValue(show("onDidChangeValue"));
		// this.quickPick.onDidTriggerButton(show("onDidTriggerButton"));
		// this.quickPick.onDidChangeSelection(show("onDidChangeSelection"));
	}
	show() {
		vscode.commands.executeCommand("setContext", "google-pinyin.seleting", true);
		this.quickPick.show();
	}

	pageprev() {
		if (this.page > 0) {
			this.page -= 1;
		}
		this.searchAndShow();
	}

	pagenext() {
		this.page += 1;
		this.searchAndShow();
	}
	typing(ch: string) {
		this.show();
		this.quickPick.value += ch;
		this.onDidChangeValue();
	}
	typingNum(n: number) {
		if (this.quickPick.items[n - 1]) {
			this.accept(this.quickPick.items[n - 1]);
		}
	}

	onDidChangeValue() {
		// window.showInformationMessage(`change: ${this.index}`);
		if (!this.quickPick.value) {
			this.quickPick.hide();
			return;
		}
		this.page = 0;
		this.searchAndShow();
	}
	async searchAndShow() {
		this.quickPick.busy = true;
		this.index += 1;
		const my_index = this.index;


		const item_count = (this.page + 1) * 9;
		const value = this.quickPick.value;
		const result = await this.cloudPinyin.search(this.quickPick.value, item_count);
		if (!result) {
			return;
		}
		// window.showInformationMessage(`my page ${this.page}`);
		if (my_index < this.index_updated) {
			window.showInformationMessage(`ignore the result with index ${my_index}`);
			return;
		}
		this.index_updated = my_index;
		this.quickPick.items = result
			.slice(this.page * 9, (this.page + 1) * 9)
			.filter(v => !v.hanzi.toLowerCase().includes(value))
			.map((v, i) =>
				({ label: `${i + 1}: ${v.hanzi}`, alwaysShow: true, result: v })
			);
		const items = this.quickPick.items;
		const a = items[0].label;
		const b = items[1].label;
		if (my_index === this.index) {
			this.quickPick.busy = false;
		}
	}
	acceptFirst() {
		if (this.quickPick.items[0]) {
			this.accept(this.quickPick.items[0]);
		}
	}
	acceptSelected() {
		if (this.quickPick.selectedItems[0]) {
			this.accept(this.quickPick.selectedItems[0]);
		}
	}

	inputUnsolved() {
		editorInsert(this.quickPick.value, this.focus);
		this.quickPick.value = "";
		this.quickPick.hide();
	}


	accept(item: MyQuickPickItem) {
		editorInsert(item.result.hanzi, this.focus);
		this.quickPick.value = this.quickPick.value.substr(item.result.matchedLength);
		this.onDidChangeValue();
	}

	onDidAccept() {
		this.inputUnsolved();
	}
	onDidHide() {
		this.quickPick.value = "";
		this.index_updated = this.index;
		vscode.commands.executeCommand("setContext", "google-pinyin.seleting", false);
	}
	hide() {
		this.quickPick.hide();
	}
}

const editorInsert = (text: string, focus: string) => {
	if (focus == "terminal" && vscode.window.activeTerminal) {
		const terminal = vscode.window.activeTerminal;
		terminal.sendText(text, false);
	} else if (focus == "editor" && vscode.window.activeTextEditor) {
		const editor = vscode.window.activeTextEditor;
		const position = editor.selections[0].anchor;
		editor.edit(editBuilder => {
			if (editor.selections.length === 1 && !editor.selections[0].isEmpty) {
				editBuilder.delete(editor.selections[0]);
				editor.selection = new vscode.Selection(editor.selections[0].end, editor.selections[0].end);
			}
			editBuilder.insert(
				position, text
			);
		});
	}
	vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
	// vscode.commands.executeCommand('editor.action.triggerSuggest')
};


// this method is called when your extension is deactivated
export function deactivate() {

}
