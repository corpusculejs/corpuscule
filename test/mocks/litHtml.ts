// tslint:disable:no-implicit-dependencies
import {html, render as originalRender} from 'lit-html/lit-html';

export {html};

export const render = jasmine.createSpy('render');
render.and.callFake(originalRender);
