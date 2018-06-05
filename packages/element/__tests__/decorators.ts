// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from "lit-html";
import {html} from "lit-html/lib/lit-extended";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import CorpusculeElement, {attributeMap, computedMap, propertyMap, render, stateMap} from "../src";
import {attribute, computed, element, property, state} from "../src/decorators";
import {mount} from "./utils";

const decorators = () => {
  describe("decorators", () => {
    describe("@element", () => {
      it("should init CorpusculeElement", () => {
        const is = `x-${uuid()}`;

        @element(is)
        class Test extends CorpusculeElement {
          protected [render](): TemplateResult {
            return html`<span id="node">Test content</span>`;
          }
        }

        const el = mount(is);
        expect(el).toEqual(jasmine.any(Test));

        const root = el.shadowRoot;
        expect(root).not.toBeNull();

        const node = root!.getElementById("node");
        expect(node).not.toBeNull();
        expect(node!.textContent).toBe("Test content");
      });

      it("should add static \"is\" to element", () => {
        const is = `x-${uuid()}`;

        @element(is)
        class Test extends CorpusculeElement {
          protected [render](): TemplateResult {
            return html`<span id="node">Test content</span>`;
          }
        }

        expect(Test.is).toBe(is);
      });
    });

    describe("@attribute", () => {
      it("should add attribute to element", () => {
        class Test extends CorpusculeElement {
          @attribute("t", Number)
          public test: number = 1;

          @attribute("t2", Boolean, {pure: false})
          public test2: boolean = false;

          protected [render](): TemplateResult {
            return html`<span id="node">Test content</span>`;
          }
        }

        expect((Test as any)[attributeMap]).toEqual({
          test: ["t", Number],
          test2: ["t2", Boolean, {pure: false}],
        });
      });
    });

    describe("@property", () => {
      it("should add property to element", () => {
        const guard1 = (v: any) => typeof v === "boolean";
        const guard2 = (v: any) => typeof v === "number";

        class Test extends CorpusculeElement {
          @property()
          public test: number = 1;

          @property(guard1)
          public test2: boolean = false;

          @property(guard2, {pure: false})
          public test3: number = 2;

          protected [render](): TemplateResult {
            return html`<span id="node">Test content</span>`;
          }
        }

        expect((Test as any)[propertyMap]).toEqual({
          test: null,
          test2: guard1,
          test3: [guard2, {pure: false}],
        });
      });
    });

    describe("@state", () => {
      it("should add state property to element", () => {
        class Test extends CorpusculeElement {
          @state
          public test: number = 1;

          @state
          public test2: number = 2;

          protected [render](): TemplateResult {
            return html`<span id="node">Test content</span>`;
          }
        }

        expect((Test as any)[stateMap]).toEqual([
          "test",
          "test2",
        ]);
      });
    });

    describe("@computed", () => {
      it("should add computed property to element", () => {
        class Test extends CorpusculeElement {
          public first: number = 1;
          public second: number = 2;

          @computed("first", "second")
          public get test(): number {
            return this.first + this.second;
          }

          @computed("first", "second")
          public get test2(): number {
            return this.second - this.first;
          }

          protected [render](): TemplateResult {
            return html`<span id="node">Test content</span>`;
          }
        }

        expect((Test as any)[computedMap]).toEqual({
          test: ["first", "second"],
          test2: ["first", "second"],
        });
      });
    });
  });
};

export default decorators;
