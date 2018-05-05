// tslint:disable:await-promise
import {TemplateResult} from 'lit-html';
import {html} from 'lit-html/lib/lit-extended';
import CorpusculeElement, {CustomElement} from '../src';

describe('CorpusculeElement', () => {
  it('should allow to create custom element using CustomElement decorator', async () => {
    @CustomElement('test-element')
    class TestElement extends CorpusculeElement {
      protected _render(): TemplateResult {
        return html`<span id="test">Test</span>`;
      }
    }

    await null;

    const element = document.createElement('test-element');
    document.body.appendChild(element);

    expect(element instanceof TestElement).toBeTruthy();
    expect(element.shadowRoot).not.toBeNull();
  });
});
