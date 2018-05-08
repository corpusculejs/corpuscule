// tslint:disable:await-promise
import {TemplateResult} from 'lit-html';
import {html} from 'lit-html/lib/lit-extended';
import CorpusculeElement from '../src';
import {element} from '../src/decorators';

describe('CorpusculeElement', () => {
  it('should allow to create custom element using CustomElement decorator', async () => {
    @element('test-element')
    class TestElement extends CorpusculeElement {
      protected _render(): TemplateResult {
        return html`<span id="test">Test</span>`;
      }
    }

    await null;

    const el = document.createElement('test-element');
    document.body.appendChild(el);

    expect(el instanceof TestElement).toBeTruthy();
    expect(el.shadowRoot).not.toBeNull();
  });
});
