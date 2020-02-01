// tslint:disable:no-implicit-dependencies
import {
  html,
  render as originalRender,
  TemplateResult,
} from 'lit-html/lit-html';

export {html, TemplateResult};

export const render = jasmine.createSpy('render');
render.and.callFake(originalRender);
